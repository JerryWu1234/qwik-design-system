import { Lucide } from "@kunai-consulting/qwik";
import { component$ } from "@qwik.dev/core";
import { Action } from "../action/action";
import { CopyButton } from "../copy-button/copy-button";

export const Hero = component$(() => {
  const copyText = "npm create qds@latest";

  const shimmerMarkup = (
    <span
      class="absolute inset-0 bg-gradient-text-shimmer animate-shimmer"
      aria-hidden="true"
    >
      Qwik Design System
    </span>
  );

  return (
    <>
      <div class="grid place-items-center px-4 text-center gap-8">
        <h1 class="font-arcade text-[40px] leading-[130%] max-w-[12ch] lg:text-[72px] lg:leading-[125%] relative">
          <span>
            <span class="text-lavender-600">Qwik</span> Design System
          </span>

          {shimmerMarkup}
        </h1>

        <span class="font-semibold leading-[137.5%] max-w-[40ch] lg:text-[20px] lg:leading-[140%]">
          The world's fastest UI toolchain—HTML until your users interact.
        </span>

        <div class="flex gap-6 flex-wrap justify-center">
          <Action as="a" variant="primary" href="/wip">
            <span>Get Started</span>
            <Lucide.ArrowRight class="size-4" />
          </Action>

          <CopyButton textToCopy={copyText} displayText={copyText} />
        </div>
      </div>
    </>
  );
});
