"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Collection = { id: number; name: string };

export type SavedRequest = {
  id: number;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string> | null;
  body: unknown;
};

export type ApiResponse = {
  status: number;
  duration: number;
  data: unknown;
};

type DashboardContextType = {
  workspaceId: number | null;
  collections: Collection[];
  selectedCollectionId: number | null;
  setSelectedCollectionId: (id: number) => void;
  refetchCollections: () => Promise<void>;

  requests: SavedRequest[];
  selectedRequestId: number | null;
  setSelectedRequestId: (id: number | null) => void;
  refetchRequests: () => Promise<void>;

  response: ApiResponse | null;
  setResponse: (r: ApiResponse | null) => void;
  clearCollectionSelection: () => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionIdState] = useState<number | null>(null);
  const [requests, setRequests] = useState<SavedRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const fetchWorkspace = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/workspaces", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.workspaces?.length) setWorkspaceId(data.workspaces[0].id);
  };

  const fetchCollections = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/collections", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setCollections(data.collections);
  };

  const fetchRequests = async (collectionId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/requests?collectionId=${collectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setRequests(data.requests);
  };

  // Selecting a collection also loads its requests and clears any stale response.
  const setSelectedCollectionId = (id: number) => {
    setSelectedCollectionIdState(id);
    setSelectedRequestId(null);
    setResponse(null);
    fetchRequests(id);
  };

  const refetchRequests = async () => {
    if (selectedCollectionId) await fetchRequests(selectedCollectionId);
  };

  // Used when the currently-selected collection itself gets deleted —
  // wipes every piece of state that depended on it.
  const clearCollectionSelection = () => {
    setSelectedCollectionIdState(null);
    setRequests([]);
    setSelectedRequestId(null);
    setResponse(null);
  };

  useEffect(() => {
    fetchWorkspace();
    fetchCollections();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        workspaceId,
        collections,
        selectedCollectionId,
        setSelectedCollectionId,
        refetchCollections: fetchCollections,
        requests,
        selectedRequestId,
        setSelectedRequestId,
        refetchRequests,
        response,
        setResponse,
        clearCollectionSelection,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}