import { 
  getCurrentUser, 
  getEntriesAction,
  getCementLoadsAction, 
  getTarLoadsAction, 
  getStockRegisterAction, 
  getSiteMaterialsAction, 
  getWorkBasedEntriesAction, 
  getPrivateWorksAction
} from "./actions";
import DashboardPortal from "@/components/dashboard-portal";

export default async function Page() {
  const user = await getCurrentUser();

  const [
    entries,
    cementLoads,
    tarLoads,
    stockRegister,
    siteMaterials,
    workBasedEntries,
    privateWorks
  ] = await Promise.all([
    getEntriesAction(),
    getCementLoadsAction(),
    getTarLoadsAction(),
    getStockRegisterAction(),
    getSiteMaterialsAction(),
    getWorkBasedEntriesAction(),
    getPrivateWorksAction()
  ]);

  const initialData = {
    entries,
    cementLoads,
    tarLoads,
    stockRegister,
    siteMaterials,
    workBasedEntries,
    privateWorks
  };

  return <DashboardPortal initialUser={user} initialData={initialData} />;
}
