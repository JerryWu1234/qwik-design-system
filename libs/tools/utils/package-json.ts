import { readFileSync } from "node:fs";

type PackageJson = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

function isPackageJson(obj: unknown): obj is PackageJson {
  if (typeof obj !== "object" || obj === null) return false;
  return (
    (!("dependencies" in obj) || typeof obj.dependencies === "object") &&
    (!("peerDependencies" in obj) || typeof obj.peerDependencies === "object") &&
    (!("devDependencies" in obj) || typeof obj.devDependencies === "object")
  );
}

/**
 * Safely reads and parses a package.json file
 * @param relativePath - Relative path to the package.json file from the current working directory
 * @returns Parsed package.json object
 * @throws Error if the file doesn't exist or has invalid structure
 */
export function readPackageJson(relativePath = "./package.json"): PackageJson {
  const parsedPkg: unknown = JSON.parse(readFileSync(relativePath, "utf-8"));
  if (!isPackageJson(parsedPkg)) {
    throw new Error(`Invalid package.json structure at ${relativePath}`);
  }
  return parsedPkg;
}
