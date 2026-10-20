"use server";

import {
  field,
  type FormState,
  index,
  localized,
  publish,
  upload,
} from "@/app/admin/action-form";
import {
  createAchievement,
  deleteAchievement,
  updateAchievement,
} from "@/lib/admin/achievements";

/**
 * The Achievements editor's Server Actions (see `app/admin/action-form.ts`).
 * An art upload travels in the same form: the request body limit is
 * `serverActions` in `next.config.ts`.
 */

const achievementFields = (form: FormData) => {
  const art = upload(form, "art");
  return {
    revision: field(form, "revision"),
    name: localized(form, "name"),
    description: localized(form, "description"),
    year: field(form, "year"),
    rarity: field(form, "rarity"),
    link: field(form, "link"),
    ...(art && { art }),
  };
};

export async function createAchievementAction(_: FormState, form: FormData) {
  return publish(createAchievement, achievementFields(form));
}

export async function updateAchievementAction(_: FormState, form: FormData) {
  return publish(updateAchievement, {
    ...achievementFields(form),
    index: index(form),
  });
}

export async function deleteAchievementAction(_: FormState, form: FormData) {
  return publish(deleteAchievement, {
    revision: field(form, "revision"),
    index: index(form),
  });
}
