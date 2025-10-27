import * as fs from "node:fs";
import * as path from "node:path";

const baseDir = process.cwd();
const routesDir = path.join(baseDir, "apps/docs/src/routes");
const publicDir = path.join(baseDir, "apps/docs/public");
const llmsDir = path.join(publicDir, "llms");
const outputFile = path.join(publicDir, "llms.txt");

function toSlug(filePath: string): string {
  return filePath
    .replace(/\/index\.mdx$/, "")
    .replace(/\.mdx$/, "")
    .replace(/\//g, ".")
    .replace(/^\.+/, "");
}

function toRoute(filePath: string): string {
  return `/${filePath
    .replace(/\/index\.mdx$/, "")
    .replace(/\.mdx$/, "")
    .replace(/\\/g, "/")}`;
}

function findRouteFiles(dir: string): string[] {
  let results: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findRouteFiles(fullPath));
    } else if (entry === "index.mdx") {
      results.push(fullPath);
    }
  }
  return results;
}

function ensureMdFile(slug: string, route: string, originalFilePath: string): void {
  const mdPath = path.join(llmsDir, `${slug}.md`);
  let content = "";

  if (fs.existsSync(originalFilePath)) {
    content = fs.readFileSync(originalFilePath, "utf8");
  }

  const heading = `# ${slug.replace(/\./g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}`;
  const metadata = `\n\nAccessible via: \`${route}\`\n`;
  const description = "\n> TODO: Add description.\n";

  fs.writeFileSync(mdPath, `${heading}${metadata}${description}\n${content}`);
  console.log("Updated:", mdPath);
}

function generate(): void {
  if (!fs.existsSync(llmsDir)) {
    fs.mkdirSync(llmsDir, { recursive: true });
  }

  const files = findRouteFiles(routesDir);
  let txt = "# LLM Index\n\n## Routes\n\n";

  for (const file of files) {
    const relative = path.relative(routesDir, file);
    const slug = toSlug(relative);
    const route = toRoute(relative);
    ensureMdFile(slug, route, file);
    txt += `- [${route}](./llms/${slug}.md)\n`;
  }

  fs.writeFileSync(outputFile, txt);
  console.log("\n✅ llms.txt generated successfully.");
}

generate();
