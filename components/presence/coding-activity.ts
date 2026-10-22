import type { Activity } from "react-use-lanyard";

import { activityImage } from "./activity-image";
import type { Presence } from "./select-presence";

/**
 * The code editors whose rich presence (vscord, the JetBrains and Zed
 * plugins…) means Lucas is coding, not playing, by activity name.
 */
const EDITORS = new Set([
  "visual studio code",
  "vs code",
  "vscode",
  "code",
  "code - insiders",
  "visual studio code - insiders",
  "vscodium",
  "cursor",
  "windsurf",
  "zed",
  "neovim",
  "vim",
  "sublime text",
  "webstorm",
  "intellij idea",
  "intellij idea ultimate",
  "intellij idea community",
  "phpstorm",
  "pycharm",
  "rider",
  "goland",
  "rustrover",
  "android studio",
  "xcode",
]);

const LISTENING = 2;
const CUSTOM_STATUS = 4;

export const isEditor = (activity: Activity): boolean =>
  activity.type !== LISTENING &&
  activity.type !== CUSTOM_STATUS &&
  EDITORS.has(activity.name.trim().toLowerCase());

/** vscord's default caption: "Editing a TypeScript file". */
const EDITING_A_FILE = /^editing an? (.+?) file$/i;
/** A bare language name, as the JetBrains and Zed plugins caption it. */
const LANGUAGE_NAME = /^[A-Za-z][A-Za-z0-9+#.-]*(?: [A-Za-z0-9+#-]+){0,2}$/;
/** "In imjustlucas.dev", "Workspace: imjustlucas.dev", "Project: …". */
const WORKSPACE = /^(?:in|workspace:?|project:?)\s+(.+)$/i;
/** vscord's problem count after the workspace: "- 3 problems found". */
const PROBLEMS = /\s+-\s+\d+\s+problems?\b.*$/i;
const IDLE = /\bidl/i;
/** A sentence about a file or a place, never a language name. */
const SENTENCE = /^(?:editing|working|viewing|reading|debugging|in|on)\b/i;

const language = (editor: Activity): string | undefined => {
  const caption = editor.assets?.large_text?.trim();
  if (!caption) return undefined;
  const editing = EDITING_A_FILE.exec(caption);
  if (editing) return editing[1];
  if (
    IDLE.test(caption) ||
    SENTENCE.test(caption) ||
    EDITORS.has(caption.toLowerCase())
  ) {
    return undefined;
  }
  // A file name has a dot followed by an extension; a language never does
  if (/\.\w+$/.test(caption)) return undefined;
  return LANGUAGE_NAME.test(caption) ? caption : undefined;
};

const project = (editor: Activity): string | undefined => {
  for (const line of [editor.details, editor.state]) {
    const workspace = line && WORKSPACE.exec(line.trim());
    if (workspace) {
      const name = workspace[1].replace(PROBLEMS, "").trim();
      if (name) return name;
    }
  }
  return undefined;
};

/**
 * What Lucas is coding: the editor, the language and the project (his
 * workspace), read from the editor's rich presence. The file he edits, the
 * line or any other free text is never kept, so it can never show.
 */
export const codingActivity = (
  editor: Activity,
): Extract<Presence, { kind: "coding" }> => {
  const lang = language(editor);
  const workspace = project(editor);
  const artwork = activityImage(
    editor,
    editor.assets?.large_image,
    lang ?? editor.name,
  );
  const badge = activityImage(editor, editor.assets?.small_image, editor.name);

  return {
    kind: "coding",
    editor: editor.name,
    ...(lang && { language: lang }),
    ...(workspace && { project: workspace }),
    ...(artwork && { artwork }),
    ...(badge && { badge }),
    ...(editor.timestamps?.start && { startedAt: editor.timestamps.start }),
  };
};
