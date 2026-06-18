/**
 * db-service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All business data operations go through this service.
 * PRIMARY path  → MongoDB Atlas via Prisma.
 * FALLBACK path → Empty arrays (returned when Atlas is unreachable).
 * Write operations always use the PRIMARY path and throw on failure.
 */

import prisma from './prisma';
import {
  CementLoad, Entry, StockRegisterItem, SiteMaterial,
  PrivateWork, TarLoad, WorkBasedEntry, Expense,
} from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Deep-serialise Prisma Date objects to plain JS values (required for RSC). */
function serialize<T>(obj: T): T {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

/** Parse string dates into real Date objects for Prisma */
function parseDates<T extends Record<string, any>>(data: T, keys: (keyof T)[]): T {
  if (!data) return data;
  const clone = { ...data };
  for (const key of keys) {
    if (clone[key] !== undefined && clone[key] !== null) {
      if (typeof clone[key] === 'string' && clone[key] !== '') {
        const d = new Date(clone[key]);
        if (!isNaN(d.getTime())) {
          clone[key] = d as any;
        }
      }
    }
  }
  return clone;
}

/** READ helper — try Prisma; return empty array on network error. */
async function readDb<T>(dbFn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return serialize(await dbFn());
  } catch (err) {
    console.warn('⚠️  DB unavailable:', (err as Error).message?.slice(0, 120));
    return serialize(fallback());
  }
}

/** WRITE helper — always uses Prisma, throws on failure. */
async function writeDb<T>(dbFn: () => Promise<T>): Promise<T> {
  return serialize(await dbFn());
}

// ─────────────────────────────────────────────────────────────────────────────
// DbService
// ─────────────────────────────────────────────────────────────────────────────

class DbService {

  // ── MODULE 1 — CEMENT LOADS ───────────────────────────────────────────────

  async getCementLoads(ownerEmail: string): Promise<CementLoad[]> {
    return readDb(
      () => prisma.cementLoad.findMany({
        where: {
          ownerEmail,
          OR: [
            { deletedAt: { isSet: false } },
            { deletedAt: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<CementLoad[]>,
      () => [] as CementLoad[],
    );
  }

  async createCementLoad(
    data: Omit<CementLoad, 'id' | 'balanceAmount' | 'createdAt'>,
    ownerEmail: string,
  ): Promise<CementLoad> {
    const parsed = parseDates(data, ['purchaseDate', 'currentStockDate', 'paymentBillDate']);
    const balanceAmount = parsed.amountPerLoad - parsed.paidAmount;
    return writeDb(() => prisma.cementLoad.create({
      data: { ...parsed, balanceAmount, ownerEmail } as any,
    })) as unknown as Promise<CementLoad>;
  }

  async updateCementLoad(
    id: string,
    updates: Partial<CementLoad>,
    ownerEmail: string,
  ): Promise<CementLoad | null> {
    return writeDb(async () => {
      const old = await prisma.cementLoad.findFirst({ where: { id, ownerEmail } });
      if (!old) return null;
      const parsedUpdates = parseDates(updates, ['purchaseDate', 'currentStockDate', 'paymentBillDate']);
      const payload = { ...parsedUpdates } as any;
      if (parsedUpdates.amountPerLoad !== undefined || parsedUpdates.paidAmount !== undefined) {
        payload.balanceAmount =
          (parsedUpdates.amountPerLoad ?? old.amountPerLoad) -
          (parsedUpdates.paidAmount ?? old.paidAmount);
      }
      return prisma.cementLoad.update({ where: { id }, data: payload });
    }) as unknown as Promise<CementLoad | null>;
  }

  async deleteCementLoad(id: string, ownerEmail: string): Promise<boolean> {
    return writeDb(async () => {
      await prisma.cementLoad.updateMany({
        where: { id, ownerEmail },
        data: { deletedAt: new Date() },
      });
      return true;
    });
  }

  // ── MODULE 2 — ENTRIES ────────────────────────────────────────────────────

  async getEntries(ownerEmail: string): Promise<Entry[]> {
    return readDb(
      () => prisma.entry.findMany({
        where: {
          ownerEmail,
          OR: [
            { deletedAt: { isSet: false } },
            { deletedAt: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<Entry[]>,
      () => [] as Entry[],
    );
  }

  async createEntry(
    data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>,
    ownerEmail: string,
  ): Promise<Entry> {
    const parsed = parseDates(data, ['lastDateToExecuteAgreement', 'siteHandoverDate', 'workCompletionDateAsPerAgreement']);
    return writeDb(() => prisma.entry.create({
      data: { ...parsed, ownerEmail } as any,
    })) as unknown as Promise<Entry>;
  }

  async updateEntry(
    id: string,
    updates: Partial<Entry>,
    ownerEmail: string,
  ): Promise<Entry | null> {
    return writeDb(async () => {
      const exists = await prisma.entry.findFirst({ where: { id, ownerEmail } });
      if (!exists) return null;
      const parsedUpdates = parseDates(updates, ['lastDateToExecuteAgreement', 'siteHandoverDate', 'workCompletionDateAsPerAgreement']);
      return prisma.entry.update({ where: { id }, data: parsedUpdates as any });
    }) as unknown as Promise<Entry | null>;
  }

  async deleteEntry(id: string, ownerEmail: string): Promise<boolean> {
    return writeDb(async () => {
      await prisma.entry.updateMany({
        where: { id, ownerEmail },
        data: { deletedAt: new Date() },
      });
      return true;
    });
  }

  // ── MODULE 3 — STOCK REGISTER ─────────────────────────────────────────────

  async getStockRegister(ownerEmail: string): Promise<StockRegisterItem[]> {
    return readDb(
      async () => {
        let items = await prisma.stockRegisterItem.findMany({ where: { ownerEmail } });
        if (items.length === 0) {
          const defaults = ['Cement', 'RS1', 'SS1', 'VG30'] as const;
          for (const materialName of defaults) {
            await prisma.stockRegisterItem.create({
              data: { ownerEmail, materialName, inBarrel: 0, inKg: 0, inTonne: 0, usedInTonne: 0, balanceInTonne: 0 },
            });
          }
          items = await prisma.stockRegisterItem.findMany({ where: { ownerEmail } });
        }
        return items as unknown as StockRegisterItem[];
      },
      () => [
        { id: 'sr-1', materialName: 'Cement', inBarrel: 0, inKg: 0, inTonne: 0, usedInTonne: 0, balanceInTonne: 0, updatedAt: new Date() },
        { id: 'sr-2', materialName: 'RS1',    inBarrel: 0, inKg: 0, inTonne: 0, usedInTonne: 0, balanceInTonne: 0, updatedAt: new Date() },
        { id: 'sr-3', materialName: 'SS1',    inBarrel: 0, inKg: 0, inTonne: 0, usedInTonne: 0, balanceInTonne: 0, updatedAt: new Date() },
        { id: 'sr-4', materialName: 'VG30',   inBarrel: 0, inKg: 0, inTonne: 0, usedInTonne: 0, balanceInTonne: 0, updatedAt: new Date() },
      ] as StockRegisterItem[],
    );
  }

  async updateStockRegisterItem(
    id: string,
    updates: Partial<StockRegisterItem>,
    ownerEmail: string,
  ): Promise<StockRegisterItem | null> {
    return writeDb(async () => {
      const old = await prisma.stockRegisterItem.findFirst({ where: { id, ownerEmail } });
      if (!old) return null;
      const payload = { ...updates } as any;
      if (updates.inTonne !== undefined || updates.usedInTonne !== undefined) {
        payload.balanceInTonne =
          (updates.inTonne ?? old.inTonne) - (updates.usedInTonne ?? old.usedInTonne);
      }
      return prisma.stockRegisterItem.update({ where: { id }, data: payload });
    }) as unknown as Promise<StockRegisterItem | null>;
  }

  // ── MODULE 4 — SITE MATERIALS ─────────────────────────────────────────────

  private mapSpecToStock(specName: string): string | null {
    const map: Record<string, string> = {
      Cement: 'Cement', RS1: 'RS1', SS1: 'SS1', 'VG 30': 'VG30', VG30: 'VG30',
    };
    return map[specName] ?? null;
  }

  async getSiteMaterials(ownerEmail: string): Promise<SiteMaterial[]> {
    return readDb(
      () => prisma.siteMaterial.findMany({
        where: {
          ownerEmail,
          OR: [
            { deletedAt: { isSet: false } },
            { deletedAt: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<SiteMaterial[]>,
      () => [] as SiteMaterial[],
    );
  }

  async createSiteMaterial(
    data: Omit<SiteMaterial, 'id' | 'balanceQuantityInCft' | 'totalQuantityInSite' | 'createdAt'>,
    ownerEmail: string,
  ): Promise<SiteMaterial> {
    const balanceQuantityInCft = data.estimatedQuantity - data.deliveredQuantityInCft;
    const totalQuantityInSite  = data.deliveredQuantityInCft;

    return writeDb(async () => {
      const created = await prisma.siteMaterial.create({
        data: { ...data, balanceQuantityInCft, totalQuantityInSite, ownerEmail } as any,
      });
      if (data.type === 'delivered' && data.deliveredQuantityInCft > 0) {
        const stockName = this.mapSpecToStock(data.specName);
        if (stockName) {
          const stockItem = await prisma.stockRegisterItem.findFirst({
            where: { ownerEmail, materialName: stockName },
          });
          if (stockItem) {
            const usedInTonne    = stockItem.usedInTonne + data.deliveredQuantityInCft;
            const balanceInTonne = stockItem.inTonne - usedInTonne;
            await prisma.stockRegisterItem.update({
              where: { id: stockItem.id },
              data: { usedInTonne, balanceInTonne },
            });
          }
        }
      }
      return created as unknown as SiteMaterial;
    });
  }

  async updateSiteMaterial(
    id: string,
    updates: Partial<SiteMaterial>,
    ownerEmail: string,
  ): Promise<SiteMaterial | null> {
    return writeDb(async () => {
      const old = await prisma.siteMaterial.findFirst({ where: { id, ownerEmail } });
      if (!old) return null;
      const payload = { ...updates } as any;
      if (updates.estimatedQuantity !== undefined || updates.deliveredQuantityInCft !== undefined) {
        payload.balanceQuantityInCft =
          (updates.estimatedQuantity ?? old.estimatedQuantity) -
          (updates.deliveredQuantityInCft ?? old.deliveredQuantityInCft);
        payload.totalQuantityInSite = updates.deliveredQuantityInCft ?? old.deliveredQuantityInCft;
      }
      if (old.type === 'delivered' && updates.deliveredQuantityInCft !== undefined) {
        const stockName = this.mapSpecToStock(old.specName);
        if (stockName) {
          const stockItem = await prisma.stockRegisterItem.findFirst({
            where: { ownerEmail, materialName: stockName },
          });
          if (stockItem) {
            const usedInTonne = stockItem.usedInTonne - old.deliveredQuantityInCft + updates.deliveredQuantityInCft;
            await prisma.stockRegisterItem.update({
              where: { id: stockItem.id },
              data: { usedInTonne, balanceInTonne: stockItem.inTonne - usedInTonne },
            });
          }
        }
      }
      return prisma.siteMaterial.update({ where: { id }, data: payload });
    }) as unknown as Promise<SiteMaterial | null>;
  }

  async deleteSiteMaterial(id: string, ownerEmail: string): Promise<boolean> {
    return writeDb(async () => {
      await prisma.siteMaterial.updateMany({
        where: { id, ownerEmail },
        data: { deletedAt: new Date() },
      });
      return true;
    });
  }

  // ── MODULE 5 — PRIVATE WORKS ──────────────────────────────────────────────

  async getPrivateWorks(ownerEmail: string): Promise<PrivateWork[]> {
    return readDb(
      () => prisma.privateWork.findMany({
        where: {
          ownerEmail,
          OR: [
            { deletedAt: { isSet: false } },
            { deletedAt: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<PrivateWork[]>,
      () => [] as PrivateWork[],
    );
  }

  async createPrivateWork(
    data: Omit<PrivateWork, 'id' | 'paymentBalance' | 'createdAt'>,
    ownerEmail: string,
  ): Promise<PrivateWork> {
    const parsed = parseDates(data, ['siteVisitDate', 'completedDate', 'completionDate']);
    const paymentBalance = parsed.approxFinalWorkAmount - parsed.paymentReceived;
    return writeDb(() => prisma.privateWork.create({
      data: { ...parsed, paymentBalance, ownerEmail } as any,
    })) as unknown as Promise<PrivateWork>;
  }

  async updatePrivateWork(
    id: string,
    updates: Partial<PrivateWork>,
    ownerEmail: string,
  ): Promise<PrivateWork | null> {
    return writeDb(async () => {
      const old = await prisma.privateWork.findFirst({ where: { id, ownerEmail } });
      if (!old) return null;
      const parsedUpdates = parseDates(updates, ['siteVisitDate', 'completedDate', 'completionDate']);
      const payload = { ...parsedUpdates } as any;
      if (parsedUpdates.approxFinalWorkAmount !== undefined || parsedUpdates.paymentReceived !== undefined) {
        payload.paymentBalance =
          (parsedUpdates.approxFinalWorkAmount ?? old.approxFinalWorkAmount) -
          (parsedUpdates.paymentReceived ?? old.paymentReceived);
      }
      return prisma.privateWork.update({ where: { id }, data: payload });
    }) as unknown as Promise<PrivateWork | null>;
  }

  async deletePrivateWork(id: string, ownerEmail: string): Promise<boolean> {
    return writeDb(async () => {
      await prisma.privateWork.updateMany({
        where: { id, ownerEmail },
        data: { deletedAt: new Date() },
      });
      return true;
    });
  }

  // ── MODULE 6 — TAR LOADS ──────────────────────────────────────────────────

  async getTarLoads(ownerEmail: string): Promise<TarLoad[]> {
    return readDb(
      () => prisma.tarLoad.findMany({
        where: {
          ownerEmail,
          OR: [
            { deletedAt: { isSet: false } },
            { deletedAt: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<TarLoad[]>,
      () => [] as TarLoad[],
    );
  }

  async createTarLoad(
    data: Omit<TarLoad, 'id' | 'balanceToBePaid' | 'createdAt'>,
    ownerEmail: string,
  ): Promise<TarLoad> {
    const parsed = parseDates(data, ['purchasedDate', 'currentStockDate', 'paymentBillDate']);
    const balanceToBePaid = parsed.amountPerLoad - parsed.paidAmount;
    return writeDb(() => prisma.tarLoad.create({
      data: { ...parsed, balanceToBePaid, ownerEmail } as any,
    })) as unknown as Promise<TarLoad>;
  }

  async updateTarLoad(
    id: string,
    updates: Partial<TarLoad>,
    ownerEmail: string,
  ): Promise<TarLoad | null> {
    return writeDb(async () => {
      const old = await prisma.tarLoad.findFirst({ where: { id, ownerEmail } });
      if (!old) return null;
      const parsedUpdates = parseDates(updates, ['purchasedDate', 'currentStockDate', 'paymentBillDate']);
      const payload = { ...parsedUpdates } as any;
      if (parsedUpdates.amountPerLoad !== undefined || parsedUpdates.paidAmount !== undefined) {
        payload.balanceToBePaid =
          (parsedUpdates.amountPerLoad ?? old.amountPerLoad) -
          (parsedUpdates.paidAmount ?? old.paidAmount);
      }
      return prisma.tarLoad.update({ where: { id }, data: payload });
    }) as unknown as Promise<TarLoad | null>;
  }

  async deleteTarLoad(id: string, ownerEmail: string): Promise<boolean> {
    return writeDb(async () => {
      await prisma.tarLoad.updateMany({
        where: { id, ownerEmail },
        data: { deletedAt: new Date() },
      });
      return true;
    });
  }

  // ── MODULE 7 — WORK BASED ENTRIES ─────────────────────────────────────────

  async getWorkBasedEntries(ownerEmail: string): Promise<WorkBasedEntry[]> {
    return readDb(
      () => prisma.workBasedEntry.findMany({
        where: { ownerEmail },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<WorkBasedEntry[]>,
      () => [] as WorkBasedEntry[],
    );
  }

  async createWorkBasedEntry(
    data: Omit<WorkBasedEntry, 'id' | 'totalAmountPerItem' | 'createdAt'>,
    ownerEmail: string,
  ): Promise<WorkBasedEntry> {
    const totalAmountPerItem = data.itemQuantity * data.itemRateAsPerEstimate;
    return writeDb(() => prisma.workBasedEntry.create({
      data: { ...data, totalAmountPerItem, ownerEmail } as any,
    })) as unknown as Promise<WorkBasedEntry>;
  }

  async updateWorkBasedEntry(
    id: string,
    updates: Partial<WorkBasedEntry>,
    ownerEmail: string,
  ): Promise<WorkBasedEntry | null> {
    return writeDb(async () => {
      const old = await prisma.workBasedEntry.findFirst({ where: { id, ownerEmail } });
      if (!old) return null;
      const payload = { ...updates } as any;
      if (updates.itemQuantity !== undefined || updates.itemRateAsPerEstimate !== undefined) {
        payload.totalAmountPerItem =
          (updates.itemQuantity ?? old.itemQuantity) *
          (updates.itemRateAsPerEstimate ?? old.itemRateAsPerEstimate);
      }
      return prisma.workBasedEntry.update({ where: { id }, data: payload });
    }) as unknown as Promise<WorkBasedEntry | null>;
  }

  async deleteWorkBasedEntry(id: string, ownerEmail: string): Promise<boolean> {
    return writeDb(async () => {
      await prisma.workBasedEntry.deleteMany({ where: { id, ownerEmail } });
      return true;
    });
  }

  // ── MODULE 11 — EXPENSES ──────────────────────────────────────────────────

  async getExpenses(ownerEmail: string): Promise<Expense[]> {
    return readDb(
      () => prisma.expense.findMany({
        where: {
          ownerEmail,
          OR: [
            { deletedAt: { isSet: false } },
            { deletedAt: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<Expense[]>,
      () => [] as Expense[],
    );
  }

  async getExpensesByWorkId(workId: string, ownerEmail: string): Promise<Expense[]> {
    return readDb(
      () => prisma.expense.findMany({
        where: {
          workId,
          ownerEmail,
          OR: [
            { deletedAt: { isSet: false } },
            { deletedAt: null }
          ]
        },
        orderBy: { date: 'desc' },
      }) as unknown as Promise<Expense[]>,
      () => [] as Expense[],
    );
  }

  async createExpense(
    data: Omit<Expense, 'id' | 'createdAt'>,
    ownerEmail: string,
  ): Promise<Expense> {
    const parsed = parseDates(data, ['date']);
    return writeDb(() => prisma.expense.create({
      data: { ...parsed, ownerEmail } as any,
    })) as unknown as Promise<Expense>;
  }

  async updateExpense(
    id: string,
    updates: Partial<Expense>,
    ownerEmail: string,
  ): Promise<Expense | null> {
    return writeDb(async () => {
      const exists = await prisma.expense.findFirst({ where: { id, ownerEmail } });
      if (!exists) return null;
      const parsedUpdates = parseDates(updates, ['date']);
      return prisma.expense.update({ where: { id }, data: parsedUpdates as any });
    }) as unknown as Promise<Expense | null>;
  }

  async deleteExpense(id: string, ownerEmail: string): Promise<boolean> {
    return writeDb(async () => {
      await prisma.expense.updateMany({
        where: { id, ownerEmail },
        data: { deletedAt: new Date() },
      });
      return true;
    });
  }
}

export const dbService = new DbService();
