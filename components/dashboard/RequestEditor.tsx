// Request editor containing method, URL and send button.

import MethodSelect from "./MethodSelect";
import UrlInput from "./UrlInput";
import SendButton from "./SendButton";

export default function RequestEditor() {
  return (
    <section className="border-b border-border p-6">
      <div className="flex gap-3">
        <MethodSelect />
        <UrlInput />
        <SendButton />
      </div>

      <div className="mt-5 flex gap-6 text-sm text-muted">
        <button className="text-foreground">Headers</button>
        <button>Body</button>
      </div>

      <div className="mt-4 h-56 rounded-xl bg-surface p-4">
        Request Body
      </div>
    </section>
  );
}