// Dropdown to choose the HTTP method.

export default function MethodSelect() {
  return (
    <select className="rounded-lg border border-[#2B2B31] bg-[#202024] px-3 py-2 outline-none">
      <option>GET</option>
      <option>POST</option>
      <option>PUT</option>
      <option>PATCH</option>
      <option>DELETE</option>
    </select>
  );
}