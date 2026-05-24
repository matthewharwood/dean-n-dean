import * as z from "zod";

import { ALCHEMY_RECIPES, EXPECTED_MINIMUM_ALCHEMY_RECIPES } from "./alchemy-recipes";

export const AlchemyRecipeKidInfoSourceIdSchema = z.string().regex(/^source:[a-z0-9-]+$/);
export type AlchemyRecipeKidInfoSourceId = z.infer<typeof AlchemyRecipeKidInfoSourceIdSchema>;

export const AlchemyRecipeKidInfoSourceSchema = z.object({
  id: AlchemyRecipeKidInfoSourceIdSchema,
  label: z.string().min(1),
  url: z.url(),
});
export type AlchemyRecipeKidInfoSource = z.infer<typeof AlchemyRecipeKidInfoSourceSchema>;

export const AlchemyRecipeKidInfoSchema = z.object({
  recipeId: z.string().regex(/^alchemy:[a-z0-9-]+$/),
  title: z.string().min(1),
  sentences: z.array(z.string().min(1)).min(3).max(4),
  sourceIds: z.array(AlchemyRecipeKidInfoSourceIdSchema).min(1),
});
export type AlchemyRecipeKidInfo = z.infer<typeof AlchemyRecipeKidInfoSchema>;

type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

const source = (id: string, label: string, url: string) => ({ id, label, url }) as const;

export const ALCHEMY_RECIPE_KID_INFO_SOURCES = [
  source("source:water", "Water - Wikipedia", "https://en.wikipedia.org/wiki/Water"),
  source(
    "source:sodium-chloride",
    "Sodium chloride - Wikipedia",
    "https://en.wikipedia.org/wiki/Sodium_chloride",
  ),
  source("source:charcoal", "Charcoal - Wikipedia", "https://en.wikipedia.org/wiki/Charcoal"),
  source("source:ash", "Ash - Wikipedia", "https://en.wikipedia.org/wiki/Ash"),
  source("source:iron", "Iron - Wikipedia", "https://en.wikipedia.org/wiki/Iron"),
  source("source:copper", "Copper - Wikipedia", "https://en.wikipedia.org/wiki/Copper"),
  source(
    "source:solution",
    "Solution - Wikipedia",
    "https://en.wikipedia.org/wiki/Solution_(chemistry)",
  ),
  source("source:clay", "Clay - Wikipedia", "https://en.wikipedia.org/wiki/Clay"),
  source(
    "source:ceramics",
    "Traditional ceramics - Britannica",
    "https://www.britannica.com/technology/traditional-ceramics",
  ),
  source("source:sand", "Sand - Wikipedia", "https://en.wikipedia.org/wiki/Sand"),
  source("source:cork", "Cork - Wikipedia", "https://en.wikipedia.org/wiki/Cork_(material)"),
  source("source:linen", "Linen - Wikipedia", "https://en.wikipedia.org/wiki/Linen"),
  source("source:beeswax", "Beeswax - Wikipedia", "https://en.wikipedia.org/wiki/Beeswax"),
  source(
    "source:silica",
    "Silicon dioxide - Wikipedia",
    "https://en.wikipedia.org/wiki/Silicon_dioxide",
  ),
  source(
    "source:sodium-carbonate",
    "Sodium carbonate - Wikipedia",
    "https://en.wikipedia.org/wiki/Sodium_carbonate",
  ),
  source(
    "source:calcium-carbonate",
    "Calcium carbonate - Wikipedia",
    "https://en.wikipedia.org/wiki/Calcium_carbonate",
  ),
  source("source:glass", "Glass - Britannica", "https://www.britannica.com/technology/glass"),
  source(
    "source:calcium-oxide",
    "Calcium oxide - Encyclopedia.com",
    "https://www.encyclopedia.com/science-and-technology/chemistry/compounds-and-elements/calcium-oxide",
  ),
  source(
    "source:calcium-hydroxide",
    "Calcium hydroxide - Wikipedia",
    "https://en.wikipedia.org/wiki/Calcium_hydroxide",
  ),
  source(
    "source:carbon-dioxide",
    "Carbon dioxide - Wikipedia",
    "https://en.wikipedia.org/wiki/Carbon_dioxide",
  ),
  source(
    "source:carbonic-acid",
    "Carbonic acid - Wikipedia",
    "https://en.wikipedia.org/wiki/Carbonic_acid",
  ),
  source(
    "source:distillation",
    "Distillation - Wikipedia",
    "https://en.wikipedia.org/wiki/Distillation",
  ),
  source("source:brine", "Brine - Wikipedia", "https://en.wikipedia.org/wiki/Brine"),
  source(
    "source:potassium-chloride",
    "Potassium chloride - Wikipedia",
    "https://en.wikipedia.org/wiki/Potassium_chloride",
  ),
  source("source:ink", "Ink - Wikipedia", "https://en.wikipedia.org/wiki/Ink"),
  source(
    "source:paper",
    "Papermaking - Britannica",
    "https://www.britannica.com/technology/papermaking/Paper-properties-and-uses",
  ),
  source("source:parchment", "Parchment - Wikipedia", "https://en.wikipedia.org/wiki/Parchment"),
  source("source:quill", "Quill - Wikipedia", "https://en.wikipedia.org/wiki/Quill"),
  source("source:alloy", "Alloy - Wikipedia", "https://en.wikipedia.org/wiki/Alloy"),
  source(
    "source:bronze-brass",
    "Bronze and brass - Britannica",
    "https://www.britannica.com/topic/metalwork/Bronze-and-brass",
  ),
  source("source:steel", "Steel - Wikipedia", "https://en.wikipedia.org/wiki/Steel"),
  source("source:vinegar", "Vinegar - Wikipedia", "https://en.wikipedia.org/wiki/Vinegar"),
  source(
    "source:baking-soda",
    "Vinegar and baking soda - ACS Middle School Chemistry",
    "https://www.acs.org/middleschoolchemistry/simulations/chapter6/lesson2.html",
  ),
  source(
    "source:verdigris",
    "Verdigris copper - Royal Society of Chemistry",
    "https://edu.rsc.org/resources/verdigris-copper/1952.article",
  ),
  source("source:pigment", "Pigment - Wikipedia", "https://en.wikipedia.org/wiki/Pigment"),
  source(
    "source:industrial-glass",
    "Industrial glass - Britannica",
    "https://www.britannica.com/science/industrial-glass",
  ),
  source("source:leather", "Leather - Wikipedia", "https://en.wikipedia.org/wiki/Leather"),
  source("source:salve", "Salve - Wikipedia", "https://en.wikipedia.org/wiki/Salve"),
  source("source:quartz", "Quartz - Wikipedia", "https://en.wikipedia.org/wiki/Quartz"),
  source("source:lens", "Lens - Wikipedia", "https://en.wikipedia.org/wiki/Lens"),
  source("source:silver", "Silver - Wikipedia", "https://en.wikipedia.org/wiki/Silver"),
  source(
    "source:gold",
    "Gold - Britannica",
    "https://www.britannica.com/science/gold-chemical-element/Properties-occurrences-and-uses",
  ),
  source(
    "source:conductor",
    "Electrical conductor - Wikipedia",
    "https://en.wikipedia.org/wiki/Electrical_conductor",
  ),
  source("source:bone-ash", "Bone ash - Wikipedia", "https://en.wikipedia.org/wiki/Bone_ash"),
  source("source:phosphate", "Phosphate - Wikipedia", "https://en.wikipedia.org/wiki/Phosphate"),
  source("source:fertilizer", "Fertilizer - Wikipedia", "https://en.wikipedia.org/wiki/Fertilizer"),
  source(
    "source:fermentation",
    "Fermentation - Wikipedia",
    "https://en.wikipedia.org/wiki/Fermentation",
  ),
  source("source:pickling", "Pickling - Wikipedia", "https://en.wikipedia.org/wiki/Pickling"),
  source(
    "source:tempering",
    "Tempering - Britannica",
    "https://www.britannica.com/technology/tempering-metallurgy",
  ),
  source(
    "source:enamel",
    "Vitreous enamel - Wikipedia",
    "https://en.wikipedia.org/wiki/Vitreous_enamel",
  ),
  source("source:mirror", "Mirror - Wikipedia", "https://en.wikipedia.org/wiki/Mirror"),
  source("source:periscope", "Periscope - Wikipedia", "https://en.wikipedia.org/wiki/Periscope"),
  source("source:heliograph", "Heliograph - Wikipedia", "https://en.wikipedia.org/wiki/Heliograph"),
] as const satisfies readonly DeepReadonly<AlchemyRecipeKidInfoSource>[];

const kidInfo = (
  recipeId: string,
  title: string,
  sentences: readonly [string, string, string, ...string[]],
  sourceIds: readonly string[],
) => ({ recipeId, title, sentences, sourceIds }) as const;

export const ALCHEMY_RECIPE_KID_INFO = [
  kidInfo(
    "alchemy:water",
    "Water",
    [
      "Water is the everyday molecule H2O, made from two hydrogen atoms and one oxygen atom.",
      "It is like the town's tiny delivery river: it carries heat, flavor, minerals, and life from place to place.",
      "In the guild, Water matters because almost every branch eventually needs something wet, clean, dissolved, cooled, or grown.",
    ],
    ["source:water"],
  ),
  kidInfo(
    "alchemy:salt",
    "Salt",
    [
      "Salt is sodium chloride, a crystal made when sodium and chlorine hold together like puzzle pieces.",
      "It matters because tiny salt pieces can spread through water, flavor food, and help preserve supplies.",
      "In the game, Salt is your first reminder that two scary-sounding elements can become something familiar on the kitchen table.",
    ],
    ["source:sodium-chloride"],
  ),
  kidInfo(
    "alchemy:charcoal",
    "Charcoal",
    [
      "Charcoal is wood changed by heat until much of what remains is carbon-rich fuel.",
      "Think of it as wood that has been turned into a quiet black battery for fire.",
      "It matters because the forge and glassworks need strong, steady heat before they can wake up.",
    ],
    ["source:charcoal"],
  ),
  kidInfo(
    "alchemy:ash",
    "Ash",
    [
      "Ash is the powdery mineral leftovers after plant material burns.",
      "It is like the footprint a fire leaves behind after the wood is gone.",
      "In recipes, Ash matters because it can stand for useful minerals and powdery additives instead of just trash.",
    ],
    ["source:ash"],
  ),
  kidInfo(
    "alchemy:iron-ingot",
    "Iron Ingot",
    [
      "Iron is a strong metal with the symbol Fe.",
      "An ingot is a neat bar, like turning messy metal into a stackable building brick.",
      "It matters because iron starts the blacksmith path: nails, chains, steel, shields, and repair kits all grow from it.",
    ],
    ["source:iron"],
  ),
  kidInfo(
    "alchemy:copper-ingot",
    "Copper Ingot",
    [
      "Copper is a reddish metal with the symbol Cu.",
      "It bends and carries electricity well, so it is like a road that energy can travel on.",
      "In the guild, Copper starts wires, rivets, charms, pigments, and later circuit-like rune parts.",
    ],
    ["source:copper", "source:conductor"],
  ),
  kidInfo(
    "alchemy:herbal-mash",
    "Herbal Mash",
    [
      "Herbal Mash is a mixture of herbs and water ground together.",
      "Water acts like a helper that pulls smells, colors, and plant bits into one soft paste.",
      "It matters because the player learns that not every craft is a new molecule; some are useful mixtures.",
    ],
    ["source:solution"],
  ),
  kidInfo(
    "alchemy:clay-slip",
    "Clay Slip",
    [
      "Clay Slip is clay mixed with enough water to flow like thick paint.",
      "Potters use wet clay mixtures because water lets tiny clay particles slide and shape together.",
      "In the game, Clay Slip starts the container chain, so mud becomes cups, vials, and bowls.",
    ],
    ["source:clay", "source:ceramics"],
  ),
  kidInfo(
    "alchemy:sand-powder",
    "Sand Powder",
    [
      "Sand Powder is sand ground into smaller pieces.",
      "Grinding changes the size of the pieces, not what the sand is made of.",
      "That matters because small particles mix and melt more evenly, which helps the glass chain make sense.",
    ],
    ["source:sand", "source:glass"],
  ),
  kidInfo(
    "alchemy:cork-stopper",
    "Cork Stopper",
    [
      "Cork is a light, springy plant material that can squeeze into a bottle neck.",
      "A stopper is like a tiny door that keeps liquid from escaping.",
      "It matters because one small shaped part can turn a plain flask into a useful sealed container.",
    ],
    ["source:cork"],
  ),
  kidInfo(
    "alchemy:linen-thread",
    "Linen Thread",
    [
      "Linen comes from plant fibers, and thread is made by twisting fibers into a stronger line.",
      "It is like many tiny strands agreeing to pull together.",
      "In the guild, thread matters because soft materials can hold, tie, label, stitch, and reinforce harder materials.",
    ],
    ["source:linen"],
  ),
  kidInfo(
    "alchemy:healing-tea",
    "Healing Tea",
    [
      "Healing Tea is a gentle mixture of herbal mash, water, and honey in the game world.",
      "Real tea and syrups work because warm water can carry flavors and plant materials into a drink.",
      "It matters because it is the first cozy potion: a recipe that feels useful, kind, and easy to understand.",
    ],
    ["source:solution", "source:water"],
  ),
  kidInfo(
    "alchemy:wax-seal",
    "Wax Seal",
    [
      "Beeswax softens when warm and hardens again when cool.",
      "A wax seal works like a little golden lock made from a material that changes shape.",
      "It matters because containers, scrolls, and kits need closures so their contents feel protected.",
    ],
    ["source:beeswax"],
  ),
  kidInfo(
    "alchemy:sugar-syrup",
    "Sugar Syrup",
    [
      "Sugar Syrup is a sweet material dissolved into water.",
      "A solution is like a crowd of tiny pieces spreading out until every sip tastes the same.",
      "It matters because syrups become potion bases, fermentation food, and a tasty way to teach dissolving.",
    ],
    ["source:solution"],
  ),
  kidInfo(
    "alchemy:silica",
    "Silica",
    [
      "Silica is silicon dioxide, a material found in quartz and much sand.",
      "It is the main skeleton of common glass, like the invisible frame inside a window.",
      "In the game, Silica matters because it starts the path from grains of sand to flasks, lenses, and mirrors.",
    ],
    ["source:silica", "source:glass"],
  ),
  kidInfo(
    "alchemy:soda-ash",
    "Soda Ash",
    [
      "Soda Ash is sodium carbonate, a useful carbonate material.",
      "Glassmakers use it because it helps silica melt more easily, like giving stubborn sand a shortcut.",
      "The game compresses the formula so the recipe stays playable, but the card still points to real Na2CO3.",
    ],
    ["source:sodium-carbonate", "source:glass"],
  ),
  kidInfo(
    "alchemy:calcium-carbonate",
    "Calcium Carbonate",
    [
      "Calcium Carbonate is found in limestone, chalk, shells, and many rocks.",
      "It is like nature's white mineral building block.",
      "It matters because glass, ceramics, lime, and garden minerals all use calcium ideas later.",
    ],
    ["source:calcium-carbonate"],
  ),
  kidInfo(
    "alchemy:glass-batch",
    "Glass Batch",
    [
      "Glass Batch is a measured mix of silica, soda ash, and calcium carbonate.",
      "Each ingredient has a job: silica builds the glass, soda helps it melt, and calcium helps it stay tough in water.",
      "This recipe matters because it teaches that materials can be teams, not just single substances.",
    ],
    ["source:glass", "source:sodium-carbonate"],
  ),
  kidInfo(
    "alchemy:glass",
    "Glass",
    [
      "Glass is a hard, see-through material made by heating a glass batch until it melts and then cools without big crystals.",
      "It is like frozen liquid rock that lets light walk through.",
      "Glass matters because it unlocks flasks, tubes, beads, lenses, mirrors, and the whole observatory feeling.",
    ],
    ["source:glass"],
  ),
  kidInfo(
    "alchemy:glass-tube",
    "Glass Tube",
    [
      "A Glass Tube is glass shaped into a hollow tunnel.",
      "The material is the same, but the shape changes what it can do, like turning flat paper into a straw.",
      "It matters because tool parts often come from shaping a known material into a more useful geometry.",
    ],
    ["source:glass"],
  ),
  kidInfo(
    "alchemy:glass-flask",
    "Glass Flask",
    [
      "A Glass Flask is a shaped glass container.",
      "Glass is useful for bottles because it is hard, smooth, and does not soak up water like cloth or wood.",
      "In the guild, the flask is the first container that feels like real alchemy gear.",
    ],
    ["source:glass"],
  ),
  kidInfo(
    "alchemy:sealed-flask",
    "Sealed Flask",
    [
      "A Sealed Flask is a glass flask plus a stopper.",
      "The stopper turns an open container into something that can travel without spilling.",
      "It matters because assembly recipes teach that two simple parts can create a new job.",
    ],
    ["source:glass", "source:cork"],
  ),
  kidInfo(
    "alchemy:water-flask",
    "Water Flask",
    [
      "A Water Flask is a sealed container filled with Water.",
      "It is the first big object that carries a smaller recipe inside it, like a backpack carrying a lunch.",
      "It matters because the player can see Water, Cork, and Glass become one useful quest item.",
    ],
    ["source:water", "source:glass"],
  ),
  kidInfo(
    "alchemy:clay-vial",
    "Clay Vial",
    [
      "A Clay Vial is a small container made from clay material that has been hardened.",
      "Ceramics matter because heat can turn soft, shapeable clay into something stronger.",
      "In the game, it gives the player a second container path that does not depend only on glass.",
    ],
    ["source:clay", "source:ceramics"],
  ),
  kidInfo(
    "alchemy:quicklime",
    "Quicklime",
    [
      "Quicklime is calcium oxide, a very reactive lime material.",
      "Real quicklime is not a kid experiment, but it is important in construction, glass, and chemistry history.",
      "In the game, it is a powerful mineral card that teaches that heating rocks can make new materials.",
    ],
    ["source:calcium-oxide"],
  ),
  kidInfo(
    "alchemy:slaked-lime",
    "Slaked Lime",
    [
      "Slaked Lime is calcium hydroxide, made when quicklime reacts with water.",
      "It is like quicklime putting on a water coat and becoming a different useful material.",
      "It matters because lime connects minerals, ceramics, cleaning ideas, and old building materials.",
    ],
    ["source:calcium-hydroxide", "source:calcium-oxide"],
  ),
  kidInfo(
    "alchemy:carbon-dioxide",
    "Carbon Dioxide",
    [
      "Carbon Dioxide is the gas CO2, made from one carbon atom and two oxygen atoms.",
      "It is invisible, but bubbles can show it is there, like a secret message from a reaction.",
      "In the guild, CO2 matters for fizz, plant ideas, smoke effects, and learning that gases are still matter.",
    ],
    ["source:carbon-dioxide"],
  ),
  kidInfo(
    "alchemy:carbonic-water",
    "Carbonic Water",
    [
      "Carbonic Water is water with carbon dioxide dissolved into it.",
      "It is the idea behind fizzy drinks: gas hiding in liquid until bubbles escape.",
      "This matters because it teaches that one card can hold another state of matter inside it.",
    ],
    ["source:carbonic-acid", "source:carbon-dioxide"],
  ),
  kidInfo(
    "alchemy:distilled-water",
    "Distilled Water",
    [
      "Distilled Water is water that has been evaporated and condensed to leave many dissolved things behind.",
      "It is like making water take a clean cloud trip and come back as drops.",
      "In recipes, it matters because cleaner water is a better potion base and a good purification lesson.",
    ],
    ["source:distillation", "source:water"],
  ),
  kidInfo(
    "alchemy:brine",
    "Brine",
    [
      "Brine is salty water.",
      "When salt dissolves, the water carries the salt pieces everywhere like a tiny delivery team.",
      "It matters because brine leads to crystals, preservation, pickles, and salt-chain mastery.",
    ],
    ["source:brine", "source:sodium-chloride"],
  ),
  kidInfo(
    "alchemy:sea-salt-crystals",
    "Sea Salt Crystals",
    [
      "Sea Salt Crystals form when salty water loses water and leaves salt behind.",
      "It is like the water walks away and the salt builds little crystal castles.",
      "This matters because evaporation and crystallization make invisible dissolved material visible again.",
    ],
    ["source:brine", "source:sodium-chloride"],
  ),
  kidInfo(
    "alchemy:potassium-salt",
    "Potassium Salt",
    [
      "Potassium Salt is modeled after potassium chloride, a salt made with potassium and chlorine.",
      "Potassium is important for living things, so this card points toward the garden path.",
      "It matters because salts are not only for food; some become plant and mineral helpers.",
    ],
    ["source:potassium-chloride", "source:fertilizer"],
  ),
  kidInfo(
    "alchemy:ceramic-clay",
    "Ceramic Clay",
    [
      "Ceramic Clay is a clay mixture with mineral helpers added.",
      "A ceramic recipe is like a dough recipe for rocks: the ingredients change how it shapes and fires.",
      "It matters because the player learns that containers can be engineered, not just found.",
    ],
    ["source:clay", "source:ceramics"],
  ),
  kidInfo(
    "alchemy:ceramic-bowl",
    "Ceramic Bowl",
    [
      "A Ceramic Bowl is clay material fired into a hard container.",
      "Heat helps the soft shape become a keeper of soup, powder, or potion parts.",
      "It matters because it turns an earthy material chain into something the town can actually use.",
    ],
    ["source:ceramics"],
  ),
  kidInfo(
    "alchemy:wax-sealed-vial",
    "Wax-Sealed Vial",
    [
      "A Wax-Sealed Vial is a clay vial closed with wax.",
      "The wax works like a soft lid that hardens into place.",
      "It matters because sealed containers make powders, gases, and special effects feel stored instead of loose.",
    ],
    ["source:beeswax", "source:ceramics"],
  ),
  kidInfo(
    "alchemy:copper-wire",
    "Copper Wire",
    [
      "Copper Wire is copper stretched into a long thin shape.",
      "Copper can carry electricity well, so the wire is like a road for energy.",
      "It matters because this tiny part unlocks charms, circuits, threads, and artificer tools.",
    ],
    ["source:copper", "source:conductor"],
  ),
  kidInfo(
    "alchemy:glass-bead",
    "Glass Bead",
    [
      "A Glass Bead is a small shaped piece of glass.",
      "The same glass can be a bottle, a tube, or a bead depending on the shape.",
      "It matters because repeated little parts can become decorations, charms, and circuit-like pieces.",
    ],
    ["source:glass"],
  ),
  kidInfo(
    "alchemy:empty-potion-bottle",
    "Empty Potion Bottle",
    [
      "An Empty Potion Bottle is a glass flask prepared with a seal.",
      "It is empty on purpose, like a clean page waiting for a story.",
      "It matters because a good container turns a messy liquid into something safe to carry and label.",
    ],
    ["source:glass", "source:beeswax"],
  ),
  kidInfo(
    "alchemy:simple-healing-potion",
    "Simple Healing Potion",
    [
      "A Simple Healing Potion is a fantasy blend of tea, clean water, and a bottle.",
      "The real science idea is formulation: choosing the right carrier, ingredients, and container.",
      "It matters because this is where separate workshop branches begin to feel like one helpful product.",
    ],
    ["source:solution", "source:distillation"],
  ),
  kidInfo(
    "alchemy:fizzy-tonic",
    "Fizzy Tonic",
    [
      "A Fizzy Tonic is a sweet drink-like mixture with carbon dioxide hiding in the water.",
      "The bubbles are gas escaping, like tiny balloons racing to the surface.",
      "It matters because it makes states of matter feel playful instead of abstract.",
    ],
    ["source:carbon-dioxide", "source:solution"],
  ),
  kidInfo(
    "alchemy:ranger-field-flask",
    "Ranger Field Flask",
    [
      "A Ranger Field Flask is a water flask reinforced for travel.",
      "Thread and wax act like straps and weatherproofing for the bottle.",
      "It matters because upgrading gear shows that chemistry is also about making useful things last.",
    ],
    ["source:linen", "source:beeswax"],
  ),
  kidInfo(
    "alchemy:cleansing-salt",
    "Cleansing Salt",
    [
      "Cleansing Salt is a game mixture of salt crystals and slaked lime.",
      "It is a fantasy-safe way to talk about mineral materials that can change water or surfaces.",
      "It matters because cleric recipes turn chemistry into care, cleaning, and protection.",
    ],
    ["source:sodium-chloride", "source:calcium-hydroxide"],
  ),
  kidInfo(
    "alchemy:ink-base",
    "Ink Base",
    [
      "Ink Base is dark particles, water, and a sticky binder mixed together.",
      "It is like making paint that knows how to write.",
      "It matters because writing materials need both color and something that helps the color stay on the page.",
    ],
    ["source:ink", "source:charcoal"],
  ),
  kidInfo(
    "alchemy:black-ink",
    "Black Ink",
    [
      "Black Ink is the finished dark writing liquid for scrolls and labels.",
      "Real inks can use pigments, liquids, and binders, and some old inks used metal-containing ingredients.",
      "It matters because the guild can finally record recipes instead of only remembering them.",
    ],
    ["source:ink", "source:pigment"],
  ),
  kidInfo(
    "alchemy:scroll-paper",
    "Scroll Paper",
    [
      "Scroll Paper is a thin writing surface made from fibers in the game model.",
      "Paper strength comes from many fibers holding together like a woven mat.",
      "It matters because recipes can become records, labels, maps, and quests once the town has a surface to write on.",
    ],
    ["source:paper", "source:linen"],
  ),
  kidInfo(
    "alchemy:sealed-scroll",
    "Sealed Scroll",
    [
      "A Sealed Scroll combines paper, ink, and a wax seal.",
      "It is like a message wearing a raincoat and a badge.",
      "It matters because information becomes an object the player can craft, carry, and deliver.",
    ],
    ["source:paper", "source:ink", "source:beeswax"],
  ),
  kidInfo(
    "alchemy:smoke-puff",
    "Smoke Puff",
    [
      "Smoke Puff is a fantasy-safe gas effect stored in a container.",
      "It uses the idea that gases are matter even when they are hard to hold.",
      "It matters because the player learns why sealed vials and gas cards belong in the same puzzle.",
    ],
    ["source:carbon-dioxide", "source:ash"],
  ),
  kidInfo(
    "alchemy:iron-nail",
    "Iron Nail",
    [
      "An Iron Nail is iron shaped into a fastener.",
      "A nail is a tiny metal tooth that helps pieces stay together.",
      "It matters because strong objects often depend on small, boring-looking parts doing important jobs.",
    ],
    ["source:iron"],
  ),
  kidInfo(
    "alchemy:copper-charm",
    "Copper Charm",
    [
      "A Copper Charm combines copper wire with a glass bead.",
      "It is partly decoration and partly a reminder that copper can carry energy.",
      "It matters because the charm becomes a bridge between pretty objects and useful material properties.",
    ],
    ["source:copper", "source:glass"],
  ),
  kidInfo(
    "alchemy:tin-ingot",
    "Tin Ingot",
    [
      "Tin is a metal with the symbol Sn.",
      "On its own it is soft, but with copper it helps make bronze.",
      "It matters because the player learns that some elements become more exciting when they join a team.",
    ],
    ["source:bronze-brass"],
  ),
  kidInfo(
    "alchemy:zinc-ingot",
    "Zinc Ingot",
    [
      "Zinc is a metal that can pair with copper to make brass.",
      "It is like a color and strength modifier for the metal path.",
      "It matters because the forge starts teaching alloys: mixtures of metals with new properties.",
    ],
    ["source:bronze-brass"],
  ),
  kidInfo(
    "alchemy:bronze-ingot",
    "Bronze Ingot",
    [
      "Bronze is an alloy made from copper and tin.",
      "An alloy is like a metal recipe where the finished team can act differently from each member alone.",
      "Bronze matters because it has been used for tools, art, and gear for a very long time.",
    ],
    ["source:bronze-brass", "source:alloy"],
  ),
  kidInfo(
    "alchemy:brass-ingot",
    "Brass Ingot",
    [
      "Brass is an alloy made from copper and zinc.",
      "It often looks golden, which makes it useful for pretty hardware and musical-looking guild pieces.",
      "It matters because the player sees that changing one partner metal changes the final material.",
    ],
    ["source:bronze-brass", "source:alloy"],
  ),
  kidInfo(
    "alchemy:steel-ingot",
    "Steel Ingot",
    [
      "Steel is mostly iron with a small amount of carbon added.",
      "That little carbon acts like a secret spice that can make iron much more useful.",
      "It matters because steel opens stronger needles, arrowheads, shields, and late-game tools.",
    ],
    ["source:steel", "source:iron"],
  ),
  kidInfo(
    "alchemy:bronze-buckle",
    "Bronze Buckle",
    [
      "A Bronze Buckle is an alloy bar shaped into useful hardware.",
      "Hardware is the small stuff that lets straps, kits, and gear actually work.",
      "It matters because the forge path starts turning materials into parts the player recognizes.",
    ],
    ["source:bronze-brass"],
  ),
  kidInfo(
    "alchemy:steel-needle",
    "Steel Needle",
    [
      "A Steel Needle is steel shaped into a thin point.",
      "Steel can hold a sharper, tougher shape than soft iron, like a pencil point that does not crumble.",
      "It matters because precise tools are needed for sewing, writing tools, and repair kits.",
    ],
    ["source:steel"],
  ),
  kidInfo(
    "alchemy:copper-rivet",
    "Copper Rivet",
    [
      "A Copper Rivet is a small fastener made from copper.",
      "Rivets hold pieces together like tiny metal buttons.",
      "It matters because soft, shapeable metals are excellent for fastening gear without needing glue.",
    ],
    ["source:copper"],
  ),
  kidInfo(
    "alchemy:iron-chain-link",
    "Iron Chain Link",
    [
      "An Iron Chain Link is one loop in a bigger flexible chain.",
      "One link is simple, but many links together can bend and still stay strong.",
      "It matters because it teaches a design idea: repeat a small part to make a new structure.",
    ],
    ["source:iron"],
  ),
  kidInfo(
    "alchemy:shield-boss",
    "Shield Boss",
    [
      "A Shield Boss is the raised metal center of a shield in this gear model.",
      "It combines strong steel, shiny brass, and copper rivets so each material has a job.",
      "It matters because the player is no longer just making substances; they are engineering equipment.",
    ],
    ["source:steel", "source:bronze-brass", "source:copper"],
  ),
  kidInfo(
    "alchemy:wood-shaft",
    "Wood Shaft",
    [
      "A Wood Shaft is wood shaped into a long straight part.",
      "Wood has grain, which is like tiny lines that help decide how it bends and breaks.",
      "It matters because not every useful part is metal; light materials are important too.",
    ],
    ["source:charcoal"],
  ),
  kidInfo(
    "alchemy:ranger-arrowhead",
    "Ranger Arrowhead",
    [
      "A Ranger Arrowhead is a hard wedge-shaped point.",
      "A wedge focuses force into a small area, like the tip of a pencil pressing into paper.",
      "It matters because shape can be as important as material in making a tool work.",
    ],
    ["source:steel"],
  ),
  kidInfo(
    "alchemy:ranger-arrow",
    "Ranger Arrow",
    [
      "A Ranger Arrow combines a shaft, point, feather, and thread into one balanced object.",
      "Each part has a job: length, tip, stability, and tying.",
      "It matters because the player sees engineering as teamwork between shapes and materials.",
    ],
    ["source:steel", "source:linen"],
  ),
  kidInfo(
    "alchemy:vinegar-solution",
    "Vinegar Solution",
    [
      "Vinegar Solution is vinegar diluted with water in the game.",
      "Vinegar contains acetic acid, which gives it its sharp smell and sour taste.",
      "It matters because acids are important recipe characters, but the game keeps them gentle and readable.",
    ],
    ["source:vinegar"],
  ),
  kidInfo(
    "alchemy:baking-soda",
    "Baking Soda",
    [
      "Baking Soda is sodium bicarbonate, written NaHCO3.",
      "It is famous because it can make carbon dioxide bubbles when it meets an acid like vinegar.",
      "In the game, the recipe is compressed so it fits the table while still teaching the bicarbonate idea.",
    ],
    ["source:baking-soda", "source:sodium-carbonate"],
  ),
  kidInfo(
    "alchemy:fizz-foam",
    "Fizz Foam",
    [
      "Fizz Foam models what happens when vinegar and baking soda react.",
      "The bubbles are carbon dioxide gas, water, and a new salt forming from the old ingredients.",
      "It matters because the player can see a chemical reaction announce itself with motion.",
    ],
    ["source:baking-soda"],
  ),
  kidInfo(
    "alchemy:copper-chloride",
    "Copper Chloride",
    [
      "Copper Chloride is a copper salt in this simplified color recipe.",
      "Copper compounds can make strong blue-green colors, like a color flag waving from the metal.",
      "It matters because metals are not only strong; they can also change the color of materials.",
    ],
    ["source:copper", "source:pigment"],
  ),
  kidInfo(
    "alchemy:copper-patina",
    "Copper Patina",
    [
      "Copper Patina is the blue-green surface that can form on copper over time.",
      "It is like copper growing a weather coat after meeting air, water, salts, or acids.",
      "It matters because surface chemistry can create colors without painting from a tube.",
    ],
    ["source:verdigris", "source:copper"],
  ),
  kidInfo(
    "alchemy:iron-oxide-pigment",
    "Iron Oxide Pigment",
    [
      "Iron Oxide Pigment is a red-brown color material inspired by rust and earth pigments.",
      "Iron and oxygen can make colored compounds that people have used in art for ages.",
      "It matters because the forge path suddenly becomes a paint path too.",
    ],
    ["source:pigment", "source:iron"],
  ),
  kidInfo(
    "alchemy:green-pigment",
    "Green Pigment",
    [
      "Green Pigment is made by grinding a colored copper patina material.",
      "Pigments work best as tiny particles that can spread through paint, glass, or ink.",
      "It matters because grinding is not just smashing; it makes color easier to use.",
    ],
    ["source:verdigris", "source:pigment"],
  ),
  kidInfo(
    "alchemy:red-pigment",
    "Red Pigment",
    [
      "Red Pigment is powdered iron oxide material.",
      "Iron oxide colors can look red, brown, or orange, like earthy sunset dust.",
      "It matters because one metal can become both armor and art depending on the recipe.",
    ],
    ["source:pigment", "source:iron"],
  ),
  kidInfo(
    "alchemy:blue-glass",
    "Blue Glass",
    [
      "Blue Glass is glass colored by a copper-containing material in the game model.",
      "Glass can carry colorants inside it, like clear ice holding a drop of sky.",
      "It matters because the same base glass can become different special materials.",
    ],
    ["source:glass", "source:industrial-glass", "source:copper"],
  ),
  kidInfo(
    "alchemy:green-glass",
    "Green Glass",
    [
      "Green Glass is glass tinted with a copper patina idea.",
      "Small amounts of metal compounds can change how glass handles light.",
      "It matters because color becomes a material property, not just decoration.",
    ],
    ["source:glass", "source:industrial-glass", "source:verdigris"],
  ),
  kidInfo(
    "alchemy:red-glass",
    "Red Glass",
    [
      "Red Glass is glass colored with an iron oxide pigment in the game.",
      "Iron compounds can bring warm colors to glass and glazes.",
      "It matters because the pigment path and glass path finally shake hands.",
    ],
    ["source:glass", "source:industrial-glass", "source:pigment"],
  ),
  kidInfo(
    "alchemy:wizard-lens",
    "Wizard Lens",
    [
      "A Wizard Lens is shaped transparent material that can bend or focus light.",
      "A lens is like a traffic guide for light rays, telling them where to go.",
      "It matters because optics turns glass from a container material into a seeing material.",
    ],
    ["source:lens", "source:glass"],
  ),
  kidInfo(
    "alchemy:leather-strip",
    "Leather Strip",
    [
      "Leather is processed hide made tougher and more useful.",
      "Salt is used in the game as a simple preservation helper before the strip becomes gear.",
      "It matters because soft, flexible materials make straps, kits, and field tools possible.",
    ],
    ["source:leather", "source:sodium-chloride"],
  ),
  kidInfo(
    "alchemy:parchment",
    "Parchment",
    [
      "Parchment is a writing surface made from specially prepared skin.",
      "It is tougher than ordinary paper, like a scroll page wearing armor.",
      "It matters because the guild can write important magic-like records on a durable material.",
    ],
    ["source:parchment", "source:calcium-hydroxide"],
  ),
  kidInfo(
    "alchemy:quill-pen",
    "Quill Pen",
    [
      "A Quill Pen is a feather shaped into a writing tool.",
      "The point controls where ink flows, like a tiny gate at the end of a river.",
      "It matters because the player learns that tools can be made from carefully shaped natural materials.",
    ],
    ["source:quill"],
  ),
  kidInfo(
    "alchemy:inked-quill",
    "Inked Quill",
    [
      "An Inked Quill is a writing tool ready to make marks.",
      "Ink travels from the pen tip to the page in a thin line.",
      "It matters because tool plus material becomes action: now the guild can write.",
    ],
    ["source:quill", "source:ink"],
  ),
  kidInfo(
    "alchemy:spell-scroll",
    "Spell Scroll",
    [
      "A Spell Scroll is parchment, ink, and a wax seal turned into a finished message.",
      "The fantasy part is the spell, but the science part is information stored on a material.",
      "It matters because the player sees knowledge as something crafted, protected, and delivered.",
    ],
    ["source:parchment", "source:ink", "source:beeswax"],
  ),
  kidInfo(
    "alchemy:alchemist-label",
    "Alchemist Label",
    [
      "An Alchemist Label is a small written tag for a bottle, kit, or shelf.",
      "Labels are like memory handles: they help your brain grab the right thing quickly.",
      "It matters because good science is not only mixing; it is also naming, sorting, and staying organized.",
    ],
    ["source:paper", "source:ink"],
  ),
  kidInfo(
    "alchemy:potion-kit",
    "Potion Kit",
    [
      "A Potion Kit is a bundle of bottle, label, and stopper parts.",
      "A kit is like a recipe packed into a toolbox so it is ready when needed.",
      "It matters because the game starts rewarding preparation, not just one-at-a-time crafting.",
    ],
    ["source:glass", "source:cork", "source:paper"],
  ),
  kidInfo(
    "alchemy:antiseptic-wash",
    "Antiseptic Wash",
    [
      "Antiseptic Wash is a fantasy cleaning liquid made from clean-water and salt ideas.",
      "The important lesson is that dissolved materials can change how water behaves.",
      "It matters because cleric recipes connect chemistry to care without asking the player to do real medical chemistry.",
    ],
    ["source:solution", "source:sodium-chloride"],
  ),
  kidInfo(
    "alchemy:cleric-salve",
    "Cleric Salve",
    [
      "A Cleric Salve is a thick fantasy balm made with wax, oil, and herbs.",
      "Wax and oil can make a soft carrier, like a little blanket that holds plant material in place.",
      "It matters because texture is a material property too: some recipes need to spread, not pour.",
    ],
    ["source:beeswax", "source:salve"],
  ),
  kidInfo(
    "alchemy:rogue-smoke-vial",
    "Rogue Smoke Vial",
    [
      "A Rogue Smoke Vial is a stronger container for a smoke effect.",
      "The fun idea is stored action: a puff can be carried until the moment it is needed.",
      "It matters because containers are not boring; they decide when and where a material can be used.",
    ],
    ["source:carbon-dioxide", "source:glass"],
  ),
  kidInfo(
    "alchemy:shine-polish",
    "Shine Polish",
    [
      "Shine Polish is a surface treatment for making gear look cleaner and brighter.",
      "Surface chemistry is like editing the cover of a book without rewriting every page inside.",
      "It matters because finishing changes how an object looks, feels, and signals care.",
    ],
    ["source:beeswax", "source:vinegar"],
  ),
  kidInfo(
    "alchemy:polished-shield-boss",
    "Polished Shield Boss",
    [
      "A Polished Shield Boss is the old shield part with a finished surface.",
      "The base gear is still there, but the surface now tells a better story.",
      "It matters because upgrades can improve an existing object instead of always starting over.",
    ],
    ["source:steel", "source:beeswax"],
  ),
  kidInfo(
    "alchemy:quartz-dust",
    "Quartz Dust",
    [
      "Quartz is a crystal form of silica.",
      "Grinding it into dust changes the particle size while keeping the mineral idea.",
      "It matters because the crystal path grows from the same silica family as glass.",
    ],
    ["source:quartz", "source:silica"],
  ),
  kidInfo(
    "alchemy:crystal-lens",
    "Crystal Lens",
    [
      "A Crystal Lens is a clear material shaped to guide light.",
      "Lenses bend light like a curved path bends a rolling ball.",
      "It matters because better seeing tools lead toward the observatory and star-map quests.",
    ],
    ["source:lens", "source:quartz"],
  ),
  kidInfo(
    "alchemy:silver-ingot",
    "Silver Ingot",
    [
      "Silver is a shiny metal with the symbol Ag.",
      "It carries electricity very well and has been valued for tools, coins, art, and electronics.",
      "In the guild, silver matters because it upgrades the conductor and precision-tool paths.",
    ],
    ["source:silver", "source:conductor"],
  ),
  kidInfo(
    "alchemy:gold-ingot",
    "Gold Ingot",
    [
      "Gold is a soft, shiny metal with the symbol Au.",
      "It can be beaten into extremely thin sheets and it resists tarnish, so it stays bright.",
      "It matters because gold adds reflection, decoration, and high-value craft energy to late recipes.",
    ],
    ["source:gold"],
  ),
  kidInfo(
    "alchemy:silver-wire",
    "Silver Wire",
    [
      "Silver Wire is silver shaped into a long conductor.",
      "Because silver conducts so well, it is like a very smooth road for electric charge.",
      "It matters because late magical tools need both shiny fantasy and real material logic.",
    ],
    ["source:silver", "source:conductor"],
  ),
  kidInfo(
    "alchemy:gold-leaf",
    "Gold Leaf",
    [
      "Gold Leaf is gold hammered into a very thin sheet.",
      "It is so thin that it feels almost like metal sunlight.",
      "It matters because a tiny amount of gold can decorate scrolls, inks, and stage items in a big way.",
    ],
    ["source:gold"],
  ),
  kidInfo(
    "alchemy:conductive-thread",
    "Conductive Thread",
    [
      "Conductive Thread mixes flexible fiber with conductive metal.",
      "It is like sewing a tiny energy road into cloth.",
      "It matters because circuits do not always have to be stiff; some useful parts can bend.",
    ],
    ["source:linen", "source:conductor", "source:copper"],
  ),
  kidInfo(
    "alchemy:circuit-rune",
    "Circuit Rune",
    [
      "A Circuit Rune is a fantasy part that compares conductors and insulators.",
      "Copper helps energy move, while glassy materials help keep the path controlled.",
      "It matters because the artificer path turns material properties into a readable magic symbol.",
    ],
    ["source:conductor", "source:glass", "source:copper"],
  ),
  kidInfo(
    "alchemy:focusing-crystal",
    "Focusing Crystal",
    [
      "A Focusing Crystal is a crystal part aligned with a lens idea.",
      "It is fantasy, but it points to real optics: clear shapes can guide light.",
      "It matters because the player sees precision as a craft, not just a bigger number.",
    ],
    ["source:lens", "source:quartz"],
  ),
  kidInfo(
    "alchemy:wizard-focus",
    "Wizard Focus",
    [
      "A Wizard Focus combines crystal, silver wire, and conductive thread.",
      "It is like a tiny instrument where light, metal, and fiber each play one note.",
      "It matters because capstone tools prove that old branches can become one smart system.",
    ],
    ["source:lens", "source:silver", "source:conductor"],
  ),
  kidInfo(
    "alchemy:radiant-ink",
    "Radiant Ink",
    [
      "Radiant Ink adds shiny gold and mineral dust to black ink.",
      "It is like ordinary ink learning how to catch the light.",
      "It matters because the writing path becomes special enough for star maps and late guild records.",
    ],
    ["source:ink", "source:gold", "source:quartz"],
  ),
  kidInfo(
    "alchemy:star-map-scroll",
    "Star Map Scroll",
    [
      "A Star Map Scroll is a spell scroll upgraded with radiant ink.",
      "It turns writing into a navigation tool, like a recipe book for the sky.",
      "It matters because the game connects tiny atoms on the table to huge patterns in the stars.",
    ],
    ["source:ink", "source:paper", "source:quartz"],
  ),
  kidInfo(
    "alchemy:bone-ash",
    "Bone Ash",
    [
      "Bone Ash is a mineral-rich ash made from bone in the game model.",
      "It points to calcium and phosphate minerals, which are important in living things and soil ideas.",
      "It matters because the garden path starts with minerals, not just leaves and water.",
    ],
    ["source:bone-ash", "source:phosphate"],
  ),
  kidInfo(
    "alchemy:phosphate-salt",
    "Phosphate Salt",
    [
      "Phosphate Salt represents a phosphate nutrient material.",
      "Phosphates are important because plants need phosphorus to grow, much like a town needs roads to move supplies.",
      "The game compresses the formula so the recipe fits, but the learning idea stays real.",
    ],
    ["source:phosphate", "source:fertilizer"],
  ),
  kidInfo(
    "alchemy:fertilizer-mix",
    "Fertilizer Mix",
    [
      "Fertilizer Mix combines nutrient ideas like phosphorus and potassium with organic material.",
      "Fertilizer is like a packed lunch for soil, giving plants materials they need.",
      "It matters because the player learns that chemistry supports living systems too.",
    ],
    ["source:fertilizer"],
  ),
  kidInfo(
    "alchemy:growth-elixir",
    "Growth Elixir",
    [
      "Growth Elixir is a fantasy plant-care liquid made from nutrients, clean water, and syrup.",
      "A liquid can carry dissolved materials to where they are needed, like a delivery cart for roots.",
      "It matters because solid minerals become a usable garden potion through solution thinking.",
    ],
    ["source:fertilizer", "source:solution"],
  ),
  kidInfo(
    "alchemy:seed-coating",
    "Seed Coating",
    [
      "Seed Coating wraps useful material around a seed in the game model.",
      "It is like packing a seed with a tiny starter kit before planting.",
      "It matters because coatings can control where helpful materials sit and when they are released.",
    ],
    ["source:fertilizer", "source:clay"],
  ),
  kidInfo(
    "alchemy:mushroom-broth",
    "Mushroom Broth",
    [
      "Mushroom Broth is water carrying material from mushrooms.",
      "Extraction is like asking water to borrow color, flavor, or useful bits from something solid.",
      "It matters because this begins the fermentation path, where time becomes part of the recipe.",
    ],
    ["source:solution", "source:fermentation"],
  ),
  kidInfo(
    "alchemy:fermentation-starter",
    "Fermentation Starter",
    [
      "A Fermentation Starter is a fantasy-safe model of microbes getting food from sugar.",
      "Fermentation is change over time, like a slow kitchen clock ticking inside the mixture.",
      "It matters because the player learns that not every craft should feel instant.",
    ],
    ["source:fermentation"],
  ),
  kidInfo(
    "alchemy:vinegar-brew",
    "Vinegar Brew",
    [
      "Vinegar Brew models a fermented liquid becoming sharper with oxygen involved.",
      "Real vinegar is connected to acetic acid and fermentation pathways.",
      "It matters because it ties the garden, acid-base, and preservation branches together.",
    ],
    ["source:vinegar", "source:fermentation"],
  ),
  kidInfo(
    "alchemy:preservative-brine",
    "Preservative Brine",
    [
      "Preservative Brine combines salty water and vinegar ideas.",
      "Salt and acid can make life harder for many spoilage microbes, like locking the pantry door.",
      "It matters because preservation turns chemistry into travel food and long-lasting supplies.",
    ],
    ["source:brine", "source:pickling", "source:vinegar"],
  ),
  kidInfo(
    "alchemy:trail-pickles",
    "Trail Pickles",
    [
      "Trail Pickles are a travel food made with a preserving brine and herbs.",
      "Pickling can use brine, vinegar, or both to help food last longer and taste different.",
      "It matters because the ranger path shows chemistry helping people prepare for journeys.",
    ],
    ["source:pickling", "source:brine"],
  ),
  kidInfo(
    "alchemy:plant-tonic",
    "Plant Tonic",
    [
      "Plant Tonic combines a growth elixir with carbonated water.",
      "It is a fantasy plant drink that joins nutrient delivery with gas-in-liquid ideas.",
      "It matters because the garden path becomes a little system: minerals, water, gas, and care.",
    ],
    ["source:fertilizer", "source:carbonic-acid"],
  ),
  kidInfo(
    "alchemy:garden-charm",
    "Garden Charm",
    [
      "A Garden Charm combines seed coating, plant tonic, and a copper charm.",
      "It is a capstone object, which means several earlier branches meet in one item.",
      "It matters because the player can point to it and say, 'I know what all those parts came from.'",
    ],
    ["source:fertilizer", "source:copper"],
  ),
  kidInfo(
    "alchemy:tempered-steel",
    "Tempered Steel",
    [
      "Tempered Steel is steel changed by careful heating and cooling.",
      "Tempering can make steel tougher by reducing brittleness, like helping a cookie be crunchy but not shatter.",
      "It matters because late forge work is about improving properties, not just making more metal.",
    ],
    ["source:tempering", "source:steel"],
  ),
  kidInfo(
    "alchemy:enamel-coating",
    "Enamel Coating",
    [
      "Enamel Coating is modeled as a glass-like colored surface layer.",
      "A coating is like giving a metal part a hard, colorful jacket.",
      "It matters because glass chemistry comes back as a finish instead of a bottle or lens.",
    ],
    ["source:enamel", "source:glass", "source:pigment"],
  ),
  kidInfo(
    "alchemy:enamelled-buckle",
    "Enamelled Buckle",
    [
      "An Enamelled Buckle is a bronze buckle with a glassy colored coating.",
      "The buckle keeps its shape job, while the surface gains a new look and protection idea.",
      "It matters because upgrades can layer new materials onto old parts.",
    ],
    ["source:enamel", "source:bronze-brass"],
  ),
  kidInfo(
    "alchemy:mirror-glass",
    "Mirror Glass",
    [
      "Mirror Glass is glass with a shiny metal backing in the game model.",
      "A mirror works because light bounces back in an organized way.",
      "It matters because reflection turns glass from something you look through into something you look at.",
    ],
    ["source:mirror", "source:glass", "source:silver"],
  ),
  kidInfo(
    "alchemy:periscope-mirror",
    "Periscope Mirror",
    [
      "A Periscope Mirror uses mirrors and a tube to redirect sight.",
      "It is like making light turn a corner so your eyes can peek from a safer place.",
      "It matters because geometry joins chemistry: the material is important, but the angle is the trick.",
    ],
    ["source:periscope", "source:mirror"],
  ),
  kidInfo(
    "alchemy:knight-repair-kit",
    "Knight Repair Kit",
    [
      "A Knight Repair Kit bundles chain, needle, and sealing material.",
      "A kit is useful because the right small parts are already together when trouble happens.",
      "It matters because the player sees earlier gear parts become practical maintenance.",
    ],
    ["source:steel", "source:beeswax"],
  ),
  kidInfo(
    "alchemy:purifying-flask",
    "Purifying Flask",
    [
      "A Purifying Flask combines the water-flask chain with salt and silver ideas.",
      "It is fantasy equipment, but each piece has a material role: container, mineral, and conductor-like metal.",
      "It matters because cleric gear becomes a map of recipes the player already understands.",
    ],
    ["source:water", "source:sodium-chloride", "source:silver"],
  ),
  kidInfo(
    "alchemy:observation-kit",
    "Observation Kit",
    [
      "An Observation Kit combines a lens, mirror, and writing tool.",
      "It lets the guild see carefully and record what it sees, like a scientist's field bag.",
      "It matters because learning is not only crafting things; it is also noticing and writing down patterns.",
    ],
    ["source:lens", "source:mirror", "source:ink"],
  ),
  kidInfo(
    "alchemy:signal-mirror",
    "Signal Mirror",
    [
      "A Signal Mirror is a reflective tool made for sending light flashes.",
      "It uses reflection like a faraway wave that says, 'I am over here.'",
      "It matters because light can become communication when a material is shaped for the job.",
    ],
    ["source:heliograph", "source:mirror"],
  ),
  kidInfo(
    "alchemy:stage-sparkle",
    "Stage Sparkle",
    [
      "Stage Sparkle combines gold leaf, blue glass, and wax into a showy quest item.",
      "Gold reflects light and blue glass changes color, so the stage gets science-powered shine.",
      "It matters because chemistry can support art, celebration, and town joy too.",
    ],
    ["source:gold", "source:glass", "source:beeswax"],
  ),
  kidInfo(
    "alchemy:calibration-kit",
    "Calibration Kit",
    [
      "A Calibration Kit bundles a circuit rune, rivet, and steel needle.",
      "Calibration means adjusting tools so they line up and measure correctly.",
      "It matters because the artificer path teaches precision: small parts help big machines behave.",
    ],
    ["source:conductor", "source:steel", "source:copper"],
  ),
  kidInfo(
    "alchemy:guild-adventure-crate",
    "Guild Adventure Crate",
    [
      "The Guild Adventure Crate packs several finished class kits into one capstone supply box.",
      "It is like the whole recipe graph folding into a single treasure chest.",
      "It matters because the player can see that Water, Glass, Metal, Ink, Plants, and Light all became one connected world.",
    ],
    ["source:water", "source:glass", "source:steel", "source:fertilizer"],
  ),
] as const satisfies readonly DeepReadonly<AlchemyRecipeKidInfo>[];

export const AlchemyRecipeKidInfoSourcesSchema = z.array(AlchemyRecipeKidInfoSourceSchema).min(1);
export const AlchemyRecipeKidInfosSchema = z
  .array(AlchemyRecipeKidInfoSchema)
  .min(EXPECTED_MINIMUM_ALCHEMY_RECIPES);

export type StaticAlchemyRecipeKidInfo = (typeof ALCHEMY_RECIPE_KID_INFO)[number];
export type StaticAlchemyRecipeKidInfoId = StaticAlchemyRecipeKidInfo["recipeId"];

export const ALCHEMY_RECIPE_KID_INFO_BY_ID = Object.freeze(
  Object.fromEntries(ALCHEMY_RECIPE_KID_INFO.map((info) => [info.recipeId, info])),
) as Readonly<Record<StaticAlchemyRecipeKidInfoId, StaticAlchemyRecipeKidInfo>>;

export function getAlchemyRecipeKidInfoById(
  recipeId: string,
): StaticAlchemyRecipeKidInfo | undefined {
  return ALCHEMY_RECIPE_KID_INFO_BY_ID[recipeId as StaticAlchemyRecipeKidInfoId];
}

export function validateAlchemyRecipeKidInfo(
  kidInfos: readonly unknown[] = ALCHEMY_RECIPE_KID_INFO,
  sources: readonly unknown[] = ALCHEMY_RECIPE_KID_INFO_SOURCES,
): AlchemyRecipeKidInfo[] {
  const parsedSources = AlchemyRecipeKidInfoSourcesSchema.parse(sources);
  const parsedKidInfos = AlchemyRecipeKidInfosSchema.parse(kidInfos);
  const sourceIds = new Set<string>(parsedSources.map((currentSource) => currentSource.id));
  const recipeIds = new Set<string>(ALCHEMY_RECIPES.map((currentRecipe) => currentRecipe.id));
  const seenRecipeIds = new Set<string>();

  for (const kidInfoToValidate of parsedKidInfos) {
    if (seenRecipeIds.has(kidInfoToValidate.recipeId)) {
      throw new Error(`Duplicate alchemy recipe kid info id: ${kidInfoToValidate.recipeId}`);
    }
    seenRecipeIds.add(kidInfoToValidate.recipeId);

    if (!recipeIds.has(kidInfoToValidate.recipeId)) {
      throw new Error(`Unknown alchemy recipe kid info id: ${kidInfoToValidate.recipeId}`);
    }
    for (const sourceId of kidInfoToValidate.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        throw new Error(`Unknown alchemy recipe kid info source id: ${sourceId}`);
      }
    }
  }

  if (seenRecipeIds.size !== ALCHEMY_RECIPES.length) {
    throw new Error(
      `Alchemy recipe kid info covers ${seenRecipeIds.size} recipes, expected ${ALCHEMY_RECIPES.length}`,
    );
  }
  for (const currentRecipe of ALCHEMY_RECIPES) {
    if (!seenRecipeIds.has(currentRecipe.id)) {
      throw new Error(`Alchemy recipe is missing kid info: ${currentRecipe.id}`);
    }
  }

  return parsedKidInfos;
}
