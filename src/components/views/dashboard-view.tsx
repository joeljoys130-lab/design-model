"use client";

import { 
  Building2, Layers, Package, Fuel, TrendingUp, Calendar, ArrowRight, 
  Award, FileText, CheckSquare, PlusCircle, BookOpen, Warehouse, Compass
} from "lucide-react";
import { CementLoad, Entry, StockRegisterItem, PrivateWork, TarLoad, WorkBasedEntry, Expense } from "@/lib/types";

interface DashboardViewProps {
  data: {
    entries: Entry[];
    cementLoads: CementLoad[];
    tarLoads: TarLoad[];
    stockRegister: StockRegisterItem[];
    siteMaterials: any[];
    workBasedEntries: WorkBasedEntry[];
    privateWorks: PrivateWork[];
    expenses?: Expense[];
  };
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ data, onNavigate }: DashboardViewProps) {
  const {
    entries = [],
    cementLoads = [],
    tarLoads = [],
    stockRegister = [],
    privateWorks = [],
    expenses = []
  } = data;

  const totalCementBags = cementLoads.reduce((sum, item) => sum + item.loadInBags, 0);
  const totalTarKg = tarLoads.reduce((sum, item) => sum + item.quantityInKg, 0);
  
  const ongoingContractsCount = entries.filter(e => e.status === 'Ongoing').length;
  const ongoingPrivateWorksCount = privateWorks.length; // Private works are all considered ongoing (no status field)
  const activeWorksCount = ongoingContractsCount + ongoingPrivateWorksCount;
  const completedWorksCount = entries.filter(e => e.status === 'Completed').length;
  const totalContractValuation = entries.reduce((sum, e) => sum + e.amount, 0);
  const privateWorksValuation = privateWorks.reduce((sum, p) => sum + p.approxFinalWorkAmount, 0);
  const totalWorksCount = entries.filter(e => e.status !== 'Completed').length + privateWorks.length;

  // Financial & Profitability calculations
  const portfolioValuation = totalContractValuation + privateWorksValuation;
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const contractPayments = entries.reduce((sum, e) => sum + (e.paymentReceived || 0), 0);
  const privatePayments = privateWorks.reduce((sum, p) => sum + (p.paymentReceived || 0), 0);
  const totalPaymentsReceived = contractPayments + privatePayments;
  const projectedProfit = portfolioValuation - totalExpenses;
  const realizedProfit = totalPaymentsReceived - totalExpenses;

  // Compute upcoming work completion alerts
  const now = new Date();
  const alerts = entries.map(entry => {
    const compDate = new Date(entry.workCompletionDateAsPerAgreement);
    const diffMs = compDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 2 && diffDays >= 0) {
      return { id: entry.id, type: 'important', message: `Work "${entry.workName}" completes in ${diffDays} day(s) – IMPORTANT!` };
    } else if (diffDays <= 3 && diffDays > 2) {
      return { id: entry.id, type: 'warning', message: `Work "${entry.workName}" completes in ${diffDays} days.` };
    } else if (diffDays <= 7 && diffDays > 3) {
      return { id: entry.id, type: 'info', message: `Work "${entry.workName}" completes in ${diffDays} days.` };
    }
    return null;
  }).filter(Boolean);

  const stats = [
    { label: "Active Works", value: activeWorksCount, desc: "Ongoing contracts + private works" },
    { label: "Contract Value", value: `₹${(totalContractValuation / 100000).toFixed(1)} L`, desc: "Total value of agreements" },
    { label: "Cement Stocked", value: `${totalCementBags} Bags`, desc: "Total purchased cement bags" },
    { label: "Tar Aggregate", value: `${(totalTarKg / 1000).toFixed(1)} Tons`, desc: "Bitumen emulsion aggregate" },
    { label: "Total Works", value: totalWorksCount, desc: "All active works (excludes completed)" },
    { label: "Works Completed", value: completedWorksCount, desc: "Completed works count" },
  ];

  const modules = [
    { id: "cement-load", label: "Cement Load Updation", icon: Package, desc: "Record cement purchase bills, load bags, and monitor remaining balances." },
    { id: "entry", label: "Contract Entry", icon: FileText, desc: "Register government contracts, SLA timelines, stamp papers, and performance guarantees." },
    { id: "stock-register", label: "Stock Register", icon: Warehouse, desc: "Real-time stock ledger of Cement, RS1, SS1, and VG30 Bitumen aggregates." },
    { id: "materials-used", label: "Materials Used in Site", icon: Compass, desc: "Map and reconcile estimated deliverables against stock delivered to construction sites." },
    { id: "private-work", label: "Private Work Status / Entry", icon: Award, desc: "Log private non-tender civil jobs, advance amounts, site visits, and final payments." },
    { id: "tar-load", label: "Tar Load Updation", icon: Fuel, desc: "Track incoming Bitumen tankers, addressed office targets, and paid balances." },
    { id: "work-based-entry", label: "Work Based Entry", icon: PlusCircle, desc: "Build detailed bill-of-quantities (BOQ) line items and rates linked to projects." },
    { id: "work-based-register", label: "Work Based Register", icon: BookOpen, desc: "Consolidated filter register of contract executions, payment logs, and item details." },
    { id: "office-wise-work", label: "Office Wise Work List", icon: Building2, desc: "Group and display ongoing construction projects by PWD or NHAI regional offices." },
    { id: "work-status-updation", label: "Work Status / Updation", icon: CheckSquare, desc: "Update contract execution parameters, timeline details, and progress status." },
  ];

  // Render alerts UI
  const renderAlert = (alert: any) => {
    const baseStyle = "p-3 rounded mb-2 text-sm font-medium";
    let style = "bg-blue-100 text-blue-800"; // info
    if (alert.type === 'warning') style = "bg-yellow-100 text-yellow-800";
    if (alert.type === 'important') style = "bg-red-100 text-red-800 border border-red-400 animate-pulse";
    return (
      <div key={alert.id} className={`${baseStyle} ${style}`}>🚨 {alert.message}</div>
    );
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="space-y-8 animate-fade-in text-black">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase">BuildCorp Control Center</h1>
        <p className="text-xs text-neutral-500 font-medium mt-1">Monochromatic management portal for Construction ERP modules.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="border border-neutral-200 bg-white p-5 rounded">
            <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">{stat.label}</div>
            <div className="text-2xl font-mono font-bold mt-1.5">{stat.value}</div>
            <div className="text-[10px] text-neutral-500 mt-1">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Portfolio Profitability & Financial Health */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100">
          Portfolio Profitability & Financial Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-neutral-200 bg-white p-5 rounded flex flex-col justify-between">
            <div>
              <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Total Portfolio Valuation</div>
              <div className="text-xl font-mono font-bold mt-1.5 text-black">₹{formatNumber(portfolioValuation)}</div>
            </div>
            <div className="text-[10px] text-neutral-500 mt-2 border-t border-neutral-100 pt-2 flex justify-between">
              <span>Govt Contracts: ₹{formatNumber(totalContractValuation)}</span>
              <span>Private: ₹{formatNumber(privateWorksValuation)}</span>
            </div>
          </div>
          <div className="border border-neutral-200 bg-white p-5 rounded flex flex-col justify-between">
            <div>
              <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Total Operational Cost / Expenses</div>
              <div className="text-xl font-mono font-bold mt-1.5 text-neutral-600">₹{formatNumber(totalExpenses)}</div>
            </div>
            <div className="text-[10px] text-neutral-500 mt-2 border-t border-neutral-100 pt-2">
              All logged machine rents, labor wages, fuel, and site fees.
            </div>
          </div>
          <div className="border border-neutral-200 bg-white p-5 rounded flex flex-col justify-between">
            <div>
              <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Projected Portfolio Profit</div>
              <div className={`text-xl font-mono font-bold mt-1.5 ${projectedProfit >= 0 ? 'text-black font-extrabold' : 'text-red-600'}`}>
                ₹{formatNumber(projectedProfit)}
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 mt-2 border-t border-neutral-100 pt-2 flex justify-between">
              <span>Margin: {portfolioValuation > 0 ? ((projectedProfit / portfolioValuation) * 100).toFixed(1) : 0}%</span>
              <span>Realized Cash Profit: ₹{formatNumber(realizedProfit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Work Alerts */}
      <div className="space-y-2">
        {alerts.length > 0 ? alerts.map(renderAlert) : <div className="text-sm text-neutral-500">No upcoming work completions.</div>}
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100">
          Construction ERP Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div 
                key={m.id}
                onClick={() => onNavigate(m.id)}
                className="group border border-neutral-200 hover:border-black bg-white p-5 rounded cursor-pointer transition-colors flex items-start gap-4"
              >
                <div className="p-2 border border-neutral-200 group-hover:border-black rounded shrink-0">
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm tracking-tight">{m.label}</h4>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-neutral-500 leading-normal">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
