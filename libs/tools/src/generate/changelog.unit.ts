import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function getLatestTag(): string | null {
  try {
    const tags = execSync("git tag --sort=-version:refname", { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    return tags.find(Boolean) || null;
  } catch {
    return null;
  }
}

function getCommitsBetweenTags(fromTag: string | null, toRef = "HEAD"): string[] {
  if (!fromTag) {
    return [];
  }
  try {
    const commits = execSync(`git log --oneline --no-merges ${fromTag}..${toRef}`, {
      encoding: "utf-8"
    })
      .trim()
      .split("\n")
      .filter(Boolean);
    return commits;
  } catch {
    return [];
  }
}

function extractChangelogSection(changelogContent: string): string {
  const lines = changelogContent.split("\n");
  const firstSection: string[] = [];
  let inSection = false;
  let sectionCount = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      sectionCount++;
      if (sectionCount === 1) {
        inSection = true;
        continue;
      } else if (sectionCount === 2) {
        break;
      }
    }
    if (inSection) {
      firstSection.push(line);
    }
  }

  return firstSection.join("\n");
}

function extractPRNumbers(changelogSection: string): string[] {
  const prRegex = /\[#(\d+)\]/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = prRegex.exec(changelogSection)) !== null) {
    if (match[1]) {
      matches.push(match[1]);
    }
  }
  return matches;
}

describe("changelog generation", () => {
  it("should include all commits with PRs in the changelog", () => {
    const latestTag = getLatestTag();

    // Skip test if no tags exist
    if (!latestTag) {
      console.log("⚠️  No tags found. Skipping test.");
      return;
    }

    const commits = getCommitsBetweenTags(latestTag);

    // Skip test if no commits since last tag
    if (commits.length === 0) {
      console.log("✅ No commits since last tag. Test passed.");
      return;
    }

    // Generate changelog
    try {
      execSync("pnpm changelog", { stdio: "inherit" });
    } catch (error) {
      throw new Error(`Failed to generate changelog: ${(error as Error).message}`, {
        cause: error
      });
    }

    // Read generated changelog
    let changelogContent: string;
    try {
      changelogContent = readFileSync("CHANGELOG.md", "utf-8");
    } catch (error) {
      throw new Error(`Failed to read CHANGELOG.md: ${(error as Error).message}`, {
        cause: error
      });
    }

    const firstSection = extractChangelogSection(changelogContent);
    const prNumbers = extractPRNumbers(firstSection);

    // Check if commits with PR numbers are included
    const commitsWithPRs = commits.filter((commit) => /\(#\d+\)/.test(commit));

    if (commitsWithPRs.length > 0) {
      const prsInCommits = commitsWithPRs
        .map((commit) => {
          const match = commit.match(/\(#(\d+)\)/);
          return match && match[1] ? match[1] : null;
        })
        .filter((pr): pr is string => pr !== null);

      const missingPRs = prsInCommits.filter((pr) => !prNumbers.includes(pr));

      if (missingPRs.length > 0) {
        throw new Error(
          `Missing PRs in changelog: ${missingPRs.join(", ")}. ` +
            `Expected PRs: ${prsInCommits.join(", ")}. ` +
            `Found PRs: ${prNumbers.join(", ")}`
        );
      }
    }

    // Verify the changelog section exists and has content
    expect(firstSection.trim()).not.toBe("");
  });
});
