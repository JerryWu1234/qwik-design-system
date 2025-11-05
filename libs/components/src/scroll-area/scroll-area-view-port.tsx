import {
  $,
  component$,
  type PropsOf,
  Slot,
  sync$,
  useContext,
  useOnDocument
} from "@qwik.dev/core";
import { scrollAreaContextId } from "./scroll-area-context";

type PublicViewPortProps = PropsOf<"div"> & {
  /** Event handler for scroll events */
  onScroll$?: (e: Event) => void;
};
/** A viewport component that contains the scrollable content and manages overflow detection */
export const ScrollAreaViewport = component$<PublicViewPortProps>((props) => {
  const context = useContext(scrollAreaContextId);
  const a11yTabIndex = 0;
  const updateOverflow = $((viewport: HTMLElement) => {
    const hasVerticalOverflow = viewport.scrollHeight > viewport.clientHeight;
    const hasHorizontalOverflow = viewport.scrollWidth > viewport.clientWidth;
    context.hasOverflow.value = hasVerticalOverflow || hasHorizontalOverflow;
  });
  const onScroll$ = $(async (e: Event) => {
    const viewport = e.target as HTMLElement;
    const verticalScrollbar = context.verticalScrollbarRef.value;
    const horizontalScrollbar = context.horizontalScrollbarRef.value;
    await updateOverflow(viewport);
    if (context.type === "scroll") {
      context.isScrolling.value = true;
      clearTimeout(context.scrollTimeout.value);
      context.scrollTimeout.value = setTimeout(() => {
        context.isScrolling.value = false;
      }, context.hideDelay) as unknown as number;
    }
    if (verticalScrollbar) {
      const verticalThumb = verticalScrollbar.querySelector(
        "[ui-qds-scroll-area-thumb]"
      ) as HTMLElement;
      if (verticalThumb) {
        const scrollRatio =
          viewport.scrollTop / (viewport.scrollHeight - viewport.clientHeight);
        const maxTop = verticalScrollbar.clientHeight - verticalThumb.clientHeight;
        verticalThumb.style.transform = `translateY(${scrollRatio * maxTop}px)`;
      }
    }
    if (horizontalScrollbar) {
      const horizontalThumb = horizontalScrollbar.querySelector(
        "[ui-qds-scroll-area-thumb]"
      ) as HTMLElement;
      if (horizontalThumb) {
        const scrollRatio =
          viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
        const maxLeft = horizontalScrollbar.clientWidth - horizontalThumb.clientWidth;
        horizontalThumb.style.transform = `translateX(${scrollRatio * maxLeft}px)`;
      }
    }
    // Call the provided onScroll$ handler if it exists
    props.onScroll$?.(e);
  });
  useOnDocument(
    "resize",
    $(async () => {
      const viewport = context.viewportRef.value;
      if (viewport) {
        await updateOverflow(viewport);
      }
    })
  );
  useOnDocument(
    "wheel",
    $(async (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const viewport = context.viewportRef.value;
        if (viewport) {
          await updateOverflow(viewport);
        }
      }
    })
  );
  useOnDocument(
    "keydown",
    $((e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "0")
      ) {
        const viewport = context.viewportRef.value;
        if (viewport) {
          const overflowEvent = new CustomEvent("qdsoverflowcheck");
          setTimeout(() => {
            viewport.dispatchEvent(overflowEvent);
          }, 50);
        }
      }
    })
  );
  return (
    <div
      {...props}
      // The viewport container that wraps the scrollable content
      ui-qds-scroll-area-viewport
      onScroll$={[onScroll$, props.onScroll$]}
      onQdsoverflowcheck$={$(async () => {
        const viewport = context.viewportRef.value;
        if (viewport) {
          await updateOverflow(viewport);
        }
      })}
      window:onLoad$={
        context.type !== "scroll"
          ? sync$(() => {
              const viewport = document.querySelector("[ui-qds-scroll-area-viewport]");
              if (viewport) {
                const event = new CustomEvent("qdsoverflowcheck");
                viewport.dispatchEvent(event);
              }
            })
          : undefined
      }
      ref={(el) => {
        context.viewportRef.value = el;
        if (el) {
          void updateOverflow(el);
        }
      }}
      tabIndex={a11yTabIndex}
      role="region"
      aria-label="Scrollable content"
    >
      <Slot />
    </div>
  );
});
