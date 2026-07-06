import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <TopBar />
      <div className="flex flex-1">
        <aside className="w-64 border-r border-border p-4">
          <h2>Sidebar</h2>
        </aside>
        <main className="flex-1 p-4">
          <h2>Main</h2>
        </main>
      </div>
    </div>
  );
}