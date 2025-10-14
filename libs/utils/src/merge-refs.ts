import type { Signal } from "@qwik.dev/core";

/**
 * Combines multiple refs to be applied to a single element
 * Type casts signals internally to ensure compatibility
 */
export const mergeRefs = <T extends Element>(
  ...refs: (
    | Signal<Element | undefined>
    | Signal<T | undefined>
    | ((el: T) => void)
    | undefined
  )[]
) => {
  return (el: T) => {
    for (const ref of refs) {
      if (!ref) continue;

      if (typeof ref === "function") {
        ref(el);
      } else {
        (ref as Signal<T | undefined>).value = el;
      }
    }
  };
};
