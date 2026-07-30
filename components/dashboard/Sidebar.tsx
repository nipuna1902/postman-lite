"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateCollectionModal from "./CreateCollectionModal";
import { useDashboard } from "./DashboardContext";

export default function Sidebar() {
  const {
    collections,
    selectedCollectionId,
    setSelectedCollectionId,
    requests,
    selectedRequestId,
    setSelectedRequestId,
  } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <aside className="flex w-72 flex-col overflow-y-auto border-r border-border bg-sidebar">
        <div className="border-b border-border p-6">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">
            <span>postman-</span>
            <span className="text-accent">lite</span>
          </h1>
        </div>

        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-xs uppercase tracking-widest text-muted">Collections</h2>
          <button onClick={() => setIsModalOpen(true)} className="rounded-lg bg-accent p-2 text-white transition hover:bg-accent-hover">
            <Plus size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-1 px-3">
          {collections.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">No collections yet</p>
          ) : (
            collections.map((collection) => (
              <div key={collection.id}>
                <button
                  onClick={() => setSelectedCollectionId(collection.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface ${
                    selectedCollectionId === collection.id ? "bg-surface text-accent" : ""
                  }`}
                >
                  {collection.name}
                </button>

                {selectedCollectionId === collection.id && (
                  <div className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                    {requests.length === 0 ? (
                      <p className="px-2 py-1 text-xs text-muted">No requests yet</p>
                    ) : (
                      requests.map((req) => (
                        <button
                          key={req.id}
                          onClick={() => setSelectedRequestId(req.id)}
                          className={`block w-full truncate rounded-md px-2 py-1 text-left text-xs transition hover:bg-surface ${
                            selectedRequestId === req.id ? "text-accent" : "text-muted"
                          }`}
                        >
                          <span className="mr-1 font-mono">{req.method}</span>
                          {req.name}
                        </button>
                      ))
                    )}

                    <button
                      onClick={() => setSelectedRequestId(null)}
                      className="mt-1 w-full rounded-md px-2 py-1 text-left text-xs text-accent hover:bg-surface"
                    >
                      + New request
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      <CreateCollectionModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}