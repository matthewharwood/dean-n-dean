import type { Preview } from "@storybook/react-vite";
import { Provider } from "jotai";
import { type ReactNode, Suspense, use } from "react";

import { idbHydrationPromise } from "../app/state/hydration";
// Same Tailwind entry the app imports — guarantees stories see the design tokens.
import "../app/styles/index.css";

// React Compiler diagnostic — outlines re-rendering components while authoring stories.
// Storybook always builds in dev mode for `storybook dev`; the static build (`storybook build`) tree-shakes.
// showToolbar:false keeps the re-render outlines (the actual diagnostic) but drops
// react-scan's bottom-anchored control widget, which otherwise overlaps and steals
// pointer events from bottom-anchored UI in stories (e.g. the bottom-right toast).
if (import.meta.env.DEV) {
  const { scan } = await import("react-scan");
  scan({ showToolbar: false });
}

function HydrateThenRender({ children }: { children: ReactNode }): ReactNode {
  use(idbHydrationPromise);
  return <>{children}</>;
}

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Suspense fallback={<div data-test="story-hydrating">…</div>}>
        <HydrateThenRender>
          <Provider>
            <Story />
          </Provider>
        </HydrateThenRender>
      </Suspense>
    ),
  ],
};

export default preview;
