import type { Locator } from "vitest/browser";

/**
 * Safely gets an element from a Locator and executes a callback if it matches the expected type.
 * @param locator - The vitest Locator
 * @param type - The expected element constructor (e.g., HTMLButtonElement)
 * @param callback - Function to execute with the typed element
 */
export function withElement<T extends Element>(
  locator: Locator,
  type: new (...args: any[]) => T,
  callback: (element: T) => void
): void {
  const element = locator.element();
  if (element instanceof type) {
    callback(element);
  }
}

/**
 * Focuses an element from a Locator if it's an HTMLElement.
 * Common shorthand for the most frequent use case.
 */
export function focusElement(locator: Locator): void {
  withElement(locator, HTMLElement, (el) => el.focus());
}

/**
 * Safely focuses a raw element if it's an HTMLElement.
 * @param element - The element to focus (can be undefined/null)
 */
export function focusRawElement(element: Element | null | undefined): void {
  if (element instanceof HTMLElement) {
    element.focus();
  }
}

/**
 * Safely gets the value from an input element, returns empty string if not an input.
 * @param locator - The vitest Locator
 * @returns The input value or empty string
 */
export function getInputValue(locator: Locator): string {
  const element = locator.element();
  return element instanceof HTMLInputElement ? element.value : "";
}
