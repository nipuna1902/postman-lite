import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background px-6 py-10 text-foreground">
      {/* Background Grid */}

      <div
        className="absolute inset-0 -z-20 opacity-[0.03]
        [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
        [background-size:48px_48px]"
      />

      {/* Background Glow */}

      <div className="absolute left-1/2 top-1/2 -z-10 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />

      {/* Hero */}

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center">
        <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted">
          HTTP Client • API Testing • Collections
        </span>

        <h1 className="mt-8 text-7xl font-bold tracking-[-0.06em]">
          <span>postman-</span>
          <span className="text-accent">lite</span>
        </h1>

        <p className="mt-6 max-w-2xl text-xl leading-8 text-muted">
          Build, test and debug{" "}
          <span className="font-medium text-foreground">HTTP APIs</span> from
          one clean workspace.
        </p>

        <p className="mt-2 text-base text-muted">
          Fast. Minimal. Built for developers.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-hover"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-border bg-surface px-6 py-3 transition hover:bg-sidebar"
          >
            Login
          </Link>
        </div>

        {/* Features */}

        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface/60 p-5 backdrop-blur-sm">
            <p className="text-2xl">⚡</p>
            <h3 className="mt-3 font-semibold">Fast Requests</h3>
            <p className="mt-2 text-sm text-muted">
              Execute APIs with a single click.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface/60 p-5 backdrop-blur-sm">
            <p className="text-2xl">📁</p>
            <h3 className="mt-3 font-semibold">Collections</h3>
            <p className="mt-2 text-sm text-muted">
              Organise requests by project.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface/60 p-5 backdrop-blur-sm">
            <p className="text-2xl">📜</p>
            <h3 className="mt-3 font-semibold">History</h3>
            <p className="mt-2 text-sm text-muted">
              Review previous executions anytime.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface/60 p-5 backdrop-blur-sm">
            <p className="text-2xl">🔒</p>
            <h3 className="mt-3 font-semibold">Secure</h3>
            <p className="mt-2 text-sm text-muted">
              Protected using JWT authentication.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="flex items-center justify-center text-sm text-muted">
        <span>Built with Next.js • TypeScript • Prisma • PostgreSQL</span>
      </footer>
    </main>
  );
}