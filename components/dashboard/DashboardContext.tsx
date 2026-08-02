"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Workspace = { id: number; name: string };
type Collection = { id: number; name: string };
type Environment = { id: number; name: string; variables: Record<string, string> | null };

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
  workspaces: Workspace[];
  workspaceId: number | null;
  setWorkspaceId: (id: number) => void;
  refetchWorkspaces: () => Promise<void>;

  environments: Environment[];
  selectedEnvironmentId: number | null;
  setSelectedEnvironmentId: (id: number | null) => void;
  refetchEnvironments: () => Promise<void>;

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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceIdState] = useState<number | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<number | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionIdState] = useState<number | null>(null);
  const [requests, setRequests] = useState<SavedRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const fetchWorkspaces = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/workspaces", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setWorkspaces(data.workspaces);
    if (data.workspaces?.length && workspaceId == null) {
      setWorkspaceIdState(data.workspaces[0].id);
    }
  };

  const fetchEnvironments = async (wsId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/environments?workspaceId=${wsId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setEnvironments(data.environments);
  };

  const fetchCollections = async (wsId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/collections?workspaceId=${wsId}`, {
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

  // Switching workspaces resets everything scoped to the old one —
  // its collections, environment selection, and whatever was open.
  const setWorkspaceId = (id: number) => {
    setWorkspaceIdState(id);
    setSelectedEnvironmentId(null);
    setSelectedCollectionIdState(null);
    setRequests([]);
    setSelectedRequestId(null);
    setResponse(null);
  };

  const setSelectedCollectionId = (id: number) => {
    setSelectedCollectionIdState(id);
    setSelectedRequestId(null);
    setResponse(null);
    fetchRequests(id);
  };

  const refetchCollections = async () => {
    if (workspaceId) await fetchCollections(workspaceId);
  };

  const refetchEnvironments = async () => {
    if (workspaceId) await fetchEnvironments(workspaceId);
  };

  const refetchRequests = async () => {
    if (selectedCollectionId) await fetchRequests(selectedCollectionId);
  };

  const clearCollectionSelection = () => {
    setSelectedCollectionIdState(null);
    setRequests([]);
    setSelectedRequestId(null);
    setResponse(null);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Once a workspace is selected (initially, or by switching), load its
  // collections and environments together.
  useEffect(() => {
    if (workspaceId != null) {
      fetchCollections(workspaceId);
      fetchEnvironments(workspaceId);
    }
  }, [workspaceId]);

  return (
    <DashboardContext.Provider
      value={{
        workspaces,
        workspaceId,
        setWorkspaceId,
        refetchWorkspaces: fetchWorkspaces,
        environments,
        selectedEnvironmentId,
        setSelectedEnvironmentId,
        refetchEnvironments,
        collections,
        selectedCollectionId,
        setSelectedCollectionId,
        refetchCollections,
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