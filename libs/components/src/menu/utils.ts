/**
 * Creates a TreeWalker for menu items, skipping disabled/hidden items and non-items.
 */
export function createMenuWalker(root: HTMLElement) {
  return document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: Element) => {
      // Only accept menu items that are enabled
      if (!node.hasAttribute("ui-qds-menu-item")) {
        return NodeFilter.FILTER_SKIP;
      }
      if (node.hasAttribute("ui-disabled") || node.hasAttribute("disabled")) {
        return NodeFilter.FILTER_SKIP;
      }
      if (
        node.getAttribute("aria-hidden") === "true" ||
        (node as HTMLElement).offsetParent === null
      ) {
        return NodeFilter.FILTER_SKIP;
      }
      // Skip submenu triggers that are inside the submenu they open
      const ariaControls = node.getAttribute("aria-controls");

      if (ariaControls === root.id) {
        return NodeFilter.FILTER_SKIP;
      }

      return NodeFilter.FILTER_ACCEPT;
    }
  });
}

/**
 * Returns the next enabled menu item after the current one, or null if none.
 */
export function getNextMenuItem(current: HTMLElement): HTMLElement | null {
  const root = current.closest('[role="menu"]');
  if (!root || !(root instanceof HTMLElement)) return null;
  const walker = createMenuWalker(root);
  let node: Node | null = walker.currentNode;
  // Find the current node
  while (node && node !== current) {
    node = walker.nextNode();
  }

  const next = walker.nextNode();

  // Get the next menu item
  return next instanceof HTMLElement ? next : null;
}

/**
 * Returns the previous enabled menu item before the current one, or null if none.
 */
export function getPreviousMenuItem(current: HTMLElement): HTMLElement | null {
  const root = current.closest('[role="menu"]');
  if (!root || !(root instanceof HTMLElement)) return null;
  const walker = createMenuWalker(root);
  let node: Node | null = walker.currentNode;
  let previousNode: HTMLElement | null = null;
  // Find the current node and keep track of the previous one
  while (node && node !== current) {
    if (node instanceof HTMLElement) {
      previousNode = node;
    }
    node = walker.nextNode();
  }
  // Only return if previousNode is not the root
  if (previousNode === root) return null;
  return previousNode;
}

/**
 * Returns the first enabled menu item in the menu.
 */
export function getFirstMenuItem(root: HTMLElement): HTMLElement | null {
  const walker = createMenuWalker(root);
  const first = walker.nextNode();
  return first instanceof HTMLElement ? first : null;
}

/**
 * Returns the last enabled menu item in the menu.
 */
export function getLastMenuItem(root: HTMLElement): HTMLElement | null {
  const walker = createMenuWalker(root);
  let lastNode: HTMLElement | null = null;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node instanceof HTMLElement) {
      lastNode = node;
    }
  }
  return lastNode;
}
