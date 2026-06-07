"use client";

import { useState } from "react";
import { 
  Building2, Layers, Package, Fuel, Award, FileText, CheckSquare, 
  PlusCircle, BookOpen, Warehouse, Compass, Menu, X, LogOut, Moon, Sun
} from "lucide-react";
import { 
  createCementLoadAction, updateCementLoadAction, deleteCementLoadAction,
  createEntryAction, updateEntryAction, deleteEntryAction,
  updateStockRegisterItemAction,
  createSiteMaterialAction, updateSiteMaterialAction, deleteSiteMaterialAction,
  createPrivateWorkAction, updatePrivateWorkAction, deletePrivateWorkAction,
  createTarLoadAction, updateTarLoadAction, deleteTarLoadAction,
  createWorkBasedEntryAction, updateWorkBasedEntryAction, deleteWorkBasedEntryAction,
  getCementLoadsAction, getEntriesAction, getStockRegisterAction,
  getSiteMaterialsAction, getPrivateWorksAction, getTarLoadsAction,
  getWorkBasedEntriesAction
} from "@/app/actions";
import DashboardView from "./views/dashboard-view";
import { 
  CementLoadView, EntryView, StockRegisterView, MaterialsUsedView, 
  PrivateWorkView, TarLoadView, WorkBasedEntryView, WorkBasedRegisterView, 
  OfficeWiseWorkView, WorkStatusUpdationView 
} from "./views/modules";

interface DashboardPortalProps {
  initialUser: any;
  initialData: any;
}

export default function DashboardPortal({ initialUser, initialData }: DashboardPortalProps) {
  const [user] = useState(initialUser);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modular Data States
  const [cementLoads, setCementLoads] = useState(initialData.cementLoads || []);
  const [entries, setEntries] = useState(initialData.entries || []);
  const [stockRegister, setStockRegister] = useState(initialData.stockRegister || []);
  const [siteMaterials, setSiteMaterials] = useState(initialData.siteMaterials || []);
  const [privateWorks, setPrivateWorks] = useState(initialData.privateWorks || []);
  const [tarLoads, setTarLoads] = useState(initialData.tarLoads || []);
  const [workBasedEntries, setWorkBasedEntries] = useState(initialData.workBasedEntries || []);

  const refreshAllStates = async () => {
    setLoading(true);
    try {
      const [cl, ent, stk, sm, pw, tl, wbe] = await Promise.all([
        getCementLoadsAction(),
        getEntriesAction(),
        getStockRegisterAction(),
        getSiteMaterialsAction(),
        getPrivateWorksAction(),
        getTarLoadsAction(),
        getWorkBasedEntriesAction()
      ]);
      setCementLoads(cl);
      setEntries(ent);
      setStockRegister(stk);
      setSiteMaterials(sm);
      setPrivateWorks(pw);
      setTarLoads(tl);
      setWorkBasedEntries(wbe);
    } catch (e) {
      console.error("Failed to refresh dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Building2 },
    { id: "cement-load", label: "Cement Load Updation", icon: Package },
    { id: "entry", label: "Entry", icon: FileText },
    { id: "stock-register", label: "Stock Register", icon: Warehouse },
    { id: "materials-used", label: "Total Materials Used In Site", icon: Compass },
    { id: "private-work", label: "Private Work Status", icon: Award },
    { id: "tar-load", label: "Tar Load Updation", icon: Fuel },
    { id: "work-based-entry", label: "Work Based Entry", icon: PlusCircle },
    { id: "work-based-register", label: "Work Based Register", icon: BookOpen },
    { id: "office-wise-work", label: "Office Wise Work List", icon: Layers },
    { id: "work-status-updation", label: "Work Status Updation", icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen flex bg-white text-black font-sans selection:bg-neutral-200">
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-200 bg-black text-white shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-800 bg-black">
          <div className="w-6 h-6 border border-white flex items-center justify-center font-bold text-xs">
            M
          </div>
          <span className="font-bold text-xs tracking-widest uppercase">
            CONSTRUCTION ERP
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-2 list-none pl-0 ml-0">
          {navigationItems.map(item => (
            <li key={item.id}>
              <a href="#" className={`block w-full text-left px-3 py-2 rounded text-xs font-semibold tracking-wide transition-colors ${activeTab === item.id ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`} onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      </aside>

      {/* 2. SIDEBAR DRAWER (MOBILE) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex bg-black/60 backdrop-blur-xs">
          <aside className="w-64 bg-black text-white flex flex-col h-full border-r border-neutral-800">
            <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider">BuildCorp</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <ul className="space-y-2 list-none pl-0 ml-0">
              {navigationItems.map(item => (
                <li key={item.id}>
                  <a href="#" className={`block w-full text-left px-3 py-2 rounded text-xs font-semibold tracking-wide transition-colors ${activeTab === item.id ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`} onClick={(e) => { e.preventDefault(); setActiveTab(item.id); setSidebarOpen(false); }}>{item.label}</a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 border border-neutral-200 px-3 py-1 rounded text-xs font-bold bg-neutral-50 uppercase">
              <span className="w-2.5 h-2.5 bg-black rounded-full" />
              <span>Division: Executive Wing</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {loading && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 animate-pulse">
                Syncing database...
              </span>
            )}
          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        <main className="flex-1 p-6 overflow-y-auto relative bg-neutral-50">
          
          {activeTab === "dashboard" && (
            <DashboardView 
              data={{
                entries,
                cementLoads,
                tarLoads,
                stockRegister,
                siteMaterials,
                workBasedEntries,
                privateWorks
              }} 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === "cement-load" && (
            <CementLoadView 
              cementLoads={cementLoads} 
              onRefresh={refreshAllStates}
              onCreateCementLoad={createCementLoadAction}
              onUpdateCementLoad={updateCementLoadAction}
              onDeleteCementLoad={deleteCementLoadAction}
            />
          )}

          {activeTab === "entry" && (
            <EntryView 
              entries={entries} 
              onRefresh={refreshAllStates}
              onCreateEntry={createEntryAction}
              onUpdateEntry={updateEntryAction}
              onDeleteEntry={deleteEntryAction}
            />
          )}

          {activeTab === "stock-register" && (
            <StockRegisterView 
              stockItems={stockRegister}
              onRefresh={refreshAllStates}
              onUpdateStockItem={updateStockRegisterItemAction}
            />
          )}

          {activeTab === "materials-used" && (
            <MaterialsUsedView 
              entries={entries} 
              siteMaterials={siteMaterials} 
              onRefresh={refreshAllStates}
              onCreateSiteMaterial={createSiteMaterialAction}
              onUpdateSiteMaterial={updateSiteMaterialAction}
              onDeleteSiteMaterial={deleteSiteMaterialAction}
            />
          )}

          {activeTab === "private-work" && (
            <PrivateWorkView 
              privateWorks={privateWorks} 
              onRefresh={refreshAllStates}
              onCreatePrivateWork={createPrivateWorkAction}
              onUpdatePrivateWork={updatePrivateWorkAction}
              onDeletePrivateWork={deletePrivateWorkAction}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "tar-load" && (
            <TarLoadView 
              tarLoads={tarLoads} 
              onRefresh={refreshAllStates}
              onCreateTarLoad={createTarLoadAction}
              onUpdateTarLoad={updateTarLoadAction}
              onDeleteTarLoad={deleteTarLoadAction}
            />
          )}

          {activeTab === "work-based-entry" && (
            <WorkBasedEntryView 
              entries={entries} 
              workBasedEntries={workBasedEntries} 
              onRefresh={refreshAllStates}
              onCreateWorkBasedEntry={createWorkBasedEntryAction}
              onUpdateWorkBasedEntry={updateWorkBasedEntryAction}
              onDeleteWorkBasedEntry={deleteWorkBasedEntryAction}
            />
          )}

          {activeTab === "work-based-register" && (
            <WorkBasedRegisterView 
              entries={entries} 
              workBasedEntries={workBasedEntries} 
            />
          )}

          {activeTab === "office-wise-work" && (
            <OfficeWiseWorkView 
              entries={entries} 
            />
          )}

          {activeTab === "work-status-updation" && (
            <WorkStatusUpdationView 
              entries={entries} 
              onRefresh={refreshAllStates}
              onUpdateEntry={updateEntryAction}
            />
          )}

        </main>
      </div>
    </div>
  );
}
