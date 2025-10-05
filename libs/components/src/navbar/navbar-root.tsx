import {
  type PropsOf,
  type Signal,
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useSignal
} from "@qwik.dev/core";
import { Render } from "../render/render";

type NavbarRootProps = PropsOf<"nav">;

export type NavbarContext = {
  numItems: number;
  itemRefs: Signal<Signal<HTMLElement | undefined>[]>;
};

export const navbarContextId = createContextId<NavbarContext>("qds-navbar");

export const NavbarRoot = component$((props: NavbarRootProps) => {
  const numItems = 0;
  const itemRefs = useSignal<Signal<HTMLElement | undefined>[]>([]);

  const context: NavbarContext = {
    numItems,
    itemRefs
  };

  useContextProvider(navbarContextId, context);

  return (
    <Render fallback="nav" {...props}>
      <Slot />
    </Render>
  );
});
