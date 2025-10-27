import { component$, type PropsOf, useSignal, useStore } from "@qwik.dev/core";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-qwik";
import { focusElement } from "../../vitest/element";
import { Popover } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const Trigger = page.getByTestId("trigger");
const Content = page.getByTestId("content");

const Basic = component$((props: PropsOf<typeof Popover.Root>) => {
  return (
    <Popover.Root {...props} data-testid="root">
      <Popover.Trigger data-testid="trigger">Open Popover</Popover.Trigger>
      <Popover.Content data-testid="content">
        <p>Popover content goes here</p>
      </Popover.Content>
    </Popover.Root>
  );
});

const ExternalState = component$(() => {
  const openSignal = useSignal(false);
  const openStore = useStore({ open: false });

  return (
    <div>
      <Popover.Root
        data-testid="root"
        // test signal
        bind:open={openSignal}
        // test value based
        open={openStore.open}
        onChange$={(open: boolean) => {
          openStore.open = open;
        }}
      >
        <Popover.Trigger data-testid="trigger">Open Popover</Popover.Trigger>
        <Popover.Content data-testid="content">
          <p>Popover content goes here</p>
        </Popover.Content>
      </Popover.Root>
      <div data-testid="open-signal">Signal: {openSignal.value.toString()}</div>
      <div data-testid="open-store">Store: {openStore.open.toString()}</div>
      <button
        type="button"
        data-testid="change-signal"
        onClick$={() => {
          openSignal.value = !openSignal.value;
        }}
      >
        Toggle Signal
      </button>
      <button
        type="button"
        data-testid="change-store"
        onClick$={() => {
          openStore.open = !openStore.open;
        }}
      >
        Toggle Store
      </button>
    </div>
  );
});

test("popover trigger is visible", async () => {
  render(<Basic />);
  await expect.element(Trigger).toBeVisible();
});

test("popover root has correct data attributes when closed", async () => {
  render(<Basic />);
  await expect.element(Root).toHaveAttribute("data-closed");
  await expect.element(Root).not.toHaveAttribute("data-open");
});

test("clicking trigger opens popover", async () => {
  render(<Basic />);
  await userEvent.click(Trigger);
  await expect.element(Content).toBeVisible();
});

test("clicking trigger toggles popover open and closed", async () => {
  render(<Basic />);

  await userEvent.click(Trigger);
  await expect.element(Content).toBeVisible();

  await userEvent.click(Trigger);
  await expect.element(Content).not.toBeVisible();
});

test("popover root has correct data attributes when open", async () => {
  render(<Basic />);

  await userEvent.click(Trigger);
  await expect.element(Root).toHaveAttribute("data-open");
  await expect.element(Root).not.toHaveAttribute("data-closed");
});

test("Enter key on trigger opens popover", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);
  await userEvent.keyboard("{Enter}");

  await expect.element(Content).toBeVisible();
});

test("Enter key toggles popover", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);

  await userEvent.keyboard("{Enter}");
  await expect.element(Content).toBeVisible();

  await userEvent.keyboard("{Enter}");
  await expect.element(Content).not.toBeVisible();
});

test("Space key on trigger opens popover", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);
  await userEvent.keyboard("{Space}");

  await expect.element(Content).toBeVisible();
});

test("Space key toggles popover", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);

  await userEvent.keyboard("{Space}");
  await expect.element(Content).toBeVisible();

  await userEvent.keyboard("{Space}");
  await expect.element(Content).not.toBeVisible();
});

test("Escape key closes open popover", async () => {
  render(<Basic />);

  await userEvent.click(Trigger);
  await expect.element(Content).toBeVisible();

  await userEvent.keyboard("{Escape}");
  await expect.element(Content).not.toBeVisible();
});

test("clicking backdrop closes popover in auto mode", async () => {
  render(<Basic />);

  await userEvent.click(Trigger);
  await expect.element(Content).toBeVisible();

  // click on corner of body
  await userEvent.click(page.getByRole("document"));
  await expect.element(Content).not.toBeVisible();
});

test("initial value opens popover on render", async () => {
  render(<Basic open />);
  await expect.element(Trigger).toBeVisible();
  await expect.element(Content).toBeVisible();
});

test("external store value changes update popover state", async () => {
  render(<ExternalState />);

  await expect.element(page.getByText("Store: false")).toBeVisible();

  await userEvent.click(page.getByTestId("change-store"));
  await expect.element(Content).toBeVisible();
  await expect.element(page.getByText("Store: true")).toBeVisible();
});

test("external signal changes update popover state", async () => {
  render(<ExternalState />);

  await expect.element(page.getByText("Signal: false")).toBeVisible();

  await userEvent.click(page.getByTestId("change-signal"));
  await expect.element(Content).toBeVisible();
  await expect.element(page.getByText("Signal: true")).toBeVisible();
});

test("onChange$ fires when popover state changes", async () => {
  render(<ExternalState />);

  await expect.element(page.getByText("Store: false")).toBeVisible();

  await userEvent.click(Trigger);
  await expect.element(page.getByText("Store: true")).toBeVisible();
});

test("trigger has popovertarget attribute", async () => {
  render(<Basic />);
  await expect.element(Trigger).toHaveAttribute("popovertarget");
});

test("content has popover attribute set to auto", async () => {
  render(<Basic />);
  await expect.element(Content).toHaveAttribute("popover", "auto");
});

test("trigger and content are connected via id", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  const triggerTarget = Trigger.element().getAttribute("popovertarget");
  await userEvent.click(Trigger);
  await expect.element(Content).toBeVisible();
  const contentId = Content.element().getAttribute("id");

  expect(triggerTarget).toBe(contentId);
});
