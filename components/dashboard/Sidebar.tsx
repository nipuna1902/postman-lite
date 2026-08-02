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
    refetchCollections,
    clearCollectionSelection,
    setResponse,
  } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteRequest = async (e: React.MouseEvent, requestId: number) => {
    e.stopPropagation();

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

    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
      setResponse(null);
    }

    await refetchRequests();
  };

  const handleDeleteCollection = async (e: React.MouseEvent, collectionId: number) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Delete this collection? All requests inside it will be deleted too. This can't be undone."
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/collections/${collectionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Failed to delete collection");
      return;
    }

    if (selectedCollectionId === collectionId) {
      clearCollectionSelection();
    }

    await refetchCollections();
  };

  return (
    <>
      <aside className="flex w-72 flex-shrink-0 flex-col overflow-y-auto no-scrollbar border-r border-border bg-sidebar">
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
                <div
                  className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-surface ${
                    selectedCollectionId === collection.id ? "bg-surface text-accent" : ""
                  }`}
                >
                  <button
                    onClick={() => setSelectedCollectionId(collection.id)}
                    className="flex-1 truncate text-left"
                  >
                    {collection.name}
                  </button>
                  <button
                    onClick={(e) => handleDeleteCollection(e, collection.id)}
                    className="ml-2 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

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