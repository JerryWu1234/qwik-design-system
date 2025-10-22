/**
 * Main Generator for QDS Styles
 *
 * This script generates the complete qds.css file including:
 * - Layer ordering
 * - Custom variants for data attributes
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateAllVariants } from "./data-attrs";
import { generateLayerOrder } from "./layers";

/**
 * Generate the complete CSS file
 */
function generateCSS(): string {
  const sections: string[] = [];

  // 1. Layer ordering comes first
  sections.push(generateLayerOrder());

  // 2. Custom variants for data attributes
  sections.push(generateAllVariants());

  // Join all sections with double newlines
  return sections.join("\n\n");
}

const css = generateCSS();
const outputPath = resolve(import.meta.dirname, "qds-tailwind.css");
writeFileSync(outputPath, css, "utf-8");

console.log(`✅ Generated ${outputPath}`);
