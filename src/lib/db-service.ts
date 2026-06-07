import fs from 'fs';
import path from 'path';
import { 
  CementLoad, Entry, StockRegisterItem, SiteMaterial, 
  PrivateWork, TarLoad, WorkBasedEntry, User, Notification, AuditLog 
} from './types';

const DB_FILE = path.join(process.cwd(), 'prisma', 'db.json');

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

const defaultUser: User = {
  id: 'u-1',
  username: 'admin',
  email: 'admin@buildcorp.com',
  name: 'Administrator',
  role: 'ADMIN',
  department: 'Executive Division',
  permissions: ['ALL'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const initialData = {
  users: [defaultUser],
  cementLoads: [
    {
      id: 'cl-1',
      purchasedFrom: 'Ambuja Cements Distributors',
      cementCompany: 'Ambuja OPC 53',
      loadInTonne: 20,
      loadInBags: 400,
      amountPerLoad: 180000,
      paidAmount: 120000,
      balanceAmount: 60000,
      purchaseDate: '2026-05-02',
      buyerName: 'BuildCorp Store Manager',
      remarks: 'Delivered to main yard stock',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cl-2',
      purchasedFrom: 'UltraTech Commercial Sales',
      cementCompany: 'UltraTech Premium PPC',
      loadInTonne: 30,
      loadInBags: 600,
      amountPerLoad: 264000,
      paidAmount: 264000,
      balanceAmount: 0,
      purchaseDate: '2026-05-18',
      buyerName: 'BuildCorp Accounts Dept',
      remarks: 'Full advance paid',
      createdAt: new Date().toISOString()
    }
  ] as CementLoad[],
  entries: [
    {
      id: 'e-1',
      workName: 'NH-66 Highway Extension Phase 3',
      amount: 85000000,
      nameOfOffice: 'NHAI Regional Office',
      mlaMpName: 'Mr. Rajesh Kumar MP',
      loaReceived: true,
      lastDateToExecuteAgreement: '2026-01-20',
      amountOfStampPaperRequired: 45000,
      securityAmount: 2250000,
      performanceGuarantee: 1350000,
      dlpPeriodAsPerInLOA: '36 Months',
      agreementNo: 'NHAI/2026/AGR-089',
      siteHandoverDate: '2026-01-28',
      workCompletionDateAsPerAgreement: '2026-12-15',
      status: 'Ongoing',
      paymentReceived: 12000000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'e-2',
      workName: 'MLA Office Complex Construction',
      amount: 24000000,
      nameOfOffice: 'PWD Executive Division',
      mlaMpName: 'Mr. Salim Ahmed MLA',
      loaReceived: true,
      lastDateToExecuteAgreement: '2026-02-25',
      amountOfStampPaperRequired: 11000,
      securityAmount: 550000,
      performanceGuarantee: 330000,
      dlpPeriodAsPerInLOA: '24 Months',
      agreementNo: 'PWD/MLA-OFFICE/2026/04',
      siteHandoverDate: '2026-03-05',
      workCompletionDateAsPerAgreement: '2026-11-30',
      status: 'Ongoing',
      paymentReceived: 3500000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as Entry[],
  stockRegister: [
    { id: 's-1', materialName: 'Cement', inBarrel: 0, inKg: 0, inTonne: 50, usedInTonne: 15, balanceInTonne: 35, updatedAt: new Date().toISOString() },
    { id: 's-2', materialName: 'RS1', inBarrel: 100, inKg: 20000, inTonne: 20, usedInTonne: 5, balanceInTonne: 15, updatedAt: new Date().toISOString() },
    { id: 's-3', materialName: 'SS1', inBarrel: 50, inKg: 10000, inTonne: 10, usedInTonne: 2, balanceInTonne: 8, updatedAt: new Date().toISOString() },
    { id: 's-4', materialName: 'VG30', inBarrel: 150, inKg: 30000, inTonne: 30, usedInTonne: 10, balanceInTonne: 20, updatedAt: new Date().toISOString() }
  ] as StockRegisterItem[],
  siteMaterials: [
    {
      id: 'sm-1',
      entryId: 'e-1',
      type: 'to_deliver',
      itemSlNo: '1',
      specName: 'Cement',
      estimatedQuantity: 1000,
      deliveredQuantityInCft: 600,
      balanceQuantityInCft: 400,
      totalQuantityInSite: 600,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sm-2',
      entryId: 'e-1',
      type: 'delivered',
      itemSlNo: '2',
      specName: 'VG30 Bitumen',
      estimatedQuantity: 500,
      deliveredQuantityInCft: 400,
      balanceQuantityInCft: 100,
      totalQuantityInSite: 400,
      createdAt: new Date().toISOString()
    }
  ] as SiteMaterial[],
  privateWorks: [
    {
      id: 'pw-1',
      workName: 'Dr. Nair Luxury Residence',
      approxAmount: 6500000,
      location: 'Greenwood Hills',
      relatedToContractWork: 'None',
      siteVisitDate: '2026-03-15',
      roadWorkNature: 'Paving & Landscaping',
      completedDate: '2026-09-10',
      advanceReceived: 1000000,
      approxFinalWorkAmount: 6750000,
      paymentReceived: 4500000,
      paymentBalance: 2250000,
      remarks: 'Premium structural finish',
      createdAt: new Date().toISOString()
    }
  ] as PrivateWork[],
  tarLoads: [
    {
      id: 'tl-1',
      purchasedFrom: 'Indian Oil Bitumen Depot',
      item: 'VG30',
      quantityInKg: 10000,
      loadInNoOfPack: 50,
      addressedOffice: 'NHAI Regional Office',
      paidAmount: 450000,
      balanceToBePaid: 150000,
      purchasedDate: '2026-05-10',
      billingNameBuyer: 'Alex Mercer',
      remarks: 'Bitumen VG30 drums',
      amountPerLoad: 600000,
      createdAt: new Date().toISOString()
    }
  ] as TarLoad[],
  workBasedEntries: [
    {
      id: 'wbe-1',
      entryId: 'e-1',
      itemSlNo: '1.2.1',
      itemName: 'Sub-grade Soil Excavation & Backfilling',
      itemQuantity: 18000,
      itemRateAsPerEstimate: 350,
      totalAmountPerItem: 6300000,
      itemUnit: 'CUM',
      createdAt: new Date().toISOString()
    },
    {
      id: 'wbe-2',
      entryId: 'e-1',
      itemSlNo: '2.4.5',
      itemName: 'Reinforced Cement Concrete (M35 Grade)',
      itemQuantity: 1200,
      itemRateAsPerEstimate: 6800,
      totalAmountPerItem: 8160000,
      itemUnit: 'CUM',
      createdAt: new Date().toISOString()
    },
    {
      id: 'wbe-3',
      entryId: 'e-2',
      itemSlNo: 'PW-A1',
      itemName: 'Foundation Pile Boring (1m diameter)',
      itemQuantity: 320,
      itemRateAsPerEstimate: 9500,
      totalAmountPerItem: 3040000,
      itemUnit: 'METER',
      createdAt: new Date().toISOString()
    }
  ] as WorkBasedEntry[],
  notifications: [] as Notification[],
  auditLogs: [] as AuditLog[]
};

class LocalDbService {
  private data: typeof initialData;

  constructor() {
    this.data = initialData;
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Failed to read local file DB, using in-memory', e);
    }
  }

  private save() {
    try {
      ensureDirectoryExistence(DB_FILE);
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save local file DB', e);
    }
  }

  // AUTH BYPASS HELPERS
  public getUserByUsername(username: string) {
    return defaultUser;
  }
  public getUsers() {
    return [defaultUser];
  }
  public getAuditLogs() {
    return this.data.auditLogs || [];
  }
  public getNotifications() {
    return this.data.notifications || [];
  }
  public createAuditLog(username: string, action: string, entity: string, entityId?: string, details?: string) {
    const log: AuditLog = {
      id: `al-${Math.random().toString(36).substr(2, 9)}`,
      username,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift(log);
    this.save();
    return log;
  }

  // CEMENT LOADS
  public getCementLoads() { return this.data.cementLoads; }
  public createCementLoad(load: Omit<CementLoad, 'id' | 'balanceAmount' | 'createdAt'>) {
    const balanceAmount = load.amountPerLoad - load.paidAmount;
    const newLoad: CementLoad = {
      ...load,
      id: `cl-${Math.random().toString(36).substr(2, 9)}`,
      balanceAmount,
      createdAt: new Date().toISOString()
    };
    this.data.cementLoads.push(newLoad);
    
    // Auto update stock register for Cement
    const cementStock = this.data.stockRegister.find(s => s.materialName === 'Cement');
    if (cementStock) {
      cementStock.inTonne += load.loadInTonne;
      cementStock.balanceInTonne = cementStock.inTonne - cementStock.usedInTonne;
      cementStock.updatedAt = new Date().toISOString();
    }
    
    this.save();
    return newLoad;
  }
  public updateCementLoad(id: string, updates: Partial<CementLoad>) {
    const idx = this.data.cementLoads.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const old = this.data.cementLoads[idx];
    
    // Adjust stock if loadInTonne changed
    if (updates.loadInTonne !== undefined) {
      const cementStock = this.data.stockRegister.find(s => s.materialName === 'Cement');
      if (cementStock) {
        cementStock.inTonne = cementStock.inTonne - old.loadInTonne + updates.loadInTonne;
        cementStock.balanceInTonne = cementStock.inTonne - cementStock.usedInTonne;
      }
    }

    const updated = { ...old, ...updates };
    updated.balanceAmount = updated.amountPerLoad - updated.paidAmount;
    this.data.cementLoads[idx] = updated;
    this.save();
    return updated;
  }
  public deleteCementLoad(id: string) {
    const old = this.data.cementLoads.find(c => c.id === id);
    if (!old) return false;
    
    // Adjust stock
    const cementStock = this.data.stockRegister.find(s => s.materialName === 'Cement');
    if (cementStock) {
      cementStock.inTonne -= old.loadInTonne;
      cementStock.balanceInTonne = cementStock.inTonne - cementStock.usedInTonne;
    }

    this.data.cementLoads = this.data.cementLoads.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // ENTRIES (Module 2)
  public getEntries() { return this.data.entries; }
  public createEntry(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) {
    const newEntry: Entry = {
      ...entry,
      id: `e-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.entries.push(newEntry);
    this.save();
    return newEntry;
  }
  public updateEntry(id: string, updates: Partial<Entry>) {
    const idx = this.data.entries.findIndex(e => e.id === id);
    if (idx === -1) return null;
    const updated = {
      ...this.data.entries[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.entries[idx] = updated;
    this.save();
    return updated;
  }
  public deleteEntry(id: string) {
    this.data.entries = this.data.entries.filter(e => e.id !== id);
    this.save();
    return true;
  }

  // STOCK REGISTER
  public getStockRegister() { return this.data.stockRegister; }
  public updateStockRegisterItem(id: string, updates: Partial<StockRegisterItem>) {
    const idx = this.data.stockRegister.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated = {
      ...this.data.stockRegister[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    updated.balanceInTonne = updated.inTonne - updated.usedInTonne;
    this.data.stockRegister[idx] = updated;
    this.save();
    return updated;
  }

  // SITE MATERIALS (Module 4)
  public getSiteMaterials() { return this.data.siteMaterials; }
  public createSiteMaterial(mat: Omit<SiteMaterial, 'id' | 'balanceQuantityInCft' | 'totalQuantityInSite' | 'createdAt'>) {
    const balanceQuantityInCft = mat.estimatedQuantity - mat.deliveredQuantityInCft;
    const newMat: SiteMaterial = {
      ...mat,
      id: `sm-${Math.random().toString(36).substr(2, 9)}`,
      balanceQuantityInCft,
      totalQuantityInSite: mat.deliveredQuantityInCft,
      createdAt: new Date().toISOString()
    };
    this.data.siteMaterials.push(newMat);
    this.save();
    return newMat;
  }
  public updateSiteMaterial(id: string, updates: Partial<SiteMaterial>) {
    const idx = this.data.siteMaterials.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const updated = {
      ...this.data.siteMaterials[idx],
      ...updates
    };
    if (updated.estimatedQuantity !== undefined || updated.deliveredQuantityInCft !== undefined) {
      updated.balanceQuantityInCft = updated.estimatedQuantity - updated.deliveredQuantityInCft;
      updated.totalQuantityInSite = updated.deliveredQuantityInCft;
    }
    this.data.siteMaterials[idx] = updated;
    this.save();
    return updated;
  }
  public deleteSiteMaterial(id: string) {
    this.data.siteMaterials = this.data.siteMaterials.filter(m => m.id !== id);
    this.save();
    return true;
  }

  // PRIVATE WORKS
  public getPrivateWorks() { return this.data.privateWorks; }
  public createPrivateWork(pw: Omit<PrivateWork, 'id' | 'paymentBalance' | 'createdAt'>) {
    const paymentBalance = pw.approxFinalWorkAmount - pw.paymentReceived;
    const newPw: PrivateWork = {
      ...pw,
      id: `pw-${Math.random().toString(36).substr(2, 9)}`,
      paymentBalance,
      createdAt: new Date().toISOString()
    };
    this.data.privateWorks.push(newPw);
    this.save();
    return newPw;
  }
  public updatePrivateWork(id: string, updates: Partial<PrivateWork>) {
    const idx = this.data.privateWorks.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = {
      ...this.data.privateWorks[idx],
      ...updates
    };
    updated.paymentBalance = updated.approxFinalWorkAmount - updated.paymentReceived;
    this.data.privateWorks[idx] = updated;
    this.save();
    return updated;
  }
  public deletePrivateWork(id: string) {
    this.data.privateWorks = this.data.privateWorks.filter(p => p.id !== id);
    this.save();
    return true;
  }

  // TAR LOADS
  public getTarLoads() { return this.data.tarLoads; }
  public createTarLoad(load: Omit<TarLoad, 'id' | 'balanceToBePaid' | 'createdAt'>) {
    const balanceToBePaid = load.amountPerLoad - load.paidAmount;
    const newLoad: TarLoad = {
      ...load,
      id: `tl-${Math.random().toString(36).substr(2, 9)}`,
      balanceToBePaid,
      createdAt: new Date().toISOString()
    };
    this.data.tarLoads.push(newLoad);
    
    // Auto update stock register for Bitumen items (RS1, SS1, VG30)
    const stockItem = this.data.stockRegister.find(s => s.materialName === load.item);
    if (stockItem) {
      // Quantity is in Kg, so convert to Tonnes for stock table (1 Tonne = 1000 Kg)
      const tonnes = load.quantityInKg / 1000;
      stockItem.inTonne += tonnes;
      stockItem.inKg += load.quantityInKg;
      stockItem.inBarrel += load.loadInNoOfPack;
      stockItem.balanceInTonne = stockItem.inTonne - stockItem.usedInTonne;
      stockItem.updatedAt = new Date().toISOString();
    }
    
    this.save();
    return newLoad;
  }
  public updateTarLoad(id: string, updates: Partial<TarLoad>) {
    const idx = this.data.tarLoads.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const old = this.data.tarLoads[idx];

    // Adjust stock if quantity changed
    if (updates.quantityInKg !== undefined || updates.loadInNoOfPack !== undefined) {
      const stockItem = this.data.stockRegister.find(s => s.materialName === old.item);
      if (stockItem) {
        if (updates.quantityInKg !== undefined) {
          const oldTonnes = old.quantityInKg / 1000;
          const newTonnes = updates.quantityInKg / 1000;
          stockItem.inTonne = stockItem.inTonne - oldTonnes + newTonnes;
          stockItem.inKg = stockItem.inKg - old.quantityInKg + updates.quantityInKg;
        }
        if (updates.loadInNoOfPack !== undefined) {
          stockItem.inBarrel = stockItem.inBarrel - old.loadInNoOfPack + updates.loadInNoOfPack;
        }
        stockItem.balanceInTonne = stockItem.inTonne - stockItem.usedInTonne;
      }
    }

    const updated = { ...old, ...updates };
    updated.balanceToBePaid = updated.amountPerLoad - updated.paidAmount;
    this.data.tarLoads[idx] = updated;
    this.save();
    return updated;
  }
  public deleteTarLoad(id: string) {
    const old = this.data.tarLoads.find(t => t.id === id);
    if (!old) return false;

    // Adjust stock
    const stockItem = this.data.stockRegister.find(s => s.materialName === old.item);
    if (stockItem) {
      const tonnes = old.quantityInKg / 1000;
      stockItem.inTonne -= tonnes;
      stockItem.inKg -= old.quantityInKg;
      stockItem.inBarrel -= old.loadInNoOfPack;
      stockItem.balanceInTonne = stockItem.inTonne - stockItem.usedInTonne;
    }

    this.data.tarLoads = this.data.tarLoads.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // WORK BASED ENTRIES (Module 7)
  public getWorkBasedEntries() { return this.data.workBasedEntries; }
  public createWorkBasedEntry(wbe: Omit<WorkBasedEntry, 'id' | 'totalAmountPerItem' | 'createdAt'>) {
    const totalAmountPerItem = wbe.itemQuantity * wbe.itemRateAsPerEstimate;
    const newWbe: WorkBasedEntry = {
      ...wbe,
      id: `wbe-${Math.random().toString(36).substr(2, 9)}`,
      totalAmountPerItem,
      createdAt: new Date().toISOString()
    };
    this.data.workBasedEntries.push(newWbe);
    this.save();
    return newWbe;
  }
  public updateWorkBasedEntry(id: string, updates: Partial<WorkBasedEntry>) {
    const idx = this.data.workBasedEntries.findIndex(w => w.id === id);
    if (idx === -1) return null;
    const updated = {
      ...this.data.workBasedEntries[idx],
      ...updates
    };
    updated.totalAmountPerItem = updated.itemQuantity * updated.itemRateAsPerEstimate;
    this.data.workBasedEntries[idx] = updated;
    this.save();
    return updated;
  }
  public deleteWorkBasedEntry(id: string) {
    this.data.workBasedEntries = this.data.workBasedEntries.filter(w => w.id !== id);
    this.save();
    return true;
  }
}

export const dbService = new LocalDbService();
