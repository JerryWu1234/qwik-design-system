import { $, component$, type PropsOf, useSignal } from "@qwik.dev/core";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-qwik";
import { focusElement } from "../../vitest/element";
import { Toggle } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const Indicator = page.getByTestId("indicator");

const Basic = component$((props: PropsOf<typeof Toggle.Root>) => {
  return (
    <Toggle.Root {...props} data-testid="root" aria-label="Toggle">
      Toggle
    </Toggle.Root>
  );
});

const InitialPressed = component$(() => {
  return (
    <Toggle.Root pressed data-testid="root" aria-label="Toggle">
      Toggle
    </Toggle.Root>
  );
});

const WithIndicator = component$(() => {
  return (
    <Toggle.Root data-testid="root" aria-label="Toggle State">
      <Toggle.Indicator data-testid="indicator" fallback={<span>Is Off</span>}>
        <span>Is On</span>
      </Toggle.Indicator>
    </Toggle.Root>
  );
});

const WithSignal = component$(() => {
  const isPressedSig = useSignal(true);

  return (
    <div>
      <Toggle.Root
        data-testid="root"
        aria-label="Toggle Mute"
        bind:pressed={isPressedSig}
      >
        Toggle
      </Toggle.Root>

      <button
        type="button"
        data-testid="toggle-signal"
        onClick$={() => {
          isPressedSig.value = !isPressedSig.value;
        }}
      >
        Toggle Signal
      </button>

      <p>Bound Signal: {isPressedSig.value.toString()}</p>
    </div>
  );
});

const WithChange = component$(() => {
  const countSig = useSignal(0);

  const handleChange = $(() => {
    countSig.value++;
  });

  return (
    <div>
      <Toggle.Root data-testid="root" aria-label="Toggle Like" onChange$={handleChange}>
        Toggle
      </Toggle.Root>
      <p>Count: {countSig.value}</p>
    </div>
  );
});

const Disabled = component$(() => {
  return (
    <Toggle.Root disabled data-testid="root" aria-label="Toggle">
      Toggle
    </Toggle.Root>
  );
});

const CSR = component$(() => {
  const showToggleSig = useSignal(false);

  return (
    <div>
      <button
        type="button"
        data-testid="render-toggle"
        onClick$={() => {
          showToggleSig.value = true;
        }}
      >
        Render Toggle
      </button>

      {showToggleSig.value && (
        <Toggle.Root data-testid="root" aria-label="Toggle">
          Toggle
        </Toggle.Root>
      )}
    </div>
  );
});

test("default toggle can be clicked to be pressed", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
  await expect.element(Root).not.toHaveAttribute("data-pressed");

  await userEvent.click(Root);

  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
  await expect.element(Root).toHaveAttribute("data-pressed");
});

test("pressed toggle can be clicked to be unpressed", async () => {
  render(<InitialPressed />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
  await expect.element(Root).toHaveAttribute("data-pressed");

  await userEvent.click(Root);

  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
  await expect.element(Root).not.toHaveAttribute("data-pressed");
});

test("toggle can be toggled with Space key", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
  await expect.element(Root).not.toHaveAttribute("data-pressed");

  await expect.element(Root).toBeVisible();
  focusElement(Root);
  await userEvent.keyboard("{Space}");

  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
  await expect.element(Root).toHaveAttribute("data-pressed");
});

test("pressed toggle can be unpressed with Space key", async () => {
  render(<InitialPressed />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
  await expect.element(Root).toHaveAttribute("data-pressed");

  await expect.element(Root).toBeVisible();
  focusElement(Root);
  await userEvent.keyboard("{Space}");

  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
  await expect.element(Root).not.toHaveAttribute("data-pressed");
});

test("toggle can be toggled with Enter key", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
  await expect.element(Root).not.toHaveAttribute("data-pressed");

  await expect.element(Root).toBeVisible();
  focusElement(Root);
  await userEvent.keyboard("{Enter}");

  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
  await expect.element(Root).toHaveAttribute("data-pressed");
});

test("pressed toggle can be unpressed with Enter key", async () => {
  render(<InitialPressed />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
  await expect.element(Root).toHaveAttribute("data-pressed");

  await expect.element(Root).toBeVisible();
  focusElement(Root);
  await userEvent.keyboard("{Enter}");

  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
  await expect.element(Root).not.toHaveAttribute("data-pressed");
});

test("toggle has type button attribute", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("type", "button");
});

test("toggle has aria-pressed false by default", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
});

test("aria-pressed updates when toggled", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "false");

  await userEvent.click(Root);
  await expect.element(Root).toHaveAttribute("aria-pressed", "true");

  await userEvent.click(Root);
  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
});

test("data-pressed updates when state changes", async () => {
  render(<Basic />);

  await expect.element(Root).not.toHaveAttribute("data-pressed");

  await userEvent.click(Root);
  await expect.element(Root).toHaveAttribute("data-pressed");

  await userEvent.click(Root);
  await expect.element(Root).not.toHaveAttribute("data-pressed");
});

test("external signal changes update toggle state", async () => {
  render(<WithSignal />);

  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
  await expect.element(Root).toHaveAttribute("data-pressed");

  await expect.element(page.getByText("true")).toBeVisible();

  await userEvent.click(page.getByTestId("toggle-signal"));

  await expect.element(Root).not.toHaveAttribute("data-pressed");
  await expect.element(Root).toHaveAttribute("aria-pressed", "false");

  await expect.element(page.getByText("false")).toBeVisible();
});

test("onChange$ is called when toggled on", async () => {
  render(<WithChange />);

  await expect.element(page.getByText("Count: 0")).toBeVisible();

  await userEvent.click(Root);

  await expect.element(page.getByText("Count: 1")).toBeVisible();
});

test("onChange$ is called when toggled off", async () => {
  render(<WithChange />);

  await expect.element(page.getByText("Count: 0")).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-pressed", "false");

  await userEvent.click(Root);

  await expect.element(page.getByText("Count: 1")).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-pressed", "true");

  await userEvent.click(Root);

  await expect.element(page.getByText("Count: 2")).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-pressed", "false");
});

test("disabled toggle has disabled and aria-disabled attributes", async () => {
  render(<Disabled />);

  await expect.element(Root).toBeDisabled();
  await expect.element(Root).toHaveAttribute("aria-disabled", "true");
});

test("indicator shows fallback content when not pressed", async () => {
  render(<WithIndicator />);

  await expect.element(Indicator.getByText("Is Off")).toBeVisible();
  await expect.element(Indicator.getByText("Is On")).not.toBeInTheDocument();
});

test("indicator shows pressed content when pressed", async () => {
  render(<WithIndicator />);

  await userEvent.click(Root);

  await expect.element(Indicator.getByText("Is On")).toBeVisible();
  await expect.element(Indicator.getByText("Is Off")).not.toBeInTheDocument();
});

test("client-side rendered toggle is visible after render", async () => {
  render(<CSR />);

  await userEvent.click(page.getByTestId("render-toggle"));
  await expect.element(Root).toBeVisible();
});

test("client-side rendered toggle state changes when clicked", async () => {
  render(<CSR />);

  await userEvent.click(page.getByTestId("render-toggle"));
  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("aria-pressed", "false");

  await userEvent.click(Root);
  await expect.element(Root).toHaveAttribute("aria-pressed", "true");
});
