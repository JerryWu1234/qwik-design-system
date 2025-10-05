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

import { type BindableProps, useBindings } from "@kunai-consulting/qwik-utils";
import anchorStyles from "./anchor-logic.css?inline";

export const popoverContextId = createContextId<PopoverContext>("qds-popover");

type PopoverContext = {
  contentRef: Signal<HTMLDivElement | undefined>;
  triggerRef: Signal<HTMLButtonElement | undefined>;
  localId: string;
  isOpenSig: Signal<boolean>;
  canExternallyChangeSig: Signal<boolean>;
  isHiddenSig: Signal<boolean>;
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

  const { openSig: isOpenSig } = useBindings(props, {
    open: false
  });

  const isInitialRenderSig = useSignal(true);
  const canExternallyChangeSig = useSignal(true);
  const isPolyfillExecutedSig = useSignal(false);
  const isHiddenSig = useSignal(true);

  const isInitiallyOpenSig = useComputed$(() => {
    if (isInitialRenderSig.value && isOpenSig.value) {
      return true;
    }

    return false;
  });

  const context: PopoverContext = {
    contentRef,
    triggerRef,
    localId,
    isOpenSig,
    canExternallyChangeSig,
    isHiddenSig,
    hover
  };

  useContextProvider(popoverContextId, context);

  const handleExternalToggle$ = $(async () => {
    if (!canExternallyChangeSig.value) return;
    if (!contentRef.value) return;

    if (isOpenSig.value) {
      await contentRef.value.showPopover();
    } else {
      await contentRef.value.hidePopover();
    }
  });

  const handlePolyfill$ = $(async () => {
    if (isServer || isPolyfillExecutedSig.value) return;

    const isUsingFixedPosition = contentRef.value
      ? window.getComputedStyle(contentRef.value).position === "fixed"
      : false;

    if (isUsingFixedPosition) {
      isPolyfillExecutedSig.value = true;
      isHiddenSig.value = false;
      return;
    }

    const needsAnchorPolyfill = !("anchorName" in document.documentElement.style);

    if (needsAnchorPolyfill) {
      await polyfill();
    }

    isPolyfillExecutedSig.value = true;
    isHiddenSig.value = false;
  });

  useTask$(async function handleChange({ track, cleanup }) {
    track(() => isOpenSig.value);

    if (!isInitialRenderSig.value) {
      await onChange$?.(isOpenSig.value);
    }

    await handlePolyfill$();

    await handleExternalToggle$();

    cleanup(() => {
      if (hoverTimeout.value !== undefined) {
        clearTimeout(hoverTimeout.value);
        hoverTimeout.value = undefined;
      }

      if (!isInitialRenderSig.value) return;
      isInitialRenderSig.value = false;
    });
  });

  /**
   *  AVOID THIS UNLESS YOU REALLY KNOW WHAT YOU ARE DOING
   *  qvisible -> conditionally add a visible task
   */
  const handleOpenOnRender$ = isInitiallyOpenSig.value
    ? $(async () => {
        await handlePolyfill$();
        context.contentRef.value?.showPopover();
      })
    : undefined;

  /**
   *  AVOID THIS UNLESS YOU REALLY KNOW WHAT YOU ARE DOING
   *  In this case there is a perf cost to wanting popover open immediately on render.
   */
  if (isInitiallyOpenSig.value) {
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
        isOpenSig.value = true;
        hoverTimeout.value = undefined;
      }, delay);
    } else {
      isOpenSig.value = true;
    }
  });

  const handleHoverOut$ = $(() => {
    // Clear any existing timeout
    if (hoverTimeout.value !== undefined) {
      clearTimeout(hoverTimeout.value);
    }

    if (closeDelay > 0) {
      hoverTimeout.value = window.setTimeout(() => {
        isOpenSig.value = false;
        hoverTimeout.value = undefined;
      }, closeDelay);
    } else {
      isOpenSig.value = false;
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
      data-open={isOpenSig.value}
      data-closed={!isOpenSig.value}
      data-qds-popover-root
      internalRef={rootRef}
      fallback={fallback}
    >
      <Slot />
    </Render>
  );
});
