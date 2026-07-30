"use client";

import { useEffect, useState } from "react";
import MethodSelect from "./MethodSelect";
import UrlInput from "./UrlInput";
import SendButton from "./SendButton";
import { useDashboard } from "./DashboardContext";

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
  const [activeTab, setActiveTab] = useState<"headers" | "body">("headers");
  const [sending, setSending] = useState(false);

  // Whenever a different saved request is selected in the sidebar, load its
  // saved values into the editor. Selecting "null" (New request) resets it.
  useEffect(() => {
    if (selectedRequestId == null) {
      setMethod("GET");
      setUrl("");
      setHeadersText("");
      setBodyText("");
      return;
    }
    const req = requests.find((r) => r.id === selectedRequestId);
    if (!req) return;
    setMethod(req.method);
    setUrl(req.url);
    setHeadersText(req.headers ? JSON.stringify(req.headers, null, 2) : "");
    setBodyText(req.body ? JSON.stringify(req.body, null, 2) : "");
  }, [selectedRequestId, requests]);

  const handleSend = async () => {
    if (!selectedCollectionId) {
      alert("Select or create a collection first");
      return;
    }
    if (!url.trim()) {
      alert("Enter a URL");
      return;
    }

    let parsedHeaders: Record<string, string> | undefined;
    let parsedBody: unknown;

    try {
      parsedHeaders = headersText.trim() ? JSON.parse(headersText) : undefined;
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

    setSending(true);
    const token = localStorage.getItem("token");

    try {
      let requestId = selectedRequestId;

      // Only save a brand-new row if this is a fresh, unsaved draft.
      // Re-sending an already-selected request just re-executes it.
      if (requestId == null) {
        const saveRes = await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: `${method} ${url}`.slice(0, 50),
            method,
            url,
            headers: parsedHeaders,
            body: parsedBody,
            collectionId: selectedCollectionId,
          }),
        });

        const saveData = await saveRes.json();

        if (!saveRes.ok) {
          alert(saveData.message || "Failed to save request");
          return;
        }
        requestId = saveData.id;
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
        <button onClick={() => setActiveTab("headers")} className={activeTab === "headers" ? "text-foreground" : ""}>
          Headers
        </button>
        <button onClick={() => setActiveTab("body")} className={activeTab === "body" ? "text-foreground" : ""}>
          Body
        </button>
      </div>

      <div className="mt-4 h-56 rounded-xl bg-surface p-4">
        {activeTab === "headers" ? (
          <textarea
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            placeholder='{ "Content-Type": "application/json" }'
            className="h-full w-full resize-none bg-transparent font-mono text-sm outline-none placeholder:text-muted"
          />
        ) : (
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder='{ "key": "value" }'
            className="h-full w-full resize-none bg-transparent font-mono text-sm outline-none placeholder:text-muted"
          />
        )}
      </div>
    </section>
  );
}