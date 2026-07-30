// MethodSelect.tsx
type Props = { value: string; onChange: (value: string) => void };

export default function MethodSelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-[#2B2B31] bg-[#202024] px-3 py-2 outline-none"
    >
      <option>GET</option>
      <option>POST</option>
      <option>PUT</option>
      <option>PATCH</option>
      <option>DELETE</option>
    </select>
  );
}