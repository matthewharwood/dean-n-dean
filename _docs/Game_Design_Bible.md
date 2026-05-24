# Elemental Guild

*A Periodic Table Crafting Adventure*

**Comprehensive Game Design Bible - First Filled Draft**

| Field | Filled Draft |
|---|---|
| Working Title | Elemental Guild |
| Single Sentence Description | Craft elements into wonders for a magical guild. |
| Platform | iPad-first tabletop board game interface; touch, drag, queue, and inspect. |
| Audience | Parent-child co-play, gifted/science-curious kids ages 7-10, and families who want chemistry to feel like a cozy RPG board game. |
| Core Hook | A three-slot starter crafting board that upgrades to five slots, where real elements compress into compounds, compounds become materials, and materials become fantasy quest objects. |
| Design Constraint | No paid gacha, no dark patterns, no failure states that shame the child. Discovery choices are deterministic and educational. |

Drafting assumptions: this bible is based on the uploaded Game Design Bible template, the spoken concept from the current conversation, and quick market/education research. It deliberately keeps this new project separate from any earlier game concept. It should be treated as a strong first draft, not final production scripture.

## Executive Summary

*Elemental Guild* is an iPad-first educational idle crafting game about learning the periodic table by turning elements into compounds, compounds into materials, and materials into recognizable fantasy-world objects. The player uses an upgradeable crafting table, an inventory, a quest bulletin board, and a slowly expanding Periodic Table Vault. The table starts with three visible slots, then grows to four and finally five through purchased workbench upgrades. Each element is a card. Each compound or material is also a card, but it preserves internal complexity. This creates the central puzzle: the board has a small visible slot budget, but a visible card may contain many atoms, allowing young players to learn composition, compression, and recipe planning without feeling like they are doing worksheets.

The game is designed for rapid development with a parent and child, and for play sessions that work like a board game on a single iPad screen. The player checks the Quest Board, chooses from a small number of requests, crafts the necessary elements or compounds, waits for idle timers, manages inventory, sells surplus, and uses rewards to unlock new elements, new quest-givers, and workshop upgrades. The long-term objective is not to "win" once; it is to fill the Periodic Table Vault, complete the Element Museum, and build a durable mental model of matter.

## The Game in One Flow Diagram

```text
Quest Board -> Choose 1-3 active quests -> Inspect recipe hints -> Pull elements from Periodic Table Vault -> Combine on the current Crafting Table -> Wait / idle queue -> Collect into Inventory -> Deliver, sell, or store -> Earn Gold + Discovery Token + Knowledge XP -> Buy table/queue/inventory upgrades -> Choose one of three deterministic discoveries -> Unlock element / recipe / NPC / upgrade -> New quests appear.
```

## First Five Minutes Snapshot

The player opens the town board. Professor Atomwick introduces the Periodic Table Vault. Only Hydrogen, Oxygen, and Carbon are glowing. Sir Bubbleton posts a quest for Water. The player drags Hydrogen, Hydrogen, and Oxygen onto the three-slot starter table and taps Craft. Water exactly fills the table, so H2O becomes a physical memory instead of a formula on a card. A 20-second timer starts. While it ticks, the tutorial opens the inventory. Water completes, slides into inventory, and is delivered to Sir Bubbleton. The reward is 10 Gold, 1 Discovery Token, and the ability to buy Workbench Slot IV for 8 Gold. The Discovery Token opens three face-up choices: Sodium, Iron, or Baker Brindle. Sodium is recommended because it will later pair with Chlorine for salt and glass-chain recipes. The game ends the tutorial by showing the idle promise: "Your workshop keeps crafting while you are away."

# PART 1 | Inspiration

The original design bible asks for successful reference games, trailer study, core loop study, and Steam/store page study. The goal is not to copy; it is to identify proven hooks that map onto this project: tactile crafting, card-board readability, idle progression, and open-ended puzzle depth.

## What Games Inspire This?

| Game / Link | Why It Inspires Elemental Guild | Design Lesson to Steal |
|---|---|---|
| Stacklands - Steam | A card-based village builder where stacking cards creates resources, structures, and quests. Its board is legible, toy-like, and easy to understand from a screenshot. | Cards should be physical, stackable, draggable, and sellable. The board can be the whole game. Use card packs/idea cards as inspiration, but make discoveries deterministic and child-safe. |
| Potion Craft: Alchemist Simulator - Steam | A fantasy crafting shop where customers ask for practical magical products and the tactile act of crafting is the point. It proves that the shop request loop can carry a whole game. | Quest-givers should feel like customers with needs. The town counts on the player. Crafting should have texture, sound, and ritual, not just a button. |
| Forager - Steam | An "idle game that you want to actively keep playing" built around gathering, crafting, expanding, secrets, skills, and base growth. | Idle timers should create reasons to return, while upgrades and new land/elements create visible expansion. The game should be playable actively for 5 minutes or passively for hours. |
| Little Alchemy 2 - Official site / app stores | A mass-market example of combination discovery: mix simple things, create the world, and keep an encyclopedia of discoveries. | The discovery fantasy is powerful. However, Elemental Guild should be more grounded in real chemistry and use quests to give purpose to recipes. |
| Opus Magnum - Steam | An open-ended puzzle game about building machines to assemble alchemical products. It makes recipe production elegant, optimizable, and shareable. | Later-game recipes can support optimization: faster queue, fewer visible slots, better factories, and puzzle-like recipe chains. |

## Trailer Study

| Game | What the Trailer / Store Hook Communicates Immediately | Application to Elemental Guild |
|---|---|---|
| Stacklands | The hook is visual in seconds: cards stack, the board changes, and tiny systems emerge from simple drags. | Opening trailer/gameplay should show H + H + O becoming Water, then Water satisfying a quest, then a new element unlocking. |
| Potion Craft | The fantasy is tactile: you are not only choosing recipes; you are operating a cozy alchemy shop that people rely on. | Use satisfying gestures: cards slide, compounds swirl, the quest-giver reacts, inventory fills, and the town visibly improves. |
| Forager | The promise is constant growth: gather, craft, expand, automate, and always have another target. | Show a tiny starting table, then a larger workshop, more elements glowing, and multiple queued crafts running offline. |
| Little Alchemy 2 | The hook is simple combinatorial curiosity: what happens if I mix these two things? | Every recipe should preserve curiosity, but with enough guidance that a child is not lost. Show "try this next" hints. |
| Opus Magnum | The hook is elegant systems thinking: simple parts assemble into complex results, and better solutions are possible. | Advanced players can optimize recipe chains: earn more workbench slots, pre-combine materials, compress complexity, and plan around a five-slot ceiling. |

## Core Game Loop Study

| Game | Core Loop | Primary Mechanic | Why Sticky |
|---|---|---|---|
| Stacklands | Stack cards -> generate resources -> complete ideas/quests -> buy packs -> survive/expand. | Dragging cards onto other cards. | Familiar cards, unique board-stacking, memorable emergent clutter and survival pressure. |
| Potion Craft | Receive customer need -> brew potion -> sell -> buy/grow ingredients -> discover recipes -> serve harder needs. | Tactile brewing with ingredients and tools. | Familiar shop, unique map-based brewing, memorable medieval craft atmosphere. |
| Forager | Gather -> craft -> sell/upgrade -> expand land -> unlock skills -> gather faster. | Active-idle gathering and crafting. | Familiar resource collection, unique constant acceleration, memorable "always one more thing" progression. |
| Little Alchemy 2 | Combine items -> discover new item -> read encyclopedia -> combine more. | Two-item mixing. | Familiar experimentation, unique discovery tree, memorable huge library. |
| Opus Magnum | Read recipe goal -> design machine -> run/optimize -> compare performance -> advance to harder puzzles. | Programmable assembly machine. | Familiar puzzle solving, unique mechanical expression, memorable shareable machines. |

## Steam / Store Page Study

| Reference | Short Description Pattern | What Elemental Guild Learns |
|---|---|---|
| Potion Craft | Genre and theme are clear immediately: an alchemist simulator about physically interacting with tools and ingredients to brew potions; the player controls the shop, invents recipes, attracts customers, and experiments. | Our description should lead with genre + action: "an idle chemistry crafting board game." Then say exactly what the player does. |
| Stacklands | The player understands the verb from one example: drag a Villager card onto a Berry Bush card to spawn Berries. | Our store/tutorial copy needs one obvious example: "Drag Hydrogen + Hydrogen + Oxygen to craft Water." |
| Forager | The description explicitly promises an idle game that you actively keep playing, then lists verbs: explore, craft, gather, manage, expand. | Our game should promise idle progress without idle boredom: "queue recipes, collect discoveries, and expand the Periodic Table Vault." |
| Opus Magnum | The page sells open-ended assembly and optimization: design machines that assemble products, then compete on simplicity, speed, and compactness. | Later-game appeal can be "solve it your way" through recipe planning and efficient compound compression. |

# PART 2 | Motivation

## What Makes the Heart-Rate Increase?

| Motivation | Why It Matters for This Game |
|---|---|
| A parent and child making a game rapidly together | This is not just a commercial product; it is a living project, a collaboration artifact, and a way to turn a child's curiosity into a playable world. |
| The periodic table as a magical map | The child already knows many elements. The game should honor that knowledge by making the periodic table feel like a world map with locked territories. |
| Fantasy RPG quest-givers asking for real-world matter | Knights, bakers, miners, wizards, gardeners, and inventors provide emotional context for chemistry. "Make water" is a worksheet; "Sir Bubbleton needs water after training" is a story. |
| Building from tiny atoms into things you recognize | The long-term magic is seeing Hydrogen, Oxygen, Carbon, Sodium, Chlorine, Iron, Silicon, Copper, and others become water, salt, glass, wire, tools, potions, circuits, and devices. |
| A board game on an iPad | The iPad should feel like a shared tabletop: big cards, readable symbols, drag-and-drop, satisfying sounds, and no tiny UI. |

## Design Values

- **Wonder before correctness:** make the player curious first, then reveal the chemistry layer.
- **Correct enough to teach:** formulas and element facts should be accurate, but higher-order objects can use simplified material recipes to remain playable.
- **Small visible choices:** never show the whole periodic table as a wall of work. Reveal in small constellations.
- **No shame:** wrong recipes create hints, not failure screens.
- **No monetized chance:** gacha-like excitement should be a deterministic Discovery Draft earned through play.
- **Parent-child friendly:** the interface should invite conversation, not isolate the child.

# PART 3A | The Trinity Hook

| Story Hook | Mechanics Hook | Art Style Hook |
|---|---|---|
| A magical guild town has lost its knowledge of matter. Each quest-giver needs real things - water, salt, glass, tools, medicines, lights - and the player restores the town by rediscovering the elements. | The upgradeable crafting table. It starts with three visible slots, then the player buys a fourth and fifth slot as recipes ask for more planning. A recipe may require more atoms than visible slots, but compounds can be pre-built and compressed into one visible card. | A cozy fantasy board game built out of crisp science cards: parchment quest board, glowing periodic table vault, hand-painted guild NPCs, polished iPad cards, readable symbols, and magical molecule animations. |

# PART 3B | The Core Game Loop

## The Loop

Quest Board -> Choose quest -> Inspect recipe and missing components -> Pull available element cards -> Craft compounds/materials on the current table -> Wait for idle timer / queue multiple items -> Collect into inventory -> Deliver to quest-giver or sell surplus -> Earn Gold, Knowledge XP, and Discovery Tokens -> Buy workbench/queue/inventory upgrades -> Select one of three discoveries -> Unlock elements, recipes, NPCs, upgrades, or new quest chains -> Repeat with higher complexity.

## Primary Mechanic

Upgradeable-slot molecular crafting with compound compression: the Crafting Table starts with three visible cards, then can be upgraded to four and finally five visible cards. A visible card may represent a simple element, a molecule, a material, or an object component. The player learns to break recipes into stages. Example: Water is H + H + O, which exactly fills the starter table. Later, five-card carbonate recipes create a clear reason to buy Workbench Slot V. The visible slot count and the hidden atom complexity create the puzzle.

## Why This Mechanic Is Sticky

| Familiar | Unique | Memorable |
|---|---|---|
| It uses cards, quests, a town board, inventory, coins, upgrades, and wait timers - patterns kids and adults already understand from board games, RPGs, and idle games. | It turns real chemical formulas into a spatial board puzzle. The slot limit starts strict, then expands at meaningful moments, creating strategy without needing advanced math. Discovery choices are deterministic but feel like a magical draft. | The child remembers that water is H2O because they physically filled all three starter slots, waited for it, delivered it, and saw the town respond. The formula becomes an action memory. |

## The Idle Layer

| Idle System | Purpose | Early Implementation |
|---|---|---|
| Craft Timers | Make crafting feel like production and give the player a reason to return. | 10-30 seconds in tutorial; 1-5 minutes in early game; longer only after automation exists. |
| Craft Queue | Let players plan before leaving. | Start at 1 queue slot, upgrade to 2-5. |
| Offline Progress | Make the game feel alive when closed. | Cap early offline progress at 30 minutes to avoid runaway inventory; upgrade cap later. |
| Notifications | Invite return without pressure. | "3 Waters are ready for the Baker." No manipulative streak warnings. |
| Workshop Assistants | Fantasy automation layer. | Unlock Goblin Sorter, Apprentice Chemist, Clockwork Cart, and Element Librarian. |

## The Discovery Draft: Gacha Feeling Without Gacha Harm

After important quests, the player receives a Discovery Token. Spending it reveals three face-up options. The options are not paid, not random in a gambling sense, and not required to be purchased. They are generated from a deterministic progression graph so every child gets a coherent path while still feeling personal.

| Choice Type | Example | Rule |
|---|---|---|
| Critical Path Discovery | Chlorine appears after Sodium so Salt quests can open. | At least one option must progress a required recipe chain. |
| Side Path Discovery | Iron opens blacksmith quests; Nitrogen opens garden quests. | Side options open alternate quest families, not dead ends. |
| Upgrade Discovery | Faster Hands I, Bigger Backpack I, Better Labels I. | Useful when the player has enough elements but needs better flow. |
| Knowledge Discovery | Element family badge: Alkali Metals, Noble Gases, Halogens. | Adds science meaning and museum progress. |
| NPC Discovery | Unlock Baker, Miner, Glassblower, Electrician. | Introduces new context for existing chemistry. |

Mathematical model: treat the unlock system as a directed acyclic graph. Each node is an element, recipe, NPC, or upgrade. The game maintains a frontier of eligible nodes whose prerequisites are met. A Discovery Draft selects three nodes from the frontier: one guaranteed critical path, one synergistic side path, and one player-preference option. This creates nonlinear-feeling choice while preserving linear curriculum safety.

# PART 4 | Game Overview

## Game Title

Elemental Guild

## Single Sentence Description

Craft elements into wonders for a magical guild.

## Subtitle

An idle chemistry board game about unlocking the periodic table.

## Short Description

*Elemental Guild* is an iPad-first idle crafting board game where you combine periodic-table element cards into compounds, materials, and familiar objects for a cozy fantasy guild. Accept quests, queue recipes, manage your inventory, unlock new elements, and build a living museum of matter one discovery at a time.

## Long Description

A knight needs water. A baker needs salt. A miner needs a better pick. A glassblower needs silica. The town looks magical, but every request begins with real matter.

In *Elemental Guild*, the periodic table becomes a fantasy map. You begin with a few simple element cards - Hydrogen, Oxygen, Carbon - and a three-slot crafting table. Drag elements onto the board, combine them into compounds, and use those compounds to satisfy quests from guild characters. The workshop keeps crafting while you are away, but every return gives you a new choice: deliver, sell, upgrade, or discover.

The twist is compound compression. Your crafting table starts with only three visible cards and grows to five through purchased upgrades, but any crafted card can contain hidden complexity. Water begins as H + H + O and exactly fills the starter table. Later, carbonate, glass, and capstone recipes ask the player to decide what should be built now, what should be stored, which slot upgrade is worth buying, and what unlocks the next part of the world.

## Key Features

- A tactile iPad board-game interface designed for parent-child play.
- A Periodic Table Vault that unlocks slowly instead of overwhelming the player.
- Upgradeable-slot chemistry crafting where formulas become spatial puzzles.
- Idle crafting queues, offline progress, notifications, and workshop upgrades.
- Fantasy RPG quest-givers who create context for real compounds and materials.
- A deterministic Discovery Draft: choose one of three new elements, upgrades, NPCs, or recipe paths.
- An Element Museum that turns discoveries into a long-term learning collection.
- Soft educational feedback: wrong recipes generate hints and facts, not punishment.

## Plot

| Plot Element | Filled Draft |
|---|---|
| Hook | A child alchemist can restore a town by rediscovering what everything is made of. Every object in the world is a doorway into chemistry. |
| Setting | Vellum Vale, a cozy fantasy guild town built around an ancient Periodic Table Vault. The town has a quest board, market, workshop, guild hall, museum, mine, bakery, garden, forge, glassworks, and later an observatory. |
| Protagonist | The Junior Alchemist, a curious young guild member chosen by Professor Atomwick to reopen the vault. The protagonist can be named by the player. |
| Antagonist | The Muddlefog - not an evil person, but a magical confusion that has scrambled the town's understanding of matter. It locks element families and causes quest-givers to forget how things are made. |
| Struggle | The player must move from memorizing element names to understanding how elements combine, how materials behave, and how small recipes build into useful objects. |
| The Black Box | What is hidden behind the final locked door of the Periodic Table Vault? The answer is the Element Museum's Grand Orrery, a model showing how atoms, molecules, materials, life, Earth, and stars connect. |
| Gameplay Relation | Every plot beat unlocks a new part of the chemistry model: elements, molecules, compounds, materials, objects, tools, energy, and advanced element families. |

## Characters

### The Protagonist

| Field | Draft |
|---|---|
| Overview | The Junior Alchemist. Age can match the player. Curious, quick, slightly impatient, and delighted by patterns. |
| The Flaw | Rushing to guess without checking the recipe, symbol, or property clue. |
| The Struggle | Learning that mastery is not only memorization; it is understanding relationships. The player must slow down, observe, combine, test, and explain. |

### The Antagonist

| Field | Draft |
|---|---|
| Overview | The Muddlefog, a drifting cloud of magical confusion that hides parts of the Periodic Table Vault and scrambles recipe memory. |
| Threat to Protagonist | It makes the town forget how everyday things are made and tempts the player to brute-force instead of reason. |
| Believability | It represents a real learning obstacle: facts without connections become foggy. The antagonist is overcome by models, practice, and curiosity. |

### Minor Characters / Quest-Givers

| Character | Purpose | Salt / Tension |
|---|---|---|
| Professor Atomwick | Tutorial guide and encyclopedia narrator. | Gives gentle hints but asks the player to explain what they made. |
| Sir Bubbleton, Knight | Early water, metal, armor, and training quests. | Needs simple objects quickly, teaching basics under light pressure. |
| Baker Brindle | Kitchen chemistry: water, salt, carbon dioxide, baking soda, sugar. | Introduces bulk orders and inventory planning. |
| Mina Pickbright, Miner | Unlocks metals, ores, alloys, and late rare elements. | Gives access to elements before the player fully understands them, creating curiosity. |
| Glassblower Luma | Silica, glass, lenses, telescope quests. | Bridges chemistry to optics and the observatory. |
| Tinker Volt | Copper, zinc, batteries, wires, circuits. | Introduces electricity and more complex material chains. |
| Gardener Nori | Nitrogen, phosphorus, potassium, plant growth, soil quests. | Shows chemistry as life-supporting, not only lab-based. |
| Archivist Mendelee | Element Museum, family badges, mastery checks. | Turns completion into knowledge collection. |

## Genre

| Field | Choice / Definition |
|---|---|
| Primary Genre | Educational idle crafting board game. |
| Secondary Genre | Casual puzzle RPG / incremental resource-management game. |
| Genre Fit | The game combines a card-board crafting surface, RPG quest flavor, idle timers, and a curriculum-like unlock graph. |
| Budget Fit | Strong fit for a rapid indie/family prototype: one board screen, cards, dialogue cards, timers, inventory, and data-driven recipes. Avoid open-world, multiplayer, complex combat, and 3D scope. |

## Target Audience

| Field | Draft |
|---|---|
| Age Group | Primary: ages 7-10 with adult co-play. Secondary: 10-14 self-directed learners. |
| Language | English first; scientific symbols are universal, but descriptions must be kid-friendly. |
| Gender | All genders. Avoid coding the game as "for boys" or "for girls"; use fantasy guild archetypes broadly. |
| Taste | Kids who like Pokemon-style collecting, Minecraft-style crafting, fantasy classes, board games, science facts, and completion checklists. |
| Other Traits | Best for curious kids who enjoy memorization, categorization, systems, and "one more unlock" progression. |

## Rewards

### Plot Rewards

The plot reward is restoring Vellum Vale and completing the Grand Orrery inside the Element Museum. Each major element family restored removes part of the Muddlefog and lights up a section of the town. The player should see that their learning changes the world: the Baker can bake, the Knight can train, the Glassblower can build lenses, the Electrician can light lamps, and the Observatory can reveal the stars.

The plot carrot begins in the trailer/tutorial: most of the Periodic Table Vault is dark. Each quest lights a square, each square opens a new possibility, and the far end of the vault hints at mysterious late-game elements and cosmic quests.

### Gameplay Rewards

| Reward | How It Works | Why It Matters |
|---|---|---|
| Gold | Earned by completing quests and selling surplus. | Buys workbench slots, extra inventory, queue slots, and shop services. |
| Discovery Tokens | Earned from quests, milestones, and museum mastery. | Opens three deterministic unlock choices. Main progression currency. |
| Knowledge XP | Earned when the player crafts, inspects, or answers quick explain prompts. | Levels the player without requiring combat. Unlocks badges and hints. |
| Element Unlocks | New periodic-table cards become available. | Main content expansion. |
| Recipe Unlocks | New known combinations appear as ghost recipes. | Makes future crafting less guessy and teaches formulas. |
| NPC Unlocks | New quest-givers arrive in town. | Adds context and new object categories. |
| Workshop Upgrades | Queue size, speed, inventory, auto-sort, recipe book, offline cap. | Makes idle progression feel satisfying. |
| Museum Badges | First 10 elements, first molecule, first salt, first alloy, first gas, first metal family. | Long-term completion and learning reinforcement. |

## Element Unlock System

Elements enter the game through five channels. This avoids the feeling that everything is merely purchased, while also keeping the progression deterministic and understandable.

| Unlock Channel | Example | Design Rule |
|---|---|---|
| Quest Reward | Craft 3 Waters for the Baker -> unlock Sodium choice. | Used for story-critical learning paths. |
| Discovery Draft | Choose Sodium vs Nitrogen vs Iron. | Player agency without dead ends. |
| Gold Purchase | Buy extra Hydrogen/Oxygen supply licenses or common element packs. | For common elements and convenience, never rare curriculum gates. |
| NPC Access | Help the Miner with a pick -> mine opens Iron, Copper, and Zinc paths. | Objects unlock contexts that unlock elements. |
| Mastery Badge | Correctly craft and explain 5 compounds -> unlock Chlorine or Carbon family badge. | Rewards understanding, not just waiting. |

## Quest Appearance Rules

Only show a few quests at a time. The Quest Board should feel like a curated bulletin board, not a spreadsheet.

| Board Slot | Quest Type | Purpose |
|---|---|---|
| Slot 1 | Critical Path Quest | Advances the next element family or NPC. Always available. |
| Slot 2 | Production Quest | Bulk order for already-known recipes. Feeds idle loop. |
| Slot 3 | Curiosity Quest | Optional strange request that hints at a future material or element. |
| Slot 4 (later) | Mastery Quest | Asks for explanation, sorting, or property use. |
| Slot 5 (later) | Long Idle Contract | Large order to run overnight or over a school day. |

## Punishments

Punishments should be soft, reversible, and educational. This is a child-facing learning game; the goal is persistence, not anxiety.

| Punishment | Trigger | Effect | Teaching Purpose |
|---|---|---|---|
| Fizzle | Invalid recipe or impossible combination. | Returns most cards and reveals one hint. | Encourages hypothesis testing without harsh loss. |
| Inventory Pressure | Inventory is full when crafts finish. | Finished item waits in Output Tray; player must sell, deliver, or upgrade. | Teaches planning and opportunity cost. |
| Quest Expiry (optional later) | A timed optional quest is ignored. | Quest leaves board but returns later; no critical loss. | Adds light urgency for older players. |
| Overproduction | Player crafts too many low-value items. | Items can be sold at reduced value or donated to Museum for tiny XP. | Teaches resource management. |

## Other Gameplay Mechanics

### Inventory

Inventory is central because the player often crafts components that are not immediately needed. It should be visual, tactile, and sortable.

| Inventory Feature | Early Game | Upgrade Path |
|---|---|---|
| Slots | Start with 5, tutorial upgrades to 6. | Backpack upgrades to 8, 12, 20, then categorized shelves. |
| Stacks | Identical simple items stack up to 10. | Stack limit upgrades through crates and jars. |
| Categories | All in one tray at first. | Elements, molecules, materials, objects, quest items, surplus. |
| Output Tray | Completed crafts land here first. | Auto-sort assistant moves completed items to correct shelf. |
| Sell Bin | Drag surplus to market bin for Gold. | Bulk-sell rules and favorites prevent accidental selling. |
| Pinned Items | Player can pin quest-relevant items. | Protects important components from selling or auto-use. |

### Crafting Model

| Layer | Meaning | Examples |
|---|---|---|
| Element | A single element card from the periodic table. | H, O, C, Na, Cl, Fe, Cu. |
| Molecule / Compound | A formula made from elements; teach exact formula where reasonable. | H2, O2, H2O, CO2, NaCl, SiO2, CaCO3. |
| Material | A practical substance made from a compound, alloy, or simplified material model. | Glass, steel, salt, limestone, copper wire. |
| Component | A shaped part made from material. | Cup, lens, nail, wire coil, pick head. |
| Object | Quest deliverable built from components/materials. | Cup of water, mining pick, lamp, telescope, bread dough. |

### Recipe Philosophy

- Use accurate formulas when teaching atoms and molecules: H2O, CO2, NaCl, SiO2, CaCO3.
- Use simplified material recipes for complex real objects: "wood" may be treated as Biomass, a material unlocked from Carbon + Water + Sunlight token rather than a literal cellulose formula.
- Separate science notes from game recipes. A card can say: "Game recipe simplified. Real wood is mostly cellulose, lignin, water, and other organic compounds."
- Make complexity visible: every compound card shows formula, atom count, and a child-readable description.
- Do not require advanced stoichiometry early. Start with countable card formulas; introduce balancing and conservation later as mastery quests.

### Crafting Complexity and Slot Upgrades

| Concept | Definition | Example |
|---|---|---|
| Visible Slots | The number of cards placed on the Crafting Table. Starts at 3, upgrades to 4, and caps at 5. | H + H + O uses 3 visible slots and exactly fills the starter table. |
| Atom Complexity | The total number of atoms represented by the visible cards. | H2O has atom complexity 3. C6H12O6 has atom complexity 24. |
| Compression | A crafted compound occupies one visible card even if it contains many atoms. | H2 card uses 1 visible slot but complexity 2. |
| Recipe Planning | The player chooses whether to craft from raw elements or pre-combine components. | Glass Batch uses Silica + Soda Ash + Calcium Carbonate after those larger ideas are compressed into cards. |
| Workbench Upgrade | More visible slots are purchased with earned Gold, never with paid randomness. | Workbench Slot IV unlocks after Water; Workbench Slot V unlocks after the first field-kit branch. |
| Mastery Challenge | Advanced quests require fitting complex recipes inside the five-slot cap by pre-crafting components. | A capstone kit may need several finished objects, where each object hides its own material chain. |

### Workbench Slot Progression

| Upgrade State | Unlock Moment | Purpose |
|---|---|---|
| 3 slots | Start of game | Water fills the entire starter table, making H2O tactile and memorable. |
| 4 slots | Shop unlock after Sir Bubbleton Needs Water | Gives the first earned comfort upgrade without immediately requiring it. |
| 5 slots | Shop unlock after The First Field Kit | Prepares the player for five-card carbonate recipes in the glass chain. |

### Early Recipe Ladder

| Tier | Unlocks | Recipes / Objects | Learning Theme |
|---|---|---|---|
| Tutorial | H, O, C | H2, O2, H2O, CO2, Charcoal token | Atoms combine into small molecules. |
| Kitchen I | Na, Cl | NaCl, Salt Water, Bread Dough simplified | Elements can become everyday substances. |
| Forge I | Fe, C | Iron Ingot, Steel simplified, Nail, Hammer Head | Metals and alloys; game recipe vs real material note. |
| Garden I | N, P, K, Ca | Plant Food simplified, Limestone CaCO3, Chalk | Element families support life and soil. |
| Glass I | Si, Ca, Na | Silica SiO2, Glass simplified, Cup, Lens | Minerals to materials to objects. |
| Electric I | Cu, Zn, C | Copper Wire, Zinc Plate, Simple Battery simplified | Materials conduct and store energy. |
| Atmosphere | N, O, Ar, Ne, He | Air Mix, Balloon Gas, Noble Gas Lamp | Gases and element families. |
| Advanced | Li, Al, Ti, Ag, Au, W, rare earths | Battery Upgrade, Foil, Telescope Mount, Mirror, Magnet simplified | Modern materials and technology. |

## Player Movement / Board Navigation

The player does not move an avatar through a world in the MVP. Instead, the iPad screen is a living board with tappable zones. The camera may pan or zoom between zones later, but the prototype should remain mostly one screen.

- **Quest Board:** active quests, completed quest animations, new NPC arrival.
- **Crafting Table:** three to five slots, craft button, timer, queue, recipe ghost hints.
- **Periodic Table Vault:** locked/unlocked elements; tap an element for facts and available recipes.
- **Inventory Tray:** finished cards, pinned quest items, surplus, sell bin.
- **Upgrade Shop:** queue, speed, inventory, labels, hints, offline progress.
- **Museum:** badges, element families, formula gallery, mastery checks.

## Health / Failure

No health system in the MVP. The equivalent of health is attention and inventory pressure. Failure should be expressed as fizzle, waiting, or a hint, not damage.

## Player Conversation

NPC dialogue is short and functional. Every quest-giver has three lines: need, hint, and celebration. Later they can have optional lore and jokes.

| Line Type | Example |
|---|---|
| Need | "My training helmet is steaming! Could you craft me Water?" |
| Hint | "Water uses two Hydrogen and one Oxygen. Count them out." |
| Celebration | "Perfect! H2O saved the day. You did not just make a card - you made a molecule." |

## Saving

Autosave constantly. Use local storage first. For the family prototype, do not require account creation. Save: unlocked elements, inventory, active quests, timers, queue, upgrades, museum badges, and last opened time for offline progress.

## Gaining and Losing Abilities

Abilities are workshop capabilities: queue more crafts, inspect formulas, auto-sort inventory, pin quest items, unlock recipe ghosts, batch craft, and eventually run helper stations. The player should not lose abilities except in optional challenge modes.

## Currency

Gold is earned by quests and selling surplus. Discovery Tokens are earned by meaningful progress and cannot be bought with real money. Knowledge XP is earned by learning actions. The economy should be tuned so the child can always do something productive after 2-5 minutes.

## Level Design

### Generic Level Design

The game world is a single iPad board representing Vellum Vale. Instead of traditional levels, progression unlocks board zones and NPC quest families. The early board has Quest Board, Crafting Table, Periodic Table Vault, Inventory, and Upgrade Shop. Later, the town expands to Bakery, Forge, Mine, Garden, Glassworks, Tinker Shop, Observatory, and Museum wings.

### Specific Level / Zone Design

| Zone | Look / Purpose | Entry Requirement | Gained |
|---|---|---|---|
| Level 1: The Workshop Table | Warm wooden board, three glowing starter slots, simple craft queue. | Start of game. | Basic crafting, H/O/C, water quest, first workbench upgrade. |
| Level 2: Guild Quest Board | Parchment board with 2-3 visible quests and NPC portraits. | Complete tutorial water. | Multiple quests, prioritization. |
| Level 3: Periodic Table Vault | Stone-and-light periodic table; locked squares are fogged. | Start; expands after each Discovery Token. | Element unlocks, facts, family badges. |
| Level 4: Market Shelf | Coin tray, sell bin, merchant card packs replaced by deterministic supply crates. | Complete first production quest. | Sell surplus, buy common supplies/upgrades. |
| Level 5: Bakery | Cozy oven, flour sacks, water and salt quests. | Unlock Sodium/Chlorine path. | Kitchen chemistry, bulk orders. |
| Level 6: Mine and Forge | Ore carts, anvil, furnace glow. | Unlock Iron or help Miner. | Metals, alloys, tool chains. |
| Level 7: Garden | Plant beds, soil cards, weather/sun token. | Unlock Nitrogen or plant quest. | NPK, life chemistry, soil properties. |
| Level 8: Glassworks | Molten glass, lens table, sand/silica cards. | Unlock Silicon path. | Glass, lenses, telescope chain. |
| Level 9: Tinker Shop | Copper coils, batteries, tiny lamps. | Unlock Copper/Zinc. | Conductors, batteries, circuits. |
| Level 10: Observatory / Grand Orrery | Stars, planets, glowing element families. | Complete major museum wings. | Cosmic chemistry, capstone knowledge. |

## Music

| Field | Direction |
|---|---|
| Genre | Cozy fantasy chamber music with light marimba/glockenspiel, soft strings, gentle woodwinds, and occasional magical synth sparkles. |
| Layering | Base town loop is calm. Crafting adds a ticking/percolating layer. Quest completion adds a short flourish. Discovery Draft adds a soft magical arpeggio. Idle return adds a warm "welcome back" sting. |
| Mood | Curious, safe, clever, cozy, lightly magical. Never frantic in the first build. |
| Sample Track 1 | Potion Craft-style medieval shop ambience as a mood reference, not a direct style copy. |
| Sample Track 2 | Stacklands-style simple board-game whimsy. |
| Sample Track 3 | Light Zelda/Pokemon town energy: friendly loops that can repeat without fatigue. |

## Control Scheme

| Input | Action |
|---|---|
| Tap card | Select / inspect card. |
| Long-press card | Open formula, pronunciation, facts, and recipe uses. |
| Drag card | Move to crafting slot, inventory, quest, sell bin, or pin area. |
| Double-tap element in vault | Add one card to hand/workbench if available. |
| Pinch Periodic Table Vault | Zoom in/out on element families. |
| Swipe inventory tray | Scroll shelves. |
| Tap Craft | Start craft if recipe is valid. |
| Tap Queue | View upcoming crafts and reorder. |
| Drag finished item to quest | Deliver. |
| Tap Discovery Token | Open three-choice Discovery Draft. |
| Two-finger tap | Parent/help overlay with deeper explanation. |

# PART 5 | The Stop & Stare Factor

## Color Palette

Palette direction: cozy parchment fantasy plus bright science clarity. The game should be warm enough to feel like a board game, but clean enough that periodic-table symbols are never muddy.

| Role | Color Direction | Usage |
|---|---|---|
| Parchment Warmth | #F4E8C8 / warm cream | Board background, quest cards, tutorial panels. |
| Guild Blue | #315C9B / deep readable blue | Headings, vault outlines, water/knowledge UI. |
| Alchemy Gold | #F2B84B / soft gold | Rewards, Discovery Tokens, completion glows. |
| Element Green | #74B37A / gentle green | Unlocked states, safe success. |
| Muddlefog Violet | #6F5A8D / muted violet | Locked zones, mystery, antagonist fog. |
| Carbon Ink | #2D2D2D / dark charcoal | Text, card borders, icons. |

## Atmosphere

The atmosphere should feel like a fantasy school desk mixed with a tabletop RPG town. The player is not in a sterile lab; they are in a magical guild workshop where scientific symbols are treasured artifacts. The lighting is warm, the cards have subtle shadows, the vault glows when new elements unlock, and the quest board feels alive without being noisy.

## Sample Art Direction

- **Card style:** large readable element symbol, atomic number, name, tiny category color, and optional kid fact.
- **NPCs:** storybook fantasy silhouettes, simple expressions, non-threatening humor.
- **Crafting animation:** cards orbit briefly, formula appears, product card stamps into existence.
- **Periodic Table Vault:** locked cells are fogged; unlocked cells are crisp; family badges create color-coded regions.
- **Museum:** specimen drawers and glowing constellation lines between related elements/compounds.

# PART 6 | Do Not Quit

## Visualizing Success

The successful version of *Elemental Guild* is a game that a parent and child can open together on an iPad and immediately discuss. The child says, "I know that one," drags the element, explains the formula, laughs at the quest-giver, and comes back later because a craft finished. Over weeks, the child does not just recite the periodic table; they understand families, compounds, materials, and why matter matters. The finished prototype becomes a family artifact, a portfolio piece, and possibly the seed of a larger educational game.

## Visualizing Failure

The failure mode is over-scoping. The game tries to model all chemistry accurately, every recipe becomes a research project, the UI becomes too small, the child gets overwhelmed by too many quests, and the prototype stalls. The way to avoid this is to protect the first playable loop: one board, one quest board, one inventory, one crafting table, ten elements, twenty recipes, and delight. If that loop feels good, the game can grow for years.

## Scope

| Scope Variable | Draft Estimate / Constraint |
|---|---|
| MVP Duration | 2-4 weeks for a rough family prototype if data-driven and visually simple. |
| First Playable | One board screen, 10 elements, 12-20 recipes, 5 NPCs, 20 quests, basic timers, inventory, discovery draft. |
| Avoid in MVP | User accounts, multiplayer, 3D, monetization, full periodic table, complex chemistry engine, procedural quest generation, combat. |
| Prototype Art | Flat cards, simple NPC portraits, parchment UI, no animation beyond basic transitions. |
| Prototype Science | Elements 1-20 plus a few useful metals only; formulas curated by hand. |
| Total Game Cost | Family prototype can be mostly time cost. Commercialization would add art, audio, curriculum review, QA, accessibility, and privacy/legal review. |

## MVP Acceptance Criteria

- A new player can complete the Water quest in under 2 minutes without reading a manual.
- The player understands that H2O means two Hydrogen and one Oxygen by performing the action.
- The player can run at least one idle craft queue, close the app, and return to finished items.
- The Quest Board never shows more than three quests in the first 15 minutes.
- The Discovery Draft always offers three meaningful, non-dead-end choices.
- The inventory creates an interesting choice but does not block progress harshly.
- At least one parent-child conversation naturally happens from an element fact, NPC joke, or formula hint.

# PART 7 | Prototype Extension

## Extend the Primary Mechanic

| Extension Idea | Description | When to Add |
|---|---|---|
| Recipe Ghosts | Show translucent required cards for known recipes. | After first 10 recipes. |
| Formula Challenge Cards | Ask the player to build from formula only, no visual hint. | After confidence is established. |
| Element Families | Halogens, noble gases, alkali metals, metals, nonmetals. | After 15-20 elements. |
| Compound Compression Puzzles | Fit a recipe into the current table, then later inside the five-slot cap, by pre-crafting components. | Mid-game. |
| Bulk Contracts | Craft 20 waters, 10 salts, 5 glass cups over hours. | After queue upgrades. |
| Workshop Assistants | Automate common recipes or sorting. | After repeated production is fun once but tedious twice. |
| Property Quests | NPC asks for something conductive, transparent, salty, acidic, basic, light, strong, or gas-like. | When formulas alone become too easy. |
| Museum Explanations | Child records or selects short explanations of what they made. | Parent-child mode. |
| Telescope / Space Chain | Use glass, metal, and gases to build observatory equipment and discuss stars/elements. | Late game. |
| Safe Advanced Elements | Introduce uranium and radioactive elements as museum-only or late story elements with careful context. | Very late game, with parent note. |

## First 20 Quests

| # | Quest | Requirement | Reward / Unlock |
|---:|---|---|---|
| 1 | Sir Bubbleton Needs Water | Craft H2O on the three-slot starter table | 10 Gold, 1 Discovery Token, Workbench Slot IV shop unlock |
| 2 | Baker Needs 3 Waters | Craft 3x H2O | 15 Gold, Sodium/Nitrogen/Iron draft |
| 3 | Professor Wants Air | Craft O2 + N2 simplified Air Mix | Unlock Nitrogen path |
| 4 | Baker Needs Salt | Craft NaCl | Unlock Kitchen I badge |
| 5 | Miner Needs a Pick Head | Craft Iron Ingot | Unlock Mine |
| 6 | Blacksmith Needs Stronger Metal | Craft Steel simplified: Fe + C | Unlock Forge queue upgrade |
| 7 | Knight Needs Nails | Craft 5 Nails from Iron | Bulk crafting tutorial |
| 8 | Garden Needs Plant Food | Craft NPK simplified | Unlock Garden |
| 9 | Archivist Wants Chalk | Craft CaCO3 | Museum badge |
| 10 | Glassblower Needs Silica | Craft SiO2 after buying the fifth slot | Unlock Glassworks |
| 11 | Make a Glass Cup | Craft Glass simplified + Heat token | Cup object |
| 12 | Cup of Water | Combine Glass Cup + H2O | Object layering tutorial |
| 13 | Tinker Needs Copper Wire | Craft Copper Wire | Unlock Electric I |
| 14 | Light the Guild Lamp | Copper Wire + Glass + simple battery | Town visual upgrade |
| 15 | Mysterious Balloon | Helium or Air Mix | Gas facts |
| 16 | Rusty Shield Lesson | Fe + O -> Rust Fe2O3 simplified | Oxidation concept |
| 17 | Vinegar for Pickles | C2H4O2 simplified from carbon chain path | Acid taste/property quest |
| 18 | Baking Bubbles | CO2 for bread rise | Gas in food concept |
| 19 | Lens for Luma | Glass Lens | Observatory teaser |
| 20 | The First Orrery Gear | Metal + Glass + Knowledge badge | Unlock Grand Orrery silhouette |

# PART 8 | The Schedule

| Milestone | Description | Completion Target |
|---:|---|---|
| 1 | Data model: elements, cards, recipes, inventory items, quests, unlock nodes. | Day 1-2 |
| 2 | Static iPad board layout: quest board, crafting table, inventory, vault. | Day 3-4 |
| 3 | Drag-and-drop card crafting for Water and Salt. | Day 5-7 |
| 4 | Quest completion rewards: Gold, Discovery Token, element unlock. | Week 2 |
| 5 | Craft timers, queue, offline progress calculation. | Week 2 |
| 6 | Inventory upgrade, sell bin, pin item behavior. | Week 3 |
| 7 | Discovery Draft deterministic graph implementation. | Week 3 |
| 8 | First 20 quests, 20-30 recipes, 10-15 elements. | Week 4 |
| 9 | Sound, animations, kid-readable polish, parent help overlay. | Week 5 |
| 10 | Playtest with son: observe confusion, delight, return behavior, and recipe recall. | Week 6 |

## Playtest Script

1. Ask the child to open the game with no explanation. Can they find the Quest Board?
2. Watch the Water quest. Do they understand two Hydrogen plus one Oxygen?
3. After the first reward, ask which Discovery Draft option they want and why.
4. Ask them to explain what is inside the Water card after it is crafted.
5. Give them an inventory-full moment. Do they sell, deliver, or upgrade?
6. Close the app for 3 minutes and come back. Are they excited the craft finished?
7. After play, ask: "What element do you want to unlock next?" If they answer with curiosity, the loop works.

# Research Notes and Design Rationale

## Chemistry Learning Alignment

The game should align with the idea that children learn science by building and revising models. NGSS grade 3-5 practices explicitly emphasize developing and using models, while middle-school matter standards state that substances are made from atoms that combine in various ways, molecules can range from two to thousands of atoms, and pure substances have characteristic properties. This strongly supports a card/model approach: a molecule card is a child-manipulable model of unseen particles.

The ACS describes the periodic table as organizing all discovered chemical elements by increasing atomic number and helping scientists see trends such as electronegativity, ionization energy, and atomic radius. The game should not dump those trends early, but the Periodic Table Vault should be built to support them later. The RSC interactive periodic table provides a useful inspiration for showing views such as groups, blocks, periods, states, isotopes, electron configuration, density, ionization energy, and supply risk. For a child game, these become progressive overlays, not first-session content.

## Market / Design Research Takeaways

- Stacklands proves that a whole game can live on a card board, with selling, card packs, ideas, quests, and short playtime. Elemental Guild should borrow board readability and card tactility, not survival stress.
- Potion Craft proves that requests from customers can justify a crafting system and make experimentation feel socially meaningful. Elemental Guild should make the guild town depend on the player.
- Forager proves that idle, crafting, gathering, upgrading, and expansion can coexist with active play. Elemental Guild should keep early sessions active while idle timers produce return motivation.
- Little Alchemy 2 proves that discovery libraries are intrinsically motivating. Elemental Guild should add stronger educational grounding and quest context.
- Opus Magnum proves that assembly and optimization can become advanced puzzle depth. Elemental Guild can use this later for slot-limited compression and workshop optimization.

## Child-Safe Gacha Rationale

The Discovery Draft should not be monetized, should not hide odds, and should not sell paid random rewards. Regulators and researchers have scrutinized paid loot-box mechanics, especially around children, odds disclosure, and virtual-currency confusion. Therefore, this design uses earned tokens, face-up choices, deterministic progression, no real-money purchases, and no time-limited pressure.

## Research Sources Consulted

| ID | Source | Design Use |
|---|---|---|
| R1 | Uploaded Game Design Bible PDF template | Structural outline: inspiration, trinity hook, core loop, overview, plot, characters, rewards, mechanics, level design, music, controls, art, scope, schedule. |
| R2 | Stacklands on Steam - https://store.steampowered.com/app/1948280/Stacklands/ | Card board, stacking, selling, packs, ideas, quests, constrained play scope. |
| R3 | Potion Craft on Steam - https://store.steampowered.com/app/1210320/Potion_Craft_Alchemist_Simulator/ | Fantasy alchemy shop, customers, tactile ingredients, whole-town reliance. |
| R4 | Forager on Steam - https://store.steampowered.com/app/751780/Forager/ | Idle game that remains actively playable; explore/craft/gather/manage/expand. |
| R5 | Little Alchemy 2 - https://littlealchemy2.com/ and app store descriptions | Combination discovery, library/encyclopedia motivation, accessible mixing fantasy. |
| R6 | Opus Magnum on Steam - https://store.steampowered.com/app/558990/Opus_Magnum/ | Open-ended alchemical assembly and optimization as advanced inspiration. |
| R7 | American Chemical Society Periodic Table - https://www.acs.org/education/whatischemistry/periodictable.html | Periodic table organization, 118 known elements, properties/trends framing. |
| R8 | Royal Society of Chemistry Interactive Periodic Table - https://periodic-table.rsc.org/ | Element data views and progressive overlays. |
| R9 | NGSS 5.Structure and Properties of Matter - https://www.nextgenscience.org/topic-arrangement/5structure-and-properties-matter | Modeling and using mathematics/computational thinking in elementary matter learning. |
| R10 | NGSS MS-PS1 Matter and its Interactions - https://www.nextgenscience.org/dci-arrangement/ms-ps1-matter-and-its-interactions | Atoms combine into molecules; pure substances have characteristic properties; reactions regroup atoms. |
| R11 | ACS Periodic Table Educational Resources Ages 6-11 - https://www.acs.org/education/whatischemistry/periodictable/educational-resources-for-ages-6-11.html | Hands-on activities, games, and everyday chemistry for young children. |
| R12 | FTC Genshin Impact / loot boxes settlement page - https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental | Rationale for no paid gacha, no hidden odds, and no child-targeted monetized randomness. |
