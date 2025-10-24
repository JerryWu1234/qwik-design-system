import polyfill from "@oddbird/css-anchor-positioning/fn";
import {
  $,
  type PropsOf,
  type Signal,
  Slot,
  component$,
  createContextId,
  isServer,
  useComputed$,
  useContextProvider,
  useId,
  useSignal,
  useStyles$,
  useTask$,
  useVisibleTask$
} from "@qwik.dev/core";
import { Render } from "../render/render";
import type { AllowedFallbacks } from "../render/render";

export type PopoverRootProps<Fallback extends "div" | "li" = "div"> = Omit<
  PropsOf<Fallback>,
  "onChange$"
> & {
  onChange$?: (open: boolean) => void;
  _fallback?: string;
  hover?: boolean;
  delay?: number;
  closeDelay?: number;
} & BindableProps<{ open: boolean }>;

import { type BindableProps, useBindings } from "@qds.dev/utils";
import anchorStyles from "./anchor-logic.css?inline";

export const popoverContextId = createContextId<PopoverContext>("qds-popover");

type PopoverContext = {
  contentRef: Signal<HTMLDivElement | undefined>;
  triggerRef: Signal<HTMLButtonElement | undefined>;
  localId: string;
  isOpen: Signal<boolean>;
  canExternallyChange: Signal<boolean>;
  isHidden: Signal<boolean>;
  hover: boolean;
};

export const PopoverRoot = component$((props: PopoverRootProps) => {
  const {
    onChange$,
    hover = false,
    _fallback,
    delay = hover ? 50 : 0,
    closeDelay = hover ? 300 : 0,
    ...rest
  } = props;

  useStyles$(anchorStyles);

  const contentRef = useSignal<HTMLDivElement>();
  const triggerRef = useSignal<HTMLButtonElement>();
  const rootRef = useSignal<HTMLDivElement>();
  const localId = useId();
  const hoverTimeout = useSignal<number | undefined>(undefined);

  const { openSig: isOpen } = useBindings(props, {
    open: false
  });

  const isInitialRender = useSignal(true);
  const canExternallyChange = useSignal(true);
  const isPolyfillExecuted = useSignal(false);
  const isHidden = useSignal(true);

  const isInitiallyOpen = useComputed$(() => {
    if (isInitialRender.value && isOpen.value) {
      return true;
    }

    return false;
  });

  const context: PopoverContext = {
    contentRef,
    triggerRef,
    localId,
    isOpen,
    canExternallyChange,
    isHidden,
    hover
  };

  useContextProvider(popoverContextId, context);

  const handleExternalToggle$ = $(async () => {
    if (!canExternallyChange.value) return;
    if (!contentRef.value) return;

    // Set flag to false to prevent the subsequent toggle event from re-triggering
    canExternallyChange.value = false;

    try {
      if (isOpen.value) {
        await contentRef.value.showPopover();
      } else {
        await contentRef.value.hidePopover();
      }
    } catch (error) {
      // Reset flag on error so next attempt can proceed
      canExternallyChange.value = true;

      // Only silence InvalidStateError (already in desired state), throw everything else
      if (error instanceof DOMException && error.name === "InvalidStateError") {
        return;
      }
      throw error;
    }
  });

  const handlePolyfill$ = $(async () => {
    if (isServer || isPolyfillExecuted.value) return;

    const isUsingFixedPosition = contentRef.value
      ? window.getComputedStyle(contentRef.value).position === "fixed"
      : false;

    if (isUsingFixedPosition) {
      isPolyfillExecuted.value = true;
      isHidden.value = false;
      return;
    }

    const needsAnchorPolyfill = !("anchorName" in document.documentElement.style);

    if (needsAnchorPolyfill) {
      await polyfill();
    }

    isPolyfillExecuted.value = true;
    isHidden.value = false;
  });

  useTask$(async function handleChange({ track, cleanup }) {
    track(() => isOpen.value);

    if (!isInitialRender.value) {
      await onChange$?.(isOpen.value);
    }

    await handlePolyfill$();

    await handleExternalToggle$();

    cleanup(() => {
      if (hoverTimeout.value !== undefined) {
        clearTimeout(hoverTimeout.value);
        hoverTimeout.value = undefined;
      }

      if (!isInitialRender.value) return;
      isInitialRender.value = false;
    });
  });

  /**
   *  AVOID THIS UNLESS YOU REALLY KNOW WHAT YOU ARE DOING
   *  qvisible -> conditionally add a visible task
   */
  const handleOpenOnRender$ = isInitiallyOpen.value
    ? $(async () => {
        await handlePolyfill$();
        context.contentRef.value?.showPopover();
      })
    : undefined;

  /**
   *  AVOID THIS UNLESS YOU REALLY KNOW WHAT YOU ARE DOING
   *  In this case there is a perf cost to wanting popover open immediately on render.
   */
  if (isInitiallyOpen.value) {
    useVisibleTask$(async () => {
      await handleOpenOnRender$?.();
    });
  }

  const fallback = _fallback ? (_fallback as AllowedFallbacks) : "div";

  const handleHoverIn$ = $(() => {
    // Clear any existing timeout
    if (hoverTimeout.value !== undefined) {
      clearTimeout(hoverTimeout.value);
    }

    if (delay > 0) {
      hoverTimeout.value = window.setTimeout(() => {
        isOpen.value = true;
        hoverTimeout.value = undefined;
      }, delay);
    } else {
      isOpen.value = true;
    }
  });

  const handleHoverOut$ = $(() => {
    // Clear any existing timeout
    if (hoverTimeout.value !== undefined) {
      clearTimeout(hoverTimeout.value);
    }

    if (closeDelay > 0) {
      hoverTimeout.value = window.setTimeout(() => {
        isOpen.value = false;
        hoverTimeout.value = undefined;
      }, closeDelay);
    } else {
      isOpen.value = false;
    }
  });

  const handlePointerMove$ = hover
    ? [handleHoverIn$, props.onPointerOver$]
    : props.onPointerMove$;

  const handlePointerOut$ = hover
    ? [handleHoverOut$, props.onPointerOut$]
    : props.onPointerOut$;

  const handlePointerOver$ = hover
    ? [handleHoverIn$, props.onPointerOver$]
    : props.onPointerOver$;

  return (
    <Render
      {...rest}
      onPointerMove$={handlePointerMove$}
      onPointerOut$={handlePointerOut$}
      onPointerOver$={handlePointerOver$}
      data-open={isOpen.value}
      data-closed={!isOpen.value}
      data-qds-popover-root
      internalRef={rootRef}
      fallback={fallback}
    >
      <Slot />
    </Render>
  );
});
