import {
  type PropsOf,
  type Signal,
  Slot,
  component$,
  useContextProvider,
  useSignal
} from "@qwik.dev/core";
import { PopoverContent } from "../popover/popover-content";
import { type NavbarContext, navbarContextId } from "./navbar-root";

type NavbarItemContentProps = PropsOf<"div">;

export const NavbarItemContent = component$((props: NavbarItemContentProps) => {
  const numItems = 0;
  const itemRefs = useSignal<Signal<HTMLElement | undefined>[]>([]);

  // Create a fresh scoped context for items within this content
  const scopedContext: NavbarContext = {
    numItems,
    itemRefs
  };

  useContextProvider(navbarContextId, scopedContext);

  return (
    <PopoverContent {...props}>
      <Slot />
    </PopoverContent>
  );
});
