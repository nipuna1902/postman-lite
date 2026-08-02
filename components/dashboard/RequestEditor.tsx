"use client";

import { useEffect, useState } from "react";
import MethodSelect from "./MethodSelect";
import UrlInput from "./UrlInput";
import SendButton from "./SendButton";
import { useDashboard } from "./DashboardContext";

type HistoryEntry = {
  id: number;
  statusCode: number;
  duration: number;
  createdAt: string;
  response: unknown;
};

export default function RequestEditor() {
  const {
    selectedCollectionId,
    selectedRequestId,
    requests,
    refetchRequests,
    setSelectedRequestId,
    setResponse,
  } = useDashboard();

  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headersText, setHeadersText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [authType, setAuthType] = useState<"none" | "bearer">("none");
  const [authToken, setAuthToken] = useState("");
  const [activeTab, setActiveTab] = useState<"auth" | "headers" | "body" | "history">("headers");
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

    // Split a saved Authorization: Bearer <token> header back out into the
    // Auth tab, so it doesn't just show up as raw JSON under Headers.
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

    // Fold the Auth tab into the same headers object before saving/sending —
    // execute doesn't need to know "auth" exists as its own concept.
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
        headers: { Authorization: `Bearer ${token}` },
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
        <SendButton onClick={handleSend} sending={sending} />
      </div>

      <div className="mt-5 flex gap-6 text-sm text-muted">
        <button onClick={() => setActiveTab("auth")} className={activeTab === "auth" ? "text-foreground" : ""}>
          Auth
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

      <div className="mt-4 h-56 overflow-y-auto rounded-xl bg-surface p-4">
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
        ) : activeTab === "headers" ? (
          <textarea
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            placeholder='{ "Content-Type": "application/json" }'
            className="h-full w-full resize-none bg-transparent font-mono text-sm outline-none placeholder:text-muted"
          />
        ) : activeTab === "body" ? (
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder='{ "key": "value" }'
            className="h-full w-full resize-none bg-transparent font-mono text-sm outline-none placeholder:text-muted"
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