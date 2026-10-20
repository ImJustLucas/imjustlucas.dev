import { SelectField } from "@/app/admin/admin-form";
import type { Rarity } from "@/lib/content/types";

/** The Rarities, labelled in French, from the most common. */
const RARITIES: ReadonlyArray<readonly [Rarity, string]> = [
  ["common", "commun"],
  ["rare", "rare"],
  ["epic", "épique"],
  ["legendary", "légendaire"],
];

/** The Rarity of a Project or an Achievement. */
export const RarityField: React.FC<{ defaultValue?: Rarity }> = ({
  defaultValue,
}) => (
  <SelectField
    name="rarity"
    label="Rareté"
    options={RARITIES}
    defaultValue={defaultValue}
  />
);
