"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, Check } from "lucide-react";
import CreateCollectionModal from "./CreateCollectionModal";
import { useDashboard } from "./DashboardContext";

export default function Sidebar() {
  const {
    workspaces,
    workspaceId,
    setWorkspaceId,
    refetchWorkspaces,
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
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId);

  const handleCreateWorkspace = async () => {
    const name = window.prompt("Name your new workspace:");
    if (!name?.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: name.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to create workspace");
      return;
    }

    await refetchWorkspaces();
    setIsWorkspaceMenuOpen(false);
  };

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
        <div className="relative border-b border-border p-6">
          <button
            onClick={() => setIsWorkspaceMenuOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition hover:bg-surface"
          >
            <span className="truncate text-sm font-medium text-muted">
              {currentWorkspace?.name ?? "Select workspace"}
            </span>
            <ChevronDown size={16} className="shrink-0 text-muted" />
          </button>

          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            <span>postman-</span>
            <span className="text-accent">lite</span>
          </h1>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-6 right-6 top-16 z-10 rounded-lg border border-border bg-surface py-1 shadow-lg">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setWorkspaceId(ws.id);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-background"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === workspaceId && <Check size={14} className="text-accent" />}
                </button>
              ))}

              <div className="my-1 border-t border-border" />

              <button
                onClick={handleCreateWorkspace}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-accent hover:bg-background"
              >
                <Plus size={14} />
                New workspace
              </button>
            </div>
          )}
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