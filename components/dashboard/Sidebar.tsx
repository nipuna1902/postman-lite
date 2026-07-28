// Sidebar for collections and navigation.

import { Plus } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="flex w-72 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">
        <span>postman-</span>
        <span className="text-accent">lite</span>
      </h1>
      </div>

      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="text-xs uppercase tracking-widest text-muted">
          Collections
        </h2>

        <button className="rounded-md p-2 transition hover:bg-surface">
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-4 px-3">
        <button className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface">
          No collections yet
        </button>
      </div>
    </aside>
  );
}