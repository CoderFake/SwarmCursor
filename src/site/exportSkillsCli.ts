import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildSkillArchiveFiles, createZipArchiveBytes } from "./skillPackager";

const rootDir = process.cwd();
const files = buildSkillArchiveFiles();

for (const file of files) {
  const fullPath = join(rootDir, "skills", file.path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, file.content, "utf8");
}

const zipBytes = createZipArchiveBytes(files);
mkdirSync(join(rootDir, "dist-site"), { recursive: true });
writeFileSync(join(rootDir, "dist-site", "swarm-cursor-skills.zip"), zipBytes);
console.log(
  `Exported ${files.length} English skill files to skills/swarm-cursor/ and dist-site/swarm-cursor-skills.zip (${zipBytes.byteLength} bytes)`
);
