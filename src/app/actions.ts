"use server";

import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { dbService } from '@/lib/db-service';
import {
  CementLoad, Entry, StockRegisterItem, SiteMaterial,
  PrivateWork, TarLoad, WorkBasedEntry, Expense,
} from '@/lib/types';

// ── Auth helper ───────────────────────────────────────────────────────────────

/** Read the JWT cookie and return the owner's email. Throws if not authenticated. */
async function getOwnerEmail(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) throw new Error('Not authenticated');
  const payload = verifyAccessToken(token) as any;
  if (!payload?.email) throw new Error('Invalid token');
  return payload.email as string;
}

// ── Cement Loads ──────────────────────────────────────────────────────────────

export async function getCementLoadsAction() {
  const email = await getOwnerEmail();
  return dbService.getCementLoads(email);
}

export async function createCementLoadAction(data: Omit<CementLoad, 'id' | 'balanceAmount' | 'createdAt'>) {
  const email = await getOwnerEmail();
  return dbService.createCementLoad(data, email);
}

export async function updateCementLoadAction(id: string, data: Partial<CementLoad>) {
  const email = await getOwnerEmail();
  return dbService.updateCementLoad(id, data, email);
}

export async function deleteCementLoadAction(id: string) {
  const email = await getOwnerEmail();
  return dbService.deleteCementLoad(id, email);
}

// ── Entries ───────────────────────────────────────────────────────────────────

export async function getEntriesAction() {
  const email = await getOwnerEmail();
  return dbService.getEntries(email);
}

export async function createEntryAction(data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) {
  const email = await getOwnerEmail();
  return dbService.createEntry(data, email);
}

export async function updateEntryAction(id: string, data: Partial<Entry>) {
  const email = await getOwnerEmail();
  return dbService.updateEntry(id, data, email);
}

export async function deleteEntryAction(id: string) {
  const email = await getOwnerEmail();
  return dbService.deleteEntry(id, email);
}

// ── Stock Register ────────────────────────────────────────────────────────────

export async function getStockRegisterAction() {
  const email = await getOwnerEmail();
  return dbService.getStockRegister(email);
}

export async function updateStockRegisterItemAction(id: string, data: Partial<StockRegisterItem>) {
  const email = await getOwnerEmail();
  return dbService.updateStockRegisterItem(id, data, email);
}

// ── Site Materials ────────────────────────────────────────────────────────────

export async function getSiteMaterialsAction() {
  const email = await getOwnerEmail();
  return dbService.getSiteMaterials(email);
}

export async function createSiteMaterialAction(
  data: Omit<SiteMaterial, 'id' | 'balanceQuantityInCft' | 'totalQuantityInSite' | 'createdAt'>,
) {
  const email = await getOwnerEmail();
  return dbService.createSiteMaterial(data, email);
}

export async function updateSiteMaterialAction(id: string, data: Partial<SiteMaterial>) {
  const email = await getOwnerEmail();
  return dbService.updateSiteMaterial(id, data, email);
}

export async function deleteSiteMaterialAction(id: string) {
  const email = await getOwnerEmail();
  return dbService.deleteSiteMaterial(id, email);
}

// ── Private Works ─────────────────────────────────────────────────────────────

export async function getPrivateWorksAction() {
  const email = await getOwnerEmail();
  return dbService.getPrivateWorks(email);
}

export async function createPrivateWorkAction(data: Omit<PrivateWork, 'id' | 'paymentBalance' | 'createdAt'>) {
  const email = await getOwnerEmail();
  return dbService.createPrivateWork(data, email);
}

export async function updatePrivateWorkAction(id: string, data: Partial<PrivateWork>) {
  const email = await getOwnerEmail();
  return dbService.updatePrivateWork(id, data, email);
}

export async function deletePrivateWorkAction(id: string) {
  const email = await getOwnerEmail();
  return dbService.deletePrivateWork(id, email);
}

// ── Tar Loads ─────────────────────────────────────────────────────────────────

export async function getTarLoadsAction() {
  const email = await getOwnerEmail();
  return dbService.getTarLoads(email);
}

export async function createTarLoadAction(data: Omit<TarLoad, 'id' | 'balanceToBePaid' | 'createdAt'>) {
  const email = await getOwnerEmail();
  return dbService.createTarLoad(data, email);
}

export async function updateTarLoadAction(id: string, data: Partial<TarLoad>) {
  const email = await getOwnerEmail();
  return dbService.updateTarLoad(id, data, email);
}

export async function deleteTarLoadAction(id: string) {
  const email = await getOwnerEmail();
  return dbService.deleteTarLoad(id, email);
}

// ── Work Based Entries ────────────────────────────────────────────────────────

export async function getWorkBasedEntriesAction() {
  const email = await getOwnerEmail();
  return dbService.getWorkBasedEntries(email);
}

export async function createWorkBasedEntryAction(
  data: Omit<WorkBasedEntry, 'id' | 'totalAmountPerItem' | 'createdAt'>,
) {
  const email = await getOwnerEmail();
  return dbService.createWorkBasedEntry(data, email);
}

export async function updateWorkBasedEntryAction(id: string, data: Partial<WorkBasedEntry>) {
  const email = await getOwnerEmail();
  return dbService.updateWorkBasedEntry(id, data, email);
}

export async function deleteWorkBasedEntryAction(id: string) {
  const email = await getOwnerEmail();
  return dbService.deleteWorkBasedEntry(id, email);
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpensesAction() {
  const email = await getOwnerEmail();
  return dbService.getExpenses(email);
}

export async function getExpensesByWorkIdAction(workId: string) {
  const email = await getOwnerEmail();
  return dbService.getExpensesByWorkId(workId, email);
}

export async function createExpenseAction(data: Omit<Expense, 'id' | 'createdAt'>) {
  const email = await getOwnerEmail();
  return dbService.createExpense(data, email);
}

export async function updateExpenseAction(id: string, data: Partial<Expense>) {
  const email = await getOwnerEmail();
  return dbService.updateExpense(id, data, email);
}

export async function deleteExpenseAction(id: string) {
  const email = await getOwnerEmail();
  return dbService.deleteExpense(id, email);
}

export async function getDashboardDataAction() {
  const email = await getOwnerEmail();
  const [cl, ent, stk, sm, pw, tl, wbe, exp] = await Promise.all([
    dbService.getCementLoads(email),
    dbService.getEntries(email),
    dbService.getStockRegister(email),
    dbService.getSiteMaterials(email),
    dbService.getPrivateWorks(email),
    dbService.getTarLoads(email),
    dbService.getWorkBasedEntries(email),
    dbService.getExpenses(email)
  ]);
  return {
    cementLoads: cl,
    entries: ent,
    stockRegister: stk,
    siteMaterials: sm,
    privateWorks: pw,
    tarLoads: tl,
    workBasedEntries: wbe,
    expenses: exp
  };
}

// ── Misc (kept for compatibility) ─────────────────────────────────────────────

export async function getNotificationsAction() { return []; }
export async function markNotificationReadAction(_id: string) { return true; }
export async function markAllNotificationsReadAction() { return true; }
export async function getAuditLogsAction() { return []; }
export async function loginAction(_data: { username: string; passwordHash: string }) {
  return { success: true, user: null, error: undefined as string | undefined };
}
export async function logoutAction() { return { success: true }; }
export async function getCurrentUser() { return null; }
