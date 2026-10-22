import {
  ArrowBigUpDash,
  Backpack,
  Coins,
  Compass,
  Crown,
  Eye,
  Ghost,
  Languages,
  type LucideIcon,
  Paintbrush,
  ScrollText,
  Sparkles,
  SunMoon,
  Trophy,
  UserPlus,
  WandSparkles,
  Waves,
} from "lucide-react";

import type { TrophyId } from "@/lib/trophies/trophies";

/** Each Trophy's line icon, on its disc on the trophies page and the toast. */
export const TROPHY_ICONS: { readonly [T in TrophyId]: LucideIcon } = {
  inspector: Backpack,
  ollie: ArrowBigUpDash,
  surf: Waves,
  bilingual: Languages,
  dayNight: SunMoon,
  whatsNew: ScrollText,
  tour: Compass,
  painter: Paintbrush,
  friendRequest: UserPlus,
  seenOnline: Eye,
  coinRain: Coins,
  top10: Crown,
  firstSecret: Sparkles,
  lost: Ghost,
  secretHunter: WandSparkles,
  platinum: Trophy,
};
