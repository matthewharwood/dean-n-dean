import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Provider } from "jotai";
import { lazy, type ReactNode, Suspense, use } from "react";

import { idbHydrationPromise } from "~/state/hydration";

// The `<html>` shell + Pillar 3 hydration boundary, extracted out of
// __root.tsx so that the route file only exports its `Route` config.
// react-doctor's `only-export-components` rule treats local-but-not-
// exported components in a non-component-export file as a fast-refresh
// boundary bug — moving them here keeps the rule green AND keeps fast
// refresh working through the shell.

// Dev-only TanStack DevTools host + Router plugin. The `import.meta.env.DEV`
// ternary is statically known at build time, so Vite tree-shakes the lazy()
// branch (and its dynamic imports) out of the production bundle.
const TanStackDevtools =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_TANSTACK_DEVTOOLS === "true"
    ? lazy(async () => {
        const [{ TanStackDevtools: Host }, { TanStackRouterDevtoolsPanel }] = await Promise.all([
          import("@tanstack/react-devtools"),
          import("@tanstack/react-router-devtools"),
        ]);
        return {
          default: () => (
            <Host
              config={{{{raw}}}}{{ position: "bottom-right" }}{{{{/raw}}}}
              plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
            />
          ),
        };
      })
    : null;

function HydrateThenRender({ children }: { children: ReactNode }): ReactNode {
  // Pillar 3 — exactly one root <Suspense> + use(idbHydrationPromise).
  // After this resolves, every atomWithIDB reads its initial value synchronously.
  use(idbHydrationPromise);
  return <>{children}</>;
}

export function RootShell(): ReactNode {
  return (
    // Browser/extension instrumentation (Chrome remote-debugger's
    // __gchrome_remoteframetoken, password-manager bookkeeping, etc.) routinely
    // mutates <html>'s attributes before React boots. React 19's strict
    // hydration treats those as mismatches and surfaces them as the "Invalid
    // HTML tag nesting" variant. Suppress on this element only — it doesn't
    // cascade into children, so real hydration bugs deeper in the tree still
    // throw normally.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Provider>
          <Suspense fallback={null}>
            <HydrateThenRender>
              <Outlet />
            </HydrateThenRender>
          </Suspense>
        </Provider>
        {TanStackDevtools ? (
          <Suspense fallback={null}>
            <TanStackDevtools />
          </Suspense>
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}
