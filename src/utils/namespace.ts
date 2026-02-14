import * as fs from "fs";
import * as path from "path";

export function getNamespace(folderPath: string): string {
  const projectRoot = findNearestCsproj(folderPath);

  if (!projectRoot) {
    console.warn("No .csproj found upward from:", folderPath);
    return "";
  }

  const csprojPath = findCsprojInDirectory(projectRoot);
  const rootNamespace = getRootNamespace(csprojPath);

  const relative = path.relative(projectRoot, folderPath);

  const folderNamespace = relative
    .split(path.sep)
    .filter((p) => p !== "" && p !== "src")
    .join(".");

  if (!folderNamespace) return rootNamespace;

  return `${rootNamespace}.${folderNamespace}`;
}

function findNearestCsproj(startDir: string): string | null {
  let current = startDir;

  while (true) {
    const entries = fs.readdirSync(current);

    const csproj = entries.find((f) => f.endsWith(".csproj"));

    if (csproj) return current;

    const parent = path.dirname(current);

    if (parent === current) break; // reached filesystem root

    current = parent;
  }

  return null;
}

function findCsprojInDirectory(dir: string): string {
  const files = fs.readdirSync(dir);
  const csproj = files.find((f) => f.endsWith(".csproj"));

  if (!csproj) throw new Error("No .csproj found in project root");

  return path.join(dir, csproj);
}

function getRootNamespace(csprojPath: string): string {
  const content = fs.readFileSync(csprojPath, "utf-8");

  const match = content.match(/<RootNamespace>(.*?)<\/RootNamespace>/);

  if (match) return match[1];

  return path.basename(csprojPath, ".csproj");
}
