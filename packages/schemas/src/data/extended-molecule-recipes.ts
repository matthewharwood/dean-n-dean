import * as z from "zod";

import { ElementSymbolSchema } from "./element-cards";

// Generated from PubChem PUG REST compound property rows.
// Extended recipes are one-time awards: each formula fits in five direct
// element slots and excludes formulas already owned by current game recipes.
export const EXTENDED_MOLECULE_DATA_SOURCE_URL =
  "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/property/Title,MolecularFormula,ConnectivitySMILES/JSON" as const;
export const EXTENDED_MOLECULE_RECIPE_COUNT = 500 as const;

export const ExtendedMoleculeRecipeIdSchema = z.string().regex(/^extended:[a-z0-9-]+$/);
export type ExtendedMoleculeRecipeId = z.infer<typeof ExtendedMoleculeRecipeIdSchema>;
export const ExtendedMoleculeCardIdSchema = z.string().regex(/^molecule:[a-z0-9-]+$/);
export type ExtendedMoleculeCardId = z.infer<typeof ExtendedMoleculeCardIdSchema>;

export const ExtendedMoleculeFormulaKeySchema = z
  .string()
  .regex(/^[A-Z][a-z]?:[1-9][0-9]*(\|[A-Z][a-z]?:[1-9][0-9]*)*$/);
export type ExtendedMoleculeFormulaKey = z.infer<typeof ExtendedMoleculeFormulaKeySchema>;
export const ExtendedMoleculeIngredientCardIdSchema = z.string().regex(/^element:[a-z]{1,3}$/);
export type ExtendedMoleculeIngredientCardId = z.infer<
  typeof ExtendedMoleculeIngredientCardIdSchema
>;

export const ExtendedMoleculeIngredientSchema = z.object({
  cardId: ExtendedMoleculeIngredientCardIdSchema,
  elementSymbol: ElementSymbolSchema,
  quantity: z.int().min(1).max(5),
});
export type ExtendedMoleculeIngredient = z.infer<typeof ExtendedMoleculeIngredientSchema>;

export const ExtendedMoleculeRecipeOutputSchema = z.object({
  cardId: ExtendedMoleculeCardIdSchema,
  formula: z.string().min(1),
  name: z.string().min(1),
});
export type ExtendedMoleculeRecipeOutput = z.infer<typeof ExtendedMoleculeRecipeOutputSchema>;

export const ExtendedMoleculeRecipeSchema = z
  .object({
    formulaKey: ExtendedMoleculeFormulaKeySchema,
    id: ExtendedMoleculeRecipeIdSchema,
    ingredients: z.array(ExtendedMoleculeIngredientSchema).min(1).max(5),
    output: ExtendedMoleculeRecipeOutputSchema,
    source: z.object({
      pubChemCid: z.int().min(1),
      url: z.string().min(1),
    }),
  })
  .refine(
    (recipe) =>
      recipe.ingredients.reduce((total, ingredient) => total + ingredient.quantity, 0) <= 5,
    {
      error: "Extended molecule awards must fit in five direct element slots.",
      path: ["ingredients"],
    },
  );
export type ExtendedMoleculeRecipe = z.infer<typeof ExtendedMoleculeRecipeSchema>;

export const EXTENDED_MOLECULE_RECIPES = [
  {
    formulaKey: "H:2",
    id: "extended:h2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h2",
      formula: "H2",
      name: "Hydrogen",
    },
    source: {
      pubChemCid: 783,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/783",
    },
  },
  {
    formulaKey: "I:2",
    id: "extended:i2",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:i2",
      formula: "I2",
      name: "Iodine",
    },
    source: {
      pubChemCid: 807,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/807",
    },
  },
  {
    formulaKey: "N:2",
    id: "extended:n2",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:n2",
      formula: "N2",
      name: "Nitrogen",
    },
    source: {
      pubChemCid: 947,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/947",
    },
  },
  {
    formulaKey: "O:2",
    id: "extended:o2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o2",
      formula: "O2",
      name: "Oxygen",
    },
    source: {
      pubChemCid: 977,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/977",
    },
  },
  {
    formulaKey: "Sb:2",
    id: "extended:sb2",
    ingredients: [
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:sb2",
      formula: "Sb2",
      name: "Antimony, mol. (Sb2)",
    },
    source: {
      pubChemCid: 23967,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23967",
    },
  },
  {
    formulaKey: "Co:2",
    id: "extended:co2",
    ingredients: [
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:co2",
      formula: "Co2",
      name: "CID 23977",
    },
    source: {
      pubChemCid: 23977,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23977",
    },
  },
  {
    formulaKey: "Br:2",
    id: "extended:br2",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:br2",
      formula: "Br2",
      name: "Bromine",
    },
    source: {
      pubChemCid: 24408,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24408",
    },
  },
  {
    formulaKey: "F:2",
    id: "extended:f2",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:f2",
      formula: "F2",
      name: "Fluorine",
    },
    source: {
      pubChemCid: 24524,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24524",
    },
  },
  {
    formulaKey: "Cl:2",
    id: "extended:cl2",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:cl2",
      formula: "Cl2",
      name: "Chlorine",
    },
    source: {
      pubChemCid: 24526,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24526",
    },
  },
  {
    formulaKey: "Te:2",
    id: "extended:te2",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:te2",
      formula: "Te2",
      name: "Tellurium, mol. (Te2)",
    },
    source: {
      pubChemCid: 66223,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66223",
    },
  },
  {
    formulaKey: "H:1|Br:1",
    id: "extended:h-br",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-br",
      formula: "BrH",
      name: "Hydrogen Bromide",
    },
    source: {
      pubChemCid: 260,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/260",
    },
  },
  {
    formulaKey: "C:1|O:1",
    id: "extended:c-o",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-o",
      formula: "CO",
      name: "Carbon Monoxide",
    },
    source: {
      pubChemCid: 281,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/281",
    },
  },
  {
    formulaKey: "H:1|Cl:1",
    id: "extended:h-cl",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-cl",
      formula: "ClH",
      name: "Hydrochloric Acid",
    },
    source: {
      pubChemCid: 313,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/313",
    },
  },
  {
    formulaKey: "K:1|I:1",
    id: "extended:k-i",
    ingredients: [
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:k-i",
      formula: "IK",
      name: "Potassium Iodide",
    },
    source: {
      pubChemCid: 4875,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/4875",
    },
  },
  {
    formulaKey: "F:1|Na:1",
    id: "extended:f-na",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f-na",
      formula: "FNa",
      name: "Sodium Fluoride",
    },
    source: {
      pubChemCid: 5235,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/5235",
    },
  },
  {
    formulaKey: "Na:1|I:1",
    id: "extended:na-i",
    ingredients: [
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:na-i",
      formula: "INa",
      name: "Sodium Iodide",
    },
    source: {
      pubChemCid: 5238,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/5238",
    },
  },
  {
    formulaKey: "C:1|Si:1",
    id: "extended:c-si",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:si",
        elementSymbol: "Si",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-si",
      formula: "CSi",
      name: "Silicon carbide",
    },
    source: {
      pubChemCid: 9863,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/9863",
    },
  },
  {
    formulaKey: "Ga:1|As:1",
    id: "extended:ga-as",
    ingredients: [
      {
        cardId: "element:ga",
        elementSymbol: "Ga",
        quantity: 1,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:ga-as",
      formula: "AsGa",
      name: "Gallium arsenide",
    },
    source: {
      pubChemCid: 14770,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14770",
    },
  },
  {
    formulaKey: "Be:1|O:1",
    id: "extended:be-o",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:be-o",
      formula: "BeO",
      name: "Beryllium Oxide",
    },
    source: {
      pubChemCid: 14775,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14775",
    },
  },
  {
    formulaKey: "O:1|Cd:1",
    id: "extended:o-cd",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-cd",
      formula: "CdO",
      name: "Cadmium oxide fume",
    },
    source: {
      pubChemCid: 14782,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14782",
    },
  },
  {
    formulaKey: "S:1|Cd:1",
    id: "extended:s-cd",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-cd",
      formula: "CdS",
      name: "Cadmium Sulfide",
    },
    source: {
      pubChemCid: 14783,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14783",
    },
  },
  {
    formulaKey: "Se:1|Cd:1",
    id: "extended:se-cd",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se-cd",
      formula: "CdSe",
      name: "Cadmium selenide",
    },
    source: {
      pubChemCid: 14784,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14784",
    },
  },
  {
    formulaKey: "O:1|Co:1",
    id: "extended:o-co",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-co",
      formula: "CoO",
      name: "Cobalt(II) oxide",
    },
    source: {
      pubChemCid: 14786,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14786",
    },
  },
  {
    formulaKey: "O:1|Mg:1",
    id: "extended:o-mg",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-mg",
      formula: "MgO",
      name: "Magnesium Oxide",
    },
    source: {
      pubChemCid: 14792,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14792",
    },
  },
  {
    formulaKey: "Fe:1|Se:1",
    id: "extended:fe-se",
    ingredients: [
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:fe-se",
      formula: "FeSe",
      name: "Ferrous selenide",
    },
    source: {
      pubChemCid: 14795,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14795",
    },
  },
  {
    formulaKey: "O:1|Ni:1",
    id: "extended:o-ni",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-ni",
      formula: "NiO",
      name: "Nickel trioxide",
    },
    source: {
      pubChemCid: 14805,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14805",
    },
  },
  {
    formulaKey: "O:1|Zn:1",
    id: "extended:o-zn",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:zn",
        elementSymbol: "Zn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-zn",
      formula: "OZn",
      name: "Desitin",
    },
    source: {
      pubChemCid: 14806,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14806",
    },
  },
  {
    formulaKey: "S:1|Pb:1",
    id: "extended:s-pb",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-pb",
      formula: "PbS",
      name: "Galena",
    },
    source: {
      pubChemCid: 14819,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14819",
    },
  },
  {
    formulaKey: "S:1|Sr:1",
    id: "extended:s-sr",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-sr",
      formula: "SSr",
      name: "Strontium sulfide",
    },
    source: {
      pubChemCid: 14820,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14820",
    },
  },
  {
    formulaKey: "S:1|Zn:1",
    id: "extended:s-zn",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:zn",
        elementSymbol: "Zn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-zn",
      formula: "SZn",
      name: "Sphalerite",
    },
    source: {
      pubChemCid: 14821,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14821",
    },
  },
  {
    formulaKey: "O:1|Pb:1",
    id: "extended:o-pb",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-pb",
      formula: "OPb",
      name: "Lead monoxide",
    },
    source: {
      pubChemCid: 14827,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14827",
    },
  },
  {
    formulaKey: "S:1|Fe:1",
    id: "extended:s-fe",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-fe",
      formula: "FeS",
      name: "Ferrous sulfide",
    },
    source: {
      pubChemCid: 14828,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14828",
    },
  },
  {
    formulaKey: "O:1|Cu:1",
    id: "extended:o-cu",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-cu",
      formula: "CuO",
      name: "Copper oxide",
    },
    source: {
      pubChemCid: 14829,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14829",
    },
  },
  {
    formulaKey: "S:1|Cu:1",
    id: "extended:s-cu",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-cu",
      formula: "CuS",
      name: "Copper monosulfide",
    },
    source: {
      pubChemCid: 14831,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14831",
    },
  },
  {
    formulaKey: "S:1|Co:1",
    id: "extended:s-co",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-co",
      formula: "CoS",
      name: "Cobalt sulfide",
    },
    source: {
      pubChemCid: 14832,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14832",
    },
  },
  {
    formulaKey: "H:1|F:1",
    id: "extended:h-f",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-f",
      formula: "FH",
      name: "Hydrofluoric Acid",
    },
    source: {
      pubChemCid: 14917,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14917",
    },
  },
  {
    formulaKey: "O:1|Mn:1",
    id: "extended:o-mn",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-mn",
      formula: "MnO",
      name: "Manganous oxide",
    },
    source: {
      pubChemCid: 14940,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14940",
    },
  },
  {
    formulaKey: "O:1|Fe:1",
    id: "extended:o-fe",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-fe",
      formula: "FeO",
      name: "Wustite",
    },
    source: {
      pubChemCid: 14945,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14945",
    },
  },
  {
    formulaKey: "H:1|Tl:1",
    id: "extended:h-tl",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:tl",
        elementSymbol: "Tl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-tl",
      formula: "HTl",
      name: "Thalliumhydrid",
    },
    source: {
      pubChemCid: 23959,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23959",
    },
  },
  {
    formulaKey: "H:1|At:1",
    id: "extended:h-at",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:at",
        elementSymbol: "At",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-at",
      formula: "AtH",
      name: "Hydrogen astatide",
    },
    source: {
      pubChemCid: 23996,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23996",
    },
  },
  {
    formulaKey: "S:1|Se:1",
    id: "extended:s-se",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-se",
      formula: "SSe",
      name: "Selenium sulfide (SeS)",
    },
    source: {
      pubChemCid: 24011,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24011",
    },
  },
  {
    formulaKey: "Cl:1|Hg:1",
    id: "extended:cl-hg",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-hg",
      formula: "ClHg",
      name: "Mercurous Chloride",
    },
    source: {
      pubChemCid: 24182,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24182",
    },
  },
  {
    formulaKey: "Cl:1|Cs:1",
    id: "extended:cl-cs",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:cs",
        elementSymbol: "Cs",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-cs",
      formula: "ClCs",
      name: "Cesium Chloride",
    },
    source: {
      pubChemCid: 24293,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24293",
    },
  },
  {
    formulaKey: "Cu:1|I:1",
    id: "extended:cu-i",
    ingredients: [
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cu-i",
      formula: "CuI",
      name: "Copper(1+) iodide; Copper(I) iodide; Cuprous iodide; Cuprous iodide (CuI)",
    },
    source: {
      pubChemCid: 24350,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24350",
    },
  },
  {
    formulaKey: "O:1|Zr:1",
    id: "extended:o-zr",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:zr",
        elementSymbol: "Zr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-zr",
      formula: "OZr",
      name: "Zirconium oxide (ZrO)",
    },
    source: {
      pubChemCid: 24374,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24374",
    },
  },
  {
    formulaKey: "O:1|V:1",
    id: "extended:o-v",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-v",
      formula: "OV",
      name: "Vanadium(II) oxide",
    },
    source: {
      pubChemCid: 24411,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24411",
    },
  },
  {
    formulaKey: "I:1|Hg:1",
    id: "extended:i-hg",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:i-hg",
      formula: "HgI",
      name: "Mercury iodide (HgI)",
    },
    source: {
      pubChemCid: 24541,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24541",
    },
  },
  {
    formulaKey: "Cl:1|Ag:1",
    id: "extended:cl-ag",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-ag",
      formula: "AgCl",
      name: "Silver Chloride",
    },
    source: {
      pubChemCid: 24561,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24561",
    },
  },
  {
    formulaKey: "Ag:1|I:1",
    id: "extended:ag-i",
    ingredients: [
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:ag-i",
      formula: "AgI",
      name: "Silver iodide",
    },
    source: {
      pubChemCid: 24563,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24563",
    },
  },
  {
    formulaKey: "Br:1|Cs:1",
    id: "extended:br-cs",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
      {
        cardId: "element:cs",
        elementSymbol: "Cs",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br-cs",
      formula: "BrCs",
      name: "Cesium bromide",
    },
    source: {
      pubChemCid: 24592,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24592",
    },
  },
  {
    formulaKey: "Cu:1|Br:1",
    id: "extended:cu-br",
    ingredients: [
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cu-br",
      formula: "BrCu",
      name: "copper(I) bromide",
    },
    source: {
      pubChemCid: 24593,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24593",
    },
  },
  {
    formulaKey: "I:1|Cs:1",
    id: "extended:i-cs",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
      {
        cardId: "element:cs",
        elementSymbol: "Cs",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:i-cs",
      formula: "CsI",
      name: "Cesium iodide",
    },
    source: {
      pubChemCid: 24601,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24601",
    },
  },
  {
    formulaKey: "Cl:1|I:1",
    id: "extended:cl-i",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-i",
      formula: "ClI",
      name: "Iodine chloride",
    },
    source: {
      pubChemCid: 24640,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24640",
    },
  },
  {
    formulaKey: "Cl:1|Tl:1",
    id: "extended:cl-tl",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:tl",
        elementSymbol: "Tl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-tl",
      formula: "ClTl",
      name: "Thallium monochloride",
    },
    source: {
      pubChemCid: 24642,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24642",
    },
  },
  {
    formulaKey: "H:1|Na:1",
    id: "extended:h-na",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-na",
      formula: "HNa",
      name: "Sodium hydride",
    },
    source: {
      pubChemCid: 24758,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24758",
    },
  },
  {
    formulaKey: "Br:1|Hg:1",
    id: "extended:br-hg",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br-hg",
      formula: "BrHg",
      name: "Mercury bromide",
    },
    source: {
      pubChemCid: 24830,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24830",
    },
  },
  {
    formulaKey: "H:1|I:1",
    id: "extended:h-i",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-i",
      formula: "HI",
      name: "Hydrogen iodide",
    },
    source: {
      pubChemCid: 24841,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24841",
    },
  },
  {
    formulaKey: "F:1|Cs:1",
    id: "extended:f-cs",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
      {
        cardId: "element:cs",
        elementSymbol: "Cs",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f-cs",
      formula: "CsF",
      name: "Cesium fluoride",
    },
    source: {
      pubChemCid: 25953,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25953",
    },
  },
  {
    formulaKey: "Cl:1|Au:1",
    id: "extended:cl-au",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:au",
        elementSymbol: "Au",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-au",
      formula: "AuCl",
      name: "Gold monochloride",
    },
    source: {
      pubChemCid: 27366,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/27366",
    },
  },
  {
    formulaKey: "S:1|Ni:1",
    id: "extended:s-ni",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-ni",
      formula: "NiS",
      name: "Nickel sulfide (NiS)",
    },
    source: {
      pubChemCid: 28094,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/28094",
    },
  },
  {
    formulaKey: "S:1|Ca:1",
    id: "extended:s-ca",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:ca",
        elementSymbol: "Ca",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-ca",
      formula: "CaS",
      name: "Oldhamite",
    },
    source: {
      pubChemCid: 30182,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/30182",
    },
  },
  {
    formulaKey: "Al:1|P:1",
    id: "extended:al-p",
    ingredients: [
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:al-p",
      formula: "AlP",
      name: "Aluminium phosphide (AlP)",
    },
    source: {
      pubChemCid: 30332,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/30332",
    },
  },
  {
    formulaKey: "O:1|Hg:1",
    id: "extended:o-hg",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-hg",
      formula: "HgO",
      name: "Mercuric oxide",
    },
    source: {
      pubChemCid: 30856,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/30856",
    },
  },
  {
    formulaKey: "P:1|In:1",
    id: "extended:p-in",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:in",
        elementSymbol: "In",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-in",
      formula: "InP",
      name: "Indium phosphide",
    },
    source: {
      pubChemCid: 31170,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/31170",
    },
  },
  {
    formulaKey: "Br:1|Au:1",
    id: "extended:br-au",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
      {
        cardId: "element:au",
        elementSymbol: "Au",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br-au",
      formula: "AuBr",
      name: "Gold bromide (AuBr)",
    },
    source: {
      pubChemCid: 33567,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/33567",
    },
  },
  {
    formulaKey: "Se:1|Pb:1",
    id: "extended:se-pb",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se-pb",
      formula: "PbSe",
      name: "Lead selenide (PbSe)",
    },
    source: {
      pubChemCid: 61550,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61550",
    },
  },
  {
    formulaKey: "Ni:1|Sb:1",
    id: "extended:ni-sb",
    ingredients: [
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:ni-sb",
      formula: "NiSb",
      name: "Breithauptite",
    },
    source: {
      pubChemCid: 61553,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61553",
    },
  },
  {
    formulaKey: "Ni:1|Se:1",
    id: "extended:ni-se",
    ingredients: [
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:ni-se",
      formula: "NiSe",
      name: "Makinenite",
    },
    source: {
      pubChemCid: 61556,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61556",
    },
  },
  {
    formulaKey: "O:1|Ti:1",
    id: "extended:o-ti",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-ti",
      formula: "OTi",
      name: "Titanium oxide (TiO)",
    },
    source: {
      pubChemCid: 61685,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61685",
    },
  },
  {
    formulaKey: "Cl:1|Br:1",
    id: "extended:cl-br",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-br",
      formula: "BrCl",
      name: "BROMINE CHLORIDE (BrCl)",
    },
    source: {
      pubChemCid: 61697,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61697",
    },
  },
  {
    formulaKey: "Ni:1|As:1",
    id: "extended:ni-as",
    ingredients: [
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:ni-as",
      formula: "AsNi",
      name: "Nickel arsenide (NiAs)",
    },
    source: {
      pubChemCid: 62391,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62391",
    },
  },
  {
    formulaKey: "O:1|Ba:1",
    id: "extended:o-ba",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:ba",
        elementSymbol: "Ba",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-ba",
      formula: "BaO",
      name: "Barium oxide",
    },
    source: {
      pubChemCid: 62392,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62392",
    },
  },
  {
    formulaKey: "S:1|Hg:1",
    id: "extended:s-hg",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-hg",
      formula: "HgS",
      name: "Cinnabar",
    },
    source: {
      pubChemCid: 62402,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62402",
    },
  },
  {
    formulaKey: "Cl:1|Cu:1",
    id: "extended:cl-cu",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-cu",
      formula: "ClCu",
      name: "Cuprous chloride",
    },
    source: {
      pubChemCid: 62652,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62652",
    },
  },
  {
    formulaKey: "F:1|Ag:1",
    id: "extended:f-ag",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f-ag",
      formula: "AgF",
      name: "Caswell No. 736",
    },
    source: {
      pubChemCid: 62656,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62656",
    },
  },
  {
    formulaKey: "F:1|Tl:1",
    id: "extended:f-tl",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
      {
        cardId: "element:tl",
        elementSymbol: "Tl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f-tl",
      formula: "FTl",
      name: "Thallium fluoride",
    },
    source: {
      pubChemCid: 62675,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62675",
    },
  },
  {
    formulaKey: "Br:1|Tl:1",
    id: "extended:br-tl",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
      {
        cardId: "element:tl",
        elementSymbol: "Tl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br-tl",
      formula: "BrTl",
      name: "Thallium bromide",
    },
    source: {
      pubChemCid: 62677,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62677",
    },
  },
  {
    formulaKey: "I:1|Tl:1",
    id: "extended:i-tl",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
      {
        cardId: "element:tl",
        elementSymbol: "Tl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:i-tl",
      formula: "ITl",
      name: "Thallium iodide (TlI)",
    },
    source: {
      pubChemCid: 62679,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62679",
    },
  },
  {
    formulaKey: "Cl:1|Rb:1",
    id: "extended:cl-rb",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:rb",
        elementSymbol: "Rb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-rb",
      formula: "ClRb",
      name: "Rubidium Chloride",
    },
    source: {
      pubChemCid: 62683,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62683",
    },
  },
  {
    formulaKey: "H:1|Li:1",
    id: "extended:h-li",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-li",
      formula: "HLi",
      name: "Lithium hydride",
    },
    source: {
      pubChemCid: 62714,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62714",
    },
  },
  {
    formulaKey: "Ni:1|Te:1",
    id: "extended:ni-te",
    ingredients: [
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:ni-te",
      formula: "NiTe",
      name: "NICKEL TELLURIDE (NiTe)",
    },
    source: {
      pubChemCid: 62780,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62780",
    },
  },
  {
    formulaKey: "Br:1|Ag:1",
    id: "extended:br-ag",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br-ag",
      formula: "AgBr",
      name: "Silver bromide",
    },
    source: {
      pubChemCid: 66199,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66199",
    },
  },
  {
    formulaKey: "B:1|N:1",
    id: "extended:b-n",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-n",
      formula: "BN",
      name: "Boron Nitride",
    },
    source: {
      pubChemCid: 66227,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66227",
    },
  },
  {
    formulaKey: "O:1|Si:1",
    id: "extended:o-si",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:si",
        elementSymbol: "Si",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-si",
      formula: "OSi",
      name: "Silicon oxide (SiO)",
    },
    source: {
      pubChemCid: 66241,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66241",
    },
  },
  {
    formulaKey: "Li:1|I:1",
    id: "extended:li-i",
    ingredients: [
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:li-i",
      formula: "ILi",
      name: "Lithium iodide",
    },
    source: {
      pubChemCid: 66321,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66321",
    },
  },
  {
    formulaKey: "Mg:1|Se:1",
    id: "extended:mg-se",
    ingredients: [
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:mg-se",
      formula: "MgSe",
      name: "Magnesium selenide",
    },
    source: {
      pubChemCid: 73969,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73969",
    },
  },
  {
    formulaKey: "Mn:1|Se:1",
    id: "extended:mn-se",
    ingredients: [
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:mn-se",
      formula: "MnSe",
      name: "Manganese selenide",
    },
    source: {
      pubChemCid: 73970,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73970",
    },
  },
  {
    formulaKey: "O:1|Pd:1",
    id: "extended:o-pd",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:pd",
        elementSymbol: "Pd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-pd",
      formula: "OPd",
      name: "Palladium oxide",
    },
    source: {
      pubChemCid: 73974,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73974",
    },
  },
  {
    formulaKey: "O:1|Sr:1",
    id: "extended:o-sr",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-sr",
      formula: "OSr",
      name: "Strontium oxide",
    },
    source: {
      pubChemCid: 73975,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73975",
    },
  },
  {
    formulaKey: "Se:1|Sr:1",
    id: "extended:se-sr",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se-sr",
      formula: "SeSr",
      name: "Einecs 215-258-1",
    },
    source: {
      pubChemCid: 73978,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73978",
    },
  },
  {
    formulaKey: "Cu:1|Se:1",
    id: "extended:cu-se",
    ingredients: [
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cu-se",
      formula: "CuSe",
      name: "Copper selenide (CuSe)",
    },
    source: {
      pubChemCid: 73980,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73980",
    },
  },
  {
    formulaKey: "Li:1|Br:1",
    id: "extended:li-br",
    ingredients: [
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:li-br",
      formula: "BrLi",
      name: "Lithium Bromide",
    },
    source: {
      pubChemCid: 82050,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82050",
    },
  },
  {
    formulaKey: "H:1|K:1",
    id: "extended:h-k",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-k",
      formula: "HK",
      name: "Potassium hydride",
    },
    source: {
      pubChemCid: 82127,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82127",
    },
  },
  {
    formulaKey: "Br:1|I:1",
    id: "extended:br-i",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br-i",
      formula: "BrI",
      name: "Iodine bromide (IBr)",
    },
    source: {
      pubChemCid: 82238,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82238",
    },
  },
  {
    formulaKey: "I:1|Au:1",
    id: "extended:i-au",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
      {
        cardId: "element:au",
        elementSymbol: "Au",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:i-au",
      formula: "AuI",
      name: "Gold monoiodide",
    },
    source: {
      pubChemCid: 82526,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82526",
    },
  },
  {
    formulaKey: "As:1|Dy:1",
    id: "extended:as-dy",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:dy",
        elementSymbol: "Dy",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-dy",
      formula: "AsDy",
      name: "Dysprosium arsenide (DyAs)",
    },
    source: {
      pubChemCid: 82779,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82779",
    },
  },
  {
    formulaKey: "As:1|Gd:1",
    id: "extended:as-gd",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:gd",
        elementSymbol: "Gd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-gd",
      formula: "AsGd",
      name: "Gadolinium arsenide (GdAs)",
    },
    source: {
      pubChemCid: 82780,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82780",
    },
  },
  {
    formulaKey: "As:1|Ho:1",
    id: "extended:as-ho",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:ho",
        elementSymbol: "Ho",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-ho",
      formula: "AsHo",
      name: "Holmium arsenide (HoAs)",
    },
    source: {
      pubChemCid: 82781,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82781",
    },
  },
  {
    formulaKey: "As:1|Lu:1",
    id: "extended:as-lu",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:lu",
        elementSymbol: "Lu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-lu",
      formula: "AsLu",
      name: "Lutetium arsenide (LuAs)",
    },
    source: {
      pubChemCid: 82782,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82782",
    },
  },
  {
    formulaKey: "Mn:1|As:1",
    id: "extended:mn-as",
    ingredients: [
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:mn-as",
      formula: "AsMn",
      name: "Manganese arsenide (MnAs)",
    },
    source: {
      pubChemCid: 82783,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82783",
    },
  },
  {
    formulaKey: "As:1|Tb:1",
    id: "extended:as-tb",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:tb",
        elementSymbol: "Tb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-tb",
      formula: "AsTb",
      name: "Terbium arsenide (TbAs)",
    },
    source: {
      pubChemCid: 82784,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82784",
    },
  },
  {
    formulaKey: "As:1|Tl:1",
    id: "extended:as-tl",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:tl",
        elementSymbol: "Tl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-tl",
      formula: "AsTl",
      name: "Thallium arsenide (TlAs)",
    },
    source: {
      pubChemCid: 82785,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82785",
    },
  },
  {
    formulaKey: "As:1|Tm:1",
    id: "extended:as-tm",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:tm",
        elementSymbol: "Tm",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-tm",
      formula: "AsTm",
      name: "Thulium arsenide (TmAs)",
    },
    source: {
      pubChemCid: 82786,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82786",
    },
  },
  {
    formulaKey: "As:1|Yb:1",
    id: "extended:as-yb",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:yb",
        elementSymbol: "Yb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-yb",
      formula: "AsYb",
      name: "Ytterbium arsenide (YbAs)",
    },
    source: {
      pubChemCid: 82787,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82787",
    },
  },
  {
    formulaKey: "B:1|Cr:1",
    id: "extended:b-cr",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:cr",
        elementSymbol: "Cr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-cr",
      formula: "BCr",
      name: "Chromium boride (CrB)",
    },
    source: {
      pubChemCid: 82788,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82788",
    },
  },
  {
    formulaKey: "B:1|Fe:1",
    id: "extended:b-fe",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-fe",
      formula: "BFe",
      name: "Iron boride (FeB)",
    },
    source: {
      pubChemCid: 82789,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82789",
    },
  },
  {
    formulaKey: "B:1|Mo:1",
    id: "extended:b-mo",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-mo",
      formula: "BMo",
      name: "Molybdenum boride",
    },
    source: {
      pubChemCid: 82790,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82790",
    },
  },
  {
    formulaKey: "B:1|Ni:1",
    id: "extended:b-ni",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-ni",
      formula: "BNi",
      name: "nickel boride (NiB)",
    },
    source: {
      pubChemCid: 82791,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82791",
    },
  },
  {
    formulaKey: "B:1|Ta:1",
    id: "extended:b-ta",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:ta",
        elementSymbol: "Ta",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-ta",
      formula: "BTa",
      name: "Tantalum boride (TaB)",
    },
    source: {
      pubChemCid: 82792,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82792",
    },
  },
  {
    formulaKey: "B:1|W:1",
    id: "extended:b-w",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-w",
      formula: "BW",
      name: "Tungsten boride",
    },
    source: {
      pubChemCid: 82793,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82793",
    },
  },
  {
    formulaKey: "Te:1|Ba:1",
    id: "extended:te-ba",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
      {
        cardId: "element:ba",
        elementSymbol: "Ba",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te-ba",
      formula: "BaTe",
      name: "Barium telluride (BaTe)",
    },
    source: {
      pubChemCid: 82796,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82796",
    },
  },
  {
    formulaKey: "Ca:1|Te:1",
    id: "extended:ca-te",
    ingredients: [
      {
        cardId: "element:ca",
        elementSymbol: "Ca",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:ca-te",
      formula: "CaTe",
      name: "Calcium telluride (CaTe)",
    },
    source: {
      pubChemCid: 82797,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82797",
    },
  },
  {
    formulaKey: "Co:1|Te:1",
    id: "extended:co-te",
    ingredients: [
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:co-te",
      formula: "CoTe",
      name: "Cobalt telluride (CoTe)",
    },
    source: {
      pubChemCid: 82799,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82799",
    },
  },
  {
    formulaKey: "Cu:1|Te:1",
    id: "extended:cu-te",
    ingredients: [
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cu-te",
      formula: "CuTe",
      name: "Copper telluride (CuTe)",
    },
    source: {
      pubChemCid: 82801,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82801",
    },
  },
  {
    formulaKey: "N:1|Dy:1",
    id: "extended:n-dy",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:dy",
        elementSymbol: "Dy",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-dy",
      formula: "DyN",
      name: "Dysprosium nitride (DyN)",
    },
    source: {
      pubChemCid: 82803,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82803",
    },
  },
  {
    formulaKey: "P:1|Dy:1",
    id: "extended:p-dy",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:dy",
        elementSymbol: "Dy",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-dy",
      formula: "DyP",
      name: "Dysprosium phosphide (DyP)",
    },
    source: {
      pubChemCid: 82804,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82804",
    },
  },
  {
    formulaKey: "N:1|Er:1",
    id: "extended:n-er",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:er",
        elementSymbol: "Er",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-er",
      formula: "ErN",
      name: "Erbium nitride (ErN)",
    },
    source: {
      pubChemCid: 82806,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82806",
    },
  },
  {
    formulaKey: "N:1|Eu:1",
    id: "extended:n-eu",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:eu",
        elementSymbol: "Eu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-eu",
      formula: "EuN",
      name: "Europium nitride (EuN)",
    },
    source: {
      pubChemCid: 82808,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82808",
    },
  },
  {
    formulaKey: "S:1|Eu:1",
    id: "extended:s-eu",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:eu",
        elementSymbol: "Eu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-eu",
      formula: "EuS",
      name: "Europium sulfide (EuS)",
    },
    source: {
      pubChemCid: 82809,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82809",
    },
  },
  {
    formulaKey: "Se:1|Eu:1",
    id: "extended:se-eu",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
      {
        cardId: "element:eu",
        elementSymbol: "Eu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se-eu",
      formula: "EuSe",
      name: "Europium selenide (EuSe)",
    },
    source: {
      pubChemCid: 82810,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82810",
    },
  },
  {
    formulaKey: "Te:1|Eu:1",
    id: "extended:te-eu",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
      {
        cardId: "element:eu",
        elementSymbol: "Eu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te-eu",
      formula: "EuTe",
      name: "Europium telluride (EuTe)",
    },
    source: {
      pubChemCid: 82811,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82811",
    },
  },
  {
    formulaKey: "P:1|Gd:1",
    id: "extended:p-gd",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:gd",
        elementSymbol: "Gd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-gd",
      formula: "GdP",
      name: "Gadolinium phosphide (GdP)",
    },
    source: {
      pubChemCid: 82814,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82814",
    },
  },
  {
    formulaKey: "N:1|Ho:1",
    id: "extended:n-ho",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:ho",
        elementSymbol: "Ho",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-ho",
      formula: "HoN",
      name: "Holmium nitride (HoN)",
    },
    source: {
      pubChemCid: 82818,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82818",
    },
  },
  {
    formulaKey: "P:1|Ho:1",
    id: "extended:p-ho",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:ho",
        elementSymbol: "Ho",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-ho",
      formula: "HoP",
      name: "Holmium phosphide (HoP)",
    },
    source: {
      pubChemCid: 82819,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82819",
    },
  },
  {
    formulaKey: "P:1|Lu:1",
    id: "extended:p-lu",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:lu",
        elementSymbol: "Lu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-lu",
      formula: "LuP",
      name: "Lutetium phosphide (LuP)",
    },
    source: {
      pubChemCid: 82822,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82822",
    },
  },
  {
    formulaKey: "Mg:1|S:1",
    id: "extended:mg-s",
    ingredients: [
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:mg-s",
      formula: "MgS",
      name: "Magnesium sulfide",
    },
    source: {
      pubChemCid: 82824,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82824",
    },
  },
  {
    formulaKey: "Mg:1|Te:1",
    id: "extended:mg-te",
    ingredients: [
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:mg-te",
      formula: "MgTe",
      name: "Magnesium telluride (MgTe)",
    },
    source: {
      pubChemCid: 82825,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82825",
    },
  },
  {
    formulaKey: "P:1|Mn:1",
    id: "extended:p-mn",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-mn",
      formula: "MnP",
      name: "Manganese phosphide (MnP)",
    },
    source: {
      pubChemCid: 82826,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82826",
    },
  },
  {
    formulaKey: "Mn:1|Te:1",
    id: "extended:mn-te",
    ingredients: [
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:mn-te",
      formula: "MnTe",
      name: "Manganese telluride (MnTe)",
    },
    source: {
      pubChemCid: 82828,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82828",
    },
  },
  {
    formulaKey: "N:1|Mo:1",
    id: "extended:n-mo",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-mo",
      formula: "MoN",
      name: "Molybdenum nitride (MoN)",
    },
    source: {
      pubChemCid: 82830,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82830",
    },
  },
  {
    formulaKey: "N:1|Ta:1",
    id: "extended:n-ta",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:ta",
        elementSymbol: "Ta",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-ta",
      formula: "NTa",
      name: "Tantalum nitride (TaN)",
    },
    source: {
      pubChemCid: 82832,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82832",
    },
  },
  {
    formulaKey: "N:1|Tb:1",
    id: "extended:n-tb",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:tb",
        elementSymbol: "Tb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-tb",
      formula: "NTb",
      name: "Terbium nitride (TbN)",
    },
    source: {
      pubChemCid: 82833,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82833",
    },
  },
  {
    formulaKey: "N:1|Tm:1",
    id: "extended:n-tm",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:tm",
        elementSymbol: "Tm",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-tm",
      formula: "NTm",
      name: "Thulium nitride (TmN)",
    },
    source: {
      pubChemCid: 82834,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82834",
    },
  },
  {
    formulaKey: "O:1|Nb:1",
    id: "extended:o-nb",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-nb",
      formula: "NbO",
      name: "Niobium oxide (NbO)",
    },
    source: {
      pubChemCid: 82838,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82838",
    },
  },
  {
    formulaKey: "P:1|Nb:1",
    id: "extended:p-nb",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-nb",
      formula: "NbP",
      name: "Niobium phosphide (NbP)",
    },
    source: {
      pubChemCid: 82840,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82840",
    },
  },
  {
    formulaKey: "O:1|Pt:1",
    id: "extended:o-pt",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:pt",
        elementSymbol: "Pt",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-pt",
      formula: "OPt",
      name: "Platinum oxide (PtO)",
    },
    source: {
      pubChemCid: 82844,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82844",
    },
  },
  {
    formulaKey: "P:1|Ta:1",
    id: "extended:p-ta",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:ta",
        elementSymbol: "Ta",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-ta",
      formula: "PTa",
      name: "Tantalum phosphide (TaP)",
    },
    source: {
      pubChemCid: 82854,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82854",
    },
  },
  {
    formulaKey: "P:1|Tb:1",
    id: "extended:p-tb",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:tb",
        elementSymbol: "Tb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-tb",
      formula: "PTb",
      name: "Terbium phosphide (TbP)",
    },
    source: {
      pubChemCid: 82855,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82855",
    },
  },
  {
    formulaKey: "P:1|Ti:1",
    id: "extended:p-ti",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-ti",
      formula: "PTi",
      name: "Titanium phosphide (tip)",
    },
    source: {
      pubChemCid: 82856,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82856",
    },
  },
  {
    formulaKey: "P:1|Tm:1",
    id: "extended:p-tm",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:tm",
        elementSymbol: "Tm",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-tm",
      formula: "PTm",
      name: "Thulium phosphide (TmP)",
    },
    source: {
      pubChemCid: 82857,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82857",
    },
  },
  {
    formulaKey: "P:1|W:1",
    id: "extended:p-w",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-w",
      formula: "PW",
      name: "Tungsten phosphide (WP)",
    },
    source: {
      pubChemCid: 82858,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82858",
    },
  },
  {
    formulaKey: "P:1|Yb:1",
    id: "extended:p-yb",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:yb",
        elementSymbol: "Yb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-yb",
      formula: "PYb",
      name: "Ytterbium phosphide (YbP)",
    },
    source: {
      pubChemCid: 82859,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82859",
    },
  },
  {
    formulaKey: "P:1|Zr:1",
    id: "extended:p-zr",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:zr",
        elementSymbol: "Zr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-zr",
      formula: "PZr",
      name: "Zirconium phosphide (ZrP)",
    },
    source: {
      pubChemCid: 82860,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82860",
    },
  },
  {
    formulaKey: "S:1|Pt:1",
    id: "extended:s-pt",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:pt",
        elementSymbol: "Pt",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-pt",
      formula: "PtS",
      name: "Platinum sulfide (PtS)",
    },
    source: {
      pubChemCid: 82861,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82861",
    },
  },
  {
    formulaKey: "Se:1|Tm:1",
    id: "extended:se-tm",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
      {
        cardId: "element:tm",
        elementSymbol: "Tm",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se-tm",
      formula: "SeTm",
      name: "Thulium selenide (TmSe)",
    },
    source: {
      pubChemCid: 82871,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82871",
    },
  },
  {
    formulaKey: "Se:1|Yb:1",
    id: "extended:se-yb",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
      {
        cardId: "element:yb",
        elementSymbol: "Yb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se-yb",
      formula: "SeYb",
      name: "Ytterbium selenide (YbSe)",
    },
    source: {
      pubChemCid: 82872,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82872",
    },
  },
  {
    formulaKey: "Sr:1|Te:1",
    id: "extended:sr-te",
    ingredients: [
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:sr-te",
      formula: "SrTe",
      name: "Strontium telluride (SrTe)",
    },
    source: {
      pubChemCid: 82874,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82874",
    },
  },
  {
    formulaKey: "Fe:1|As:1",
    id: "extended:fe-as",
    ingredients: [
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:fe-as",
      formula: "AsFe",
      name: "Iron arsenide (FeAs)",
    },
    source: {
      pubChemCid: 82876,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82876",
    },
  },
  {
    formulaKey: "As:1|Pr:1",
    id: "extended:as-pr",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:pr",
        elementSymbol: "Pr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-pr",
      formula: "AsPr",
      name: "Praseodymium arsenide (PrAs)",
    },
    source: {
      pubChemCid: 82880,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82880",
    },
  },
  {
    formulaKey: "B:1|Mn:1",
    id: "extended:b-mn",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-mn",
      formula: "BMn",
      name: "Manganese boride (MnB)",
    },
    source: {
      pubChemCid: 82881,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82881",
    },
  },
  {
    formulaKey: "B:1|Nb:1",
    id: "extended:b-nb",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-nb",
      formula: "BNb",
      name: "Niobium boride (NbB)",
    },
    source: {
      pubChemCid: 82882,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82882",
    },
  },
  {
    formulaKey: "B:1|V:1",
    id: "extended:b-v",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b-v",
      formula: "BV",
      name: "Vanadium boride (VB)",
    },
    source: {
      pubChemCid: 82883,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82883",
    },
  },
  {
    formulaKey: "Cr:1|Se:1",
    id: "extended:cr-se",
    ingredients: [
      {
        cardId: "element:cr",
        elementSymbol: "Cr",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cr-se",
      formula: "CrSe",
      name: "Chromium selenide (CrSe)",
    },
    source: {
      pubChemCid: 82886,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82886",
    },
  },
  {
    formulaKey: "N:1|W:1",
    id: "extended:n-w",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-w",
      formula: "NW",
      name: "Tungsten nitride (WN)",
    },
    source: {
      pubChemCid: 82895,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82895",
    },
  },
  {
    formulaKey: "P:1|Ga:1",
    id: "extended:p-ga",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:ga",
        elementSymbol: "Ga",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-ga",
      formula: "GaP",
      name: "Gallium phosphide",
    },
    source: {
      pubChemCid: 82901,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82901",
    },
  },
  {
    formulaKey: "P:1|Pr:1",
    id: "extended:p-pr",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:pr",
        elementSymbol: "Pr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-pr",
      formula: "PPr",
      name: "Praseodymium phosphide (PrP)",
    },
    source: {
      pubChemCid: 82904,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82904",
    },
  },
  {
    formulaKey: "P:1|Sm:1",
    id: "extended:p-sm",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:sm",
        elementSymbol: "Sm",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-sm",
      formula: "PSm",
      name: "Samarium phosphide (SmP)",
    },
    source: {
      pubChemCid: 82905,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82905",
    },
  },
  {
    formulaKey: "P:1|V:1",
    id: "extended:p-v",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-v",
      formula: "PV",
      name: "Vanadium phosphide (VP)",
    },
    source: {
      pubChemCid: 82906,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82906",
    },
  },
  {
    formulaKey: "Te:1|Hg:1",
    id: "extended:te-hg",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te-hg",
      formula: "HgTe",
      name: "Mercury telluride",
    },
    source: {
      pubChemCid: 82914,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82914",
    },
  },
  {
    formulaKey: "S:1|Pd:1",
    id: "extended:s-pd",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:pd",
        elementSymbol: "Pd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-pd",
      formula: "PdS",
      name: "Palladium sulfide (PdS)",
    },
    source: {
      pubChemCid: 82926,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82926",
    },
  },
  {
    formulaKey: "N:1|Lu:1",
    id: "extended:n-lu",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:lu",
        elementSymbol: "Lu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-lu",
      formula: "LuN",
      name: "Lutetium nitride (LuN)",
    },
    source: {
      pubChemCid: 82927,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82927",
    },
  },
  {
    formulaKey: "Te:1|Yb:1",
    id: "extended:te-yb",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
      {
        cardId: "element:yb",
        elementSymbol: "Yb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te-yb",
      formula: "TeYb",
      name: "Ytterbium telluride (YbTe)",
    },
    source: {
      pubChemCid: 82928,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82928",
    },
  },
  {
    formulaKey: "Fe:1|Te:1",
    id: "extended:fe-te",
    ingredients: [
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:fe-te",
      formula: "FeTe",
      name: "Iron telluride (FeTe)",
    },
    source: {
      pubChemCid: 82929,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82929",
    },
  },
  {
    formulaKey: "P:1|Mo:1",
    id: "extended:p-mo",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-mo",
      formula: "MoP",
      name: "Molybdenum phosphide (MoP)",
    },
    source: {
      pubChemCid: 82956,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82956",
    },
  },
  {
    formulaKey: "S:1|Nb:1",
    id: "extended:s-nb",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-nb",
      formula: "NbS",
      name: "Niobium sulfide (NbS)",
    },
    source: {
      pubChemCid: 82957,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82957",
    },
  },
  {
    formulaKey: "S:1|V:1",
    id: "extended:s-v",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s-v",
      formula: "SV",
      name: "Vanadium sulfide (VS)",
    },
    source: {
      pubChemCid: 82959,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82959",
    },
  },
  {
    formulaKey: "P:1|Sc:1",
    id: "extended:p-sc",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:sc",
        elementSymbol: "Sc",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-sc",
      formula: "PSc",
      name: "Scandium phosphide (ScP)",
    },
    source: {
      pubChemCid: 82969,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82969",
    },
  },
  {
    formulaKey: "P:1|Er:1",
    id: "extended:p-er",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:er",
        elementSymbol: "Er",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:p-er",
      formula: "ErP",
      name: "Erbium phosphide (ErP)",
    },
    source: {
      pubChemCid: 82973,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82973",
    },
  },
  {
    formulaKey: "Be:1|Se:1",
    id: "extended:be-se",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:be-se",
      formula: "BeSe",
      name: "Beryllium selenide (BeSe)",
    },
    source: {
      pubChemCid: 82990,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82990",
    },
  },
  {
    formulaKey: "Be:1|Te:1",
    id: "extended:be-te",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:be-te",
      formula: "BeTe",
      name: "Beryllium telluride",
    },
    source: {
      pubChemCid: 82991,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82991",
    },
  },
  {
    formulaKey: "As:1|Er:1",
    id: "extended:as-er",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:er",
        elementSymbol: "Er",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-er",
      formula: "AsEr",
      name: "Erbium arsenide (ErAs)",
    },
    source: {
      pubChemCid: 82998,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82998",
    },
  },
  {
    formulaKey: "As:1|La:1",
    id: "extended:as-la",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:la",
        elementSymbol: "La",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-la",
      formula: "AsLa",
      name: "Lanthanum arsenide (LaAs)",
    },
    source: {
      pubChemCid: 82999,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82999",
    },
  },
  {
    formulaKey: "As:1|Nb:1",
    id: "extended:as-nb",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:as-nb",
      formula: "AsNb",
      name: "Niobium arsenide (NbAs)",
    },
    source: {
      pubChemCid: 83000,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/83000",
    },
  },
  {
    formulaKey: "O:3",
    id: "extended:o3",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:o3",
      formula: "O3",
      name: "Ozone",
    },
    source: {
      pubChemCid: 24823,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24823",
    },
  },
  {
    formulaKey: "H:2|S:1",
    id: "extended:h2-s",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-s",
      formula: "H2S",
      name: "Hydrogen Sulfide",
    },
    source: {
      pubChemCid: 402,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/402",
    },
  },
  {
    formulaKey: "H:2|Se:1",
    id: "extended:h2-se",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-se",
      formula: "H2Se",
      name: "Hydrogen selenide",
    },
    source: {
      pubChemCid: 533,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/533",
    },
  },
  {
    formulaKey: "N:2|O:1",
    id: "extended:n2-o",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 2,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n2-o",
      formula: "N2O",
      name: "Nitrous Oxide",
    },
    source: {
      pubChemCid: 948,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/948",
    },
  },
  {
    formulaKey: "O:2|S:1",
    id: "extended:o2-s",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-s",
      formula: "O2S",
      name: "Sulfur Dioxide",
    },
    source: {
      pubChemCid: 1119,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/1119",
    },
  },
  {
    formulaKey: "Cl:2|Pt:1",
    id: "extended:cl2-pt",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:pt",
        elementSymbol: "Pt",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-pt",
      formula: "Cl2Pt",
      name: "Platinous chloride",
    },
    source: {
      pubChemCid: 2770,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/2770",
    },
  },
  {
    formulaKey: "Cl:2|Zn:1",
    id: "extended:cl2-zn",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:zn",
        elementSymbol: "Zn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-zn",
      formula: "Cl2Zn",
      name: "Zinc Chloride",
    },
    source: {
      pubChemCid: 5727,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/5727",
    },
  },
  {
    formulaKey: "C:1|S:2",
    id: "extended:c-s2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c-s2",
      formula: "CS2",
      name: "Carbon Disulfide",
    },
    source: {
      pubChemCid: 6348,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/6348",
    },
  },
  {
    formulaKey: "O:2|U:1",
    id: "extended:o2-u",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:u",
        elementSymbol: "U",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-u",
      formula: "O2U",
      name: "Einecs 215-700-3",
    },
    source: {
      pubChemCid: 10916,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/10916",
    },
  },
  {
    formulaKey: "O:2|Ba:1",
    id: "extended:o2-ba",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:ba",
        elementSymbol: "Ba",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-ba",
      formula: "BaO2",
      name: "Barium peroxide",
    },
    source: {
      pubChemCid: 14773,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14773",
    },
  },
  {
    formulaKey: "O:2|Ca:1",
    id: "extended:o2-ca",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:ca",
        elementSymbol: "Ca",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-ca",
      formula: "CaO2",
      name: "Calcium peroxide",
    },
    source: {
      pubChemCid: 14779,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14779",
    },
  },
  {
    formulaKey: "S:2|Fe:1",
    id: "extended:s2-fe",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-fe",
      formula: "FeS2",
      name: "Pyrite",
    },
    source: {
      pubChemCid: 14788,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14788",
    },
  },
  {
    formulaKey: "O:2|Pb:1",
    id: "extended:o2-pb",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-pb",
      formula: "O2Pb",
      name: "Lead dioxide",
    },
    source: {
      pubChemCid: 14793,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14793",
    },
  },
  {
    formulaKey: "O:2|Ge:1",
    id: "extended:o2-ge",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:ge",
        elementSymbol: "Ge",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-ge",
      formula: "GeO2",
      name: "Dioxogermane",
    },
    source: {
      pubChemCid: 14796,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14796",
    },
  },
  {
    formulaKey: "O:2|Mn:1",
    id: "extended:o2-mn",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-mn",
      formula: "MnO2",
      name: "Manganese dioxide",
    },
    source: {
      pubChemCid: 14801,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14801",
    },
  },
  {
    formulaKey: "Na:2|S:1",
    id: "extended:na2-s",
    ingredients: [
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 2,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:na2-s",
      formula: "Na2S",
      name: "Sodium Sulfide",
    },
    source: {
      pubChemCid: 14804,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14804",
    },
  },
  {
    formulaKey: "O:2|Sr:1",
    id: "extended:o2-sr",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-sr",
      formula: "O2Sr",
      name: "Strontium peroxide",
    },
    source: {
      pubChemCid: 14807,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14807",
    },
  },
  {
    formulaKey: "O:2|Th:1",
    id: "extended:o2-th",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:th",
        elementSymbol: "Th",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-th",
      formula: "O2Th",
      name: "THORIUM OXIDE (ThO2)",
    },
    source: {
      pubChemCid: 14808,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14808",
    },
  },
  {
    formulaKey: "S:2|Mo:1",
    id: "extended:s2-mo",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-mo",
      formula: "MoS2",
      name: "Molybdenum disulfide",
    },
    source: {
      pubChemCid: 14823,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14823",
    },
  },
  {
    formulaKey: "H:2|Te:1",
    id: "extended:h2-te",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-te",
      formula: "H2Te",
      name: "Hydrogen telluride",
    },
    source: {
      pubChemCid: 21765,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/21765",
    },
  },
  {
    formulaKey: "H:2|Pb:1",
    id: "extended:h2-pb",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-pb",
      formula: "H2Pb",
      name: "Plumbylidyne",
    },
    source: {
      pubChemCid: 23927,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23927",
    },
  },
  {
    formulaKey: "H:2|Po:1",
    id: "extended:h2-po",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:po",
        elementSymbol: "Po",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-po",
      formula: "H2Po",
      name: "Polonium hydride (PoH2)",
    },
    source: {
      pubChemCid: 23941,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23941",
    },
  },
  {
    formulaKey: "H:2|Sr:1",
    id: "extended:h2-sr",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-sr",
      formula: "H2Sr",
      name: "CID 23955",
    },
    source: {
      pubChemCid: 23955,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23955",
    },
  },
  {
    formulaKey: "H:2|Sn:1",
    id: "extended:h2-sn",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:sn",
        elementSymbol: "Sn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-sn",
      formula: "H2Sn",
      name: "Dihydridotin",
    },
    source: {
      pubChemCid: 23962,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23962",
    },
  },
  {
    formulaKey: "O:2|Se:1",
    id: "extended:o2-se",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-se",
      formula: "O2Se",
      name: "Selenium Dioxide",
    },
    source: {
      pubChemCid: 24007,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24007",
    },
  },
  {
    formulaKey: "Cl:2|Hg:1",
    id: "extended:cl2-hg",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-hg",
      formula: "Cl2Hg",
      name: "Mercuric Chloride",
    },
    source: {
      pubChemCid: 24085,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24085",
    },
  },
  {
    formulaKey: "S:2|Se:1",
    id: "extended:s2-se",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-se",
      formula: "S2Se",
      name: "Selenium disulfide",
    },
    source: {
      pubChemCid: 24087,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24087",
    },
  },
  {
    formulaKey: "Cl:2|Co:1",
    id: "extended:cl2-co",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-co",
      formula: "Cl2Co",
      name: "Cobalt(II) chloride",
    },
    source: {
      pubChemCid: 24288,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24288",
    },
  },
  {
    formulaKey: "Cl:2|Pd:1",
    id: "extended:cl2-pd",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:pd",
        elementSymbol: "Pd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-pd",
      formula: "Cl2Pd",
      name: "Palladium Chloride",
    },
    source: {
      pubChemCid: 24290,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24290",
    },
  },
  {
    formulaKey: "Zn:1|Br:2",
    id: "extended:zn-br2",
    ingredients: [
      {
        cardId: "element:zn",
        elementSymbol: "Zn",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:zn-br2",
      formula: "Br2Zn",
      name: "Zinc bromide (ZnBr2); Zinc Dibromide",
    },
    source: {
      pubChemCid: 24375,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24375",
    },
  },
  {
    formulaKey: "Cl:2|Ni:1",
    id: "extended:cl2-ni",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-ni",
      formula: "Cl2Ni",
      name: "Nickel Dichloride",
    },
    source: {
      pubChemCid: 24385,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24385",
    },
  },
  {
    formulaKey: "Cl:2|Fe:1",
    id: "extended:cl2-fe",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-fe",
      formula: "Cl2Fe",
      name: "Ferrous Chloride",
    },
    source: {
      pubChemCid: 24458,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24458",
    },
  },
  {
    formulaKey: "Cl:2|Pb:1",
    id: "extended:cl2-pb",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-pb",
      formula: "Cl2Pb",
      name: "Lead chloride",
    },
    source: {
      pubChemCid: 24459,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24459",
    },
  },
  {
    formulaKey: "Cl:2|Sn:1",
    id: "extended:cl2-sn",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:sn",
        elementSymbol: "Sn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-sn",
      formula: "Cl2Sn",
      name: "Stannous Chloride",
    },
    source: {
      pubChemCid: 24479,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24479",
    },
  },
  {
    formulaKey: "Cl:2|Mn:1",
    id: "extended:cl2-mn",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-mn",
      formula: "Cl2Mn",
      name: "Manganese (II) chloride",
    },
    source: {
      pubChemCid: 24480,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24480",
    },
  },
  {
    formulaKey: "I:2|Hg:1",
    id: "extended:i2-hg",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:i2-hg",
      formula: "HgI2",
      name: "Mercuric Iodide",
    },
    source: {
      pubChemCid: 24485,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24485",
    },
  },
  {
    formulaKey: "F:2|Mn:1",
    id: "extended:f2-mn",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-mn",
      formula: "F2Mn",
      name: "Manganese difluoride",
    },
    source: {
      pubChemCid: 24528,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24528",
    },
  },
  {
    formulaKey: "F:2|Mg:1",
    id: "extended:f2-mg",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-mg",
      formula: "F2Mg",
      name: "Magnesium fluoride",
    },
    source: {
      pubChemCid: 24546,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24546",
    },
  },
  {
    formulaKey: "O:1|F:2",
    id: "extended:o-f2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o-f2",
      formula: "F2O",
      name: "Oxygen difluoride",
    },
    source: {
      pubChemCid: 24547,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24547",
    },
  },
  {
    formulaKey: "F:2|Pb:1",
    id: "extended:f2-pb",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-pb",
      formula: "F2Pb",
      name: "Lead fluoride",
    },
    source: {
      pubChemCid: 24549,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24549",
    },
  },
  {
    formulaKey: "F:2|Sn:1",
    id: "extended:f2-sn",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:sn",
        elementSymbol: "Sn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-sn",
      formula: "F2Sn",
      name: "Stop",
    },
    source: {
      pubChemCid: 24550,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24550",
    },
  },
  {
    formulaKey: "F:2|Zn:1",
    id: "extended:f2-zn",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:zn",
        elementSymbol: "Zn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-zn",
      formula: "F2Zn",
      name: "Zinc fluoride",
    },
    source: {
      pubChemCid: 24551,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24551",
    },
  },
  {
    formulaKey: "Mg:1|Cl:2",
    id: "extended:mg-cl2",
    ingredients: [
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:mg-cl2",
      formula: "Cl2Mg",
      name: "Magnogene",
    },
    source: {
      pubChemCid: 24584,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24584",
    },
  },
  {
    formulaKey: "Be:1|Cl:2",
    id: "extended:be-cl2",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:be-cl2",
      formula: "BeCl2",
      name: "Beryllium Chloride",
    },
    source: {
      pubChemCid: 24588,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24588",
    },
  },
  {
    formulaKey: "Be:1|F:2",
    id: "extended:be-f2",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:be-f2",
      formula: "BeF2",
      name: "Beryllium Fluoride",
    },
    source: {
      pubChemCid: 24589,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24589",
    },
  },
  {
    formulaKey: "Ca:1|Br:2",
    id: "extended:ca-br2",
    ingredients: [
      {
        cardId: "element:ca",
        elementSymbol: "Ca",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:ca-br2",
      formula: "Br2Ca",
      name: "Calcium bromide, ultra dry, 99.978% (metals basis)",
    },
    source: {
      pubChemCid: 24608,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24608",
    },
  },
  {
    formulaKey: "Br:2|Cd:1",
    id: "extended:br2-cd",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br2-cd",
      formula: "Br2Cd",
      name: "Cadmium bromide (CdBr2)",
    },
    source: {
      pubChemCid: 24609,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24609",
    },
  },
  {
    formulaKey: "Co:1|Br:2",
    id: "extended:co-br2",
    ingredients: [
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:co-br2",
      formula: "Br2Co",
      name: "Cobalt dibromide",
    },
    source: {
      pubChemCid: 24610,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24610",
    },
  },
  {
    formulaKey: "Cu:1|Br:2",
    id: "extended:cu-br2",
    ingredients: [
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:cu-br2",
      formula: "Br2Cu",
      name: "Copper bromide (CuBr2)",
    },
    source: {
      pubChemCid: 24611,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24611",
    },
  },
  {
    formulaKey: "Br:2|Hg:1",
    id: "extended:br2-hg",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br2-hg",
      formula: "Br2Hg",
      name: "Mercury dibromide",
    },
    source: {
      pubChemCid: 24612,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24612",
    },
  },
  {
    formulaKey: "F:2|Ca:1",
    id: "extended:f2-ca",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:ca",
        elementSymbol: "Ca",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-ca",
      formula: "CaF2",
      name: "Fluorite",
    },
    source: {
      pubChemCid: 24617,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24617",
    },
  },
  {
    formulaKey: "Cl:2|Cd:1",
    id: "extended:cl2-cd",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-cd",
      formula: "CdCl2",
      name: "Cadmium chloride, dihydrate",
    },
    source: {
      pubChemCid: 24633,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24633",
    },
  },
  {
    formulaKey: "F:2|Cd:1",
    id: "extended:f2-cd",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-cd",
      formula: "CdF2",
      name: "Cadmium fluoride",
    },
    source: {
      pubChemCid: 24634,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24634",
    },
  },
  {
    formulaKey: "Cd:1|I:2",
    id: "extended:cd-i2",
    ingredients: [
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:cd-i2",
      formula: "CdI2",
      name: "Cadmium iodide",
    },
    source: {
      pubChemCid: 24635,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24635",
    },
  },
  {
    formulaKey: "O:1|Cl:2",
    id: "extended:o-cl2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o-cl2",
      formula: "Cl2O",
      name: "Chlorine monoxide",
    },
    source: {
      pubChemCid: 24646,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24646",
    },
  },
  {
    formulaKey: "F:2|Co:1",
    id: "extended:f2-co",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-co",
      formula: "CoF2",
      name: "Cobalt difluoride",
    },
    source: {
      pubChemCid: 24820,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24820",
    },
  },
  {
    formulaKey: "F:2|Ni:1",
    id: "extended:f2-ni",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-ni",
      formula: "F2Ni",
      name: "Nickel difluoride",
    },
    source: {
      pubChemCid: 24825,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24825",
    },
  },
  {
    formulaKey: "Br:2|Pb:1",
    id: "extended:br2-pb",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br2-pb",
      formula: "Br2Pb",
      name: "Lead (II) bromide",
    },
    source: {
      pubChemCid: 24831,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24831",
    },
  },
  {
    formulaKey: "Cl:2|Ca:1",
    id: "extended:cl2-ca",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:ca",
        elementSymbol: "Ca",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-ca",
      formula: "CaCl2",
      name: "Calol",
    },
    source: {
      pubChemCid: 24854,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24854",
    },
  },
  {
    formulaKey: "O:2|Cl:1",
    id: "extended:o2-cl",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-cl",
      formula: "ClO2",
      name: "Chlorine Dioxide",
    },
    source: {
      pubChemCid: 24870,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24870",
    },
  },
  {
    formulaKey: "Cl:2|Cr:1",
    id: "extended:cl2-cr",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:cr",
        elementSymbol: "Cr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-cr",
      formula: "Cl2Cr",
      name: "Chromium dichloride",
    },
    source: {
      pubChemCid: 24871,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24871",
    },
  },
  {
    formulaKey: "I:2|Pb:1",
    id: "extended:i2-pb",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:i2-pb",
      formula: "I2Pb",
      name: "Lead iodide",
    },
    source: {
      pubChemCid: 24931,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24931",
    },
  },
  {
    formulaKey: "Sn:1|I:2",
    id: "extended:sn-i2",
    ingredients: [
      {
        cardId: "element:sn",
        elementSymbol: "Sn",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:sn-i2",
      formula: "I2Sn",
      name: "Stannous iodide",
    },
    source: {
      pubChemCid: 25138,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25138",
    },
  },
  {
    formulaKey: "Cl:2|Ba:1",
    id: "extended:cl2-ba",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:ba",
        elementSymbol: "Ba",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-ba",
      formula: "BaCl2",
      name: "Barium chloride",
    },
    source: {
      pubChemCid: 25204,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25204",
    },
  },
  {
    formulaKey: "Br:2|Sr:1",
    id: "extended:br2-sr",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br2-sr",
      formula: "Br2Sr",
      name: "Strontium bromide",
    },
    source: {
      pubChemCid: 25302,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25302",
    },
  },
  {
    formulaKey: "Sr:1|I:2",
    id: "extended:sr-i2",
    ingredients: [
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:sr-i2",
      formula: "I2Sr",
      name: "Strontium iodide",
    },
    source: {
      pubChemCid: 25304,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25304",
    },
  },
  {
    formulaKey: "S:1|Cl:2",
    id: "extended:s-cl2",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:s-cl2",
      formula: "Cl2S",
      name: "Sulfur dichloride",
    },
    source: {
      pubChemCid: 25353,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25353",
    },
  },
  {
    formulaKey: "Ni:1|Br:2",
    id: "extended:ni-br2",
    ingredients: [
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:ni-br2",
      formula: "Br2Ni",
      name: "Nickel(2+) dibromide",
    },
    source: {
      pubChemCid: 26037,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26037",
    },
  },
  {
    formulaKey: "Ni:1|I:2",
    id: "extended:ni-i2",
    ingredients: [
      {
        cardId: "element:ni",
        elementSymbol: "Ni",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:ni-i2",
      formula: "I2Ni",
      name: "Nickel(II) iodide",
    },
    source: {
      pubChemCid: 26038,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26038",
    },
  },
  {
    formulaKey: "O:2|Ti:1",
    id: "extended:o2-ti",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-ti",
      formula: "O2Ti",
      name: "Titanium dioxide",
    },
    source: {
      pubChemCid: 26042,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26042",
    },
  },
  {
    formulaKey: "O:2|Sn:1",
    id: "extended:o2-sn",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:sn",
        elementSymbol: "Sn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-sn",
      formula: "O2Sn",
      name: "Cassiterite",
    },
    source: {
      pubChemCid: 29011,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/29011",
    },
  },
  {
    formulaKey: "O:2|Mo:1",
    id: "extended:o2-mo",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-mo",
      formula: "MoO2",
      name: "Molybdenum dioxide",
    },
    source: {
      pubChemCid: 29320,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/29320",
    },
  },
  {
    formulaKey: "Cl:2|Sr:1",
    id: "extended:cl2-sr",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-sr",
      formula: "Cl2Sr",
      name: "Strontium Chloride, Anhydrous",
    },
    source: {
      pubChemCid: 61520,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61520",
    },
  },
  {
    formulaKey: "S:2|Ti:1",
    id: "extended:s2-ti",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-ti",
      formula: "S2Ti",
      name: "Titanium disulfide",
    },
    source: {
      pubChemCid: 61544,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61544",
    },
  },
  {
    formulaKey: "O:2|Mg:1",
    id: "extended:o2-mg",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-mg",
      formula: "MgO2",
      name: "Magnesium peroxide (Mg(O2))",
    },
    source: {
      pubChemCid: 61745,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61745",
    },
  },
  {
    formulaKey: "O:2|Zr:1",
    id: "extended:o2-zr",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:zr",
        elementSymbol: "Zr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-zr",
      formula: "O2Zr",
      name: "Zirconium dioxide",
    },
    source: {
      pubChemCid: 62395,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62395",
    },
  },
  {
    formulaKey: "O:2|Te:1",
    id: "extended:o2-te",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-te",
      formula: "O2Te",
      name: "Tellurium dioxide",
    },
    source: {
      pubChemCid: 62638,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62638",
    },
  },
  {
    formulaKey: "F:2|Ba:1",
    id: "extended:f2-ba",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:ba",
        elementSymbol: "Ba",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-ba",
      formula: "BaF2",
      name: "Barium fluoride",
    },
    source: {
      pubChemCid: 62670,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62670",
    },
  },
  {
    formulaKey: "Mo:1|Te:2",
    id: "extended:mo-te2",
    ingredients: [
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:mo-te2",
      formula: "MoTe2",
      name: "Molybdenum telluride (MoTe2)",
    },
    source: {
      pubChemCid: 64728,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/64728",
    },
  },
  {
    formulaKey: "Br:2|Sn:1",
    id: "extended:br2-sn",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
      {
        cardId: "element:sn",
        elementSymbol: "Sn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br2-sn",
      formula: "Br2Sn",
      name: "Stannous bromide",
    },
    source: {
      pubChemCid: 66224,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66224",
    },
  },
  {
    formulaKey: "Cl:2|Ti:1",
    id: "extended:cl2-ti",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-ti",
      formula: "Cl2Ti",
      name: "Titanium dichloride",
    },
    source: {
      pubChemCid: 66228,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66228",
    },
  },
  {
    formulaKey: "F:2|Cr:1",
    id: "extended:f2-cr",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:cr",
        elementSymbol: "Cr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-cr",
      formula: "CrF2",
      name: "Chromous fluoride",
    },
    source: {
      pubChemCid: 66229,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66229",
    },
  },
  {
    formulaKey: "Ca:1|I:2",
    id: "extended:ca-i2",
    ingredients: [
      {
        cardId: "element:ca",
        elementSymbol: "Ca",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:ca-i2",
      formula: "CaI2",
      name: "Calcium iodide, anhydrous",
    },
    source: {
      pubChemCid: 66244,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66244",
    },
  },
  {
    formulaKey: "Zn:1|I:2",
    id: "extended:zn-i2",
    ingredients: [
      {
        cardId: "element:zn",
        elementSymbol: "Zn",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:zn-i2",
      formula: "I2Zn",
      name: "Zinc iodide",
    },
    source: {
      pubChemCid: 66278,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66278",
    },
  },
  {
    formulaKey: "Mg:1|I:2",
    id: "extended:mg-i2",
    ingredients: [
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:mg-i2",
      formula: "I2Mg",
      name: "Magnesium iodide",
    },
    source: {
      pubChemCid: 66322,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66322",
    },
  },
  {
    formulaKey: "Br:2|Ba:1",
    id: "extended:br2-ba",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
      {
        cardId: "element:ba",
        elementSymbol: "Ba",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br2-ba",
      formula: "BaBr2",
      name: "Barium Bromide, Anhydrous",
    },
    source: {
      pubChemCid: 66350,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66350",
    },
  },
  {
    formulaKey: "Cl:2|V:1",
    id: "extended:cl2-v",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl2-v",
      formula: "Cl2V",
      name: "Vanadium dichloride",
    },
    source: {
      pubChemCid: 66355,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66355",
    },
  },
  {
    formulaKey: "Be:2|C:1",
    id: "extended:be2-c",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 2,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:be2-c",
      formula: "CBe2",
      name: "Beryllium carbide",
    },
    source: {
      pubChemCid: 68173,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/68173",
    },
  },
  {
    formulaKey: "C:1|Se:2",
    id: "extended:c-se2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c-se2",
      formula: "CSe2",
      name: "Carbon diselenide",
    },
    source: {
      pubChemCid: 68174,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/68174",
    },
  },
  {
    formulaKey: "O:2|Ce:1",
    id: "extended:o2-ce",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:ce",
        elementSymbol: "Ce",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-ce",
      formula: "CeO2",
      name: "Ceria",
    },
    source: {
      pubChemCid: 73963,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73963",
    },
  },
  {
    formulaKey: "K:2|Se:1",
    id: "extended:k2-se",
    ingredients: [
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:k2-se",
      formula: "K2Se",
      name: "Potassium selenide",
    },
    source: {
      pubChemCid: 73968,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73968",
    },
  },
  {
    formulaKey: "O:1|Na:2",
    id: "extended:o-na2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o-na2",
      formula: "Na2O",
      name: "Sodium oxide",
    },
    source: {
      pubChemCid: 73971,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73971",
    },
  },
  {
    formulaKey: "Na:2|Se:1",
    id: "extended:na2-se",
    ingredients: [
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:na2-se",
      formula: "Na2Se",
      name: "Sodium selenide",
    },
    source: {
      pubChemCid: 73973,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73973",
    },
  },
  {
    formulaKey: "O:2|Pt:1",
    id: "extended:o2-pt",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:pt",
        elementSymbol: "Pt",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-pt",
      formula: "O2Pt",
      name: "Platinum oxide",
    },
    source: {
      pubChemCid: 73976,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73976",
    },
  },
  {
    formulaKey: "S:2|Sn:1",
    id: "extended:s2-sn",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:sn",
        elementSymbol: "Sn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-sn",
      formula: "S2Sn",
      name: "Mosaic gold",
    },
    source: {
      pubChemCid: 73977,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/73977",
    },
  },
  {
    formulaKey: "F:2|Hg:1",
    id: "extended:f2-hg",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-hg",
      formula: "F2Hg",
      name: "Mercury fluoride (HgF2)",
    },
    source: {
      pubChemCid: 82209,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82209",
    },
  },
  {
    formulaKey: "F:2|Sr:1",
    id: "extended:f2-sr",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:sr",
        elementSymbol: "Sr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-sr",
      formula: "F2Sr",
      name: "Strontium fluoride",
    },
    source: {
      pubChemCid: 82210,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82210",
    },
  },
  {
    formulaKey: "Fe:1|I:2",
    id: "extended:fe-i2",
    ingredients: [
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:fe-i2",
      formula: "FeI2",
      name: "Ferrous Iodide",
    },
    source: {
      pubChemCid: 82220,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82220",
    },
  },
  {
    formulaKey: "F:2|Ag:1",
    id: "extended:f2-ag",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-ag",
      formula: "AgF2",
      name: "Silver fluoride (AgF2)",
    },
    source: {
      pubChemCid: 82221,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82221",
    },
  },
  {
    formulaKey: "Be:1|Br:2",
    id: "extended:be-br2",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:be-br2",
      formula: "BeBr2",
      name: "Beryllium bromide",
    },
    source: {
      pubChemCid: 82230,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82230",
    },
  },
  {
    formulaKey: "Be:1|I:2",
    id: "extended:be-i2",
    ingredients: [
      {
        cardId: "element:be",
        elementSymbol: "Be",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:be-i2",
      formula: "BeI2",
      name: "Beryllium iodide",
    },
    source: {
      pubChemCid: 82231,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82231",
    },
  },
  {
    formulaKey: "F:2|Cu:1",
    id: "extended:f2-cu",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-cu",
      formula: "CuF2",
      name: "Copper(II) fluoride, anhydrous",
    },
    source: {
      pubChemCid: 82236,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82236",
    },
  },
  {
    formulaKey: "F:2|Fe:1",
    id: "extended:f2-fe",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f2-fe",
      formula: "F2Fe",
      name: "Ferrous fluoride",
    },
    source: {
      pubChemCid: 82237,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82237",
    },
  },
  {
    formulaKey: "Fe:1|Br:2",
    id: "extended:fe-br2",
    ingredients: [
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:fe-br2",
      formula: "Br2Fe",
      name: "Ferrous bromide",
    },
    source: {
      pubChemCid: 82240,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82240",
    },
  },
  {
    formulaKey: "Mg:1|Br:2",
    id: "extended:mg-br2",
    ingredients: [
      {
        cardId: "element:mg",
        elementSymbol: "Mg",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:mg-br2",
      formula: "Br2Mg",
      name: "Magnesium Bromide",
    },
    source: {
      pubChemCid: 82241,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82241",
    },
  },
  {
    formulaKey: "Mn:1|I:2",
    id: "extended:mn-i2",
    ingredients: [
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:mn-i2",
      formula: "I2Mn",
      name: "Manganese iodide",
    },
    source: {
      pubChemCid: 82250,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82250",
    },
  },
  {
    formulaKey: "Pd:1|I:2",
    id: "extended:pd-i2",
    ingredients: [
      {
        cardId: "element:pd",
        elementSymbol: "Pd",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:pd-i2",
      formula: "I2Pd",
      name: "Palladium(2+);diiodide",
    },
    source: {
      pubChemCid: 82251,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82251",
    },
  },
  {
    formulaKey: "I:2|Pt:1",
    id: "extended:i2-pt",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
      {
        cardId: "element:pt",
        elementSymbol: "Pt",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:i2-pt",
      formula: "I2Pt",
      name: "Platinous iodide",
    },
    source: {
      pubChemCid: 82252,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82252",
    },
  },
  {
    formulaKey: "B:2|Mo:1",
    id: "extended:b2-mo",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 2,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b2-mo",
      formula: "B2Mo",
      name: "Molybdenum boride (MoB2)",
    },
    source: {
      pubChemCid: 82794,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82794",
    },
  },
  {
    formulaKey: "B:2|U:1",
    id: "extended:b2-u",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 2,
      },
      {
        cardId: "element:u",
        elementSymbol: "U",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b2-u",
      formula: "B2U",
      name: "Uranium boride (UB2)",
    },
    source: {
      pubChemCid: 82795,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82795",
    },
  },
  {
    formulaKey: "Fe:1|Te:2",
    id: "extended:fe-te2",
    ingredients: [
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:fe-te2",
      formula: "FeTe2",
      name: "Iron telluride (FeTe2)",
    },
    source: {
      pubChemCid: 82813,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82813",
    },
  },
  {
    formulaKey: "S:2|Ge:1",
    id: "extended:s2-ge",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:ge",
        elementSymbol: "Ge",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-ge",
      formula: "GeS2",
      name: "Germanium sulfide (GeS2)",
    },
    source: {
      pubChemCid: 82816,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82816",
    },
  },
  {
    formulaKey: "O:2|Ir:1",
    id: "extended:o2-ir",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:ir",
        elementSymbol: "Ir",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-ir",
      formula: "IrO2",
      name: "Iridium oxide (IrO2)",
    },
    source: {
      pubChemCid: 82821,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82821",
    },
  },
  {
    formulaKey: "Mn:1|Te:2",
    id: "extended:mn-te2",
    ingredients: [
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:mn-te2",
      formula: "MnTe2",
      name: "Manganese telluride (MnTe2)",
    },
    source: {
      pubChemCid: 82829,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82829",
    },
  },
  {
    formulaKey: "Na:2|Te:1",
    id: "extended:na2-te",
    ingredients: [
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 2,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:na2-te",
      formula: "Na2Te",
      name: "Disodium telluride",
    },
    source: {
      pubChemCid: 82837,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82837",
    },
  },
  {
    formulaKey: "O:2|Nb:1",
    id: "extended:o2-nb",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-nb",
      formula: "NbO2",
      name: "Niobium dioxide",
    },
    source: {
      pubChemCid: 82839,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82839",
    },
  },
  {
    formulaKey: "Se:2|Nb:1",
    id: "extended:se2-nb",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-nb",
      formula: "NbSe2",
      name: "Niobium selenide (NbSe2)",
    },
    source: {
      pubChemCid: 82841,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82841",
    },
  },
  {
    formulaKey: "Nb:1|Te:2",
    id: "extended:nb-te2",
    ingredients: [
      {
        cardId: "element:nb",
        elementSymbol: "Nb",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:nb-te2",
      formula: "NbTe2",
      name: "Niobium telluride (NbTe2)",
    },
    source: {
      pubChemCid: 82842,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82842",
    },
  },
  {
    formulaKey: "O:2|Pd:1",
    id: "extended:o2-pd",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:pd",
        elementSymbol: "Pd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-pd",
      formula: "O2Pd",
      name: "Palladium oxide (PdO2)",
    },
    source: {
      pubChemCid: 82845,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82845",
    },
  },
  {
    formulaKey: "O:2|Pr:1",
    id: "extended:o2-pr",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:pr",
        elementSymbol: "Pr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-pr",
      formula: "O2Pr",
      name: "Praseodymium oxide (PrO2)",
    },
    source: {
      pubChemCid: 82846,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82846",
    },
  },
  {
    formulaKey: "O:2|Re:1",
    id: "extended:o2-re",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:re",
        elementSymbol: "Re",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-re",
      formula: "O2Re",
      name: "Rhenium oxide (ReO2)",
    },
    source: {
      pubChemCid: 82847,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82847",
    },
  },
  {
    formulaKey: "O:2|Ru:1",
    id: "extended:o2-ru",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:ru",
        elementSymbol: "Ru",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-ru",
      formula: "O2Ru",
      name: "Ruthenium dioxide",
    },
    source: {
      pubChemCid: 82848,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82848",
    },
  },
  {
    formulaKey: "O:2|V:1",
    id: "extended:o2-v",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-v",
      formula: "O2V",
      name: "Vanadium dioxide",
    },
    source: {
      pubChemCid: 82849,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82849",
    },
  },
  {
    formulaKey: "O:2|W:1",
    id: "extended:o2-w",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-w",
      formula: "O2W",
      name: "Tungsten dioxide",
    },
    source: {
      pubChemCid: 82850,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82850",
    },
  },
  {
    formulaKey: "S:2|Pt:1",
    id: "extended:s2-pt",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:pt",
        elementSymbol: "Pt",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-pt",
      formula: "PtS2",
      name: "Platinum sulfide (PtS2)",
    },
    source: {
      pubChemCid: 82862,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82862",
    },
  },
  {
    formulaKey: "S:2|Re:1",
    id: "extended:s2-re",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:re",
        elementSymbol: "Re",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-re",
      formula: "ReS2",
      name: "Rhenium sulfide (ReS2)",
    },
    source: {
      pubChemCid: 82864,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82864",
    },
  },
  {
    formulaKey: "Se:2|Re:1",
    id: "extended:se2-re",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:re",
        elementSymbol: "Re",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-re",
      formula: "ReSe2",
      name: "Rhenium selenide (ReSe2)",
    },
    source: {
      pubChemCid: 82865,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82865",
    },
  },
  {
    formulaKey: "S:2|U:1",
    id: "extended:s2-u",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:u",
        elementSymbol: "U",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-u",
      formula: "S2U",
      name: "Uranium sulfide (US2)",
    },
    source: {
      pubChemCid: 82866,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82866",
    },
  },
  {
    formulaKey: "S:2|Zr:1",
    id: "extended:s2-zr",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:zr",
        elementSymbol: "Zr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-zr",
      formula: "S2Zr",
      name: "Zirconium sulfide (ZrS2)",
    },
    source: {
      pubChemCid: 82867,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82867",
    },
  },
  {
    formulaKey: "Se:2|Ta:1",
    id: "extended:se2-ta",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:ta",
        elementSymbol: "Ta",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-ta",
      formula: "Se2Ta",
      name: "Tantalum selenide (TaSe2)",
    },
    source: {
      pubChemCid: 82873,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82873",
    },
  },
  {
    formulaKey: "Se:2|Mo:1",
    id: "extended:se2-mo",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-mo",
      formula: "MoSe2",
      name: "Molybdenum diselenide",
    },
    source: {
      pubChemCid: 82894,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82894",
    },
  },
  {
    formulaKey: "Ge:1|Se:2",
    id: "extended:ge-se2",
    ingredients: [
      {
        cardId: "element:ge",
        elementSymbol: "Ge",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:ge-se2",
      formula: "GeSe2",
      name: "Germanium selenide (GeSe2)",
    },
    source: {
      pubChemCid: 82903,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82903",
    },
  },
  {
    formulaKey: "Te:2|Re:1",
    id: "extended:te2-re",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
      {
        cardId: "element:re",
        elementSymbol: "Re",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te2-re",
      formula: "ReTe2",
      name: "Rhenium telluride (ReTe2)",
    },
    source: {
      pubChemCid: 82908,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82908",
    },
  },
  {
    formulaKey: "Ti:1|Se:2",
    id: "extended:ti-se2",
    ingredients: [
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:ti-se2",
      formula: "Se2Ti",
      name: "Titanium selenide (TiSe2)",
    },
    source: {
      pubChemCid: 82909,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82909",
    },
  },
  {
    formulaKey: "Se:2|W:1",
    id: "extended:se2-w",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-w",
      formula: "Se2W",
      name: "Tungsten selenide (WSe2)",
    },
    source: {
      pubChemCid: 82910,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82910",
    },
  },
  {
    formulaKey: "Te:2|Ta:1",
    id: "extended:te2-ta",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
      {
        cardId: "element:ta",
        elementSymbol: "Ta",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te2-ta",
      formula: "TaTe2",
      name: "Tantalum telluride (TaTe2)",
    },
    source: {
      pubChemCid: 82911,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82911",
    },
  },
  {
    formulaKey: "Ti:1|Te:2",
    id: "extended:ti-te2",
    ingredients: [
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:ti-te2",
      formula: "Te2Ti",
      name: "Titanium telluride (TiTe2)",
    },
    source: {
      pubChemCid: 82912,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82912",
    },
  },
  {
    formulaKey: "Te:2|W:1",
    id: "extended:te2-w",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te2-w",
      formula: "Te2W",
      name: "Tungsten telluride (WTe2)",
    },
    source: {
      pubChemCid: 82913,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82913",
    },
  },
  {
    formulaKey: "Li:2|Te:1",
    id: "extended:li2-te",
    ingredients: [
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 2,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:li2-te",
      formula: "Li2Te",
      name: "Lithium telluride (Li2Te)",
    },
    source: {
      pubChemCid: 82934,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82934",
    },
  },
  {
    formulaKey: "Li:2|Se:1",
    id: "extended:li2-se",
    ingredients: [
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:li2-se",
      formula: "Li2Se",
      name: "Lithium selenide (Li2Se)",
    },
    source: {
      pubChemCid: 82935,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82935",
    },
  },
  {
    formulaKey: "O:2|Rh:1",
    id: "extended:o2-rh",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:rh",
        elementSymbol: "Rh",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-rh",
      formula: "O2Rh",
      name: "Rhodium oxide (RhO2)",
    },
    source: {
      pubChemCid: 82936,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82936",
    },
  },
  {
    formulaKey: "S:2|Th:1",
    id: "extended:s2-th",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:th",
        elementSymbol: "Th",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-th",
      formula: "S2Th",
      name: "Thorium disulfide",
    },
    source: {
      pubChemCid: 82937,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82937",
    },
  },
  {
    formulaKey: "S:2|W:1",
    id: "extended:s2-w",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-w",
      formula: "S2W",
      name: "Tungsten disulfide",
    },
    source: {
      pubChemCid: 82938,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82938",
    },
  },
  {
    formulaKey: "Se:2|U:1",
    id: "extended:se2-u",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:u",
        elementSymbol: "U",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-u",
      formula: "Se2U",
      name: "Uranium selenide (USe2)",
    },
    source: {
      pubChemCid: 82939,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82939",
    },
  },
  {
    formulaKey: "Te:2|U:1",
    id: "extended:te2-u",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 2,
      },
      {
        cardId: "element:u",
        elementSymbol: "U",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:te2-u",
      formula: "Te2U",
      name: "Uranium telluride (UTe2)",
    },
    source: {
      pubChemCid: 82940,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82940",
    },
  },
  {
    formulaKey: "K:2|Te:1",
    id: "extended:k2-te",
    ingredients: [
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 2,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:k2-te",
      formula: "K2Te",
      name: "Potassium telluride (K2Te)",
    },
    source: {
      pubChemCid: 82942,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82942",
    },
  },
  {
    formulaKey: "S:2|Ta:1",
    id: "extended:s2-ta",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:ta",
        elementSymbol: "Ta",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-ta",
      formula: "S2Ta",
      name: "Tantalum sulfide (TaS2)",
    },
    source: {
      pubChemCid: 82945,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82945",
    },
  },
  {
    formulaKey: "Se:2|Hf:1",
    id: "extended:se2-hf",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:hf",
        elementSymbol: "Hf",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-hf",
      formula: "HfSe2",
      name: "Hafnium selenide (HfSe2)",
    },
    source: {
      pubChemCid: 82955,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82955",
    },
  },
  {
    formulaKey: "S:2|Ru:1",
    id: "extended:s2-ru",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:ru",
        elementSymbol: "Ru",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-ru",
      formula: "RuS2",
      name: "Ruthenium sulfide (RuS2)",
    },
    source: {
      pubChemCid: 82958,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82958",
    },
  },
  {
    formulaKey: "Se:2|Zr:1",
    id: "extended:se2-zr",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:zr",
        elementSymbol: "Zr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:se2-zr",
      formula: "Se2Zr",
      name: "Zirconium selenide (ZrSe2)",
    },
    source: {
      pubChemCid: 82961,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82961",
    },
  },
  {
    formulaKey: "Te:1|Cs:2",
    id: "extended:te-cs2",
    ingredients: [
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
      {
        cardId: "element:cs",
        elementSymbol: "Cs",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:te-cs2",
      formula: "Cs2Te",
      name: "Cesium telluride (Cs2Te)",
    },
    source: {
      pubChemCid: 82968,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82968",
    },
  },
  {
    formulaKey: "Rb:2|Te:1",
    id: "extended:rb2-te",
    ingredients: [
      {
        cardId: "element:rb",
        elementSymbol: "Rb",
        quantity: 2,
      },
      {
        cardId: "element:te",
        elementSymbol: "Te",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:rb2-te",
      formula: "Rb2Te",
      name: "Rubidium telluride (Rb2Te)",
    },
    source: {
      pubChemCid: 82970,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82970",
    },
  },
  {
    formulaKey: "B:2|Mn:1",
    id: "extended:b2-mn",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 2,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b2-mn",
      formula: "B2Mn",
      name: "Manganese boride (MnB2)",
    },
    source: {
      pubChemCid: 82988,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82988",
    },
  },
  {
    formulaKey: "B:2|W:1",
    id: "extended:b2-w",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 2,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:b2-w",
      formula: "B2W",
      name: "Tungsten boride (WB2)",
    },
    source: {
      pubChemCid: 82989,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82989",
    },
  },
  {
    formulaKey: "H:1|C:1|N:1",
    id: "extended:h-c-n",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-c-n",
      formula: "CHN",
      name: "Hydrogen Cyanide",
    },
    source: {
      pubChemCid: 768,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/768",
    },
  },
  {
    formulaKey: "H:1|N:1|O:1",
    id: "extended:h-n-o",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-n-o",
      formula: "HNO",
      name: "Nitroxyl",
    },
    source: {
      pubChemCid: 945,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/945",
    },
  },
  {
    formulaKey: "H:1|Li:1|O:1",
    id: "extended:h-li-o",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-li-o",
      formula: "HLiO",
      name: "Lithium Hydroxide",
    },
    source: {
      pubChemCid: 3939,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/3939",
    },
  },
  {
    formulaKey: "H:1|O:1|Bi:1",
    id: "extended:h-o-bi",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:bi",
        elementSymbol: "Bi",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o-bi",
      formula: "BiHO",
      name: "Oxobismuthane",
    },
    source: {
      pubChemCid: 6879,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/6879",
    },
  },
  {
    formulaKey: "C:1|N:1|Na:1",
    id: "extended:c-n-na",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-na",
      formula: "CNNa",
      name: "Sodium Cyanide",
    },
    source: {
      pubChemCid: 8929,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/8929",
    },
  },
  {
    formulaKey: "C:1|N:1|K:1",
    id: "extended:c-n-k",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-k",
      formula: "CKN",
      name: "Potassium Cyanide",
    },
    source: {
      pubChemCid: 9032,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/9032",
    },
  },
  {
    formulaKey: "C:1|O:1|S:1",
    id: "extended:c-o-s",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-o-s",
      formula: "COS",
      name: "Carbonyl Sulfide",
    },
    source: {
      pubChemCid: 10039,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/10039",
    },
  },
  {
    formulaKey: "C:1|N:1|Ag:1",
    id: "extended:c-n-ag",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-ag",
      formula: "CAgN",
      name: "Silver cyanide",
    },
    source: {
      pubChemCid: 10475,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/10475",
    },
  },
  {
    formulaKey: "C:1|N:1|Br:1",
    id: "extended:c-n-br",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-br",
      formula: "CBrN",
      name: "Cyanogen Bromide",
    },
    source: {
      pubChemCid: 10476,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/10476",
    },
  },
  {
    formulaKey: "C:1|N:1|Cl:1",
    id: "extended:c-n-cl",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-cl",
      formula: "CClN",
      name: "Cyanogen Chloride",
    },
    source: {
      pubChemCid: 10477,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/10477",
    },
  },
  {
    formulaKey: "C:1|N:1|I:1",
    id: "extended:c-n-i",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-i",
      formula: "CIN",
      name: "Cyanogen iodide",
    },
    source: {
      pubChemCid: 10478,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/10478",
    },
  },
  {
    formulaKey: "C:1|N:1|Cu:1",
    id: "extended:c-n-cu",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-cu",
      formula: "CCuN",
      name: "Copper cyanide",
    },
    source: {
      pubChemCid: 11009,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/11009",
    },
  },
  {
    formulaKey: "H:1|O:1|K:1",
    id: "extended:h-o-k",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o-k",
      formula: "HKO",
      name: "Potassium Hydroxide",
    },
    source: {
      pubChemCid: 14797,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14797",
    },
  },
  {
    formulaKey: "H:1|O:1|Na:1",
    id: "extended:h-o-na",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o-na",
      formula: "HNaO",
      name: "Sodium Hydroxide",
    },
    source: {
      pubChemCid: 14798,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14798",
    },
  },
  {
    formulaKey: "H:1|S:1|Bi:1",
    id: "extended:h-s-bi",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:bi",
        elementSymbol: "Bi",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-s-bi",
      formula: "BiHS",
      name: "Sulfanylidenebismuthane",
    },
    source: {
      pubChemCid: 14944,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14944",
    },
  },
  {
    formulaKey: "N:1|O:1|Cl:1",
    id: "extended:n-o-cl",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-o-cl",
      formula: "ClNO",
      name: "Nitrosyl chloride",
    },
    source: {
      pubChemCid: 17601,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/17601",
    },
  },
  {
    formulaKey: "H:1|O:1|Cl:1",
    id: "extended:h-o-cl",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o-cl",
      formula: "ClHO",
      name: "Hypochlorous Acid",
    },
    source: {
      pubChemCid: 24341,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24341",
    },
  },
  {
    formulaKey: "H:1|C:1|W:1",
    id: "extended:h-c-w",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-c-w",
      formula: "CHW",
      name: "Tungsten, methylidyne-",
    },
    source: {
      pubChemCid: 25505,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25505",
    },
  },
  {
    formulaKey: "Cl:1|Br:1|Pb:1",
    id: "extended:cl-br-pb",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
      {
        cardId: "element:pb",
        elementSymbol: "Pb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl-br-pb",
      formula: "BrClPb",
      name: "Bromo(chloro)lead",
    },
    source: {
      pubChemCid: 26267,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26267",
    },
  },
  {
    formulaKey: "H:1|Na:1|S:1",
    id: "extended:h-na-s",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-na-s",
      formula: "HNaS",
      name: "Sodium hydrosulfide",
    },
    source: {
      pubChemCid: 28015,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/28015",
    },
  },
  {
    formulaKey: "H:1|O:1|Rb:1",
    id: "extended:h-o-rb",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:rb",
        elementSymbol: "Rb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o-rb",
      formula: "HORb",
      name: "Rubidium hydroxide",
    },
    source: {
      pubChemCid: 62393,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62393",
    },
  },
  {
    formulaKey: "H:1|O:1|Cs:1",
    id: "extended:h-o-cs",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cs",
        elementSymbol: "Cs",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o-cs",
      formula: "CsHO",
      name: "Cesium hydroxide",
    },
    source: {
      pubChemCid: 62750,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62750",
    },
  },
  {
    formulaKey: "C:1|N:1|Au:1",
    id: "extended:c-n-au",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:au",
        elementSymbol: "Au",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:c-n-au",
      formula: "CAuN",
      name: "Gold monocyanide",
    },
    source: {
      pubChemCid: 68172,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/68172",
    },
  },
  {
    formulaKey: "Li:1|C:1|N:1",
    id: "extended:li-c-n",
    ingredients: [
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 1,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:li-c-n",
      formula: "CLiN",
      name: "Lithium cyanide",
    },
    source: {
      pubChemCid: 75478,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/75478",
    },
  },
  {
    formulaKey: "H:1|O:1|Sb:1",
    id: "extended:h-o-sb",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o-sb",
      formula: "HOSb",
      name: "Oxostibane",
    },
    source: {
      pubChemCid: 82258,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82258",
    },
  },
  {
    formulaKey: "H:3|N:1",
    id: "extended:h3-n",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-n",
      formula: "H3N",
      name: "Ammonia",
    },
    source: {
      pubChemCid: 222,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/222",
    },
  },
  {
    formulaKey: "H:2|O:2",
    id: "extended:h2-o2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h2-o2",
      formula: "H2O2",
      name: "Hydrogen Peroxide",
    },
    source: {
      pubChemCid: 784,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/784",
    },
  },
  {
    formulaKey: "F:3|Al:1",
    id: "extended:f3-al",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-al",
      formula: "AlF3",
      name: "Aluminum fluoride",
    },
    source: {
      pubChemCid: 2124,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/2124",
    },
  },
  {
    formulaKey: "H:2|C:2",
    id: "extended:h2-c2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h2-c2",
      formula: "C2H2",
      name: "Acetylene",
    },
    source: {
      pubChemCid: 6326,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/6326",
    },
  },
  {
    formulaKey: "H:3|B:1",
    id: "extended:h3-b",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-b",
      formula: "BH3",
      name: "Borane",
    },
    source: {
      pubChemCid: 6331,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/6331",
    },
  },
  {
    formulaKey: "B:1|F:3",
    id: "extended:b-f3",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:b-f3",
      formula: "BF3",
      name: "Boron trifluoride",
    },
    source: {
      pubChemCid: 6356,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/6356",
    },
  },
  {
    formulaKey: "H:3|Bi:1",
    id: "extended:h3-bi",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:bi",
        elementSymbol: "Bi",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-bi",
      formula: "BiH3",
      name: "Bismuthine",
    },
    source: {
      pubChemCid: 9242,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/9242",
    },
  },
  {
    formulaKey: "H:3|Sb:1",
    id: "extended:h3-sb",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-sb",
      formula: "H3Sb",
      name: "Stibine",
    },
    source: {
      pubChemCid: 9359,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/9359",
    },
  },
  {
    formulaKey: "C:2|N:2",
    id: "extended:c2-n2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c2-n2",
      formula: "C2N2",
      name: "Cyanogen",
    },
    source: {
      pubChemCid: 9999,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/9999",
    },
  },
  {
    formulaKey: "H:3|Al:1",
    id: "extended:h3-al",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-al",
      formula: "AlH3",
      name: "Aluminum hydride",
    },
    source: {
      pubChemCid: 14488,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14488",
    },
  },
  {
    formulaKey: "O:3|Mo:1",
    id: "extended:o3-mo",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 3,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o3-mo",
      formula: "MoO3",
      name: "Molybdenum trioxide",
    },
    source: {
      pubChemCid: 14802,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14802",
    },
  },
  {
    formulaKey: "O:2|Na:2",
    id: "extended:o2-na2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o2-na2",
      formula: "Na2O2",
      name: "Sodium peroxide",
    },
    source: {
      pubChemCid: 14803,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14803",
    },
  },
  {
    formulaKey: "O:3|W:1",
    id: "extended:o3-w",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 3,
      },
      {
        cardId: "element:w",
        elementSymbol: "W",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o3-w",
      formula: "O3W",
      name: "Tungsten oxide (WO3)",
    },
    source: {
      pubChemCid: 14811,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14811",
    },
  },
  {
    formulaKey: "O:3|Cr:1",
    id: "extended:o3-cr",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 3,
      },
      {
        cardId: "element:cr",
        elementSymbol: "Cr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o3-cr",
      formula: "CrO3",
      name: "Chromium Trioxide",
    },
    source: {
      pubChemCid: 14915,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14915",
    },
  },
  {
    formulaKey: "H:3|As:1",
    id: "extended:h3-as",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-as",
      formula: "AsH3",
      name: "Arsine",
    },
    source: {
      pubChemCid: 23969,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23969",
    },
  },
  {
    formulaKey: "H:3|Ga:1",
    id: "extended:h3-ga",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:ga",
        elementSymbol: "Ga",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-ga",
      formula: "GaH3",
      name: "Gallium hydride (GaH3)",
    },
    source: {
      pubChemCid: 23983,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23983",
    },
  },
  {
    formulaKey: "H:3|In:1",
    id: "extended:h3-in",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:in",
        elementSymbol: "In",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-in",
      formula: "H3In",
      name: "Indigane",
    },
    source: {
      pubChemCid: 24000,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24000",
    },
  },
  {
    formulaKey: "Al:1|Cl:3",
    id: "extended:al-cl3",
    ingredients: [
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:al-cl3",
      formula: "AlCl3",
      name: "Aluminum Chloride",
    },
    source: {
      pubChemCid: 24012,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24012",
    },
  },
  {
    formulaKey: "C:2|Cl:2",
    id: "extended:c2-cl2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c2-cl2",
      formula: "C2Cl2",
      name: "Dichloroacetylene",
    },
    source: {
      pubChemCid: 24227,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24227",
    },
  },
  {
    formulaKey: "Cl:3|Fe:1",
    id: "extended:cl3-fe",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-fe",
      formula: "Cl3Fe",
      name: "Iron chloride (FeCl3)",
    },
    source: {
      pubChemCid: 24380,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24380",
    },
  },
  {
    formulaKey: "P:1|Cl:3",
    id: "extended:p-cl3",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:p-cl3",
      formula: "Cl3P",
      name: "Phosphorus trichloride",
    },
    source: {
      pubChemCid: 24387,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24387",
    },
  },
  {
    formulaKey: "H:3|P:1",
    id: "extended:h3-p",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 3,
      },
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h3-p",
      formula: "H3P",
      name: "Phosphine",
    },
    source: {
      pubChemCid: 24404,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24404",
    },
  },
  {
    formulaKey: "Al:1|Br:3",
    id: "extended:al-br3",
    ingredients: [
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:al-br3",
      formula: "AlBr3",
      name: "Aluminum bromide",
    },
    source: {
      pubChemCid: 24409,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24409",
    },
  },
  {
    formulaKey: "F:3|Ce:1",
    id: "extended:f3-ce",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:ce",
        elementSymbol: "Ce",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-ce",
      formula: "CeF3",
      name: "Cerium trifluoride",
    },
    source: {
      pubChemCid: 24457,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24457",
    },
  },
  {
    formulaKey: "H:1|N:3",
    id: "extended:h-n3",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:h-n3",
      formula: "HN3",
      name: "Hydrazoic acid",
    },
    source: {
      pubChemCid: 24530,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24530",
    },
  },
  {
    formulaKey: "F:3|Fe:1",
    id: "extended:f3-fe",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-fe",
      formula: "F3Fe",
      name: "Iron fluoride (FeF3)",
    },
    source: {
      pubChemCid: 24552,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24552",
    },
  },
  {
    formulaKey: "N:1|F:3",
    id: "extended:n-f3",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:n-f3",
      formula: "F3N",
      name: "Nitrogen trifluoride",
    },
    source: {
      pubChemCid: 24553,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24553",
    },
  },
  {
    formulaKey: "F:3|Sb:1",
    id: "extended:f3-sb",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-sb",
      formula: "F3Sb",
      name: "Antimony trifluoride",
    },
    source: {
      pubChemCid: 24554,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24554",
    },
  },
  {
    formulaKey: "As:1|Br:3",
    id: "extended:as-br3",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:as-br3",
      formula: "AsBr3",
      name: "Arsenic tribromide",
    },
    source: {
      pubChemCid: 24569,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24569",
    },
  },
  {
    formulaKey: "Cl:3|As:1",
    id: "extended:cl3-as",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-as",
      formula: "AsCl3",
      name: "Arsenic chloride (AsCl3)",
    },
    source: {
      pubChemCid: 24570,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24570",
    },
  },
  {
    formulaKey: "F:3|As:1",
    id: "extended:f3-as",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-as",
      formula: "AsF3",
      name: "Arsenic trifluoride",
    },
    source: {
      pubChemCid: 24571,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24571",
    },
  },
  {
    formulaKey: "As:1|I:3",
    id: "extended:as-i3",
    ingredients: [
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:as-i3",
      formula: "AsI3",
      name: "Arsenic iodide (AsI3)",
    },
    source: {
      pubChemCid: 24575,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24575",
    },
  },
  {
    formulaKey: "Cl:3|Bi:1",
    id: "extended:cl3-bi",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:bi",
        elementSymbol: "Bi",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-bi",
      formula: "BiCl3",
      name: "Bismuth trichloride",
    },
    source: {
      pubChemCid: 24591,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24591",
    },
  },
  {
    formulaKey: "F:3|Br:1",
    id: "extended:f3-br",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-br",
      formula: "BrF3",
      name: "Bromine trifluoride",
    },
    source: {
      pubChemCid: 24594,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24594",
    },
  },
  {
    formulaKey: "P:1|Br:3",
    id: "extended:p-br3",
    ingredients: [
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:p-br3",
      formula: "Br3P",
      name: "Phosphorus tribromide",
    },
    source: {
      pubChemCid: 24614,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24614",
    },
  },
  {
    formulaKey: "Br:3|Sb:1",
    id: "extended:br3-sb",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br3-sb",
      formula: "Br3Sb",
      name: "Antimony tribromide",
    },
    source: {
      pubChemCid: 24615,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24615",
    },
  },
  {
    formulaKey: "Sb:1|I:3",
    id: "extended:sb-i3",
    ingredients: [
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:sb-i3",
      formula: "I3Sb",
      name: "Antimony Triiodide",
    },
    source: {
      pubChemCid: 24630,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24630",
    },
  },
  {
    formulaKey: "Cl:3|Ce:1",
    id: "extended:cl3-ce",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:ce",
        elementSymbol: "Ce",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-ce",
      formula: "CeCl3",
      name: "Cerium(III) chloride",
    },
    source: {
      pubChemCid: 24636,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24636",
    },
  },
  {
    formulaKey: "F:3|Cl:1",
    id: "extended:f3-cl",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-cl",
      formula: "ClF3",
      name: "Chlorine trifluoride",
    },
    source: {
      pubChemCid: 24637,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24637",
    },
  },
  {
    formulaKey: "O:3|S:1",
    id: "extended:o3-s",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 3,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o3-s",
      formula: "O3S",
      name: "Sulfur trioxide",
    },
    source: {
      pubChemCid: 24682,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24682",
    },
  },
  {
    formulaKey: "S:2|Cl:2",
    id: "extended:s2-cl2",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:s2-cl2",
      formula: "Cl2S2",
      name: "Sulfur monochloride",
    },
    source: {
      pubChemCid: 24807,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24807",
    },
  },
  {
    formulaKey: "Cl:3|Cr:1",
    id: "extended:cl3-cr",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:cr",
        elementSymbol: "Cr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-cr",
      formula: "Cl3Cr",
      name: "Chromium chloride (crcl3)",
    },
    source: {
      pubChemCid: 24808,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24808",
    },
  },
  {
    formulaKey: "Cl:3|Eu:1",
    id: "extended:cl3-eu",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:eu",
        elementSymbol: "Eu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-eu",
      formula: "Cl3Eu",
      name: "Europium chloride",
    },
    source: {
      pubChemCid: 24809,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24809",
    },
  },
  {
    formulaKey: "Cl:3|In:1",
    id: "extended:cl3-in",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:in",
        elementSymbol: "In",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-in",
      formula: "Cl3In",
      name: "Indium Trichloride",
    },
    source: {
      pubChemCid: 24812,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24812",
    },
  },
  {
    formulaKey: "Cl:3|Sb:1",
    id: "extended:cl3-sb",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-sb",
      formula: "Cl3Sb",
      name: "Antimony trichloride",
    },
    source: {
      pubChemCid: 24814,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24814",
    },
  },
  {
    formulaKey: "Br:2|Hg:2",
    id: "extended:br2-hg2",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:br2-hg2",
      formula: "Br2Hg2",
      name: "Mercurous bromide",
    },
    source: {
      pubChemCid: 24829,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24829",
    },
  },
  {
    formulaKey: "Cl:3|Rh:1",
    id: "extended:cl3-rh",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:rh",
        elementSymbol: "Rh",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-rh",
      formula: "Cl3Rh",
      name: "Rhodium chloride",
    },
    source: {
      pubChemCid: 24872,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24872",
    },
  },
  {
    formulaKey: "Cl:3|Lu:1",
    id: "extended:cl3-lu",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:lu",
        elementSymbol: "Lu",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-lu",
      formula: "Cl3Lu",
      name: "Lutetium chloride",
    },
    source: {
      pubChemCid: 24919,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24919",
    },
  },
  {
    formulaKey: "Cl:2|Hg:2",
    id: "extended:cl2-hg2",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:cl2-hg2",
      formula: "Cl2Hg2",
      name: "Mercury chloride (Hg2Cl2)",
    },
    source: {
      pubChemCid: 24956,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24956",
    },
  },
  {
    formulaKey: "Cl:3|Ho:1",
    id: "extended:cl3-ho",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:ho",
        elementSymbol: "Ho",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-ho",
      formula: "Cl3Ho",
      name: "Holmium chloride",
    },
    source: {
      pubChemCid: 24992,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24992",
    },
  },
  {
    formulaKey: "B:1|Br:3",
    id: "extended:b-br3",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:b-br3",
      formula: "BBr3",
      name: "Boron tribromide",
    },
    source: {
      pubChemCid: 25134,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25134",
    },
  },
  {
    formulaKey: "B:1|Cl:3",
    id: "extended:b-cl3",
    ingredients: [
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:b-cl3",
      formula: "BCl3",
      name: "Boron Trichloride",
    },
    source: {
      pubChemCid: 25135,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25135",
    },
  },
  {
    formulaKey: "Li:2|O:2",
    id: "extended:li2-o2",
    ingredients: [
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 2,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:li2-o2",
      formula: "Li2O2",
      name: "Lithium peroxide",
    },
    source: {
      pubChemCid: 25489,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25489",
    },
  },
  {
    formulaKey: "Fe:1|Br:3",
    id: "extended:fe-br3",
    ingredients: [
      {
        cardId: "element:fe",
        elementSymbol: "Fe",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:fe-br3",
      formula: "Br3Fe",
      name: "iron(III)bromide",
    },
    source: {
      pubChemCid: 25554,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25554",
    },
  },
  {
    formulaKey: "Cl:3|Ir:1",
    id: "extended:cl3-ir",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:ir",
        elementSymbol: "Ir",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-ir",
      formula: "Cl3Ir",
      name: "Iridium trichloride",
    },
    source: {
      pubChemCid: 25563,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25563",
    },
  },
  {
    formulaKey: "Cl:3|Ga:1",
    id: "extended:cl3-ga",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:ga",
        elementSymbol: "Ga",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-ga",
      formula: "Cl3Ga",
      name: "Gallium chloride",
    },
    source: {
      pubChemCid: 26010,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26010",
    },
  },
  {
    formulaKey: "Cl:3|Au:1",
    id: "extended:cl3-au",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:au",
        elementSymbol: "Au",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-au",
      formula: "AuCl3",
      name: "Gold trichloride",
    },
    source: {
      pubChemCid: 26030,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26030",
    },
  },
  {
    formulaKey: "Br:3|In:1",
    id: "extended:br3-in",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
      {
        cardId: "element:in",
        elementSymbol: "In",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br3-in",
      formula: "Br3In",
      name: "Indium tribromide",
    },
    source: {
      pubChemCid: 26046,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26046",
    },
  },
  {
    formulaKey: "N:3|Br:1",
    id: "extended:n3-br",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 3,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n3-br",
      formula: "BrN3",
      name: "Bromine azide",
    },
    source: {
      pubChemCid: 26364,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/26364",
    },
  },
  {
    formulaKey: "I:2|Hg:2",
    id: "extended:i2-hg2",
    ingredients: [
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
      {
        cardId: "element:hg",
        elementSymbol: "Hg",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:i2-hg2",
      formula: "Hg2I2",
      name: "Mercurous Iodide",
    },
    source: {
      pubChemCid: 27243,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/27243",
    },
  },
  {
    formulaKey: "O:2|K:2",
    id: "extended:o2-k2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o2-k2",
      formula: "K2O2",
      name: "Potassium peroxide",
    },
    source: {
      pubChemCid: 28202,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/28202",
    },
  },
  {
    formulaKey: "N:3|Na:1",
    id: "extended:n3-na",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 3,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n3-na",
      formula: "N3Na",
      name: "Sodium Azide",
    },
    source: {
      pubChemCid: 33557,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/33557",
    },
  },
  {
    formulaKey: "C:2|Br:2",
    id: "extended:c2-br2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c2-br2",
      formula: "C2Br2",
      name: "Ethyne, dibromo-",
    },
    source: {
      pubChemCid: 61169,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61169",
    },
  },
  {
    formulaKey: "C:2|I:2",
    id: "extended:c2-i2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c2-i2",
      formula: "C2I2",
      name: "Ethyne, diiodo-",
    },
    source: {
      pubChemCid: 61170,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61170",
    },
  },
  {
    formulaKey: "N:1|Cl:3",
    id: "extended:n-cl3",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:n-cl3",
      formula: "Cl3N",
      name: "Nitrogen trichloride",
    },
    source: {
      pubChemCid: 61437,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61437",
    },
  },
  {
    formulaKey: "Cl:3|Tb:1",
    id: "extended:cl3-tb",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:tb",
        elementSymbol: "Tb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-tb",
      formula: "Cl3Tb",
      name: "Terbium chloride",
    },
    source: {
      pubChemCid: 61458,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61458",
    },
  },
  {
    formulaKey: "Cl:3|Gd:1",
    id: "extended:cl3-gd",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:gd",
        elementSymbol: "Gd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-gd",
      formula: "Cl3Gd",
      name: "Gadolinium chloride",
    },
    source: {
      pubChemCid: 61486,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61486",
    },
  },
  {
    formulaKey: "Cl:3|Sm:1",
    id: "extended:cl3-sm",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:sm",
        elementSymbol: "Sm",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-sm",
      formula: "Cl3Sm",
      name: "Samarium chloride",
    },
    source: {
      pubChemCid: 61508,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61508",
    },
  },
  {
    formulaKey: "Cl:3|Yb:1",
    id: "extended:cl3-yb",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:yb",
        elementSymbol: "Yb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-yb",
      formula: "Cl3Yb",
      name: "Ytterbium chloride",
    },
    source: {
      pubChemCid: 61510,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61510",
    },
  },
  {
    formulaKey: "Na:3|P:1",
    id: "extended:na3-p",
    ingredients: [
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 3,
      },
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:na3-p",
      formula: "Na3P",
      name: "Sodium phosphide",
    },
    source: {
      pubChemCid: 61547,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61547",
    },
  },
  {
    formulaKey: "N:1|I:3",
    id: "extended:n-i3",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:n-i3",
      formula: "I3N",
      name: "Nitrogen iodide (NI3)",
    },
    source: {
      pubChemCid: 61603,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61603",
    },
  },
  {
    formulaKey: "Cl:3|Tm:1",
    id: "extended:cl3-tm",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:tm",
        elementSymbol: "Tm",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-tm",
      formula: "Cl3Tm",
      name: "Thulium trichloride",
    },
    source: {
      pubChemCid: 61643,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61643",
    },
  },
  {
    formulaKey: "N:3|Ag:1",
    id: "extended:n3-ag",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 3,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n3-ag",
      formula: "AgN3",
      name: "Silver azide",
    },
    source: {
      pubChemCid: 61698,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61698",
    },
  },
  {
    formulaKey: "N:3|Cl:1",
    id: "extended:n3-cl",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 3,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n3-cl",
      formula: "ClN3",
      name: "Chlorine azide (Cl(N3))",
    },
    source: {
      pubChemCid: 61708,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61708",
    },
  },
  {
    formulaKey: "N:3|I:1",
    id: "extended:n3-i",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 3,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n3-i",
      formula: "IN3",
      name: "Iodine azide",
    },
    source: {
      pubChemCid: 61763,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61763",
    },
  },
  {
    formulaKey: "Cl:3|Ru:1",
    id: "extended:cl3-ru",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:ru",
        elementSymbol: "Ru",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-ru",
      formula: "Cl3Ru",
      name: "Ruthenium trichloride",
    },
    source: {
      pubChemCid: 61850,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61850",
    },
  },
  {
    formulaKey: "Cl:3|Ti:1",
    id: "extended:cl3-ti",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:ti",
        elementSymbol: "Ti",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-ti",
      formula: "Cl3Ti",
      name: "TITANIUM CHLORIDE (TiCl3)",
    },
    source: {
      pubChemCid: 62646,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62646",
    },
  },
  {
    formulaKey: "Cl:3|V:1",
    id: "extended:cl3-v",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-v",
      formula: "Cl3V",
      name: "Vanadium trichloride",
    },
    source: {
      pubChemCid: 62647,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62647",
    },
  },
  {
    formulaKey: "F:3|P:1",
    id: "extended:f3-p",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-p",
      formula: "F3P",
      name: "Phosphorus trifluoride",
    },
    source: {
      pubChemCid: 62665,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62665",
    },
  },
  {
    formulaKey: "Cl:3|La:1",
    id: "extended:cl3-la",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:la",
        elementSymbol: "La",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-la",
      formula: "Cl3La",
      name: "Lanthanum chloride (LaCl3)",
    },
    source: {
      pubChemCid: 64735,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/64735",
    },
  },
  {
    formulaKey: "Cl:3|Nd:1",
    id: "extended:cl3-nd",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:nd",
        elementSymbol: "Nd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-nd",
      formula: "Cl3Nd",
      name: "Neodymium trichloride",
    },
    source: {
      pubChemCid: 66204,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66204",
    },
  },
  {
    formulaKey: "Cl:2|Se:2",
    id: "extended:cl2-se2",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:cl2-se2",
      formula: "Cl2Se2",
      name: "Selenium chloride (Se2Cl2)",
    },
    source: {
      pubChemCid: 66206,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66206",
    },
  },
  {
    formulaKey: "Cl:3|Dy:1",
    id: "extended:cl3-dy",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:dy",
        elementSymbol: "Dy",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-dy",
      formula: "Cl3Dy",
      name: "Dysprosium chloride",
    },
    source: {
      pubChemCid: 66207,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66207",
    },
  },
  {
    formulaKey: "F:3|Co:1",
    id: "extended:f3-co",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-co",
      formula: "CoF3",
      name: "Cobalt trifluoride",
    },
    source: {
      pubChemCid: 66208,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66208",
    },
  },
  {
    formulaKey: "F:3|V:1",
    id: "extended:f3-v",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:v",
        elementSymbol: "V",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-v",
      formula: "F3V",
      name: "Vanadium trifluoride",
    },
    source: {
      pubChemCid: 66230,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66230",
    },
  },
  {
    formulaKey: "Cl:3|Er:1",
    id: "extended:cl3-er",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:er",
        elementSymbol: "Er",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-er",
      formula: "Cl3Er",
      name: "Erbium chloride",
    },
    source: {
      pubChemCid: 66277,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66277",
    },
  },
  {
    formulaKey: "Cl:3|Co:1",
    id: "extended:cl3-co",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-co",
      formula: "Cl3Co",
      name: "Cobalt chloride (CoCl3)",
    },
    source: {
      pubChemCid: 66297,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66297",
    },
  },
  {
    formulaKey: "Cl:3|Pr:1",
    id: "extended:cl3-pr",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:pr",
        elementSymbol: "Pr",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-pr",
      formula: "Cl3Pr",
      name: "Praseodymium chloride",
    },
    source: {
      pubChemCid: 66317,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66317",
    },
  },
  {
    formulaKey: "Cl:3|Y:1",
    id: "extended:cl3-y",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:y",
        elementSymbol: "Y",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-y",
      formula: "Cl3Y",
      name: "Yttrium chloride (YCl3)",
    },
    source: {
      pubChemCid: 66318,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66318",
    },
  },
  {
    formulaKey: "Cl:3|I:1",
    id: "extended:cl3-i",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-i",
      formula: "Cl3I",
      name: "Iodine trichloride",
    },
    source: {
      pubChemCid: 70076,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/70076",
    },
  },
  {
    formulaKey: "O:3|U:1",
    id: "extended:o3-u",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 3,
      },
      {
        cardId: "element:u",
        elementSymbol: "U",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o3-u",
      formula: "O3U",
      name: "Uranium trioxide",
    },
    source: {
      pubChemCid: 74013,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/74013",
    },
  },
  {
    formulaKey: "F:3|Ga:1",
    id: "extended:f3-ga",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:ga",
        elementSymbol: "Ga",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-ga",
      formula: "F3Ga",
      name: "Gallium fluoride",
    },
    source: {
      pubChemCid: 82211,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82211",
    },
  },
  {
    formulaKey: "F:3|In:1",
    id: "extended:f3-in",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:in",
        elementSymbol: "In",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-in",
      formula: "F3In",
      name: "Indium fluoride (InF3)",
    },
    source: {
      pubChemCid: 82212,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82212",
    },
  },
  {
    formulaKey: "F:3|Mn:1",
    id: "extended:f3-mn",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:mn",
        elementSymbol: "Mn",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-mn",
      formula: "F3Mn",
      name: "Manganese fluoride(MnF3)",
    },
    source: {
      pubChemCid: 82213,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82213",
    },
  },
  {
    formulaKey: "F:3|Tl:1",
    id: "extended:f3-tl",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:tl",
        elementSymbol: "Tl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-tl",
      formula: "F3Tl",
      name: "Thallium fluoride (TlF3)",
    },
    source: {
      pubChemCid: 82214,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82214",
    },
  },
  {
    formulaKey: "Al:1|I:3",
    id: "extended:al-i3",
    ingredients: [
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:al-i3",
      formula: "AlI3",
      name: "Aluminum iodide",
    },
    source: {
      pubChemCid: 82222,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82222",
    },
  },
  {
    formulaKey: "Br:3|Bi:1",
    id: "extended:br3-bi",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
      {
        cardId: "element:bi",
        elementSymbol: "Bi",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br3-bi",
      formula: "BiBr3",
      name: "bismuth(III) bromide",
    },
    source: {
      pubChemCid: 82232,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82232",
    },
  },
  {
    formulaKey: "F:3|Bi:1",
    id: "extended:f3-bi",
    ingredients: [
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 3,
      },
      {
        cardId: "element:bi",
        elementSymbol: "Bi",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:f3-bi",
      formula: "BiF3",
      name: "Bismuth fluoride",
    },
    source: {
      pubChemCid: 82233,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82233",
    },
  },
  {
    formulaKey: "Se:2|Br:2",
    id: "extended:se2-br2",
    ingredients: [
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 2,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:se2-br2",
      formula: "Br2Se2",
      name: "Diselenium dibromide",
    },
    source: {
      pubChemCid: 82243,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82243",
    },
  },
  {
    formulaKey: "Cr:1|Br:3",
    id: "extended:cr-br3",
    ingredients: [
      {
        cardId: "element:cr",
        elementSymbol: "Cr",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
    ],
    output: {
      cardId: "molecule:cr-br3",
      formula: "Br3Cr",
      name: "Chromic;tribromide",
    },
    source: {
      pubChemCid: 82309,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82309",
    },
  },
  {
    formulaKey: "Br:3|Ir:1",
    id: "extended:br3-ir",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
      {
        cardId: "element:ir",
        elementSymbol: "Ir",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br3-ir",
      formula: "Br3Ir",
      name: "Iridium bromide (IrBr3)",
    },
    source: {
      pubChemCid: 82324,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82324",
    },
  },
  {
    formulaKey: "Br:3|Au:1",
    id: "extended:br3-au",
    ingredients: [
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 3,
      },
      {
        cardId: "element:au",
        elementSymbol: "Au",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:br3-au",
      formula: "AuBr3",
      name: "Gold tribromide",
    },
    source: {
      pubChemCid: 82525,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82525",
    },
  },
  {
    formulaKey: "Cl:3|Sc:1",
    id: "extended:cl3-sc",
    ingredients: [
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 3,
      },
      {
        cardId: "element:sc",
        elementSymbol: "Sc",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:cl3-sc",
      formula: "Cl3Sc",
      name: "Scandium chloride",
    },
    source: {
      pubChemCid: 82586,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82586",
    },
  },
  {
    formulaKey: "S:3|Mo:1",
    id: "extended:s3-mo",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 3,
      },
      {
        cardId: "element:mo",
        elementSymbol: "Mo",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s3-mo",
      formula: "MoS3",
      name: "Molybdenum sulfide (MoS3)",
    },
    source: {
      pubChemCid: 82831,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82831",
    },
  },
  {
    formulaKey: "K:3|As:1",
    id: "extended:k3-as",
    ingredients: [
      {
        cardId: "element:k",
        elementSymbol: "K",
        quantity: 3,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:k3-as",
      formula: "AsK3",
      name: "Potassium arsenide (K3As)",
    },
    source: {
      pubChemCid: 82877,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82877",
    },
  },
  {
    formulaKey: "Li:3|As:1",
    id: "extended:li3-as",
    ingredients: [
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 3,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:li3-as",
      formula: "AsLi3",
      name: "Lithium arsenide (Li3As)",
    },
    source: {
      pubChemCid: 82878,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82878",
    },
  },
  {
    formulaKey: "Na:3|As:1",
    id: "extended:na3-as",
    ingredients: [
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 3,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:na3-as",
      formula: "AsNa3",
      name: "Sodium arsenide (Na3As)",
    },
    source: {
      pubChemCid: 82879,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/82879",
    },
  },
  {
    formulaKey: "H:2|C:1|O:1",
    id: "extended:h2-c-o",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-c-o",
      formula: "CH2O",
      name: "Formaldehyde",
    },
    source: {
      pubChemCid: 712,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/712",
    },
  },
  {
    formulaKey: "C:1|O:1|Cl:2",
    id: "extended:c-o-cl2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c-o-cl2",
      formula: "CCl2O",
      name: "Phosgene",
    },
    source: {
      pubChemCid: 6371,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/6371",
    },
  },
  {
    formulaKey: "H:2|Al:1|Cl:1",
    id: "extended:h2-al-cl",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-al-cl",
      formula: "AlClH2",
      name: "Chloroalane",
    },
    source: {
      pubChemCid: 7278,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/7278",
    },
  },
  {
    formulaKey: "C:1|O:1|F:2",
    id: "extended:c-o-f2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c-o-f2",
      formula: "CF2O",
      name: "Carbonyl fluoride",
    },
    source: {
      pubChemCid: 9623,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/9623",
    },
  },
  {
    formulaKey: "C:1|S:1|Cl:2",
    id: "extended:c-s-cl2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c-s-cl2",
      formula: "CCl2S",
      name: "Thiophosgene",
    },
    source: {
      pubChemCid: 10040,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/10040",
    },
  },
  {
    formulaKey: "H:1|Al:1|Cl:2",
    id: "extended:h-al-cl2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-al-cl2",
      formula: "AlCl2H",
      name: "Aluminum dichloride",
    },
    source: {
      pubChemCid: 11238,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/11238",
    },
  },
  {
    formulaKey: "O:2|Na:1|Al:1",
    id: "extended:o2-na-al",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-na-al",
      formula: "AlNaO2",
      name: "Sodium aluminate",
    },
    source: {
      pubChemCid: 14766,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/14766",
    },
  },
  {
    formulaKey: "H:1|O:2|P:1",
    id: "extended:h-o2-p",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o2-p",
      formula: "HO2P",
      name: "phosphenous acid",
    },
    source: {
      pubChemCid: 22497,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/22497",
    },
  },
  {
    formulaKey: "H:2|C:1|Se:1",
    id: "extended:h2-c-se",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-c-se",
      formula: "CH2Se",
      name: "Methaneselenal",
    },
    source: {
      pubChemCid: 23068,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/23068",
    },
  },
  {
    formulaKey: "O:1|S:1|Cl:2",
    id: "extended:o-s-cl2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o-s-cl2",
      formula: "Cl2OS",
      name: "Thionyl Chloride",
    },
    source: {
      pubChemCid: 24386,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24386",
    },
  },
  {
    formulaKey: "O:2|Na:1|Cl:1",
    id: "extended:o2-na-cl",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o2-na-cl",
      formula: "ClNaO2",
      name: "CID 24452",
    },
    source: {
      pubChemCid: 24452,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24452",
    },
  },
  {
    formulaKey: "H:1|O:2|Cl:1",
    id: "extended:h-o2-cl",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o2-cl",
      formula: "ClHO2",
      name: "Chlorous acid",
    },
    source: {
      pubChemCid: 24453,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24453",
    },
  },
  {
    formulaKey: "H:1|B:1|O:2",
    id: "extended:h-b-o2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-b-o2",
      formula: "BHO2",
      name: "Boric acid (HBO2)",
    },
    source: {
      pubChemCid: 24492,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24492",
    },
  },
  {
    formulaKey: "H:1|N:1|O:2",
    id: "extended:h-n-o2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-n-o2",
      formula: "HNO2",
      name: "Nitrous Acid",
    },
    source: {
      pubChemCid: 24529,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24529",
    },
  },
  {
    formulaKey: "H:2|Li:1|N:1",
    id: "extended:h2-li-n",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:li",
        elementSymbol: "Li",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-li-n",
      formula: "H2LiN",
      name: "Lithium amide",
    },
    source: {
      pubChemCid: 24532,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24532",
    },
  },
  {
    formulaKey: "H:2|N:1|Na:1",
    id: "extended:h2-n-na",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:na",
        elementSymbol: "Na",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-n-na",
      formula: "H2NNa",
      name: "Sodium amide",
    },
    source: {
      pubChemCid: 24533,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24533",
    },
  },
  {
    formulaKey: "O:1|F:2|S:1",
    id: "extended:o-f2-s",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-f2-s",
      formula: "F2OS",
      name: "Thionyl fluoride",
    },
    source: {
      pubChemCid: 24548,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24548",
    },
  },
  {
    formulaKey: "H:1|O:2|As:1",
    id: "extended:h-o2-as",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:as",
        elementSymbol: "As",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o2-as",
      formula: "AsHO2",
      name: "Arsenenous acid",
    },
    source: {
      pubChemCid: 24577,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24577",
    },
  },
  {
    formulaKey: "O:1|Cl:2|Se:1",
    id: "extended:o-cl2-se",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
      {
        cardId: "element:se",
        elementSymbol: "Se",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:o-cl2-se",
      formula: "Cl2OSe",
      name: "Selenium oxychloride",
    },
    source: {
      pubChemCid: 24647,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/24647",
    },
  },
  {
    formulaKey: "H:1|N:1|F:2",
    id: "extended:h-n-f2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-n-f2",
      formula: "F2HN",
      name: "Fluorimide",
    },
    source: {
      pubChemCid: 25242,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25242",
    },
  },
  {
    formulaKey: "H:2|N:1|Cl:1",
    id: "extended:h2-n-cl",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-n-cl",
      formula: "ClH2N",
      name: "Monochloramine",
    },
    source: {
      pubChemCid: 25423,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25423",
    },
  },
  {
    formulaKey: "H:2|Al:1|Br:1",
    id: "extended:h2-al-br",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-al-br",
      formula: "AlBrH2",
      name: "Bromoalumane",
    },
    source: {
      pubChemCid: 25542,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25542",
    },
  },
  {
    formulaKey: "H:1|Al:1|Br:2",
    id: "extended:h-al-br2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-al-br2",
      formula: "AlBr2H",
      name: "Dibromoalumane",
    },
    source: {
      pubChemCid: 25543,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/25543",
    },
  },
  {
    formulaKey: "H:1|S:1|Ag:2",
    id: "extended:h-s-ag2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-s-ag2",
      formula: "Ag2HS",
      name: "Acanthite",
    },
    source: {
      pubChemCid: 30686,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/30686",
    },
  },
  {
    formulaKey: "H:1|O:2|Al:1",
    id: "extended:h-o2-al",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o2-al",
      formula: "AlHO2",
      name: "Aluminium hydroxide oxide",
    },
    source: {
      pubChemCid: 32524,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/32524",
    },
  },
  {
    formulaKey: "H:1|C:2|F:1",
    id: "extended:h-c2-f",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-c2-f",
      formula: "C2HF",
      name: "Ethyne, fluoro-",
    },
    source: {
      pubChemCid: 32759,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/32759",
    },
  },
  {
    formulaKey: "S:2|Zn:1|Cd:1",
    id: "extended:s2-zn-cd",
    ingredients: [
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:zn",
        elementSymbol: "Zn",
        quantity: 1,
      },
      {
        cardId: "element:cd",
        elementSymbol: "Cd",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:s2-zn-cd",
      formula: "CdS2Zn",
      name: "Cadmium zinc sulfide",
    },
    source: {
      pubChemCid: 44181,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/44181",
    },
  },
  {
    formulaKey: "H:1|O:2|Co:1",
    id: "extended:h-o2-co",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:co",
        elementSymbol: "Co",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-o2-co",
      formula: "CoHO2",
      name: "Cobalt oxyhydroxide",
    },
    source: {
      pubChemCid: 61540,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61540",
    },
  },
  {
    formulaKey: "H:1|C:2|Ag:1",
    id: "extended:h-c2-ag",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
      {
        cardId: "element:ag",
        elementSymbol: "Ag",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-c2-ag",
      formula: "C2HAg",
      name: "Silver acetylide (dry) [Forbidden]",
    },
    source: {
      pubChemCid: 61576,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/61576",
    },
  },
  {
    formulaKey: "H:1|S:2|Sb:1",
    id: "extended:h-s2-sb",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 2,
      },
      {
        cardId: "element:sb",
        elementSymbol: "Sb",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-s2-sb",
      formula: "HS2Sb",
      name: "Bis(sulfanylidene)-lambda5-stibane",
    },
    source: {
      pubChemCid: 62397,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62397",
    },
  },
  {
    formulaKey: "H:1|S:1|Cu:2",
    id: "extended:h-s-cu2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:cu",
        elementSymbol: "Cu",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-s-cu2",
      formula: "Cu2HS",
      name: "Chalcocite",
    },
    source: {
      pubChemCid: 62755,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/62755",
    },
  },
  {
    formulaKey: "N:1|O:2|F:1",
    id: "extended:n-o2-f",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 2,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:n-o2-f",
      formula: "FNO2",
      name: "Nitryl fluoride",
    },
    source: {
      pubChemCid: 66203,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66203",
    },
  },
  {
    formulaKey: "H:1|B:1|Cl:2",
    id: "extended:h-b-cl2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:b",
        elementSymbol: "B",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-b-cl2",
      formula: "BCl2H",
      name: "Lhcgbifhsccrrg-uhfffaoysa-",
    },
    source: {
      pubChemCid: 66309,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/66309",
    },
  },
  {
    formulaKey: "H:2|F:1|Al:1",
    id: "extended:h2-f-al",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:f",
        elementSymbol: "F",
        quantity: 1,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-f-al",
      formula: "AlFH2",
      name: "Fluoroalumane",
    },
    source: {
      pubChemCid: 67777,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/67777",
    },
  },
  {
    formulaKey: "O:1|S:1|Br:2",
    id: "extended:o-s-br2",
    ingredients: [
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:o-s-br2",
      formula: "Br2OS",
      name: "Thionyl bromide",
    },
    source: {
      pubChemCid: 68176,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/68176",
    },
  },
  {
    formulaKey: "H:1|C:2|Cl:1",
    id: "extended:h-c2-cl",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 2,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h-c2-cl",
      formula: "C2HCl",
      name: "Chloroethyne",
    },
    source: {
      pubChemCid: 68975,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/68975",
    },
  },
  {
    formulaKey: "N:1|P:1|Cl:2",
    id: "extended:n-p-cl2",
    ingredients: [
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:p",
        elementSymbol: "P",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:n-p-cl2",
      formula: "Cl2NP",
      name: "Phosphonitrile chloride",
    },
    source: {
      pubChemCid: 74596,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/74596",
    },
  },
  {
    formulaKey: "H:2|Al:1|I:1",
    id: "extended:h2-al-i",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:al",
        elementSymbol: "Al",
        quantity: 1,
      },
      {
        cardId: "element:i",
        elementSymbol: "I",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-al-i",
      formula: "AlH2I",
      name: "Iodoalumane",
    },
    source: {
      pubChemCid: 74875,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/74875",
    },
  },
  {
    formulaKey: "H:1|N:1|Cl:2",
    id: "extended:h-n-cl2",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 1,
      },
      {
        cardId: "element:n",
        elementSymbol: "N",
        quantity: 1,
      },
      {
        cardId: "element:cl",
        elementSymbol: "Cl",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:h-n-cl2",
      formula: "Cl2HN",
      name: "Chlorimide",
    },
    source: {
      pubChemCid: 76939,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/76939",
    },
  },
  {
    formulaKey: "C:1|O:1|Br:2",
    id: "extended:c-o-br2",
    ingredients: [
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:o",
        elementSymbol: "O",
        quantity: 1,
      },
      {
        cardId: "element:br",
        elementSymbol: "Br",
        quantity: 2,
      },
    ],
    output: {
      cardId: "molecule:c-o-br2",
      formula: "CBr2O",
      name: "Carbonyl bromide",
    },
    source: {
      pubChemCid: 79057,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/79057",
    },
  },
  {
    formulaKey: "H:2|C:1|S:1",
    id: "extended:h2-c-s",
    ingredients: [
      {
        cardId: "element:h",
        elementSymbol: "H",
        quantity: 2,
      },
      {
        cardId: "element:c",
        elementSymbol: "C",
        quantity: 1,
      },
      {
        cardId: "element:s",
        elementSymbol: "S",
        quantity: 1,
      },
    ],
    output: {
      cardId: "molecule:h2-c-s",
      formula: "CH2S",
      name: "Thioformaldehyde",
    },
    source: {
      pubChemCid: 79115,
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/79115",
    },
  },
] as const satisfies readonly ExtendedMoleculeRecipe[];
export type StaticExtendedMoleculeRecipe = (typeof EXTENDED_MOLECULE_RECIPES)[number];

export const EXTENDED_MOLECULE_RECIPE_BY_ID: ReadonlyMap<string, StaticExtendedMoleculeRecipe> =
  new Map(EXTENDED_MOLECULE_RECIPES.map((recipe) => [recipe.id, recipe]));
export const EXTENDED_MOLECULE_RECIPE_BY_FORMULA_KEY: ReadonlyMap<
  string,
  StaticExtendedMoleculeRecipe
> = new Map(EXTENDED_MOLECULE_RECIPES.map((recipe) => [recipe.formulaKey, recipe]));

export function getExtendedMoleculeRecipeById(
  recipeId: string,
): StaticExtendedMoleculeRecipe | undefined {
  return EXTENDED_MOLECULE_RECIPE_BY_ID.get(recipeId);
}

export function getExtendedMoleculeRecipeByFormulaKey(
  formulaKey: string,
): StaticExtendedMoleculeRecipe | undefined {
  return EXTENDED_MOLECULE_RECIPE_BY_FORMULA_KEY.get(formulaKey);
}
