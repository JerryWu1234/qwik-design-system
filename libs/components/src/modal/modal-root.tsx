import { createNoScroll, markScrollable } from "@fluejs/noscroll";
import { initTouchHandler, resetTouchHandler } from "@fluejs/noscroll/touch";
import { type BindableProps, useBindings } from "@qds.dev/utils";
import {
  type PropsOf,
  type Signal,
  Slot,
  component$,
  createContextId,
  noSerialize,
  useConstant,
  useContext,
  useContextProvider,
  useId,
  useSignal,
  useStyles$,
  useTask$
} from "@qwik.dev/core";
import { Render } from "../render/render";
import styles from "./modal.css?inline";

export const modalContextId = createContextId<ModalContext>("qds-modal");

type ModalContext = {
  contentRef: Signal<HTMLDialogElement | undefined>;
  isOpen: Signal<boolean>;
  closeOnOutsideClick: boolean;
  level: number;
  isTitle: Signal<boolean>;
  isDescription: Signal<boolean>;
  localId: string;
};

type ModalRootProps = PropsOf<"div"> &
  BindableProps<{
    open: boolean;
  }> & {
    closeOnOutsideClick?: boolean;
  };

export const ModalRoot = component$((props: ModalRootProps) => {
  useStyles$(styles);

  const contentRef = useSignal<HTMLDialogElement | undefined>();
  const isInitialized = useSignal(false);
  const disablePageScrollFn = useSignal<() => void>();
  const enablePageScrollFn = useSignal<() => void>();
  const isTitle = useSignal(false);
  const isDescription = useSignal(false);
  const localId = useId();

  // handling nested state
  const parentContext = useContext(modalContextId, null);
  const level = useConstant(() => {
    return (parentContext?.level ?? 0) + 1;
  });

  const { closeOnOutsideClick = true, ...rest } = props;

  const { openSig: isOpen } = useBindings(rest, {
    open: false
  });

  useTask$(({ track, cleanup }) => {
    track(isOpen);

    if (!isInitialized.value) {
      if (!contentRef.value) return;
      markScrollable(contentRef.value);
      isInitialized.value = true;

      const { disablePageScroll, enablePageScroll } = createNoScroll({
        onInitScrollDisable: initTouchHandler,
        onResetScrollDisable: resetTouchHandler
      });

      disablePageScrollFn.value = noSerialize(disablePageScroll);
      enablePageScrollFn.value = noSerialize(enablePageScroll);
    }

    if (isOpen.value) {
      contentRef.value?.showModal();
      disablePageScrollFn.value?.();
    } else {
      contentRef.value?.close();
    }

    cleanup(() => {
      if (level > 1) return;
      enablePageScrollFn.value?.();
    });
  });

  const context: ModalContext = {
    contentRef,
    isOpen,
    closeOnOutsideClick,
    level,
    isTitle,
    isDescription,
    localId
  };

  useContextProvider(modalContextId, context);

  return (
    <Render
      {...rest}
      fallback="div"
      ui-qds-scope
      ui-open={isOpen.value}
      ui-closed={!isOpen.value}
    >
      <Slot />
    </Render>
  );
});
