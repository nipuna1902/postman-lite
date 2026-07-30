// UrlInput.tsx
type Props = { value: string; onChange: (value: string) => void };

export default function UrlInput({ value, onChange }: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="https://api.example.com/users"
      className="flex-1 rounded-lg border border-[#2B2B31] bg-[#202024] px-4 py-2 outline-none"
    />
  );
}