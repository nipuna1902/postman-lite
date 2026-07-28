"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  // Calls the signup API and redirects to login on success.
  const handleSignup = async () => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (response.ok) {
      router.push("/login");
      return;
    }

    const data = await response.json();
    alert(data.message || "Signup failed");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8">

        <h1 className="mb-8 text-3xl font-semibold">
          Create Account
        </h1>

        <div className="space-y-4">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-lg border border-border bg-background p-3 outline-none"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-border bg-background p-3 outline-none"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-border bg-background p-3 outline-none"
          />

          <button onClick={handleSignup} className="mt-4 w-full rounded-lg bg-accent p-3 font-medium text-white hover:bg-accent-hover">
            Create Account
          </button>

        </div>

      </div>
    </main>
  );
}