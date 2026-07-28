"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  // Calls the login API, stores the JWT and redirects to dashboard.
  const handleLogin = async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);

    router.push("/dashboard");
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8">

        <h1 className="mb-8 text-3xl font-semibold">
          Welcome Back
        </h1>

        <div className="space-y-4">

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

          <button onClick={handleLogin} className="mt-4 w-full rounded-lg bg-accent p-3 font-medium text-white hover:bg-accent-hover">
            Login
          </button>

        </div>

      </div>
    </main>
  );
}