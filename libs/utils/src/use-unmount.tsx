import {
  type QRL,
  type Signal,
  implicit$FirstArg,
  isBrowser,
  isServer,
  sync$,
  useOnDocument,
  useSignal,
  useTask$
} from "@qwik.dev/core";

/**
 * Hook that sets up a global listener for the qsymbol event (fired when Qwik app resumes).
 * When qsymbol fires, dispatches a custom "qresumed" event that can be used to clean up
 * server-rendered content that shouldn't persist after hydration.
 *
 * This hook uses globalThis to ensure the qresumed event is only dispatched once per
 * application, even if called from multiple component instances.
 *
 * @example
 * // In a component that needs to clean up server-rendered content
 * export const MyComponent = component$(() => {
 *   useResumed();
 *
 *   // Listen for the resumed event
 *   useOnDocument("qresumed", sync$(() => {
 *     // Clean up logic here
 *   }));
 *
 *   return <div>...</div>;
 * });
 */
export function useResumedQrl(qrl: QRL<() => void>): void {
  const initResumedFn = sync$(() => {
    const global = globalThis as typeof globalThis & {
      __qds_resumed_dispatched?: boolean;
    };

    if (global.__qds_resumed_dispatched) {
      return;
    }

    global.__qds_resumed_dispatched = true;

    const event = new CustomEvent("qresumed", {
      bubbles: true,
      detail: {
        timestamp: Date.now()
      }
    });
    document.dispatchEvent(event);
  });

  if (isServer) {
    useOnDocument("qsymbol", initResumedFn);
  }

  useOnDocument("qresumed", qrl);
}

export const useResumed$ = implicit$FirstArg(useResumedQrl);

/**
 * Global MutationObserver for tracking Qwik DOM removals.
 * More efficient than creating one observer per component instance.
 */
class GlobalUnmountObserver {
  private observer: MutationObserver | null = null;
  private cleanupMap = new WeakMap<Element, Set<() => void>>();
  private elementsToWatch = new Set<Element>();

  private initObserver() {
    if (this.observer || typeof document === "undefined") return;

    this.observer = new MutationObserver(() => {
      for (const element of this.elementsToWatch) {
        if (!element.parentElement || !document.contains(element)) {
          const cleanups = this.cleanupMap.get(element);
          if (cleanups) {
            for (const cleanup of cleanups) {
              cleanup();
            }
            cleanups.clear();
          }
          this.elementsToWatch.delete(element);
        }
      }

      if (this.elementsToWatch.size === 0) {
        this.observer?.disconnect();
        this.observer = null;
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  register(element: Element, cleanup: () => void) {
    this.initObserver();

    if (!this.cleanupMap.has(element)) {
      this.cleanupMap.set(element, new Set());
    }

    this.cleanupMap.get(element)?.add(cleanup);
    this.elementsToWatch.add(element);
  }

  unregister(element: Element, cleanup: () => void) {
    const cleanups = this.cleanupMap.get(element);
    if (cleanups) {
      cleanups.delete(cleanup);

      if (cleanups.size === 0) {
        this.elementsToWatch.delete(element);
      }
    }
  }
}

const globalUnmountObserver = new GlobalUnmountObserver();

export function useMountTaskQrl(
  taskFn: QRL<(ctx: { cleanup: (cleanupFn: () => void) => void }) => void>,
  elementRef: Signal<Element | undefined>
): void {
  const cleanupFn = useSignal<QRL<() => void> | undefined>();

  useTask$(({ cleanup }) => {
    taskFn({
      /**
       * NOTE: cleanup gets wrapped in QRL for useTask$-style DX via qdsTransformPlugin / environment agnostic unmount behavior.
       */
      cleanup: (fn) => {
        // @ts-expect-error - fn is a function
        cleanupFn.value = fn;
      }
    });

    if (isBrowser) {
      cleanup(() => cleanupFn.value?.());
    }
  });

  if (isServer) {
    useResumed$(() => {
      const element = elementRef.value;
      if (!element) return;

      const cleanup = () => cleanupFn.value?.();

      globalUnmountObserver.register(element, cleanup);
    });
  }
}

export const useMountTask$ = implicit$FirstArg(useMountTaskQrl);
