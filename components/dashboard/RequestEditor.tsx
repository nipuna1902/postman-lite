"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import MethodSelect from "./MethodSelect";
import UrlInput from "./UrlInput";
import SendButton from "./SendButton";
import { useDashboard } from "./DashboardContext";
import Editor from "@monaco-editor/react";

type HistoryEntry = {
  id: number;
  statusCode: number;
  duration: number;
  createdAt: string;
  response: unknown;
};

type ParamRow = { key: string; value: string };

function parseParamsFromUrl(url: string): ParamRow[] {
  const [, query] = url.split("?");
  if (!query) return [];
  const params = new URLSearchParams(query);
  return Array.from(params.entries()).map(([key, value]) => ({ key, value }));
}

function buildUrlWithParams(url: string, rows: ParamRow[]): string {
  const base = url.split("?")[0];
  const validRows = rows.filter((r) => r.key.trim() !== "");
  if (validRows.length === 0) return base;

  const params = new URLSearchParams();
  validRows.forEach((r) => params.append(r.key, r.value));
  return `${base}?${params.toString()}`;
}

export default function RequestEditor() {
  const {
    selectedCollectionId,
    selectedRequestId,
    requests,
    refetchRequests,
    setSelectedRequestId,
    setResponse,
    environments,
    selectedEnvironmentId,
    setSelectedEnvironmentId,
  } = useDashboard();

  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [paramRows, setParamRows] = useState<ParamRow[]>([]);
  const [headersText, setHeadersText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [authType, setAuthType] = useState<"none" | "bearer">("none");
  const [authToken, setAuthToken] = useState("");
  const [activeTab, setActiveTab] = useState<"auth" | "params" | "headers" | "body" | "history">("headers");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (selectedRequestId == null) {
      setMethod("GET");
      setUrl("");
      setHeadersText("");
      setBodyText("");
      setAuthType("none");
      setAuthToken("");
      return;
    }
    const req = requests.find((r) => r.id === selectedRequestId);
    if (!req) return;

    setMethod(req.method);
    setUrl(req.url);
    setBodyText(req.body ? JSON.stringify(req.body, null, 2) : "");

    const savedHeaders = { ...(req.headers ?? {}) } as Record<string, string>;
    const authHeader = savedHeaders["Authorization"];

    if (authHeader?.startsWith("Bearer ")) {
      setAuthType("bearer");
      setAuthToken(authHeader.slice(7));
      delete savedHeaders["Authorization"];
    } else {
      setAuthType("none");
      setAuthToken("");
    }

    setHeadersText(Object.keys(savedHeaders).length ? JSON.stringify(savedHeaders, null, 2) : "");
  }, [selectedRequestId, requests]);

  useEffect(() => {
    setParamRows(parseParamsFromUrl(url));
  }, [url]);

  useEffect(() => {
    if (activeTab !== "history" || selectedRequestId == null) return;

    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/requests/${selectedRequestId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.history);
    };

    fetchHistory();
  }, [activeTab, selectedRequestId]);

  const updateParamRow = (index: number, field: "key" | "value", newValue: string) => {
    const newRows = paramRows.map((row, i) => (i === index ? { ...row, [field]: newValue } : row));
    setParamRows(newRows);
    setUrl(buildUrlWithParams(url, newRows));
  };

  const addParamRow = () => {
    setParamRows([...paramRows, { key: "", value: "" }]);
  };

  const removeParamRow = (index: number) => {
    const newRows = paramRows.filter((_, i) => i !== index);
    setParamRows(newRows);
    setUrl(buildUrlWithParams(url, newRows));
  };

  const handleSend = async () => {
    if (!selectedCollectionId) {
      alert("Select or create a collection first");
      return;
    }
    if (!url.trim()) {
      alert("Enter a URL");
      return;
    }

    let parsedHeaders: Record<string, string> = {};
    let parsedBody: unknown;

    try {
      parsedHeaders = headersText.trim() ? JSON.parse(headersText) : {};
    } catch {
      alert('Headers must be valid JSON, e.g. { "Content-Type": "application/json" }');
      return;
    }

    try {
      parsedBody = bodyText.trim() ? JSON.parse(bodyText) : undefined;
    } catch {
      alert("Body must be valid JSON");
      return;
    }

    if (authType === "bearer" && authToken.trim()) {
      parsedHeaders["Authorization"] = `Bearer ${authToken.trim()}`;
    }

    setSending(true);
    const token = localStorage.getItem("token");

    const payload = {
      name: url.slice(0, 50),
      method,
      url,
      headers: Object.keys(parsedHeaders).length ? parsedHeaders : undefined,
      body: parsedBody,
      collectionId: selectedCollectionId,
    };

    try {
      let requestId = selectedRequestId;

      if (requestId == null) {
        const saveRes = await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });

        const saveData = await saveRes.json();

        if (!saveRes.ok) {
          alert(saveData.message || "Failed to save request");
          return;
        }
        requestId = saveData.id;
      } else {
        const updateRes = await fetch(`/api/requests/${requestId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });

        const updateData = await updateRes.json();

        if (!updateRes.ok) {
          alert(updateData.message || "Failed to update request");
          return;
        }
      }

      const execRes = await fetch(`/api/requests/${requestId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ environmentId: selectedEnvironmentId ?? undefined }),
      });

      const execData = await execRes.json();

      if (!execRes.ok) {
        alert(execData.message || "Failed to execute request");
        return;
      }

      setResponse({
        status: execData.status,
        duration: execData.duration,
        data: execData.data,
      });

      await refetchRequests();
      setSelectedRequestId(requestId);
    } catch {
      alert("Something went wrong sending the request");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="border-b border-border p-6">
      <div className="flex gap-3">
        <MethodSelect value={method} onChange={setMethod} />
        <UrlInput value={url} onChange={setUrl} />

        <select
          value={selectedEnvironmentId ?? ""}
          onChange={(e) => setSelectedEnvironmentId(e.target.value ? Number(e.target.value) : null)}
          className="rounded-lg border border-[#2B2B31] bg-[#202024] px-3 py-2 text-sm outline-none"
        >
          <option value="">No Environment</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>

        <SendButton onClick={handleSend} sending={sending} />
      </div>

      <div className="mt-5 flex gap-6 text-sm text-muted">
        <button onClick={() => setActiveTab("auth")} className={activeTab === "auth" ? "text-foreground" : ""}>
          Auth
        </button>
        <button onClick={() => setActiveTab("params")} className={activeTab === "params" ? "text-foreground" : ""}>
          Params
        </button>
        <button onClick={() => setActiveTab("headers")} className={activeTab === "headers" ? "text-foreground" : ""}>
          Headers
        </button>
        <button onClick={() => setActiveTab("body")} className={activeTab === "body" ? "text-foreground" : ""}>
          Body
        </button>
        <button onClick={() => setActiveTab("history")} className={activeTab === "history" ? "text-foreground" : ""}>
          History
        </button>
      </div>

      <div className="mt-4 h-56 overflow-y-auto no-scrollbar rounded-xl bg-surface p-4">
        {activeTab === "auth" ? (
          <div className="space-y-3">
            <select
              value={authType}
              onChange={(e) => setAuthType(e.target.value as "none" | "bearer")}
              className="rounded-lg border border-[#2B2B31] bg-[#202024] px-3 py-2 text-sm outline-none"
            >
              <option value="none">No Auth</option>
              <option value="bearer">Bearer Token</option>
            </select>

            {authType === "bearer" && (
              <input
                type="text"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Paste your token here"
                className="w-full rounded-lg border border-[#2B2B31] bg-[#202024] px-4 py-2 text-sm font-mono outline-none"
              />
            )}
          </div>
        ) : activeTab === "params" ? (
          <div className="space-y-2">
            {paramRows.length === 0 ? (
              <p className="text-sm text-muted">No query params yet</p>
            ) : (
              paramRows.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => updateParamRow(index, "key", e.target.value)}
                    placeholder="key"
                    className="w-1/3 rounded-md border border-[#2B2B31] bg-[#202024] px-3 py-1.5 text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateParamRow(index, "value", e.target.value)}
                    placeholder="value"
                    className="flex-1 rounded-md border border-[#2B2B31] bg-[#202024] px-3 py-1.5 text-sm outline-none"
                  />
                  <button onClick={() => removeParamRow(index)} className="text-muted hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            <button onClick={addParamRow} className="text-sm text-accent hover:underline">
              + Add param
            </button>
          </div>
        ) : activeTab === "headers" ? (
  <Editor
      height="100%"
      language="json"
      theme="vs-dark"
      value={headersText}
      onChange={(value) => setHeadersText(value ?? "")}
      options={{ minimap: { enabled: false }, fontSize: 13 }}
    />
  ) : activeTab === "body" ? (
    <Editor
      height="100%"
      language="json"
      theme="vs-dark"
      value={bodyText}
      onChange={(value) => setBodyText(value ?? "")}
      options={{ minimap: { enabled: false }, fontSize: 13 }}
    />
) : selectedRequestId == null ? (
          <p className="text-sm text-muted">Save this request to see its run history.</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted">No runs yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() =>
                  setResponse({
                    status: h.statusCode,
                    duration: h.duration,
                    data: h.response,
                  })
                }
                className="flex w-full justify-between rounded-md bg-background px-3 py-2 text-left text-xs transition hover:bg-surface"
              >
                <span className={h.statusCode >= 400 ? "text-red-400" : "text-green-400"}>
                  {h.statusCode}
                </span>
                <span className="text-muted">{h.duration} ms</span>
                <span className="text-muted">{new Date(h.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}