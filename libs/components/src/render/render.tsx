import {
  $,
  type Component,
  type JSXOutput,
  type QwikIntrinsicElements,
  type Signal,
  Slot,
  component$
} from "@qwik.dev/core";

// keyof slows the type server a bunch, instead we use the most common fallbacks
export type AllowedFallbacks =
  | "div"
  | "span"
  | "a"
  | "button"
  | "label"
  | "nav"
  | "ul"
  | "li"
  | "nav";

type RenderInternalProps<T extends AllowedFallbacks> = {
  /** The default element and types if a render prop is not provided */
  fallback: T;
  /**
   *  Library authors use this to pass refs to the component. Consumers of this library use the standard ref prop.
   */
  internalRef?: Signal<HTMLElement | undefined>;

  jsxType?: unknown;
  movedProps?: Record<string, unknown>;
} & QwikIntrinsicElements[T] &
  Record<`${string}$`, unknown>;

/**
 * Creates an object that overrides bind:* props with undefined to prevent them from rendering in the DOM.
 * This approach preserves Qwik's reactivity tracking on the original props.
 */
function getBindOverrides(props: Record<string, unknown>): Record<string, undefined> {
  const overrides: Record<string, undefined> = {};
  for (const key in props) {
    if (key.startsWith("bind:")) {
      overrides[key] = undefined;
    }
  }
  return overrides;
}

/**
 * Render component enables flexible composition by allowing a component to be rendered with a fallback
 * element type.
 *
 * It accepts a _jsxType prop for custom rendering, and falls back to a specified HTML element
 * (div, span, a, button) if no component is provided.
 *
 * This allows components and JSX nodes to be composed with asChild while maintaining proper typing and
 * accessibility.
 *
 * IMPORTANT: Filters out bind:* directives by overriding them with undefined, which preserves
 * Qwik's reactivity tracking while preventing these attributes from appearing in the DOM.
 */
export const Render = component$(
  <T extends AllowedFallbacks>(props: RenderInternalProps<T>): JSXOutput => {
    const { fallback, jsxType, movedProps, internalRef, ...rest } = props;

    fallback;
    jsxType;
    internalRef;
    movedProps;

    const Comp = (props.jsxType ?? props.fallback) as Component;

    const restOverrides = getBindOverrides(rest);
    const movedPropsOverrides = movedProps ? getBindOverrides(movedProps) : undefined;

    return (
      <Comp
        {...rest}
        {...movedProps}
        {...restOverrides}
        {...movedPropsOverrides}
        ref={$((el: HTMLElement) => {
          if (props.ref && "value" in props.ref) {
            (props.ref as Signal<HTMLElement>).value = el;
          }

          if (props.internalRef) {
            props.internalRef.value = el;
          }
        })}
      >
        <Slot />
      </Comp>
    );
  }
);
