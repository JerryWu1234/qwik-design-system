import { $, component$, type PropsOf, useSignal, useStore } from "@qwik.dev/core";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-qwik";
import { focusElement } from "../../vitest/element";
import { Collapsible } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const Trigger = page.getByTestId("trigger");
const Content = page.getByTestId("content");
const ChangeCount = page.getByTestId("change-count");
const OpenState = page.getByTestId("open-state");
const ToggleButton = page.getByTestId("toggle-button");
const RenderButton = page.getByTestId("render-button");

const Basic = component$((props: PropsOf<typeof Collapsible.Root>) => {
  return (
    <Collapsible.Root {...props} data-testid="root">
      <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
      <Collapsible.Content data-testid="content">
        This is the collapsible content.
      </Collapsible.Content>
    </Collapsible.Root>
  );
});

test("content is visible when trigger is clicked", async () => {
  render(<Basic />);

  await expect.element(Content).not.toBeVisible();

  await userEvent.click(Trigger);

  await expect.element(Content).toBeVisible();
  await expect.element(Trigger).toHaveAttribute("aria-expanded", "true");
});

test("content is hidden when trigger is clicked on open collapsible", async () => {
  render(<Basic open />);

  await expect.element(Content).toBeVisible();

  await userEvent.click(Trigger);

  await expect.element(Content).not.toBeVisible();
  await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
});

test("content is visible when space key is pressed", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);
  await expect.element(Trigger).toHaveFocus();

  await userEvent.keyboard("{Space}");

  await expect.element(Content).toBeVisible();
  await expect.element(Trigger).toHaveAttribute("aria-expanded", "true");
});

test("content is hidden when space key is pressed on open collapsible", async () => {
  render(<Basic open />);

  await expect.element(Content).toBeVisible();
  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);

  await userEvent.keyboard("{Space}");

  await expect.element(Content).not.toBeVisible();
  await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
});

test("content is visible when enter key is pressed", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);
  await expect.element(Trigger).toHaveFocus();

  await userEvent.keyboard("{Enter}");

  await expect.element(Content).toBeVisible();
  await expect.element(Trigger).toHaveAttribute("aria-expanded", "true");
});

test("content is hidden when enter key is pressed on open collapsible", async () => {
  render(<Basic open />);

  await expect.element(Content).toBeVisible();
  await expect.element(Trigger).toBeVisible();
  focusElement(Trigger);

  await userEvent.keyboard("{Enter}");

  await expect.element(Content).not.toBeVisible();
  await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
});

test("trigger aria-controls matches content id", async () => {
  render(<Basic />);

  await expect.element(Trigger).toBeVisible();
  await userEvent.click(Trigger);
  await expect.element(Content).toBeVisible();

  const triggerElement = Trigger.element();
  const contentElement = Content.element();
  const contentId = contentElement?.getAttribute("id");
  const ariaControls = triggerElement?.getAttribute("aria-controls");

  expect(contentId).toBeTruthy();
  expect(ariaControls).toBe(contentId);
});

test("trigger aria-expanded is false when closed", async () => {
  render(<Basic />);

  await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
});

test("trigger aria-expanded is true when open", async () => {
  render(<Basic open />);

  await expect.element(Trigger).toHaveAttribute("aria-expanded", "true");
});

const WithOnChange = component$((props: PropsOf<typeof Collapsible.Root>) => {
  const changeCount = useSignal(0);
  const isOpen = useSignal(false);

  const handleChange$ = $((open: boolean) => {
    changeCount.value++;
    isOpen.value = open;
  });

  return (
    <div>
      <Collapsible.Root {...props} data-testid="root" onChange$={handleChange$}>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Content data-testid="content">
          This is the collapsible content.
        </Collapsible.Content>
      </Collapsible.Root>
      <p data-testid="change-count">count: {changeCount.value}</p>
      <p data-testid="open-state">open: {isOpen.value.toString()}</p>
    </div>
  );
});

test("onChange$ handler is called when opened", async () => {
  render(<WithOnChange />);

  await expect.element(ChangeCount).toHaveTextContent("count: 0");

  await userEvent.click(Trigger);

  await expect.element(ChangeCount).toHaveTextContent("count: 1");
  await expect.element(OpenState).toHaveTextContent("open: true");
});

test("onChange$ handler is called when closed", async () => {
  render(<WithOnChange open />);

  await userEvent.click(Trigger);

  await expect.element(ChangeCount).toHaveTextContent("count: 1");
  await expect.element(OpenState).toHaveTextContent("open: false");
});

const WithBindOpen = component$((props: PropsOf<typeof Collapsible.Root>) => {
  const isOpen = useSignal(props.open ?? false);

  return (
    <div>
      <Collapsible.Root {...props} bind:open={isOpen} data-testid="root">
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Content data-testid="content">
          This is the collapsible content.
        </Collapsible.Content>
      </Collapsible.Root>
      <button
        type="button"
        data-testid="toggle-button"
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
      >
        Toggle Programmatically
      </button>
      <p data-testid="open-state">open: {isOpen.value.toString()}</p>
    </div>
  );
});

test("bind:open signal changes when trigger is clicked", async () => {
  render(<WithBindOpen />);

  await expect.element(OpenState).toHaveTextContent("open: false");

  await userEvent.click(Trigger);

  await expect.element(OpenState).toHaveTextContent("open: true");
  await expect.element(Content).toBeVisible();
});

test("content opens when bind:open signal changes to true", async () => {
  render(<WithBindOpen />);

  await expect.element(Content).not.toBeVisible();

  await userEvent.click(ToggleButton);

  await expect.element(Content).toBeVisible();
  await expect.element(OpenState).toHaveTextContent("open: true");
});

test("content closes when bind:open signal changes to false", async () => {
  render(<WithBindOpen open />);

  await expect.element(Content).toBeVisible();

  await userEvent.click(ToggleButton);

  await expect.element(Content).not.toBeVisible();
  await expect.element(OpenState).toHaveTextContent("open: false");
});

const ExternalState = component$(() => {
  const signalOpen = useSignal(false);
  const storeOpen = useStore({ value: false });

  return (
    <div>
      <Collapsible.Root
        bind:open={signalOpen}
        open={storeOpen.value}
        onChange$={(open: boolean) => {
          storeOpen.value = open;
        }}
        data-testid="root"
      >
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Content data-testid="content">
          This is the collapsible content.
        </Collapsible.Content>
      </Collapsible.Root>
      <button
        type="button"
        data-testid="toggle-signal"
        onClick$={() => {
          signalOpen.value = !signalOpen.value;
        }}
      >
        Toggle Signal
      </button>
      <button
        type="button"
        data-testid="toggle-store"
        onClick$={() => {
          storeOpen.value = !storeOpen.value;
        }}
      >
        Toggle Store
      </button>
    </div>
  );
});

test("external signal changes update collapsible state", async () => {
  render(<ExternalState />);

  await expect.element(Content).not.toBeVisible();

  await userEvent.click(page.getByTestId("toggle-signal"));

  await expect.element(Content).toBeVisible();
});

test("external store changes update collapsible state", async () => {
  render(<ExternalState />);

  await expect.element(Content).not.toBeVisible();

  await userEvent.click(page.getByTestId("toggle-store"));

  await expect.element(Content).toBeVisible();
});

test("disabled collapsible does not open when clicked", async () => {
  render(<Basic disabled />);

  await expect.element(Trigger).toBeDisabled();

  await expect.element(Content).not.toBeVisible();
});

const CSR = component$(() => {
  const shouldRender = useSignal(false);

  return (
    <div>
      <button
        type="button"
        data-testid="render-button"
        onClick$={() => {
          shouldRender.value = true;
        }}
      >
        Render Collapsible
      </button>
      {shouldRender.value && (
        <Collapsible.Root data-testid="root">
          <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
          <Collapsible.Content data-testid="content">
            This is the collapsible content.
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </div>
  );
});

test("collapsible can be client-side rendered", async () => {
  render(<CSR />);

  await expect.element(Trigger).not.toBeInTheDocument();

  await userEvent.click(RenderButton);

  await expect.element(Trigger).toBeVisible();
});

test("CSR collapsible can be opened", async () => {
  render(<CSR />);

  await userEvent.click(RenderButton);
  await expect.element(Trigger).toBeVisible();

  await userEvent.click(Trigger);

  await expect.element(Content).toBeVisible();
});

test("CSR collapsible can be closed", async () => {
  render(<CSR />);

  await userEvent.click(RenderButton);
  await expect.element(Trigger).toBeVisible();

  await userEvent.click(Trigger);
  await expect.element(Content).toBeVisible();

  await userEvent.click(Trigger);

  await expect.element(Content).not.toBeVisible();
});

test("collapsible root has data-qds-collapsible attribute", async () => {
  render(<Basic />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("ui-qds-collapsible");
});

test("collapsible root has data-open when open", async () => {
  render(<Basic open />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("ui-open");
});

test("collapsible root has data-closed when closed", async () => {
  render(<Basic />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("ui-closed");
});

test("collapsible root has data-disabled when disabled", async () => {
  render(<Basic disabled />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).toHaveAttribute("ui-disabled");
});

test("collapsible root does not have data-disabled when not disabled", async () => {
  render(<Basic />);

  await expect.element(Root).toBeVisible();
  await expect.element(Root).not.toHaveAttribute("ui-disabled");
});

test("collapsible root data-open updates when opened", async () => {
  render(<Basic />);

  await expect.element(Root).not.toHaveAttribute("ui-open");
  await expect.element(Root).toHaveAttribute("ui-closed");

  await userEvent.click(Trigger);

  await expect.element(Root).toHaveAttribute("ui-open");
  await expect.element(Root).not.toHaveAttribute("ui-closed");
});

test("collapsible root data-open updates when closed", async () => {
  render(<Basic open />);

  await expect.element(Root).toHaveAttribute("ui-open");
  await expect.element(Root).not.toHaveAttribute("ui-closed");

  await userEvent.click(Trigger);

  await expect.element(Root).not.toHaveAttribute("ui-open");
  await expect.element(Root).toHaveAttribute("ui-closed");
});

test("collapsible root has aria-live attribute", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("aria-live", "polite");
});

test("content has hidden=until-found when closed", async () => {
  render(<Basic />);

  await expect.element(Content).not.toBeVisible();

  const contentElement = Content.element();
  const hiddenValue = contentElement?.getAttribute("hidden");

  expect(hiddenValue).toBe("until-found");
});

test("content does not have hidden attribute when open", async () => {
  render(<Basic open />);

  await expect.element(Content).toBeVisible();
  await expect.element(Content).not.toHaveAttribute("hidden");
});

test("content changes from hidden=until-found to no hidden when opened", async () => {
  render(<Basic />);

  await expect.element(Content).toHaveAttribute("hidden", "until-found");

  await userEvent.click(Trigger);

  await expect.element(Content).toBeVisible();
  await expect.element(Content).not.toHaveAttribute("hidden");
});

test("beforematch event syncs state when browser reveals content", async () => {
  render(<WithBindOpen />);

  await expect.element(Content).not.toBeVisible();
  await expect.element(OpenState).toHaveTextContent("open: false");

  const contentElement = Content.element();

  // Simulate the browser revealing content via find-in-page
  contentElement?.dispatchEvent(new Event("beforematch"));

  // State should now be synced
  await expect.element(OpenState).toHaveTextContent("open: true");
});
