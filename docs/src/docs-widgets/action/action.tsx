import { type PropsOf, Slot, component$ } from "@qwik.dev/core";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "px-2 py-2.5 border-[1.6px] text-sm leading-[142.857%] flex items-center gap-2 z-2 relative transform hover:-translate-[2px] transition-transform duration-300",
  {
    variants: {
      variant: {
        primary: "border-lavender-500 bg-lavender-400 text-white",
        secondary: "border-lavender-400 bg-lavender-200 text-lavender-600"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

const shadowVariants = cva("absolute inset-0 z-1 translate-1", {
  variants: {
    variant: {
      primary: "bg-[#6C2CC4]",
      secondary: "bg-[#AC7EF4]"
    }
  },
  defaultVariants: {
    variant: "primary"
  }
});

type HeroButtonProps = (
  | ({ as: "a" } & PropsOf<"a">)
  | ({ as?: "button" } & PropsOf<"button">)
) & {
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export const Action = component$<HeroButtonProps>(
  ({ variant = "primary", as = "button", ...props }) => {
    const classNames = cn(buttonVariants({ variant }), props.class);

    return (
      <div class="relative">
        {as === "a" ? (
          <a {...(props as PropsOf<"a">)} class={classNames}>
            <Slot />
          </a>
        ) : (
          <button {...(props as PropsOf<"button">)} class={classNames}>
            <Slot />
          </button>
        )}
        <div class={shadowVariants({ variant })} aria-hidden="true" />
      </div>
    );
  }
);
