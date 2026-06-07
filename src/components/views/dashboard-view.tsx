"use client";

import { 
  Building2, Layers, Package, Fuel, TrendingUp, Calendar, ArrowRight, 
  Award, FileText, CheckSquare, PlusCircle, BookOpen, Warehouse, Compass
} from "lucide-react";
import { CementLoad, Entry, StockRegisterItem, PrivateWork, TarLoad, WorkBasedEntry } from "@/lib/types";

interface DashboardViewProps {
  data: {
    entries: Entry[];
    cementLoads: CementLoad[];
    tarLoads: TarLoad[];
    stockRegister: StockRegisterItem[];
    siteMaterials: any[];
    workBasedEntries: WorkBasedEntry[];
    privateWorks: PrivateWork[];
  };
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ data, onNavigate }: DashboardViewProps) {
  const {
    entries = [],
    cementLoads = [],
    tarLoads = [],
    stockRegister = [],
    privateWorks = []
  } = data;

  const totalCementBags = cementLoads.reduce((sum, item) => sum + item.loadInBags, 0);
  const totalTarKg = tarLoads.reduce((sum, item) => sum + item.quantityInKg, 0);
  
  const activeEntriesCount = entries.filter(e => e.status === 'Ongoing').length;
  const totalContractValuation = entries.reduce((sum, e) => sum + e.amount, 0);

  const privateWorksValuation = privateWorks.reduce((sum, p) => sum + p.approxFinalWorkAmount, 0);

  const stats = [
    { label: "Active Contracts", value: activeEntriesCount, desc: "Ongoing government works" },
    { label: "Contract Value", value: `₹${(totalContractValuation / 100000).toFixed(1)} L`, desc: "Total value of agreements" },
    { label: "Cement Stocked", value: `${totalCementBags} Bags`, desc: "Total purchased cement bags" },
    { label: "Tar Aggregate", value: `${(totalTarKg / 1000).toFixed(1)} Tons`, desc: "Bitumen emulsion aggregate" },
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
