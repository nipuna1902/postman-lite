"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
    refetchRequests,
    setResponse,
  } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteRequest = async (e: React.MouseEvent, requestId: number) => {
    e.stopPropagation(); // don't also trigger the parent button's onClick (selecting it)

    const confirmed = window.confirm("Delete this request? This can't be undone.");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/requests/${requestId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Failed to delete request");
      return;
    }

    // If the deleted request was open in the editor, clear the editor too.
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
      setResponse(null);
    }

    await refetchRequests();
  };

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
                        <div
                          key={req.id}
                          className={`group flex items-center justify-between rounded-md px-2 py-1 text-xs transition hover:bg-surface ${
                            selectedRequestId === req.id ? "text-accent" : "text-muted"
                          }`}
                        >
                          <button
                            onClick={() => setSelectedRequestId(req.id)}
                            className="flex-1 truncate text-left"
                          >
                            <span className="mr-1 font-mono">{req.method}</span>
                            {req.name}
                          </button>
                          <button
                            onClick={(e) => handleDeleteRequest(e, req.id)}
                            className="ml-2 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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