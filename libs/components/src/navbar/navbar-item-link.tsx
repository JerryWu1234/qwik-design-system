import {
  type PropsOf,
  Slot,
  component$,
  useConstant,
  useContext,
  useSignal,
  useTask$
} from "@qwik.dev/core";
import { Render } from "../render/render";
import { navbarContextId } from "./navbar-root";

type NavbarItemLinkProps = PropsOf<"a">;

export const NavbarItemLink = component$((props: NavbarItemLinkProps) => {
  const context = useContext(navbarContextId);
  const linkRef = useSignal<HTMLElement>();

  const index = useConstant(() => {
    const idx = context.numItems;
    context.numItems++;
    return idx;
  });

  useTask$(function registerRef() {
    // context.itemRefs.value[index] = linkRef;
  });

  return (
    <Render ref={linkRef} fallback="a" data-index={index} {...props}>
      <Slot />
    </Render>
  );
});
