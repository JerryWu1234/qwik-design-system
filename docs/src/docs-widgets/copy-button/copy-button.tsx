import { Lucide } from "@qds.dev/ui";
import { $, type PropsOf, component$, useSignal } from "@qwik.dev/core";
import { Action } from "../action/action";

type CopyButtonProps = Omit<PropsOf<"button">, "children"> & {
  textToCopy: string;
  displayText: string;
  successDuration?: number;
};

export const CopyButton = component$<CopyButtonProps>(
  ({ textToCopy, displayText, successDuration = 2000, ...props }) => {
    const isCopied = useSignal(false);

    const handleCopy = $(async () => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        isCopied.value = true;
        setTimeout(() => {
          isCopied.value = false;
        }, successDuration);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    });

    return (
      <Action
        {...props}
        variant="secondary"
        onClick$={handleCopy}
        aria-label={isCopied.value ? "Copied!" : `Copy ${displayText}`}
      >
        <span>{displayText}</span>
        {isCopied.value ? (
          <Lucide.Check class="size-4" />
        ) : (
          <Lucide.Clipboard class="size-4" />
        )}
      </Action>
    );
  }
);
