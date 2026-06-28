// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

const files = await Array.fromAsync(new Bun.Glob("packages/**/*.ts").scan("."));
const missing = [];
for (const file of files) {
  const text = await Bun.file(file).text();
  if (!text.includes("SPDX-License-Identifier: MPL-2.0")) missing.push(file);
}
if (missing.length) {
  console.error(missing.join("\n"));
  process.exit(1);
}
console.log(`Checked ${files.length} source files.`);

export {};
