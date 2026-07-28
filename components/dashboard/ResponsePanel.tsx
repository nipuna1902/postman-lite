// Displays the response returned by the API.

export default function ResponsePanel() {
  return (
    <section className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex gap-6 text-sm">
        <span>Status: --</span>
        <span>Time: -- ms</span>
      </div>

      <div className="flex-1 rounded-xl bg-surface p-5">
        Response will appear here...
      </div>
    </section>
  );
}