"use client";

import { useState } from "react";

interface CreateCollectionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCollectionModal({
  open,
  onClose,
  onCreated,
}: CreateCollectionModalProps) {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;

    const token = localStorage.getItem("token");

    const response = await fetch("/api/collections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (!response.ok) {
      alert("Failed to create collection");
      return;
    }

    setName("");
    onClose();
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6">

        <h2 className="text-2xl font-semibold">
          New Collection
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          className="mt-6 w-full rounded-lg border border-border bg-background p-3 outline-none"
        />

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="rounded-lg bg-accent px-4 py-2 text-white"
          >
            Create
          </button>

        </div>

      </div>
    </div>
  );
}