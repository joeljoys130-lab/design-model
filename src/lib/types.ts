export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SITE_ENGINEER' | 'STORE_MANAGER' | 'VIEWER';
  department?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  username: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// MODULE 1 - CEMENT LOAD UPDATION
export interface CementLoad {
  id: string;
  purchasedFrom: string;
  cementCompany: string;
  loadInTonne: number;
  loadInBags: number; // No. of Pack
  amountPerLoad: number;
  paidAmount: number;
  balanceAmount: number; // Balance to be paid (amountPerLoad - paidAmount)
  purchaseDate: string;
  buyerName: string; // Billing Name / Buyer
  remarks?: string;
  createdAt: string;

  // Current Stock Available
  currentStockDate?: string;
  currentStockQty?: number;
  currentStockUsed?: number;
  currentStockBalance?: number;
  currentStockUsedAmount?: number;
  currentStockBalanceAmount?: number;

  // Payment Details
  paymentPartyName?: string;
  paymentBillAmount?: number;
  paymentBillDate?: string;
  paymentPaidAmount?: number;
  paymentBalanceAmount?: number;
  paymentRemarks?: string;
}


// MODULE 2, 8, 9, 10 - ENTRY / WORK STATUS
export interface Entry {
  id: string;
  workName: string;
  amount: number;
  nameOfOffice: string;
  mlaMpName?: string;
  loaReceived: boolean;
  lastDateToExecuteAgreement: string;
  amountOfStampPaperRequired: number;
  securityAmount: number;
  performanceGuarantee: number;
  dlpPeriodAsPerInLOA: string;
  agreementNo: string;
  siteHandoverDate: string;
  workCompletionDateAsPerAgreement: string;
  status: 'Not Started' | 'Ongoing' | 'Pending' | 'Completed';
  paymentReceived: number;
  createdAt: string;
  updatedAt: string;
}

// MODULE 3 - STOCK REGISTER
export interface StockRegisterItem {
  id: string;
  materialName: 'Cement' | 'RS1' | 'SS1' | 'VG30';
  inBarrel: number;
  inKg: number;
  inTonne: number;
  usedInTonne: number;
  balanceInTonne: number; // (inTonne - usedInTonne)
  updatedAt: string;
}

// MODULE 4 - SITE MATERIALS USED
export interface SiteMaterial {
  id: string;
  entryId: string; // linked to Entry/Work
  type: 'to_deliver' | 'delivered'; // table type
  itemSlNo: string;
  specName: string;
  estimatedQuantity: number;
  deliveredQuantityInCft: number;
  balanceQuantityInCft: number; // (estimatedQuantity - deliveredQuantityInCft)
  totalQuantityInSite: number; // (deliveredQuantityInCft)
  createdAt: string;
}

// MODULE 5 - PRIVATE WORK STATUS / ENTRY
export interface PrivateWork {
  id: string;
  workName: string;
  approxAmount: number;
  location: string;
  relatedToContractWork?: string;
  siteVisitDate: string;
  roadWorkNature: string;
  completedDate: string;
  advanceReceived: number;
  approxFinalWorkAmount: number;
  paymentReceived: number;
  paymentBalance: number; // (approxFinalWorkAmount - paymentReceived)
  remarks?: string;
  createdAt: string;
}

// MODULE 6 - TAR LOAD UPDATION
export interface TarLoad {
  id: string;
  purchasedFrom: string;
  item: 'RS1' | 'SS1' | 'VG30';
  quantityInKg: number;
  loadInNoOfPack: number;
  addressedOffice: string;
  paidAmount: number;
  balanceToBePaid: number; // calculated: amountPerLoad - paidAmount
  purchasedDate: string;
  billingNameBuyer: string;
  remarks?: string;
  amountPerLoad: number;
  createdAt: string;

  // Current Stock Available
  currentStockDate?: string;
  currentStockQty?: number;
  currentStockUsed?: number;
  currentStockBalance?: number;
  currentStockUsedAmount?: number;
  currentStockBalanceAmount?: number;

  // Payment Details
  paymentPartyName?: string;
  paymentBillAmount?: number;
  paymentBillDate?: string;
  paymentPaidAmount?: number;
  paymentBalanceAmount?: number;
  paymentRemarks?: string;
}

// MODULE 7, 8 - WORK BASED ENTRY
export interface WorkBasedEntry {
  id: string;
  entryId: string; // linked to Entry/Work Name
  itemSlNo: string;
  itemName: string;
  itemQuantity: number;
  itemRateAsPerEstimate: number;
  totalAmountPerItem: number; // (itemQuantity * itemRateAsPerEstimate)
  itemUnit: string;
  createdAt: string;
}
