/**
 * Generator for Tailwind CSS Layer Ordering
 *
 * This generates the @layer declaration that defines the cascade order
 * for Tailwind CSS layers in QDS.
 */

/**
 * Generate the @layer ordering declaration
 *
 * @returns CSS string with @layer declaration
 */
export function generateLayerOrder(): string {
  return `/**
 * QDS Layer Ordering
 * 
 * Defines the cascade order for Tailwind CSS layers:
 * - qds: QDS design system tokens and custom variants
 * - theme: Theme-level customizations
 * - base: Base styles and resets
 * - components: Component styles
 * - utilities: Utility classes (highest priority)
 */
@layer qds, theme, base, components, utilities;`;
}
