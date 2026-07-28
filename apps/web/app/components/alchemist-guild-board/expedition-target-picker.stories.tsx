import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ExpeditionTargetPicker,
  type ExpeditionTargetPickerProps,
} from "./expedition-target-picker";

const QUEST_HELP_TARGETS = [
  {
    cardId: "raw:hide",
    imageSrc: null,
    name: "Hide",
    source: "current-quest",
    symbol: "Hi",
  },
  {
    cardId: "raw:resin",
    imageSrc: null,
    name: "Tree Resin",
    source: "current-quest",
    symbol: "TR",
  },
  {
    cardId: "raw:berries",
    imageSrc: null,
    name: "Dark Berries",
    source: "future-quest",
    symbol: "DB",
  },
  {
    cardId: "raw:feather",
    imageSrc: null,
    name: "Feather",
    source: "future-quest",
    symbol: "Fe",
  },
  {
    cardId: "raw:vinegar",
    imageSrc: null,
    name: "Vinegar",
    source: "future-quest",
    symbol: "Vi",
  },
  {
    cardId: "raw:plant-oil",
    imageSrc: null,
    name: "Plant Oil",
    source: "future-quest",
    symbol: "PO",
  },
  {
    cardId: "raw:quartz",
    imageSrc: null,
    name: "Quartz",
    source: "future-quest",
    symbol: "Qz",
  },
  {
    cardId: "raw:crystal-shard",
    imageSrc: null,
    name: "Crystal Shard",
    source: "future-quest",
    symbol: "CS",
  },
  {
    cardId: "raw:bone",
    imageSrc: null,
    name: "Bone",
    source: "future-quest",
    symbol: "Bo",
  },
  {
    cardId: "raw:seaweed",
    imageSrc: null,
    name: "Seaweed",
    source: "future-quest",
    symbol: "Sw",
  },
] satisfies ExpeditionTargetPickerProps["questHelpTargets"];

const ELEMENT_TARGETS = [
  {
    cardId: "element:h",
    imageSrc: `${import.meta.env.BASE_URL}element-card-art/h.webp`,
    name: "Hydrogen",
    source: "vault",
    symbol: "H",
  },
  {
    cardId: "element:o",
    imageSrc: `${import.meta.env.BASE_URL}element-card-art/o.webp`,
    name: "Oxygen",
    source: "both",
    symbol: "O",
  },
  {
    cardId: "element:si",
    imageSrc: `${import.meta.env.BASE_URL}element-card-art/si.webp`,
    name: "Silicon",
    source: "quest",
    symbol: "Si",
  },
  {
    cardId: "element:na",
    imageSrc: `${import.meta.env.BASE_URL}element-card-art/na.webp`,
    name: "Sodium",
    source: "vault",
    symbol: "Na",
  },
] satisfies ExpeditionTargetPickerProps["elementTargets"];

const meta = {
  title: "Components/AlchemistGuildBoard/ExpeditionTargetPicker",
  component: ExpeditionTargetPicker,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    disabled: false,
    elementTargets: ELEMENT_TARGETS,
    onSelectTarget: () => undefined,
    questHelpTargets: QUEST_HELP_TARGETS,
    selectedCardId: "raw:hide",
  },
} satisfies Meta<typeof ExpeditionTargetPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuestHelpAtLimit: Story = {
  render: (args) => (
    <div className="min-h-screen bg-[linear-gradient(145deg,#dce8e4,#f4efe2_55%,#dcecff)] p-4">
      <div className="mx-auto h-[min(768px,calc(100vh-2rem))] min-h-[36rem] w-[1024px] max-w-full">
        <ExpeditionTargetPicker {...args} />
      </div>
    </div>
  ),
};

export const ElementsOnly: Story = {
  args: {
    questHelpTargets: [],
    selectedCardId: "element:o",
  },
  render: (args) => (
    <div className="min-h-screen bg-[linear-gradient(145deg,#dce8e4,#f4efe2_55%,#dcecff)] p-4">
      <div className="mx-auto h-[min(768px,calc(100vh-2rem))] min-h-[28rem] w-[1024px] max-w-full">
        <ExpeditionTargetPicker {...args} />
      </div>
    </div>
  ),
};
