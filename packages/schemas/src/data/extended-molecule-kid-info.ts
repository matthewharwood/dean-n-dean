import * as z from "zod";

import {
  EXTENDED_MOLECULE_DATA_SOURCE_URL,
  EXTENDED_MOLECULE_RECIPE_COUNT,
  EXTENDED_MOLECULE_RECIPES,
  ExtendedMoleculeRecipeIdSchema,
  type StaticExtendedMoleculeRecipe,
} from "./extended-molecule-recipes";

export const EXTENDED_MOLECULE_PUBCHEM_IMAGE_URL_TEMPLATE =
  "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG?image_size=large" as const;

export const ExtendedMoleculeKidInfoSourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
});
export type ExtendedMoleculeKidInfoSource = z.infer<typeof ExtendedMoleculeKidInfoSourceSchema>;

export const ExtendedMoleculeKidInfoSchema = z.object({
  funFacts: z.array(z.string().min(1)).min(3).max(4),
  imageAlt: z.string().min(1),
  imageUrl: z.url(),
  recipeId: ExtendedMoleculeRecipeIdSchema,
  sentences: z.array(z.string().min(1)).min(3).max(4),
  sourceLinks: z.array(ExtendedMoleculeKidInfoSourceSchema).min(2),
  title: z.string().min(1),
});
export type ExtendedMoleculeKidInfo = z.infer<typeof ExtendedMoleculeKidInfoSchema>;

export const EXTENDED_MOLECULE_KID_INFO = EXTENDED_MOLECULE_RECIPES.map((recipe) =>
  createExtendedMoleculeKidInfo(recipe),
) satisfies readonly ExtendedMoleculeKidInfo[];

export const EXTENDED_MOLECULE_KID_INFO_BY_ID: ReadonlyMap<string, ExtendedMoleculeKidInfo> =
  new Map(EXTENDED_MOLECULE_KID_INFO.map((info) => [info.recipeId, info]));

export function getExtendedMoleculeKidInfoById(
  recipeId: string,
): ExtendedMoleculeKidInfo | undefined {
  return EXTENDED_MOLECULE_KID_INFO_BY_ID.get(recipeId);
}

export function createExtendedMoleculeKidInfo(
  recipe: StaticExtendedMoleculeRecipe,
): ExtendedMoleculeKidInfo {
  const atomCount = getExtendedMoleculeAtomCount(recipe);
  const uniqueElementCount = recipe.ingredients.length;
  const biggestIngredient = recipe.ingredients.toSorted(
    (left, right) => right.quantity - left.quantity,
  )[0];
  const biggestIngredientFact = biggestIngredient
    ? `The biggest stack in its formula is ${biggestIngredient.quantity} ${biggestIngredient.elementSymbol} atom${biggestIngredient.quantity === 1 ? "" : "s"}.`
    : `Its formula uses ${atomCount} tiny atom pieces.`;

  return ExtendedMoleculeKidInfoSchema.parse({
    funFacts: [
      `PubChem keeps this molecule as compound ${recipe.source.pubChemCid}.`,
      `Its formula uses ${atomCount} total atom${atomCount === 1 ? "" : "s"}.`,
      `It has ${uniqueElementCount} kind${uniqueElementCount === 1 ? "" : "s"} of element in the recipe.`,
      biggestIngredientFact,
    ],
    imageAlt: `${recipe.output.name} structure from PubChem`,
    imageUrl: getExtendedMoleculePubChemImageUrl(recipe.source.pubChemCid),
    recipeId: recipe.id,
    sentences: [
      `${recipe.output.name} is an extended molecule with the formula ${recipe.output.formula}.`,
      `${formatExtendedMoleculeIngredientSentence(recipe)}.`,
      "A formula is like a tiny recipe card: the letters name the elements, and the little numbers tell how many atoms join in.",
      "In the guild, this is an optional discovery card for curious experimenting after the main quests.",
    ],
    sourceLinks: [
      { label: "PubChem compound", url: recipe.source.url },
      {
        label: "PubChem structure image",
        url: getExtendedMoleculePubChemImageUrl(recipe.source.pubChemCid),
      },
      {
        label: "PubChem property API",
        url: EXTENDED_MOLECULE_DATA_SOURCE_URL.replace("{cid}", String(recipe.source.pubChemCid)),
      },
    ],
    title: recipe.output.name,
  });
}

export function getExtendedMoleculePubChemImageUrl(pubChemCid: number): string {
  return EXTENDED_MOLECULE_PUBCHEM_IMAGE_URL_TEMPLATE.replace("{cid}", String(pubChemCid));
}

export function validateExtendedMoleculeKidInfo(
  kidInfos: readonly unknown[] = EXTENDED_MOLECULE_KID_INFO,
): ExtendedMoleculeKidInfo[] {
  const parsedKidInfos = z
    .array(ExtendedMoleculeKidInfoSchema)
    .length(EXTENDED_MOLECULE_RECIPE_COUNT)
    .parse(kidInfos);
  const recipeIds = new Set<string>(EXTENDED_MOLECULE_RECIPES.map((recipe) => recipe.id));
  const seenRecipeIds = new Set<string>();

  for (const kidInfo of parsedKidInfos) {
    if (seenRecipeIds.has(kidInfo.recipeId)) {
      throw new Error(`Duplicate extended molecule kid info id: ${kidInfo.recipeId}`);
    }
    seenRecipeIds.add(kidInfo.recipeId);

    if (!recipeIds.has(kidInfo.recipeId)) {
      throw new Error(`Unknown extended molecule kid info id: ${kidInfo.recipeId}`);
    }
  }

  if (seenRecipeIds.size !== EXTENDED_MOLECULE_RECIPES.length) {
    throw new Error(
      `Extended molecule kid info covers ${seenRecipeIds.size} recipes, expected ${EXTENDED_MOLECULE_RECIPES.length}`,
    );
  }

  return parsedKidInfos;
}

function getExtendedMoleculeAtomCount(recipe: StaticExtendedMoleculeRecipe): number {
  return recipe.ingredients.reduce((total, ingredient) => total + ingredient.quantity, 0);
}

function formatExtendedMoleculeIngredientSentence(recipe: StaticExtendedMoleculeRecipe): string {
  const ingredientLabels = recipe.ingredients.map(
    (ingredient) =>
      `${ingredient.quantity} ${ingredient.elementSymbol} atom${ingredient.quantity === 1 ? "" : "s"}`,
  );

  if (ingredientLabels.length === 1) return `It is made from ${ingredientLabels[0]}`;

  const lastLabel = ingredientLabels.at(-1);
  const firstLabels = ingredientLabels.slice(0, -1);
  return `It is made from ${firstLabels.join(", ")} and ${lastLabel}`;
}
