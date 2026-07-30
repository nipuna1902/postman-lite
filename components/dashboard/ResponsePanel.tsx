"use client";

import { useDashboard } from "./DashboardContext";

export default function ResponsePanel() {
  const { response } = useDashboard();

  return (
    <section className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex gap-6 text-sm">
        <span>Status: {response ? response.status : "--"}</span>
        <span>Time: {response ? `${response.duration} ms` : "-- ms"}</span>
      </div>

      <div className="flex-1 overflow-auto rounded-xl bg-surface p-5">
        {response ? (
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
          </pre>
        ) : (
          "Response will appear here..."
        )}
      </div>
    </section>
  );
}