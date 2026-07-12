type BumpKind = "patch" | "minor" | "major";

const bump = Bun.argv[2] as BumpKind | undefined;
if (bump !== "patch" && bump !== "minor" && bump !== "major") {
  throw new Error("Usage: bun scripts/bump-version.ts <patch|minor|major>");
}

const packageJsonUrl = new URL("../package.json", import.meta.url);
const jsrJsonUrl = new URL("../jsr.json", import.meta.url);

const packageJson = await Bun.file(packageJsonUrl).json() as {
  version?: string;
  [key: string]: unknown;
};
const jsrJson = await Bun.file(jsrJsonUrl).json() as {
  version?: string;
  [key: string]: unknown;
};

if (!packageJson.version) {
  throw new Error("package.json is missing version.");
}

if (jsrJson.version && jsrJson.version !== packageJson.version) {
  throw new Error(`Version mismatch: package.json=${packageJson.version}, jsr.json=${jsrJson.version}`);
}

const nextVersion = bumpVersion(packageJson.version, bump);
packageJson.version = nextVersion;
jsrJson.version = nextVersion;

await Bun.write(packageJsonUrl, `${JSON.stringify(packageJson, null, 2)}\n`);
await Bun.write(jsrJsonUrl, `${JSON.stringify(jsrJson, null, 2)}\n`);

console.log(nextVersion);

function bumpVersion(version: string, kind: BumpKind): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (kind === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (kind === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}
