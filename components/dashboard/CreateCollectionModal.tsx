"use client";

interface CreateCollectionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCollectionModal({
  open,
  onClose,
}: CreateCollectionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-full max-w-md rounded-2xl bg-surface p-6">

        <h2 className="text-2xl font-semibold">
          New Collection
        </h2>

        <input
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

          <button className="rounded-lg bg-accent px-4 py-2 text-white">
            Create
          </button>

        </div>

      </div>

    </div>
  );
}