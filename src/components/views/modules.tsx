"use client";

import { useState } from "react";
import { 
  Plus, Search, FileDown, Edit2, Trash2, Calendar, FileText, CheckCircle, 
  AlertCircle, X, ChevronRight, Filter, Printer
} from "lucide-react";
import { 
  CementLoad, Entry, StockRegisterItem, SiteMaterial, 
  PrivateWork, TarLoad, WorkBasedEntry 
} from "@/lib/types";

// Common helper for CSV exports
const exportCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  );
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==========================================
// MODULE 1 – CEMENT LOAD UPDATION
// ==========================================
export function CementLoadView({
  cementLoads,
  onRefresh,
  onCreateCementLoad,
  onUpdateCementLoad,
  onDeleteCementLoad,
  onNavigate
}: {
  cementLoads: CementLoad[];
  onRefresh: () => void;
  onCreateCementLoad: (data: any) => Promise<any>;
  onUpdateCementLoad: (id: string, data: any) => Promise<any>;
  onDeleteCementLoad: (id: string) => Promise<any>;
  onNavigate: (tab: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Fields
  const [purchasedFrom, setPurchasedFrom] = useState("");
  const [cementCompany, setCementCompany] = useState("");
  const [loadInTonne, setLoadInTonne] = useState(0);
  const [loadInBags, setLoadInBags] = useState(0);
  const [amountPerLoad, setAmountPerLoad] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [remarks, setRemarks] = useState("");

  // Current Stock Available
  const [currentStockDate, setCurrentStockDate] = useState("");
  const [currentStockQty, setCurrentStockQty] = useState(0);
  const [currentStockUsed, setCurrentStockUsed] = useState(0);
  const [currentStockUsedAmount, setCurrentStockUsedAmount] = useState(0);
  const [currentStockBalanceAmount, setCurrentStockBalanceAmount] = useState(0);

  // Payment Details
  const [paymentPartyName, setPaymentPartyName] = useState("");
  const [paymentBillAmount, setPaymentBillAmount] = useState(0);
  const [paymentBillDate, setPaymentBillDate] = useState("");
  const [paymentPaidAmount, setPaymentPaidAmount] = useState(0);
  const [paymentRemarks, setPaymentRemarks] = useState("");

  // Search/Filter
  const [searchQuery, setSearchQuery] = useState("");

  const clearForm = () => {
    setPurchasedFrom("");
    setCementCompany("");
    setLoadInTonne(0);
    setLoadInBags(0);
    setAmountPerLoad(0);
    setPaidAmount(0);
    setPurchaseDate("");
    setBuyerName("");
    setRemarks("");

    setCurrentStockDate("");
    setCurrentStockQty(0);
    setCurrentStockUsed(0);
    setCurrentStockUsedAmount(0);
    setCurrentStockBalanceAmount(0);

    setPaymentPartyName("");
    setPaymentBillAmount(0);
    setPaymentBillDate("");
    setPaymentPaidAmount(0);
    setPaymentRemarks("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      purchasedFrom, cementCompany,
      loadInTonne: Number(loadInTonne),
      loadInBags: Number(loadInBags),
      amountPerLoad: Number(amountPerLoad),
      paidAmount: Number(paidAmount),
      purchaseDate, buyerName, remarks,

      // Current Stock Available
      currentStockDate,
      currentStockQty: Number(currentStockQty),
      currentStockUsed: Number(currentStockUsed),
      currentStockBalance: Number(currentStockQty - currentStockUsed),
      currentStockUsedAmount: Number(currentStockUsedAmount),
      currentStockBalanceAmount: Number(currentStockBalanceAmount),

      // Payment Details
      paymentPartyName,
      paymentBillAmount: Number(paymentBillAmount),
      paymentBillDate,
      paymentPaidAmount: Number(paymentPaidAmount),
      paymentBalanceAmount: Number(paymentBillAmount - paymentPaidAmount),
      paymentRemarks
    };

    if (editingId) {
      await onUpdateCementLoad(editingId, payload);
    } else {
      await onCreateCementLoad(payload);
    }
    clearForm();
    setEditingId(null);
    setShowForm(false);
    onRefresh();
  };

  const handleEdit = (load: CementLoad) => {
    setEditingId(load.id);
    setPurchasedFrom(load.purchasedFrom);
    setCementCompany(load.cementCompany);
    setLoadInTonne(load.loadInTonne);
    setLoadInBags(load.loadInBags);
    setAmountPerLoad(load.amountPerLoad);
    setPaidAmount(load.paidAmount);
    setPurchaseDate(load.purchaseDate.substring(0, 10));
    setBuyerName(load.buyerName);
    setRemarks(load.remarks || "");

    setCurrentStockDate(load.currentStockDate ? load.currentStockDate.substring(0, 10) : "");
    setCurrentStockQty(load.currentStockQty || 0);
    setCurrentStockUsed(load.currentStockUsed || 0);
    setCurrentStockUsedAmount(load.currentStockUsedAmount || 0);
    setCurrentStockBalanceAmount(load.currentStockBalanceAmount || 0);

    setPaymentPartyName(load.paymentPartyName || "");
    setPaymentBillAmount(load.paymentBillAmount || 0);
    setPaymentBillDate(load.paymentBillDate ? load.paymentBillDate.substring(0, 10) : "");
    setPaymentPaidAmount(load.paymentPaidAmount || 0);
    setPaymentRemarks(load.paymentRemarks || "");

    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this cement load?")) {
      await onDeleteCementLoad(id);
      onRefresh();
    }
  };

  const totalBags = cementLoads.reduce((sum, item) => sum + item.loadInBags, 0);
  const totalTonne = cementLoads.reduce((sum, item) => sum + item.loadInTonne, 0);
  const totalAmount = cementLoads.reduce((sum, item) => sum + item.amountPerLoad, 0);
  const totalPaid = cementLoads.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalBalance = totalAmount - totalPaid;

  const filteredLoads = cementLoads.filter(c => 
    c.purchasedFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cementCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black">Cement Load Updation</h2>
          <p className="text-xs text-neutral-500">Record purchases, update stock levels, and track remaining balances.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportCSV(cementLoads, "cement_loads")}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Export Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Print
          </button>
          {!showForm && (
            <button 
              onClick={() => { clearForm(); setEditingId(null); setShowForm(true); }}
              className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded cursor-pointer"
            >
              Add Cement Load
            </button>
          )}
          <button 
            onClick={() => onNavigate("dashboard")}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Total Bags Purchased</div>
          <div className="text-xl font-mono font-bold mt-1 text-black">{totalBags} Bags</div>
        </div>
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Total Weight</div>
          <div className="text-xl font-mono font-bold mt-1 text-black">{totalTonne} Tonnes</div>
        </div>
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Total Cost</div>
          <div className="text-xl font-mono font-bold mt-1 text-black">₹{totalAmount.toLocaleString()}</div>
        </div>
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Total Balance Due</div>
          <div className="text-xl font-mono font-bold mt-1 text-black">₹{totalBalance.toLocaleString()}</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="border border-neutral-300 bg-white p-5 rounded space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-200 pb-2">
            {editingId ? "Update Cement Load" : "New Cement Load Details"}
          </h3>
          
          {/* Main Load Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Purchased From</label>
              <input 
                type="text" required value={purchasedFrom} onChange={(e) => setPurchasedFrom(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="Vendor Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Cement Company</label>
              <input 
                type="text" required value={cementCompany} onChange={(e) => setCementCompany(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="e.g. UltraTech, ACC"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Purchased Date</label>
              <input 
                type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Load In Tonne</label>
              <input 
                type="number" step="any" required value={loadInTonne} onChange={(e) => setLoadInTonne(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Load In No. Of Pack</label>
              <input 
                type="number" required value={loadInBags} onChange={(e) => setLoadInBags(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Billing Name/Buyer</label>
              <input 
                type="text" required value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="Buyer Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Amount Per Load</label>
              <input 
                type="number" required value={amountPerLoad} onChange={(e) => setAmountPerLoad(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Paid Amount</label>
              <input 
                type="number" required value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Balance To Be Paid</label>
              <div className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono font-bold text-black">
                ₹{(amountPerLoad - paidAmount).toLocaleString()}
              </div>
            </div>
            <div className="col-span-1 md:col-span-3">
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Remarks</label>
              <textarea 
                rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="Additional notes"
              />
            </div>
          </div>

          {/* Current Stock Available Section */}
          <div className="border-t border-neutral-200 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">Current Stock Available</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Current Date</label>
                <input 
                  type="date" value={currentStockDate} onChange={(e) => setCurrentStockDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Stock</label>
                <input 
                  type="number" value={currentStockQty} onChange={(e) => setCurrentStockQty(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Used</label>
                <input 
                  type="number" value={currentStockUsed} onChange={(e) => setCurrentStockUsed(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Balance</label>
                <div className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono font-bold text-black">
                  {(currentStockQty - currentStockUsed).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">U Amount</label>
                <input 
                  type="number" value={currentStockUsedAmount} onChange={(e) => setCurrentStockUsedAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Bal Amount</label>
                <input 
                  type="number" value={currentStockBalanceAmount} onChange={(e) => setCurrentStockBalanceAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="border-t border-neutral-200 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Party Name</label>
                <input 
                  type="text" value={paymentPartyName} onChange={(e) => setPaymentPartyName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                  placeholder="Party Name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Bill Amount</label>
                <input 
                  type="number" value={paymentBillAmount} onChange={(e) => setPaymentBillAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Bill Date</label>
                <input 
                  type="date" value={paymentBillDate} onChange={(e) => setPaymentBillDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Paid Amount</label>
                <input 
                  type="number" value={paymentPaidAmount} onChange={(e) => setPaymentPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Balance Amount</label>
                <div className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-mono font-bold text-black">
                  ₹{(paymentBillAmount - paymentPaidAmount).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Remarks</label>
                <input 
                  type="text" value={paymentRemarks} onChange={(e) => setPaymentRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                  placeholder="Payment remarks"
                />
              </div>
            </div>
          </div>

          {/* Action buttons on every page: Edit, Save, Clear, Update, Cancel, Back */}
          <div className="flex gap-2 justify-end border-t border-neutral-200 pt-3">
            {editingId && (
              <button 
                type="button" onClick={() => handleEdit(cementLoads.find(c => c.id === editingId)!)}
                className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
              >
                Edit
              </button>
            )}
            {!editingId ? (
              <button 
                type="submit"
                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-850 text-xs font-semibold rounded cursor-pointer"
              >
                Save
              </button>
            ) : (
              <button 
                type="submit"
                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-850 text-xs font-semibold rounded cursor-pointer"
              >
                Update
              </button>
            )}
            <button 
              type="button" onClick={clearForm}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Clear
            </button>
            <button 
              type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Back
            </button>
          </div>
        </form>
      )}

      {/* Main Table view */}
      <div className="border border-neutral-200 bg-white rounded overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
            <input 
              type="text" placeholder="Search party or brand..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                <th className="p-3">Date</th>
                <th className="p-3">Party (Purchased From)</th>
                <th className="p-3">Company</th>
                <th className="p-3 text-right">Load (T)</th>
                <th className="p-3 text-right">Packs (Bags)</th>
                <th className="p-3 text-right">Total Amt</th>
                <th className="p-3 text-right">Paid Amt</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLoads.map(load => (
                <tr key={load.id} className="hover:bg-neutral-55">
                  <td className="p-3 font-mono text-black">{load.purchaseDate.substring(0, 10)}</td>
                  <td className="p-3 font-bold text-black">{load.purchasedFrom}</td>
                  <td className="p-3 text-black">{load.cementCompany}</td>
                  <td className="p-3 text-right font-mono text-black">{load.loadInTonne} T</td>
                  <td className="p-3 text-right font-mono text-black">{load.loadInBags}</td>
                  <td className="p-3 text-right font-mono text-black">₹{load.amountPerLoad.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-neutral-600">₹{load.paidAmount.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold text-black">₹{load.balanceAmount.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(load)} className="px-2 py-1 border border-neutral-300 rounded text-[10px] font-bold text-black hover:bg-neutral-100 cursor-pointer">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(load.id)} className="px-2 py-1 border border-neutral-300 rounded text-[10px] font-bold text-black hover:bg-neutral-100 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLoads.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-neutral-400">No cement load records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 2 – ENTRY
// ==========================================
export function EntryView({
  entries,
  onRefresh,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  onNavigate
}: {
  entries: Entry[];
  onRefresh: () => void;
  onCreateEntry: (data: any) => Promise<any>;
  onUpdateEntry: (id: string, data: any) => Promise<any>;
  onDeleteEntry: (id: string) => Promise<any>;
  onNavigate: (tab: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [workName, setWorkName] = useState("");
  const [amount, setAmount] = useState(0);
  const [nameOfOffice, setNameOfOffice] = useState("");
  const [mlaMpName, setMlaMpName] = useState("");
  const [loaReceived, setLoaReceived] = useState(false);
  const [lastDateToExecuteAgreement, setLastDateToExecuteAgreement] = useState("");
  const [amountOfStampPaperRequired, setAmountOfStampPaperRequired] = useState(0);
  const [securityAmount, setSecurityAmount] = useState(0);
  const [performanceGuarantee, setPerformanceGuarantee] = useState(0);
  const [dlpPeriodAsPerInLOA, setDlpPeriodAsPerInLOA] = useState("");
  const [agreementNo, setAgreementNo] = useState("");
  const [siteHandoverDate, setSiteHandoverDate] = useState("");
  const [workCompletionDateAsPerAgreement, setWorkCompletionDateAsPerAgreement] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const clearForm = () => {
    setWorkName("");
    setAmount(0);
    setNameOfOffice("");
    setMlaMpName("");
    setLoaReceived(false);
    setLastDateToExecuteAgreement("");
    setAmountOfStampPaperRequired(0);
    setSecurityAmount(0);
    setPerformanceGuarantee(0);
    setDlpPeriodAsPerInLOA("");
    setAgreementNo("");
    setSiteHandoverDate("");
    setWorkCompletionDateAsPerAgreement("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      workName,
      amount: Number(amount),
      nameOfOffice,
      mlaMpName,
      loaReceived,
      lastDateToExecuteAgreement,
      amountOfStampPaperRequired: Number(amountOfStampPaperRequired),
      securityAmount: Number(securityAmount),
      performanceGuarantee: Number(performanceGuarantee),
      dlpPeriodAsPerInLOA,
      agreementNo,
      siteHandoverDate,
      workCompletionDateAsPerAgreement,
      // Default placeholder fields for other views
      status: "Not Started",
      paymentReceived: 0
    };
    if (editingId) {
      await onUpdateEntry(editingId, payload);
    } else {
      await onCreateEntry(payload);
    }
    clearForm();
    setEditingId(null);
    setShowForm(false);
    onRefresh();
  };

  const handleEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setWorkName(entry.workName);
    setAmount(entry.amount);
    setNameOfOffice(entry.nameOfOffice);
    setMlaMpName(entry.mlaMpName || "");
    setLoaReceived(entry.loaReceived);
    setLastDateToExecuteAgreement(entry.lastDateToExecuteAgreement.substring(0, 10));
    setAmountOfStampPaperRequired(entry.amountOfStampPaperRequired);
    setSecurityAmount(entry.securityAmount);
    setPerformanceGuarantee(entry.performanceGuarantee);
    setDlpPeriodAsPerInLOA(entry.dlpPeriodAsPerInLOA);
    setAgreementNo(entry.agreementNo);
    setSiteHandoverDate(entry.siteHandoverDate.substring(0, 10));
    setWorkCompletionDateAsPerAgreement(entry.workCompletionDateAsPerAgreement.substring(0, 10));
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project entry?")) {
      await onDeleteEntry(id);
      onRefresh();
    }
  };

  const filteredEntries = entries.filter(e => 
    e.workName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.agreementNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.nameOfOffice.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black">Entry</h2>
          <p className="text-xs text-neutral-500">Record work details, agreements, SLA specifications, and handover timelines.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportCSV(entries, "work_entries")}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Export Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Print
          </button>
          {!showForm && (
            <button 
              onClick={() => { clearForm(); setEditingId(null); setShowForm(true); }}
              className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded cursor-pointer"
            >
              Add Entry
            </button>
          )}
          <button 
            onClick={() => onNavigate("dashboard")}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="border border-neutral-300 bg-white p-5 rounded space-y-4">
          <h3 className="text-xs font-bold uppercase border-b border-neutral-200 pb-2 text-black">
            {editingId ? "Update Entry details" : "New Contract / Project Entry"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Work Name</label>
              <input 
                type="text" required value={workName} onChange={(e) => setWorkName(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="Full title of the project"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Amount</label>
              <input 
                type="number" required value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Name Of Office</label>
              <input 
                type="text" required value={nameOfOffice} onChange={(e) => setNameOfOffice(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="e.g. NHAI Regional Office, PWD"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">MLA/MP Name (Optional)</label>
              <input 
                type="text" value={mlaMpName} onChange={(e) => setMlaMpName(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="Constituency details"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">LOA Received</label>
              <select 
                value={loaReceived ? "true" : "false"} onChange={(e) => setLoaReceived(e.target.value === "true")}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
              >
                <option value="false">No / Pending</option>
                <option value="true">Yes / Received</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Last Date To Execute Agreement</label>
              <input 
                type="date" required value={lastDateToExecuteAgreement} onChange={(e) => setLastDateToExecuteAgreement(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Amount Of Stamp Paper Required</label>
              <input 
                type="number" required value={amountOfStampPaperRequired} onChange={(e) => setAmountOfStampPaperRequired(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Security Amount</label>
              <input 
                type="number" required value={securityAmount} onChange={(e) => setSecurityAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Performance Guarantee (If Applicable)</label>
              <input 
                type="number" value={performanceGuarantee} onChange={(e) => setPerformanceGuarantee(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">DLP Period As Per In LOA</label>
              <input 
                type="text" required value={dlpPeriodAsPerInLOA} onChange={(e) => setDlpPeriodAsPerInLOA(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
                placeholder="e.g. 24 Months, 3 Years"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Agreement No</label>
              <input 
                type="text" required value={agreementNo} onChange={(e) => setAgreementNo(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
                placeholder="AGR-..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Site Handover Date</label>
              <input 
                type="date" required value={siteHandoverDate} onChange={(e) => setSiteHandoverDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Work Completion Date As Per Agreement</label>
              <input 
                type="date" required value={workCompletionDateAsPerAgreement} onChange={(e) => setWorkCompletionDateAsPerAgreement(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-neutral-200 pt-3">
            {editingId && (
              <button 
                type="button" onClick={() => handleEdit(entries.find(e => e.id === editingId)!)}
                className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
              >
                Edit
              </button>
            )}
            {!editingId ? (
              <button 
                type="submit"
                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-850 text-xs font-semibold rounded cursor-pointer"
              >
                Save
              </button>
            ) : (
              <button 
                type="submit"
                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-850 text-xs font-semibold rounded cursor-pointer"
              >
                Update
              </button>
            )}
            <button 
              type="button" onClick={clearForm}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Clear
            </button>
            <button 
              type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Back
            </button>
          </div>
        </form>
      )}

      {/* Main Table view */}
      <div className="border border-neutral-200 bg-white rounded overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
            <input 
              type="text" placeholder="Search work title or agreement..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                <th className="p-3">Work Name</th>
                <th className="p-3">Office</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Agreement No.</th>
                <th className="p-3">Handover</th>
                <th className="p-3">Completion Date</th>
                <th className="p-3 text-center">LOA</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredEntries.map(e => (
                <tr key={e.id} className="hover:bg-neutral-55">
                  <td className="p-3">
                    <div className="font-bold text-black">{e.workName}</div>
                  </td>
                  <td className="p-3 text-neutral-600">{e.nameOfOffice}</td>
                  <td className="p-3 text-right font-mono font-bold text-black">₹{e.amount.toLocaleString()}</td>
                  <td className="p-3 font-mono text-black">{e.agreementNo || "Pending"}</td>
                  <td className="p-3 font-mono text-black">{e.siteHandoverDate.substring(0, 10)}</td>
                  <td className="p-3 font-mono text-black">{e.workCompletionDateAsPerAgreement.substring(0, 10)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${e.loaReceived ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-neutral-500'}`}>
                      {e.loaReceived ? "YES" : "NO"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(e)} className="px-2 py-1 border border-neutral-300 rounded text-[10px] font-bold text-black hover:bg-neutral-100 cursor-pointer">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="px-2 py-1 border border-neutral-300 rounded text-[10px] font-bold text-black hover:bg-neutral-100 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-neutral-400">No project entries logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// MODULE 3 – STOCK REGISTER
// ==========================================
export function StockRegisterView({
  stockItems,
  onRefresh,
  onUpdateStockItem,
  onNavigate
}: {
  stockItems: StockRegisterItem[];
  onRefresh: () => void;
  onUpdateStockItem: (id: string, data: any) => Promise<any>;
  onNavigate: (tab: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [inBarrel, setInBarrel] = useState(0);
  const [inKg, setInKg] = useState(0);
  const [inTonne, setInTonne] = useState(0);
  const [usedInTonne, setUsedInTonne] = useState(0);
  const [materialName, setMaterialName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (item: StockRegisterItem) => {
    setEditingId(item.id);
    setMaterialName(item.materialName);
    setInBarrel(item.inBarrel);
    setInKg(item.inKg);
    setInTonne(item.inTonne);
    setUsedInTonne(item.usedInTonne);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    await onUpdateStockItem(editingId, {
      inBarrel: Number(inBarrel),
      inKg: Number(inKg),
      inTonne: Number(inTonne),
      usedInTonne: Number(usedInTonne)
    });
    setEditingId(null);
    onRefresh();
  };

  const clearForm = () => {
    setInBarrel(0);
    setInKg(0);
    setInTonne(0);
    setUsedInTonne(0);
  };

  const filteredItems = stockItems.filter(item => 
    item.materialName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black">Stock Register</h2>
          <p className="text-xs text-neutral-500">Real-time inventory levels of raw building material aggregates.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportCSV(stockItems, "stock_register")}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Export Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Print
          </button>
          <button 
            onClick={() => onNavigate("dashboard")}
            className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      {editingId && (
        <form onSubmit={handleSave} className="border border-neutral-300 bg-white p-5 rounded space-y-4">
          <h3 className="text-xs font-bold uppercase border-b border-neutral-200 pb-2 text-black">
            Update Stock levels for {materialName}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">In Barrel</label>
              <input 
                type="number" required value={inBarrel} onChange={(e) => setInBarrel(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">In KG</label>
              <input 
                type="number" required value={inKg} onChange={(e) => setInKg(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">In Tonne</label>
              <input 
                type="number" required value={inTonne} onChange={(e) => setInTonne(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Used In Tonne</label>
              <input 
                type="number" required value={usedInTonne} onChange={(e) => setUsedInTonne(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black font-mono text-black bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-neutral-200 pt-3">
            <button 
              type="button" onClick={() => handleEdit(stockItems.find(s => s.id === editingId)!)}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Edit
            </button>
            <button 
              type="submit"
              className="px-3 py-1.5 bg-black text-white hover:bg-neutral-850 text-xs font-semibold rounded cursor-pointer"
            >
              Update
            </button>
            <button 
              type="button" onClick={clearForm}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Clear
            </button>
            <button 
              type="button" onClick={() => setEditingId(null)}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button" onClick={() => setEditingId(null)}
              className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold rounded text-black bg-white cursor-pointer"
            >
              Back
            </button>
          </div>
        </form>
      )}

      <div className="border border-neutral-200 bg-white rounded overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
            <input 
              type="text" placeholder="Search material..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black text-black bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                <th className="p-3.5">Material Name</th>
                <th className="p-3.5 text-right">In Barrel</th>
                <th className="p-3.5 text-right">In KG</th>
                <th className="p-3.5 text-right">In Tonne</th>
                <th className="p-3.5 text-right">Used In Tonne</th>
                <th className="p-3.5 text-right">Balance In Tonne</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-neutral-55">
                  <td className="p-3.5 font-bold text-black">{item.materialName}</td>
                  <td className="p-3.5 text-right font-mono text-black">{item.inBarrel.toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono text-black">{item.inKg.toLocaleString()} KG</td>
                  <td className="p-3.5 text-right font-mono text-black">{item.inTonne.toLocaleString()} T</td>
                  <td className="p-3.5 text-right font-mono text-neutral-500">{item.usedInTonne.toLocaleString()} T</td>
                  <td className="p-3.5 text-right font-mono font-bold text-black border-l border-neutral-50 bg-neutral-50">
                    {(item.inTonne - item.usedInTonne).toLocaleString()} T
                  </td>
                  <td className="p-3.5 text-right">
                    <button onClick={() => handleEdit(item)} className="px-2 py-1 border border-neutral-300 rounded text-[10px] font-bold text-black hover:bg-neutral-100 cursor-pointer">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// MODULE 4 – TOTAL MATERIALS USED IN SITE
// ==========================================
export function MaterialsUsedView({
  entries,
  siteMaterials,
  onRefresh,
  onCreateSiteMaterial,
  onUpdateSiteMaterial,
  onDeleteSiteMaterial,
  onNavigate
}: {
  entries: Entry[];
  siteMaterials: SiteMaterial[];
  onRefresh: () => void;
  onCreateSiteMaterial: (data: any) => Promise<any>;
  onUpdateSiteMaterial: (id: string, data: any) => Promise<any>;
  onDeleteSiteMaterial: (id: string) => Promise<any>;
  onNavigate: (tab: string) => void;
}) {
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemType, setItemType] = useState<'to_deliver' | 'delivered'>('to_deliver');
const [searchQuery, setSearchQuery] = useState("");

  // Form inputs
  const [itemSlNo, setItemSlNo] = useState("");
  const [specName, setSpecName] = useState("");
  const [estimatedQuantity, setEstimatedQuantity] = useState(0);
  const [deliveredQuantity, setDeliveredQuantity] = useState(0);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  const clearForm = () => {
    setItemSlNo("");
    setSpecName("");
    setEstimatedQuantity(0);
    setDeliveredQuantity(0);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryId) return;
    await onCreateSiteMaterial({
      entryId: selectedEntryId,
      type: itemType,
      itemSlNo,
      specName,
      estimatedQuantity: Number(estimatedQuantity),
      deliveredQuantityInCft: Number(deliveredQuantity)
    });
    clearForm();
    setShowItemForm(false);
    onRefresh();
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Remove this item?")) {
      await onDeleteSiteMaterial(id);
      onRefresh();
    }
  };

  // Filter items linked to chosen Work
  const currentWorkMaterials = siteMaterials.filter(m => m.entryId === selectedEntryId);
  const toDeliverList = currentWorkMaterials.filter(m => m.type === 'to_deliver');
  const deliveredList = currentWorkMaterials.filter(m => m.type === 'delivered');
  // Apply search filter on specName
  const filteredToDeliver = toDeliverList.filter(item =>
    item.specName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDelivered = deliveredList.filter(item =>
    item.specName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Total Materials Used in Site</h2>
        <p className="text-xs text-neutral-500 font-medium">Select a contract work to log estimated deliverables and reconcile materials dispatched to the site.</p>
      </div>

      {/* Action Toolbar */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => exportCSV(siteMaterials, "materials_used")}
          className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
        >
          Export Excel
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
        >
          Print
        </button>
        <button
          onClick={() => onNavigate("dashboard")}
          className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
        >
          Back
        </button>
      </div>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
        />
      </div>

      {/* Select work name drop-down */}
      <div className="border border-neutral-200 bg-white p-4 rounded">
        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1.5">Select Work Name</label>
        <select 
          value={selectedEntryId} onChange={(e) => setSelectedEntryId(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-semibold"
        >
          <option value="">-- Choose Contract Work --</option>
          {entries.map(e => (
            <option key={e.id} value={e.id}>{e.workName}</option>
          ))}
        </select>
      </div>

      {selectedEntry && (
        <div className="space-y-6 animate-fade-in">
          {/* Work Metadata */}
          <div className="border border-neutral-200 bg-white p-4 rounded grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold">Work Name</span>
              <span className="font-bold">{selectedEntry.workName}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold">Total Amount</span>
              <span className="font-mono font-bold">₹{selectedEntry.amount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold">Handover Date</span>
              <span className="font-mono font-bold">{selectedEntry.siteHandoverDate.substring(0, 10)}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px] uppercase font-bold">Completion Date</span>
              <span className="font-mono font-bold">{selectedEntry.workCompletionDateAsPerAgreement.substring(0, 10)}</span>
            </div>
          </div>

          {showItemForm && (
            <form onSubmit={handleAddItem} className="border border-black bg-white p-4 rounded space-y-4">
              <h4 className="text-xs font-bold uppercase border-b border-neutral-100 pb-2">
                Add item to {itemType === 'to_deliver' ? "Materials To Be Delivered" : "Stock Delivered In Site"}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Sl No</label>
                  <input type="text" required value={itemSlNo} onChange={(e) => setItemSlNo(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Spec/Item Name</label>
                  <input type="text" required value={specName} onChange={(e) => setSpecName(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Estimated Quantity</label>
                  <input type="number" required value={estimatedQuantity} onChange={(e) => setEstimatedQuantity(Number(e.target.value))} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Delivered Qty (CFT)</label>
                  <input type="number" required value={deliveredQuantity} onChange={(e) => setDeliveredQuantity(Number(e.target.value))} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-neutral-50 pt-3">
                <button type="button" onClick={clearForm} className="px-3 py-1 border border-neutral-200 text-xs rounded">Clear</button>
                <button type="button" onClick={() => setShowItemForm(false)} className="px-3 py-1 border border-neutral-200 text-xs rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-neutral-900">Save</button>
              </div>
            </form>
          )}

          {/* Table 1: Materials To Be Delivered */}
          <div className="border border-neutral-200 bg-white rounded overflow-hidden">
            <div className="bg-neutral-50 p-3 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase text-neutral-800">1. Materials To Be Delivered To Site</h3>
              <button 
                onClick={() => { setItemType('to_deliver'); setShowItemForm(true); }}
                className="px-2 py-1 bg-black text-white hover:bg-neutral-900 text-[10px] font-bold uppercase rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                  <th className="p-3">Sl No</th>
                  <th className="p-3">Spec Name</th>
                  <th className="p-3 text-right">Est. Qty</th>
                  <th className="p-3 text-right">Delivered Qty In CFT</th>
                  <th className="p-3 text-right">Bal Qty In CFT</th>
                  <th className="p-3 text-right">Total Qty In Site</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredToDeliver.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono">{item.itemSlNo}</td>
                    <td className="p-3 font-semibold">{item.specName}</td>
                    <td className="p-3 text-right font-mono">{item.estimatedQuantity}</td>
                    <td className="p-3 text-right font-mono">{item.deliveredQuantityInCft}</td>
                    <td className="p-3 text-right font-mono font-bold">{item.balanceQuantityInCft}</td>
                    <td className="p-3 text-right font-mono font-bold text-black">{item.totalQuantityInSite}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteItem(item.id)} className="text-neutral-500 hover:text-black">
                        <Trash2 className="w-3.5 h-3.5 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredToDeliver.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-neutral-400">No estimated delivery plans logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table 2: Stock Delivered In Site */}
          <div className="border border-neutral-200 bg-white rounded overflow-hidden">
            <div className="bg-neutral-50 p-3 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase text-neutral-800">2. Stock Delivered In Site</h3>
              <button 
                onClick={() => { setItemType('delivered'); setShowItemForm(true); }}
                className="px-2 py-1 bg-black text-white hover:bg-neutral-900 text-[10px] font-bold uppercase rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                  <th className="p-3">Sl No</th>
                  <th className="p-3">Spec Name</th>
                  <th className="p-3 text-right">Est. Qty</th>
                  <th className="p-3 text-right">Delivered Qty In CFT</th>
                  <th className="p-3 text-right">Bal Qty In CFT</th>
                  <th className="p-3 text-right">Total Qty In Site</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredDelivered.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono">{item.itemSlNo}</td>
                    <td className="p-3 font-semibold">{item.specName}</td>
                    <td className="p-3 text-right font-mono">{item.estimatedQuantity}</td>
                    <td className="p-3 text-right font-mono">{item.deliveredQuantityInCft}</td>
                    <td className="p-3 text-right font-mono font-bold">{item.balanceQuantityInCft}</td>
                    <td className="p-3 text-right font-mono font-bold text-black">{item.totalQuantityInSite}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteItem(item.id)} className="text-neutral-500 hover:text-black">
                        <Trash2 className="w-3.5 h-3.5 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDelivered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-neutral-400">No site arrivals registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODULE 5 – PRIVATE WORK STATUS / ENTRY
// ==========================================
export function PrivateWorkView({
  privateWorks,
  onRefresh,
  onCreatePrivateWork,
  onUpdatePrivateWork,
  onDeletePrivateWork,
  onNavigate,
}: {
  privateWorks: PrivateWork[];
  onRefresh: () => void;
  onCreatePrivateWork: (data: any) => Promise<any>;
  onUpdatePrivateWork: (id: string, data: any) => Promise<any>;
  onDeletePrivateWork: (id: string) => Promise<any>;
  onNavigate: (tab: string) => void
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // States
  const [workName, setWorkName] = useState("");
  const [approxAmount, setApproxAmount] = useState(0);
  const [location, setLocation] = useState("");
  const [relatedToContractWork, setRelatedToContractWork] = useState("");
  const [siteVisitDate, setSiteVisitDate] = useState("");
  const [roadWorkNature, setRoadWorkNature] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [advanceReceived, setAdvanceReceived] = useState(0);
  const [approxFinalWorkAmount, setApproxFinalWorkAmount] = useState(0);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [remarks, setRemarks] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const clearForm = () => {
    setWorkName("");
    setApproxAmount(0);
    setLocation("");
    setRelatedToContractWork("");
    setSiteVisitDate("");
    setRoadWorkNature("");
    setCompletedDate("");
    setAdvanceReceived(0);
    setApproxFinalWorkAmount(0);
    setPaymentReceived(0);
    setRemarks("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      workName,
      approxAmount: Number(approxAmount),
      location,
      relatedToContractWork,
      siteVisitDate,
      roadWorkNature,
      completedDate,
      advanceReceived: Number(advanceReceived),
      approxFinalWorkAmount: Number(approxFinalWorkAmount),
      paymentReceived: Number(paymentReceived),
      remarks
    };
    if (editingId) {
      await onUpdatePrivateWork(editingId, payload);
    } else {
      await onCreatePrivateWork(payload);
    }
    clearForm();
    setEditingId(null);
    setShowForm(false);
    onRefresh();
  };

  const handleEdit = (w: PrivateWork) => {
    setEditingId(w.id);
    setWorkName(w.workName);
    setApproxAmount(w.approxAmount);
    setLocation(w.location);
    setRelatedToContractWork(w.relatedToContractWork || "");
    setSiteVisitDate(w.siteVisitDate.substring(0, 10));
    setRoadWorkNature(w.roadWorkNature);
    setCompletedDate(w.completedDate.substring(0, 10));
    setAdvanceReceived(w.advanceReceived);
    setApproxFinalWorkAmount(w.approxFinalWorkAmount);
    setPaymentReceived(w.paymentReceived);
    setRemarks(w.remarks || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this private work record?")) {
      await onDeletePrivateWork(id);
      onRefresh();
    }
  };

  const filtered = privateWorks.filter(w => 
    w.workName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Private Works</h2>
          <p className="text-xs text-neutral-500">Track and maintain status sheets for direct non-tender private civil jobs.</p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button 
              onClick={() => { clearForm(); setEditingId(null); setShowForm(true); }}
              className="px-3 py-1.5 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded"
            >
              New Private Work
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="border border-black bg-white p-5 rounded space-y-4">
          <h3 className="text-sm font-bold border-b border-neutral-100 pb-2">{editingId ? "Update Private Work details" : "New Private Work"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Work Name</label>
              <input 
                type="text" required value={workName} onChange={(e) => setWorkName(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Approx Amount (₹)</label>
              <input 
                type="number" required value={approxAmount} onChange={(e) => setApproxAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Location</label>
              <input 
                type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Related To Contract Work (If Any)</label>
              <input 
                type="text" value={relatedToContractWork} onChange={(e) => setRelatedToContractWork(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
                placeholder="Link to Government project"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Site Visit Date</label>
              <input 
                type="date" required value={siteVisitDate} onChange={(e) => setSiteVisitDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Road/Work Nature</label>
              <input 
                type="text" required value={roadWorkNature} onChange={(e) => setRoadWorkNature(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
                placeholder="e.g. Asphalting, Tiling"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Advance Received (₹)</label>
              <input 
                type="number" value={advanceReceived} onChange={(e) => setAdvanceReceived(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Approx Final Work Amount (₹)</label>
              <input 
                type="number" required value={approxFinalWorkAmount} onChange={(e) => setApproxFinalWorkAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Payment Received (₹)</label>
              <input 
                type="number" required value={paymentReceived} onChange={(e) => setPaymentReceived(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Payment Balance (₹)</label>
              <div className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs font-mono font-bold">
                ₹{(approxFinalWorkAmount - paymentReceived).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Completed Date</label>
              <input 
                type="date" required value={completedDate} onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Remarks</label>
              <textarea 
                rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-neutral-100 pt-3">
            <button type="button" onClick={clearForm} className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded">Clear</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded">Cancel</button>
            <button type="submit" className="px-3 py-1.5 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded">{editingId ? "Update" : "Save"}</button>
          </div>
        </form>
      )}

      {/* Main Table view */}
      <div className="border border-neutral-200 bg-white rounded overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
            <input 
              type="text" placeholder="Search work title or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                <th className="p-3">Work Name</th>
                <th className="p-3">Location</th>
                <th className="p-3">Nature</th>
                <th className="p-3 text-right">Approx Amt</th>
                <th className="p-3 text-right">Final Amt</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-right">Completed Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(w => (
                <tr key={w.id} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-bold">{w.workName}</td>
                  <td className="p-3">{w.location}</td>
                  <td className="p-3">{w.roadWorkNature}</td>
                  <td className="p-3 text-right font-mono">₹{w.approxAmount.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold">₹{w.approxFinalWorkAmount.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-neutral-600">₹{w.paymentReceived.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold">₹{w.paymentBalance.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono">{w.completedDate.substring(0, 10)}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(w)} className="p-1 hover:bg-neutral-100 rounded text-neutral-600">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(w.id)} className="p-1 hover:bg-neutral-150 rounded text-neutral-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-neutral-400">No private works logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 6 – TAR LOAD UPDATION
// ==========================================
export function TarLoadView({
  tarLoads,
  onRefresh,
  onCreateTarLoad,
  onUpdateTarLoad,
  onDeleteTarLoad,
  onNavigate,
}: {
  tarLoads: TarLoad[];
  onRefresh: () => void;
  onCreateTarLoad: (data: any) => Promise<any>;
  onUpdateTarLoad: (id: string, data: any) => Promise<any>;
  onDeleteTarLoad: (id: string) => Promise<any>;
  onNavigate: (tab: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // States
  const [purchasedFrom, setPurchasedFrom] = useState("");
  const [item, setItem] = useState<'RS1' | 'SS1' | 'VG30'>("VG30");
  const [quantityInKg, setQuantityInKg] = useState(0);
  const [loadInNoOfPack, setLoadInNoOfPack] = useState(0);
  const [addressedOffice, setAddressedOffice] = useState("");
  const [amountPerLoad, setAmountPerLoad] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [purchasedDate, setPurchasedDate] = useState("");
  const [billingNameBuyer, setBillingNameBuyer] = useState("");
  const [remarks, setRemarks] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const clearForm = () => {
    setPurchasedFrom("");
    setItem("VG30");
    setQuantityInKg(0);
    setLoadInNoOfPack(0);
    setAddressedOffice("");
    setAmountPerLoad(0);
    setPaidAmount(0);
    setPurchasedDate("");
    setBillingNameBuyer("");
    setRemarks("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      purchasedFrom,
      item,
      quantityInKg: Number(quantityInKg),
      loadInNoOfPack: Number(loadInNoOfPack),
      addressedOffice,
      amountPerLoad: Number(amountPerLoad),
      paidAmount: Number(paidAmount),
      purchasedDate,
      billingNameBuyer,
      remarks
    };
    if (editingId) {
      await onUpdateTarLoad(editingId, payload);
    } else {
      await onCreateTarLoad(payload);
    }
    clearForm();
    setEditingId(null);
    setShowForm(false);
    onRefresh();
  };

  const handleEdit = (load: TarLoad) => {
    setEditingId(load.id);
    setPurchasedFrom(load.purchasedFrom);
    setItem(load.item);
    setQuantityInKg(load.quantityInKg);
    setLoadInNoOfPack(load.loadInNoOfPack);
    setAddressedOffice(load.addressedOffice);
    setAmountPerLoad(load.amountPerLoad || 0);
    setPaidAmount(load.paidAmount);
    setPurchasedDate(load.purchasedDate.substring(0, 10));
    setBillingNameBuyer(load.billingNameBuyer);
    setRemarks(load.remarks || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this tar load sheet?")) {
      await onDeleteTarLoad(id);
      onRefresh();
    }
  };

  const totalKg = tarLoads.reduce((sum, item) => sum + item.quantityInKg, 0);
  const totalPacks = tarLoads.reduce((sum, item) => sum + item.loadInNoOfPack, 0);
  const totalAmount = tarLoads.reduce((sum, item) => sum + (item.amountPerLoad || 0), 0);
  const totalPaid = tarLoads.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalBalance = totalAmount - totalPaid;

  const filtered = tarLoads.filter(t => 
    t.purchasedFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => exportCSV(tarLoads, "tar_loads")}
          className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
        >
          Export Excel
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
        >
          Print
        </button>
        <button
          onClick={() => onNavigate("dashboard")}
          className="px-3 py-1.5 border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 rounded text-black bg-white cursor-pointer"
        >
          Back
        </button>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Tar Load Updation</h2>
          <p className="text-xs text-neutral-500">Log incoming road paving emulsions, VG-30 Bitumen packs, and calculate balances.</p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button 
              onClick={() => { clearForm(); setEditingId(null); setShowForm(true); }}
              className="px-3 py-1.5 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded"
            >
              New Tar Load
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Total KG Received</div>
          <div className="text-xl font-mono font-bold mt-1">{totalKg.toLocaleString()} KG</div>
        </div>
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Total No. of Pack</div>
          <div className="text-xl font-mono font-bold mt-1">{totalPacks} Packs</div>
        </div>
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Total Purchase bill</div>
          <div className="text-xl font-mono font-bold mt-1">₹{totalAmount.toLocaleString()}</div>
        </div>
        <div className="border border-neutral-200 bg-white p-4 rounded">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Outstanding Balance</div>
          <div className="text-xl font-mono font-bold mt-1 text-black">₹{totalBalance.toLocaleString()}</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="border border-black bg-white p-5 rounded space-y-4">
          <h3 className="text-sm font-bold border-b border-neutral-100 pb-2">{editingId ? "Update Tar Load" : "New Tar Load Details"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Purchased From</label>
              <input 
                type="text" required value={purchasedFrom} onChange={(e) => setPurchasedFrom(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Tar Emulsion / Item</label>
              <select 
                value={item} onChange={(e) => setItem(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              >
                <option value="VG30">VG30 Bitumen</option>
                <option value="RS1">RS1 Emulsion</option>
                <option value="SS1">SS1 Emulsion</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Quantity In KG</label>
              <input 
                type="number" required value={quantityInKg} onChange={(e) => setQuantityInKg(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Load In No. Of Pack</label>
              <input 
                type="number" required value={loadInNoOfPack} onChange={(e) => setLoadInNoOfPack(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Addressed Office</label>
              <input 
                type="text" required value={addressedOffice} onChange={(e) => setAddressedOffice(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Purchased Date</label>
              <input 
                type="date" required value={purchasedDate} onChange={(e) => setPurchasedDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Amount Per Load</label>
              <input 
                type="number" required value={amountPerLoad} onChange={(e) => setAmountPerLoad(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Paid Amount</label>
              <input 
                type="number" required value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Balance To Be Paid</label>
              <div className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs font-mono font-bold">
                ₹{(amountPerLoad - paidAmount).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Billing Name/Buyer</label>
              <input 
                type="text" required value={billingNameBuyer} onChange={(e) => setBillingNameBuyer(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-semibold"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Remarks</label>
              <textarea 
                rows={1} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-neutral-100 pt-3">
            <button type="button" onClick={clearForm} className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded">Clear</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded">Cancel</button>
            <button type="submit" className="px-3 py-1.5 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded">{editingId ? "Update" : "Save"}</button>
          </div>
        </form>
      )}

      {/* Main Table view */}
      <div className="border border-neutral-200 bg-white rounded overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
            <input 
              type="text" placeholder="Search vendor or material..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                <th className="p-3">Purchase Date</th>
                <th className="p-3">Party Name</th>
                <th className="p-3">Material Item</th>
                <th className="p-3 text-right">Quantity In KG</th>
                <th className="p-3 text-right">Load In Packs</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Paid Amount</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(load => (
                <tr key={load.id} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-mono">{load.purchasedDate.substring(0, 10)}</td>
                  <td className="p-3 font-bold">{load.purchasedFrom}</td>
                  <td className="p-3"><span className="border border-neutral-300 px-1 py-0.5 rounded font-bold font-mono">{load.item}</span></td>
                  <td className="p-3 text-right font-mono">{load.quantityInKg.toLocaleString()} KG</td>
                  <td className="p-3 text-right font-mono">{load.loadInNoOfPack} Packs</td>
                  <td className="p-3 text-right font-mono font-bold">₹{(load.amountPerLoad || 0).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-neutral-600">₹{load.paidAmount.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold">₹{((load.amountPerLoad || 0) - load.paidAmount).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(load)} className="p-1 hover:bg-neutral-100 rounded text-neutral-600">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(load.id)} className="p-1 hover:bg-neutral-150 rounded text-neutral-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-neutral-400">No tar load records logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 7 – WORK BASED ENTRY
// ==========================================
export function WorkBasedEntryView({
  entries,
  workBasedEntries,
  onRefresh,
  onCreateWorkBasedEntry,
  onUpdateWorkBasedEntry,
  onDeleteWorkBasedEntry,
  onNavigate
}: {
  entries: Entry[];
  workBasedEntries: WorkBasedEntry[];
  onRefresh: () => void;
  onCreateWorkBasedEntry: (data: any) => Promise<any>;
  onUpdateWorkBasedEntry: (id: string, data: any) => Promise<any>;
  onDeleteWorkBasedEntry: (id: string) => Promise<any>;
  onNavigate: (tab: string) => void}) {
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // States
  const [itemSlNo, setItemSlNo] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemRateAsPerEstimate, setItemRateAsPerEstimate] = useState(0);
  const [itemUnit, setItemUnit] = useState("CUM");

  const clearForm = () => {
    setItemSlNo("");
    setItemName("");
    setItemQuantity(0);
    setItemRateAsPerEstimate(0);
    setItemUnit("CUM");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryId) return;
    const payload = {
      entryId: selectedEntryId,
      itemSlNo,
      itemName,
      itemQuantity: Number(itemQuantity),
      itemRateAsPerEstimate: Number(itemRateAsPerEstimate),
      itemUnit
    };
    if (editingId) {
      await onUpdateWorkBasedEntry(editingId, payload);
    } else {
      await onCreateWorkBasedEntry(payload);
    }
    clearForm();
    setEditingId(null);
    setShowForm(false);
    onRefresh();
  };

  const handleEdit = (wbe: WorkBasedEntry) => {
    setEditingId(wbe.id);
    setItemSlNo(wbe.itemSlNo);
    setItemName(wbe.itemName);
    setItemQuantity(wbe.itemQuantity);
    setItemRateAsPerEstimate(wbe.itemRateAsPerEstimate);
    setItemUnit(wbe.itemUnit);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this BOQ line item?")) {
      await onDeleteWorkBasedEntry(id);
      onRefresh();
    }
  };

  const filteredItems = workBasedEntries.filter(wbe => wbe.entryId === selectedEntryId);
  const totalBOQValuation = filteredItems.reduce((sum, item) => sum + item.totalAmountPerItem, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Work Based Entry (Item Estimator)</h2>
        <p className="text-xs text-neutral-500 font-medium">Link detailed bill-of-quantities (BOQ) specifications and rates to concrete projects.</p>
      </div>

      <div className="border border-neutral-200 bg-white p-4 rounded">
        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1.5">Select Work Name</label>
        <select 
          value={selectedEntryId} onChange={(e) => setSelectedEntryId(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-semibold"
        >
          <option value="">-- Select Active Work --</option>
          {entries.map(e => (
            <option key={e.id} value={e.id}>{e.workName}</option>
          ))}
        </select>
      </div>

      {selectedEntryId && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-neutral-50 p-4 border border-neutral-200 rounded">
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400">Total BOQ Estimate Value</span>
              <div className="text-lg font-mono font-bold text-black">₹{totalBOQValuation.toLocaleString()}</div>
            </div>
            {!showForm && (
              <button 
                onClick={() => { clearForm(); setEditingId(null); setShowForm(true); }}
                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Estimate Item
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSave} className="border border-black bg-white p-4 rounded space-y-4">
              <h4 className="text-xs font-bold uppercase border-b border-neutral-100 pb-2">{editingId ? "Update BOQ Item" : "New BOQ Item Details"}</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Item Sl No</label>
                  <input type="text" placeholder="e.g. 1.1" required value={itemSlNo} onChange={(e) => setItemSlNo(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Item Name/Spec</label>
                  <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Item Quantity</label>
                  <input type="number" required value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Item Rate</label>
                  <input type="number" required value={itemRateAsPerEstimate} onChange={(e) => setItemRateAsPerEstimate(Number(e.target.value))} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Item Unit</label>
                  <input type="text" required value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs font-mono" placeholder="CUM, KG, TON" />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-50 pt-3">
                <button type="button" onClick={clearForm} className="px-3 py-1 border border-neutral-200 text-xs rounded">Clear</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-3 py-1 border border-neutral-200 text-xs rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-neutral-900">{editingId ? "Update" : "Save"}</button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="border border-neutral-200 bg-white rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                  <th className="p-3">Item Sl No</th>
                  <th className="p-3">Specification Name</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right">Estimated Rate</th>
                  <th className="p-3 text-right">Total Amount Per Item</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono font-bold">{item.itemSlNo}</td>
                    <td className="p-3 font-semibold">{item.itemName}</td>
                    <td className="p-3 text-right font-mono">{item.itemQuantity.toLocaleString()}</td>
                    <td className="p-3"><span className="bg-neutral-100 px-1 py-0.5 rounded font-bold font-mono">{item.itemUnit}</span></td>
                    <td className="p-3 text-right font-mono">₹{item.itemRateAsPerEstimate.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-black border-l border-neutral-50">
                      ₹{item.totalAmountPerItem.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(item)} className="p-1 hover:bg-neutral-100 rounded text-neutral-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-neutral-150 rounded text-neutral-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-neutral-400">No BOQ items logged for this work entry.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODULE 8 – WORK BASED REGISTER
// ==========================================
export function WorkBasedRegisterView({
  entries,
  workBasedEntries
}: {
  entries: Entry[];
  workBasedEntries: WorkBasedEntry[];
}) {
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [mlaMp, setMlaMp] = useState("");
  
  // Status checkboxes
  const [ongoing, setOngoing] = useState(true);
  const [pending, setPending] = useState(true);
  const [notStarted, setNotStarted] = useState(true);
  const [completed, setCompleted] = useState(true);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  // Filter the list of entries shown in dropdown/tables
  const filteredEntries = entries.filter(e => {
    if (keyword && !e.workName.toLowerCase().includes(keyword.toLowerCase()) && !e.agreementNo.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (minAmount && e.amount < Number(minAmount)) return false;
    if (mlaMp && !e.mlaMpName?.toLowerCase().includes(mlaMp.toLowerCase())) return false;
    
    // Status filter
    if (e.status === 'Ongoing' && !ongoing) return false;
    if (e.status === 'Pending' && !pending) return false;
    if (e.status === 'Not Started' && !notStarted) return false;
    if (e.status === 'Completed' && !completed) return false;

    return true;
  });

  const boqItems = workBasedEntries.filter(wbe => wbe.entryId === selectedEntryId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Work Based Register</h2>
        <p className="text-xs text-neutral-500 font-medium">Consolidated view of all contract executions with search parameters and filter configurations.</p>
      </div>

      {/* Filter panel */}
      <div className="border border-neutral-200 bg-white p-5 rounded space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-black" /> Filter Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Select Work Name</label>
            <select 
              value={selectedEntryId} onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-semibold"
            >
              <option value="">-- Choose Contract Work --</option>
              {filteredEntries.map(e => (
                <option key={e.id} value={e.id}>{e.workName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Keyword Search</label>
            <input 
              type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              placeholder="Work Name or Agreement No"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Min Contract Amount (₹)</label>
            <input 
              type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              placeholder="e.g. 1000000"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">MP/MLA Sponsor</label>
            <input 
              type="text" value={mlaMp} onChange={(e) => setMlaMp(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              placeholder="MLA/MP Name"
            />
          </div>
        </div>

        {/* Status Checkboxes */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-neutral-50 text-xs">
          <span className="text-[10px] font-bold uppercase text-neutral-500 self-center">Work Status:</span>
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input type="checkbox" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} className="rounded border-neutral-300 text-black focus:ring-black" />
            Ongoing
          </label>
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input type="checkbox" checked={pending} onChange={(e) => setPending(e.target.checked)} className="rounded border-neutral-300 text-black focus:ring-black" />
            Pending
          </label>
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input type="checkbox" checked={notStarted} onChange={(e) => setNotStarted(e.target.checked)} className="rounded border-neutral-300 text-black focus:ring-black" />
            Not Started
          </label>
          <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
            <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} className="rounded border-neutral-300 text-black focus:ring-black" />
            Completed
          </label>
        </div>
      </div>

      {selectedEntry && (
        <div className="space-y-6 animate-fade-in bg-white border border-neutral-200 rounded p-6">
          <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">{selectedEntry.status}</span>
              <h3 className="text-lg font-bold text-black mt-1">{selectedEntry.workName}</h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">Agreement Number: {selectedEntry.agreementNo || "Pending"}</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Sheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs pt-4">
            <div className="space-y-3">
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Office Wing</span>
                <span className="font-semibold text-neutral-900">{selectedEntry.nameOfOffice}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">MLA/MP Sponsor</span>
                <span className="font-semibold text-neutral-900">{selectedEntry.mlaMpName || "N/A"}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Contract Value</span>
                <span className="font-mono font-bold text-black text-sm">₹{selectedEntry.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">LOA Issued Status</span>
                <span className="font-semibold text-neutral-900">{selectedEntry.loaReceived ? "Yes, Agreement Completed" : "No, Under SLA Review"}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Last Date to Execute Agreement</span>
                <span className="font-mono font-semibold text-neutral-900">{selectedEntry.lastDateToExecuteAgreement.substring(0, 10)}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">DLP Period</span>
                <span className="font-semibold text-neutral-900">{selectedEntry.dlpPeriodAsPerInLOA}</span>
              </div>
            </div>

            <div className="space-y-3 border-l border-neutral-100 pl-0 md:pl-6">
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Security Amount Deposit</span>
                <span className="font-mono font-semibold text-neutral-900">₹{selectedEntry.securityAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Performance Guarantee</span>
                <span className="font-mono font-semibold text-neutral-900">₹{selectedEntry.performanceGuarantee.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Payment Settled</span>
                <span className="font-mono font-bold text-neutral-900">₹{(selectedEntry.paymentReceived || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Item Wise Table */}
          <div className="border border-neutral-200 rounded overflow-hidden mt-6">
            <div className="bg-neutral-50 p-3 border-b border-neutral-200">
              <h4 className="font-bold text-xs uppercase text-neutral-800">Linked Estimate Quantities & Valuation</h4>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
                  <th className="p-3">Sl No</th>
                  <th className="p-3">Spec Name</th>
                  <th className="p-3 text-right">Estimated Quantity</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right">Contract Rate</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {boqItems.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono">{item.itemSlNo}</td>
                    <td className="p-3 font-semibold">{item.itemName}</td>
                    <td className="p-3 text-right font-mono">{item.itemQuantity.toLocaleString()}</td>
                    <td className="p-3 font-mono">{item.itemUnit}</td>
                    <td className="p-3 text-right font-mono">₹{item.itemRateAsPerEstimate.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-black border-l border-neutral-50">
                      ₹{item.totalAmountPerItem.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {boqItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-neutral-400">No linked estimate items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODULE 9 – OFFICE WISE WORK LIST
// ==========================================
export function OfficeWiseWorkView({
  entries
}: {
  entries: Entry[];
}) {
  const [selectedOffice, setSelectedOffice] = useState("");

  const officeNames = Array.from(new Set(entries.map(e => e.nameOfOffice)));
  const filteredEntries = selectedOffice 
    ? entries.filter(e => e.nameOfOffice === selectedOffice) 
    : entries;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Office Wise Work List</h2>
        <p className="text-xs text-neutral-500 font-medium">Filter consolidated contract items by regional office divisions or municipal departments.</p>
      </div>

      <div className="border border-neutral-200 bg-white p-4 rounded">
        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1.5">Select Office Wing / Division</label>
        <select 
          value={selectedOffice} onChange={(e) => setSelectedOffice(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-semibold"
        >
          <option value="">-- All Office Wings --</option>
          {officeNames.map(office => (
            <option key={office} value={office}>{office}</option>
          ))}
        </select>
      </div>

      <div className="border border-neutral-200 bg-white rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[9px] text-neutral-400">
              <th className="p-3">Work Name</th>
              <th className="p-3">Office Wing</th>
              <th className="p-3 text-right">Contract Amount</th>
              <th className="p-3">Agreement Number</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Completion Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredEntries.map(e => (
              <tr key={e.id} className="hover:bg-neutral-50/50">
                <td className="p-3 font-bold text-neutral-900">{e.workName}</td>
                <td className="p-3 font-semibold text-neutral-600">{e.nameOfOffice}</td>
                <td className="p-3 text-right font-mono font-bold">₹{e.amount.toLocaleString()}</td>
                <td className="p-3 font-mono">{e.agreementNo || "Pending"}</td>
                <td className="p-3 text-center">
                  <span className="font-semibold text-[10px] uppercase border border-black px-1.5 py-0.5 rounded bg-white text-black">
                    {e.status}
                  </span>
                </td>
                <td className="p-3 text-right font-mono">{e.workCompletionDateAsPerAgreement.substring(0, 10)}</td>
              </tr>
            ))}
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-400">No active work lists registered for this office division.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 10 – WORK STATUS / UPDATION
// ==========================================
export function WorkStatusUpdationView({
  entries,
  onRefresh,
  onUpdateEntry
}: {
  entries: Entry[];
  onRefresh: () => void;
  onUpdateEntry: (id: string, data: any) => Promise<any>;
}) {
  const [selectedEntryId, setSelectedEntryId] = useState("");

  // States
  const [workName, setWorkName] = useState("");
  const [amount, setAmount] = useState(0);
  const [nameOfOffice, setNameOfOffice] = useState("");
  const [mlaMpName, setMlaMpName] = useState("");
  const [loaReceived, setLoaReceived] = useState(false);
  const [lastDateToExecuteAgreement, setLastDateToExecuteAgreement] = useState("");
  const [amountOfStampPaperRequired, setAmountOfStampPaperRequired] = useState(0);
  const [securityAmount, setSecurityAmount] = useState(0);
  const [performanceGuarantee, setPerformanceGuarantee] = useState(0);
  const [dlpPeriodAsPerInLOA, setDlpPeriodAsPerInLOA] = useState("");
  const [agreementNo, setAgreementNo] = useState("");
  const [siteHandoverDate, setSiteHandoverDate] = useState("");
  const [workCompletionDateAsPerAgreement, setWorkCompletionDateAsPerAgreement] = useState("");
  const [status, setStatus] = useState<'Not Started' | 'Ongoing' | 'Pending' | 'Completed'>('Not Started');
  const [paymentReceived, setPaymentReceived] = useState(0);

  const [message, setMessage] = useState("");

  const handleSelectWork = (id: string) => {
    setSelectedEntryId(id);
    setMessage("");
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    setWorkName(entry.workName);
    setAmount(entry.amount);
    setNameOfOffice(entry.nameOfOffice);
    setMlaMpName(entry.mlaMpName || "");
    setLoaReceived(entry.loaReceived);
    setLastDateToExecuteAgreement(entry.lastDateToExecuteAgreement.substring(0, 10));
    setAmountOfStampPaperRequired(entry.amountOfStampPaperRequired);
    setSecurityAmount(entry.securityAmount);
    setPerformanceGuarantee(entry.performanceGuarantee);
    setDlpPeriodAsPerInLOA(entry.dlpPeriodAsPerInLOA);
    setAgreementNo(entry.agreementNo);
    setSiteHandoverDate(entry.siteHandoverDate.substring(0, 10));
    setWorkCompletionDateAsPerAgreement(entry.workCompletionDateAsPerAgreement.substring(0, 10));
    setStatus(entry.status);
    setPaymentReceived(entry.paymentReceived || 0);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryId) return;
    const payload = {
      workName,
      amount: Number(amount),
      nameOfOffice,
      mlaMpName,
      loaReceived,
      lastDateToExecuteAgreement,
      amountOfStampPaperRequired: Number(amountOfStampPaperRequired),
      securityAmount: Number(securityAmount),
      performanceGuarantee: Number(performanceGuarantee),
      dlpPeriodAsPerInLOA,
      agreementNo,
      siteHandoverDate,
      workCompletionDateAsPerAgreement,
      status,
      paymentReceived: Number(paymentReceived)
    };
    await onUpdateEntry(selectedEntryId, payload);
    setMessage("Success: Work status records updated successfully.");
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Work Status / Updation</h2>
        <p className="text-xs text-neutral-500 font-medium">Select an active contract to modify field logs, execute revisions, and toggle completion states.</p>
      </div>

      <div className="border border-neutral-200 bg-white p-4 rounded">
        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1.5">Work Selector</label>
        <select 
          value={selectedEntryId} onChange={(e) => handleSelectWork(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-semibold"
        >
          <option value="">-- Select Work To Update --</option>
          {entries.map(e => (
            <option key={e.id} value={e.id}>{e.workName}</option>
          ))}
        </select>
      </div>

      {message && (
        <div className="p-3 border border-black bg-neutral-50 text-xs font-bold rounded animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-black" /> {message}
        </div>
      )}

      {selectedEntryId && (
        <form onSubmit={handleUpdate} className="border border-black bg-white p-5 rounded space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold border-b border-neutral-100 pb-2">Status sheet for: {workName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Work Name</label>
              <input 
                type="text" required value={workName} onChange={(e) => setWorkName(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Contract Amount (₹)</label>
              <input 
                type="number" required value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Name Of Office</label>
              <input 
                type="text" required value={nameOfOffice} onChange={(e) => setNameOfOffice(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">MLA/MP Name (Optional)</label>
              <input 
                type="text" value={mlaMpName} onChange={(e) => setMlaMpName(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">LOA Received</label>
              <select 
                value={loaReceived ? "true" : "false"} onChange={(e) => setLoaReceived(e.target.value === "true")}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              >
                <option value="false">No / Pending</option>
                <option value="true">Yes / Received</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Last Date To Execute Agreement</label>
              <input 
                type="date" required value={lastDateToExecuteAgreement} onChange={(e) => setLastDateToExecuteAgreement(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Amount Of Stamp Paper Required</label>
              <input 
                type="number" required value={amountOfStampPaperRequired} onChange={(e) => setAmountOfStampPaperRequired(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Security Amount</label>
              <input 
                type="number" required value={securityAmount} onChange={(e) => setSecurityAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Performance Guarantee</label>
              <input 
                type="number" value={performanceGuarantee} onChange={(e) => setPerformanceGuarantee(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">DLP Period As Per LOA</label>
              <input 
                type="text" required value={dlpPeriodAsPerInLOA} onChange={(e) => setDlpPeriodAsPerInLOA(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Agreement No</label>
              <input 
                type="text" required value={agreementNo} onChange={(e) => setAgreementNo(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Site Handover Date</label>
              <input 
                type="date" required value={siteHandoverDate} onChange={(e) => setSiteHandoverDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Work Completion Date As Per Agreement</label>
              <input 
                type="date" required value={workCompletionDateAsPerAgreement} onChange={(e) => setWorkCompletionDateAsPerAgreement(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Status</label>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Payment Received (₹)</label>
              <input 
                type="number" value={paymentReceived} onChange={(e) => setPaymentReceived(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-neutral-100 pt-3">
            <button 
              type="submit"
              className="px-4 py-2 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded uppercase tracking-wider"
            >
              Update Record
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
