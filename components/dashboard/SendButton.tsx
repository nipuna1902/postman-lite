// SendButton.tsx
type Props = { onClick: () => void; sending: boolean };

export default function SendButton({ onClick, sending }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={sending}
      className="rounded-lg bg-accent px-5 py-2 font-medium text-white transition-colors duration-200 hover:bg-accent-hover disabled:opacity-50"
    >
      {sending ? "Sending..." : "Send"}
    </button>
  );
}