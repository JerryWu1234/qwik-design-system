import { Lucide } from "@qds.dev/ui";
import { component$ } from "@qwik.dev/core";
import { Action } from "../../docs-widgets/action/action";
import { Home } from "../../docs-widgets/home";
import { Spacer } from "../../docs-widgets/spacer/spacer";

export default component$(() => {
  return (
    <>
      <Spacer class="h-16 lg:h-52" />
      <Home.Decor />
      <div class="grid place-items-center px-4 text-center gap-8">
        <h1 class="font-arcade text-[40px] leading-[130%] max-w-[12ch] lg:text-[72px] lg:leading-[125%] relative">
          <span>WIP</span>
        </h1>

        <span class="font-semibold leading-[137.5%] max-w-[40ch] lg:text-[20px] lg:leading-[140%]">
          This page is a work in progress.
        </span>

        <div class="flex gap-6 flex-wrap justify-center">
          <Action as="a" variant="primary" href="/">
            <span>Back Home</span>
            <Lucide.ArrowRight class="size-4" />
          </Action>
        </div>
      </div>
    </>
  );
});
