import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

// Router-level + route-level fallback UIs. Lives outside routes/ so the
// route file (__root.tsx) only exports its `Route` — React Fast Refresh
// (and react-doctor's "Only export components" rule) treats mixed
// component/non-component exports as a refresh-boundary bug.
//
// Wired in TWO places (asserted by router.test.ts):
//   - __root.tsx → route-level errorComponent / notFoundComponent
//     (the common case — Pillar 3 IDB-corrupt-state recovery, Pillar 2
//     Zod parse-on-set throws, side-channel setup failures)
//   - router.tsx → defaultErrorComponent / defaultNotFoundComponent
//     (the router-level fallback for route-resolution throws, loader
//     rejects, errors during route preload, notFound() outside the tree)
//
// RouteError re-throws on the server so prerender.failOnError: true
// aborts the build instead of silently baking a "Something broke" page
// into static HTML for a route that should have failed.

export function NotFound(): ReactNode {
  return (
    <main className="flex flex-col items-center gap-4 min-h-screen justify-center font-display">
      <h1 className="text-3xl">404: page not found</h1>
      <Link to="/" className="rounded-card bg-brand-500 px-4 py-2 text-white shadow-md">
        Go home
      </Link>
    </main>
  );
}

export function RouteError({ error, reset }: { error: Error; reset: () => void }): ReactNode {
  if (typeof window === "undefined") throw error;
  if (import.meta.env.DEV) {
    console.error("[Route error boundary caught]", error);
  }
  return (
    <main className="flex flex-col items-center gap-4 min-h-screen justify-center font-display">
      <h1 className="text-3xl">Something broke</h1>
      {import.meta.env.DEV ? (
        <pre className="text-sm text-red-700 max-w-2xl whitespace-pre-wrap">
          {error.message}
          {error.stack ? `\n\n${error.stack}` : null}
        </pre>
      ) : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-card bg-brand-500 px-4 py-2 text-white shadow-md"
        >
          Try again
        </button>
        <Link to="/" className="rounded-card bg-gray-200 px-4 py-2 shadow-md">
          Go home
        </Link>
      </div>
    </main>
  );
}
