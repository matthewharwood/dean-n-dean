# Gem Interface Design Ledger

This ledger records decisions that should remain consistent if the Alchemist Guild interface expands into a full gem-themed visual language.

## North star

Gems represent deliberate, high-confidence actions. They should feel valuable, tactile, and naturally mounted in the surrounding object—not pasted on top of a flat interface.

## Decision 001 — Emerald confirmation control

- Status: implemented.
- Component: `GemSwipeControl`.
- Uses: transmutation, gathering-answer confirmation, and quest-reward confirmation.
- Positive experience: a child gets one recognizable “slide the jewel to make it real” gesture everywhere.
- Skill atom: drag or keyboard trigger → jewel travels through an energized channel → facets brighten and the channel fills → the player learns that emerald means deliberate confirmation.
- Loop role: a seconds-long closure gesture. It adds weight to consequential actions without slowing navigation or ordinary selection.
- Relatedness: quest claims use the same deliberate gesture when helping an authored character, connecting the physical interaction to completing a promise.

## Visual construction

- Gem: emerald-cut emerald, exact top-down orthographic perspective, generated as a raster reference and stored at `apps/web/public/gem-ui/emerald-slider-thumb.png`.
- Shape: wide octagon with clipped corners and symmetric step-cut facets. The silhouette must stay recognizable from the compact 72 px control through the 76 px large control.
- Setting: warm dark brass beneath the image. A thin setting silhouette extends beyond the gem so it feels mounted.
- Channel: recessed green-black enamel with brass rails. The progress fill is light inside the channel, not paint on its surface.
- Emission: the image owns facet detail; CSS owns hover, focus, drag, disabled, and completed glow. This keeps interaction feedback deterministic and honors reduced motion.
- Scale tokens:
  - Compact: 72 px thumb, 48 px setting height, 6 px channel padding, used for quest rewards.
  - Standard: 72 px thumb, 48 px setting height, 12 px channel padding, used for answer confirmation.
  - Large: 76 px thumb, 52 px setting height, 12 px channel padding, used for transmutation.
- Alignment rule: pointer travel uses the width of the aspect-correct brass setting, not a larger invisible rectangle. At both endpoints the visible setting, interaction box, and recessed channel agree about where the gesture starts and ends.
- Stretch rule: the semantic button may fill a taller grid row to preserve its touch area, but the visible setting never inherits that row height; it stays centered at its scale token.

## Interaction and accessibility

- Pointer and touch keep the existing native `pointerdown` handlers and window-level move/release capture.
- The thumb remains a semantic button with a minimum 48 px touch area.
- Enter, Space, End, and Right Arrow provide a complete non-drag confirmation path.
- Focus is a pale mint inner outline plus a dark emerald outer ring; it must remain visible over both brass and green.
- Press and drag compress the setting by 5% and lower it by 2 px, creating touch feedback without relying only on color.
- Disabled controls lose saturation and emission but keep their silhouette.
- Completed controls brighten without looping animation.
- `prefers-reduced-motion: reduce` removes transitions; state remains legible through position, brightness, and the filled channel.

## Technology decision

HTML/CSS is intentional for this control. It preserves native focus and keyboard semantics, keeps the existing pointer events unchanged, scales crisply across the three layouts, and avoids introducing a Pixi canvas lifecycle for one interactive element. Pixi remains appropriate for scene-level gem particles or ambient refraction later.

## Generated asset record

- Tool path: built-in image generation, followed by local magenta chroma-key removal and transparent-bound trimming.
- Use-case classification: `product-mockup`.
- Final source direction: “One emerald-green emerald-cut gemstone, mathematically perfect top-down orthographic view, symmetric step-cut facets, rich green perimeter and luminous pale-green table, lightly stylized for a game UI, no setting, no shadow, no text.”

## Candidate future tokens

- Emerald: confirmations and successful delivery.
- Sapphire: information, recipes, and knowledge.
- Ruby: danger, destructive actions, or battle commitment—never routine errors.
- Amethyst: discovery and emergent recipes.
- Citrine: gold, trade, and earned upgrades.

These color meanings are proposals, not yet implementation contracts. Before applying them, validate that color is never the only state indicator and that rare gems do not become scarcity-pressure devices.

## Decision 002 — Layered Lapidary Workshop

- Status: implemented.
- Positive experience: the board should feel like a real workshop the player understands and owns, while making the active play surface easier to find at a glance.
- Constraint check: no new game state, persistence shape, interaction, or canvas lifecycle. The theme is a presentation layer over the existing semantic HTML, Jotai/IDB state, and Pixi scenes.
- Structural metaphor:
  - Inventory is the gem tray: safe, glanceable sockets for held material.
  - Quests are commissions: warm parchment work orders from people the player is helping.
  - The periodic table is the element vault: the largest, darkest, most open working surface.
  - The workbench is the cutting bench: five deliberate sockets, machinery, the emerald latch, and the output setting.
  - Recipes are the lapidary ledger: sapphire-coded reference knowledge.
  - Gathering is extraction: moss-green action surfaces and creature encounters.
  - Expeditions are prospecting: compass/amber navigation and material targeting.
  - Upgrades are permanent tools: amethyst-coded improvements to the workshop.

### Layer contract

1. Mineral ground: quiet graphite-teal grain and broad emerald illumination. It never carries game text.
2. Structural shell: matte graphite-green panels with narrow champagne-brass double edges.
3. Inset well: near-black emerald surfaces for playfields, ledgers, card sockets, and inventory pockets.
4. Raised control: clipped-corner buttons with semantic jewel edge colors and a visible pressed depth change.
5. Icon setting: simple high-contrast glyphs seated inside compact gem badges.
6. Feedback: focus, drag, success, rewards, and notifications emit above the physical layers. Idle surfaces do not glow.

### Concept evaluation

- Variant 01 — Guild Jeweler's Bench: best warm brass channel and commission parchment; slightly too uniformly ornate.
- Variant 02 — Arcane Geode Cabinet: strongest sense of raw extraction; rejected as the base because rock texture competes with repeated reading and play.
- Variant 03 — Sunlit Jade Conservatory: best daylight readability lesson; rejected as the base because the overall white value weakens depth and focus.
- Variant 04 — Prismatic Guild Window: best semantic gem accents and clipped corners; reduced to edge accents to avoid rainbow noise.
- Variant 05 — Precision Lapidary Lab: selected structural base because its shapes, spacing, and materials are reproducible in CSS without stealing content area.
- Final synthesis: Variant 05 structure + Variant 01 parchment/brass + Variant 04 semantic accents + Variant 03 opaque reading surfaces.

### Semantic material tokens

- Emerald: crafting, confirmation, success, and currently selected primary action.
- Moss: gathering and practice.
- Amber/topaz: quests, deliveries, expedition rewards, and earned value.
- Sapphire: recipes, reference information, and knowledge.
- Amethyst: upgrades, extended discoveries, and emergent results.
- Quartz: inventory, neutral utilities, and uncommitted sockets.
- Ruby remains reserved for danger and destructive actions.

Color never carries state alone. Selected controls also use position, contrast, borders, labels, and/or `aria-selected`; disabled controls retain a readable silhouette; focus uses an external pale mint ring independent of the semantic hue.

## Audit and concept artifacts

- Current-state full screens and isolated layers: `docs/design/gem-ui-audit/current/`.
- Five generated concept variants: `docs/design/gem-ui-audit/concepts/`.
- Selected synthesized target: `docs/design/gem-ui-audit/final/final-synthesis-target.png`.
- Target-to-implementation comparison: `docs/design/gem-ui-audit/final/final-design-comparison.png`.
- Themed crafting, gathering, expedition, upgrade, Field Bag, and gem-control captures: `docs/design/gem-ui-audit/final/`.

## Implementation record

- Theme contract: `apps/web/app/components/alchemist-guild-board/gem-interface-theme.css`.
- Board integration: `data-gem-theme="lapidary"` scopes the presentation layer without moving game state out of Jotai/IDB or moving Pixi scene data into React.
- Storybook integration: the same theme scope wraps isolated stories so a component is judged in the shipped material system, while `?reactScan=off` allows uncontaminated audit captures without disabling the normal diagnostic.
- Pixi legibility: the periodic-table DOM well tints the page-level canvas instead of masking it, and its heading uses parchment ivory against the dark vault.
- Functional restraint: the generated target's decorative microscope and oversized corner ornaments were not implemented because they would consume interaction space without adding gameplay meaning.
- Accessibility restraint: native buttons, tab semantics, drag geometry, keyboard confirmation, touch targets, focus rings, disabled states, and reduced-motion behavior remain authoritative even where the generated concept suggested tighter ornament.

## Decision 003 — Crystal over Velvet

- Status: implemented as the revision to Decision 002.
- Trigger: the dark lapidary pass preserved the green velvet mood but made transitional text, temporary panels, and some controls feel like a different and less accessible interface. It also displaced too much of the original liquid-glass identity.
- Positive experience: a child experiences a state change as a clear crystal tray being placed on a calm velvet work surface. The game explains what changed and what to do next without feeling like it moved to another app.
- Skill atom: state change → a bright glass bridge settles into the existing panel stack → one clear action remains visually dominant → semantic facet color explains the kind of choice → the player returns to the persistent workshop.

### Revised material stack

1. Emerald velvet is the foundation. It appears in the page ground, gutters, and genuinely recessed play wells; it never carries important dark text.
2. Structural shells are translucent celadon glass with medium blur, a pale jade refracted edge, one champagne-gold setting line, and a consistent soft shadow.
3. Reading and transition surfaces are brighter frosted ivory-mint crystal. Dark forest ink is the default text color.
4. Deep enamel remains only where depth communicates a mechanism: the periodic-table vault, card backs, and the emerald confirmation channel.
5. Semantic gems are narrow facet strips or compact badges. Addition/sapphire, subtraction/emerald, and phonics/amethyst never become three unrelated opaque panel systems.
6. Temporary feedback uses the same crystal recipe as permanent chrome. Toasts, reward dialogs, boss states, and guidance cards do not switch to a separate dark theme.

### Unified geometry and interaction tokens

- Panel and transition corners: 8 px with restrained clipped-corner imagery; focus outlines are never clipped.
- Structural edge: 1 px champagne-gold plus a pale inner highlight.
- Glass: layered translucent gradients with `backdrop-filter`, never an opaque lacquer fill.
- Text: `#17382f` on light crystal; `#0b2c23` for strong headings; muted copy remains green-gray rather than low-opacity white.
- Focus: white inner outline plus a dark emerald outer ring, independent of semantic hue.
- Touch: important actions keep at least a 48 px target. Visual compression at short landscape heights reduces decorative art and gaps before it reduces an action target.

### Transitional layout contract

- Learning-path selection, answer confirmation, boss combat, boss rewards, ordinary rewards, expedition delivery, and upgrade states are layout modes of the same board—not floating pages with their own spacing rules.
- The primary action must be visible without scrolling at the 1280 × 720 audit viewport. Safety overflow may remain for smaller screens, but its scrollbar is visually quiet when all content fits.
- Reward selection gets more vertical room than practice cards. Learning-path selection gives its compact guidance bridge a smaller row. These are intentional content-priority allocations rather than one row height forced onto every state.
- Repeated status inside the primary answer-confirm panel hides at desktop widths because the right information rail already contains it. It remains available below the desktop breakpoint where that rail disappears.
- Decorative reward art shrinks before reward cards, confirmation controls, or claim buttons are clipped.
- Gathering card trays reserve a centered 148 px card row inside a 12.5 rem lower panel; card faces and focus/shadow feedback must remain above the viewport edge while the primary confirmation control stays fully visible.
- Toasts are capped at 18 rem and use pale crystal bodies so a stack occupies less game space and remains readable over velvet.

### Revision concept evaluation

- Variant 01 — Velvet Crystal Cabinet: strongest hierarchy, guidance bridge, and safe notification placement; too ornate to reproduce literally.
- Variant 02 — Opaline Liquid Glass: best connection to the original crystal identity and most convincing edge refraction; too uniformly pale as a complete board.
- Variant 03 — Sunlit Jade Glass: best balance of green structure and velvet depth; a few dark green feedback surfaces were rejected.
- Final synthesis: Variant 02's glass physics + Variant 03's green balance and compact structure + Variant 01's accessible reading hierarchy and toast placement.

### Revision artifacts

- Three revised concepts and the selected synthesis: `docs/design/gem-ui-audit/revision-02/`.
- Eleven implementation captures covering path selection, confirmation, boss states, reward states, expedition, upgrades, crafting, Field Bag, and notifications: `docs/design/gem-ui-audit/revision-02/implementation/`.
- Implementation contact sheet: `docs/design/gem-ui-audit/revision-02/implementation-contact-sheet.png`.
