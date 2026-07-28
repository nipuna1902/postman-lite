"use client";

// Sidebar for collections and navigation.

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type Collection = {
  id: number;
  name: string;
};

export default function Sidebar() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/collections", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setCollections(data.collections);
    };

    fetchCollections();
  }, []);

  return (
    <aside className="flex w-72 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">
          <span>postman-</span>
          <span className="text-accent">lite</span>
        </h1>
      </div>

      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="text-xs uppercase tracking-widest text-muted">
          Collections
        </h2>

        <button className="rounded-md p-2 transition hover:bg-surface">
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-1 px-3">
        {collections.map((collection) => (
          <button
            key={collection.id}
            className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface"
          >
            {collection.name}
          </button>
        ))}
      </div>
    </aside>
  );
}