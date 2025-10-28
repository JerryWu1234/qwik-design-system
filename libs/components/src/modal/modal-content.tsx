import { $, component$, type PropsOf, Slot, useContext, useSignal } from "@qwik.dev/core";
import { modalContextId } from "./modal-root";

/**
 * Determines if the backdrop of the Modal has been clicked.
 */
const isBackdropClick = (dialogEl: HTMLDialogElement, event: PointerEvent): boolean => {
  const modal = dialogEl.getBoundingClientRect();
  const { clientX: x, clientY: y } = event;
  const isInsideModal =
    x >= modal.left && x <= modal.right && y >= modal.top && y <= modal.bottom;
  return !isInsideModal;
};

export const ModalContent = component$((props: PropsOf<"dialog">) => {
  const context = useContext(modalContextId);
  const isDownOnBackdrop = useSignal(false);
  const descriptionId = `${context.localId}-description`;
  const titleId = `${context.localId}-title`;

  const handleBackdropDown$ = $((e: PointerEvent) => {
    e.stopPropagation();
    if (!context.contentRef.value) {
      isDownOnBackdrop.value = false;
      return;
    }
    isDownOnBackdrop.value = isBackdropClick(context.contentRef.value, e);
  });

  const handleBackdropSlide$ = $((e: PointerEvent) => {
    e.stopPropagation();
    if (!isDownOnBackdrop.value) {
      return;
    }

    if (!context.closeOnOutsideClick) {
      isDownOnBackdrop.value = false;
      return;
    }

    if (!context.contentRef.value) {
      isDownOnBackdrop.value = false;
      return;
    }

    const isBackdrop = isBackdropClick(context.contentRef.value, e);

    if (isBackdrop) {
      context.isOpen.value = false;
    }

    isDownOnBackdrop.value = false;
  });

  const handleClose$ = $(() => {
    context.isOpen.value = false;
  });

  return (
    <dialog
      {...props}
      ref={context.contentRef}
      onPointerDown$={[handleBackdropDown$, props.onPointerDown$]}
      onPointerUp$={[handleBackdropSlide$, props.onPointerUp$]}
      onClose$={[handleClose$, props.onClose$]}
      aria-labelledby={context.isTitle.value ? titleId : undefined}
      aria-describedby={context.isDescription.value ? descriptionId : undefined}
    >
      <Slot />
    </dialog>
  );
});
