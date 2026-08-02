// Dashboard layout.

import Sidebar from "@/components/dashboard/Sidebar";
import RequestEditor from "@/components/dashboard/RequestEditor";
import ResponsePanel from "@/components/dashboard/ResponsePanel";
import { DashboardProvider } from "@/components/dashboard/DashboardContext";

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <main className="flex h-screen overflow-x-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-1 flex-col min-h-0">
          <RequestEditor />
          <ResponsePanel />
        </div>
      </main>
    </DashboardProvider>
  );
}