// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export async function runTui(): Promise<number> {
  try {
    await import("@opentui/core");
    console.log("OpenTUI runtime detected. Full TUI screens require generated SDK operations.");
    return 0;
  } catch (error) {
    console.error("OpenTUI is unavailable; use the non-interactive CLI.", error);
    return 2;
  }
}
