"use server";

import { dbService } from "@/lib/db-service";
import { CementLoad, Entry, StockRegisterItem, SiteMaterial, PrivateWork, TarLoad, WorkBasedEntry } from "@/lib/types";

// AUTHENTICATION BYPASS
export async function getCurrentUser() {
  return {
    id: "u-1",
    username: "admin",
    email: "admin@buildcorp.com",
    name: "Administrator",
    role: "ADMIN" as const,
    permissions: ["ALL"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function loginAction(data: { username: string; passwordHash: string }) {
  return { success: true, user: await getCurrentUser(), error: undefined as string | undefined };
}

export async function logoutAction() {
  return { success: true };
}

// CEMENT LOADS
export async function getCementLoadsAction() {
  return dbService.getCementLoads();
}

export async function createCementLoadAction(data: Omit<CementLoad, 'id' | 'balanceAmount' | 'createdAt'>) {
  return dbService.createCementLoad(data);
}

export async function updateCementLoadAction(id: string, data: Partial<CementLoad>) {
  return dbService.updateCementLoad(id, data);
}

export async function deleteCementLoadAction(id: string) {
  return dbService.deleteCementLoad(id);
}

// ENTRIES (Module 2)
export async function getEntriesAction() {
  return dbService.getEntries();
}

export async function createEntryAction(data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) {
  return dbService.createEntry(data);
}

export async function updateEntryAction(id: string, data: Partial<Entry>) {
  return dbService.updateEntry(id, data);
}

export async function deleteEntryAction(id: string) {
  return dbService.deleteEntry(id);
}

// STOCK REGISTER
export async function getStockRegisterAction() {
  return dbService.getStockRegister();
}

export async function updateStockRegisterItemAction(id: string, data: Partial<StockRegisterItem>) {
  return dbService.updateStockRegisterItem(id, data);
}

// SITE MATERIALS (Module 4)
export async function getSiteMaterialsAction() {
  return dbService.getSiteMaterials();
}

export async function createSiteMaterialAction(data: Omit<SiteMaterial, 'id' | 'balanceQuantityInCft' | 'totalQuantityInSite' | 'createdAt'>) {
  return dbService.createSiteMaterial(data);
}

export async function updateSiteMaterialAction(id: string, data: Partial<SiteMaterial>) {
  return dbService.updateSiteMaterial(id, data);
}

export async function deleteSiteMaterialAction(id: string) {
  return dbService.deleteSiteMaterial(id);
}

// PRIVATE WORKS
export async function getPrivateWorksAction() {
  return dbService.getPrivateWorks();
}

export async function createPrivateWorkAction(data: Omit<PrivateWork, 'id' | 'paymentBalance' | 'createdAt'>) {
  return dbService.createPrivateWork(data);
}

export async function updatePrivateWorkAction(id: string, data: Partial<PrivateWork>) {
  return dbService.updatePrivateWork(id, data);
}

export async function deletePrivateWorkAction(id: string) {
  return dbService.deletePrivateWork(id);
}

// TAR LOADS
export async function getTarLoadsAction() {
  return dbService.getTarLoads();
}

export async function createTarLoadAction(data: Omit<TarLoad, 'id' | 'balanceToBePaid' | 'createdAt'>) {
  return dbService.createTarLoad(data);
}

export async function updateTarLoadAction(id: string, data: Partial<TarLoad>) {
  return dbService.updateTarLoad(id, data);
}

export async function deleteTarLoadAction(id: string) {
  return dbService.deleteTarLoad(id);
}

// WORK BASED ENTRIES
export async function getWorkBasedEntriesAction() {
  return dbService.getWorkBasedEntries();
}

export async function createWorkBasedEntryAction(data: Omit<WorkBasedEntry, 'id' | 'totalAmountPerItem' | 'createdAt'>) {
  return dbService.createWorkBasedEntry(data);
}

export async function updateWorkBasedEntryAction(id: string, data: Partial<WorkBasedEntry>) {
  return dbService.updateWorkBasedEntry(id, data);
}

export async function deleteWorkBasedEntryAction(id: string) {
  return dbService.deleteWorkBasedEntry(id);
}

// NOTIFICATIONS & AUDITS
export async function getNotificationsAction() {
  return [];
}

export async function markNotificationReadAction(id: string) {
  return true;
}

export async function markAllNotificationsReadAction() {
  return true;
}

export async function getAuditLogsAction() {
  return [];
}
