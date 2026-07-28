// Input field for the request URL.

export default function UrlInput() {
  return (
    <input
      type="text"
      placeholder="https://api.example.com/users"
      className="flex-1 rounded-lg border border-[#2B2B31] bg-[#202024] px-4 py-2 outline-none"
    />
  );
}