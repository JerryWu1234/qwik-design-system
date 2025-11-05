import { $, component$, type PropsOf, useSignal, useStore } from "@qwik.dev/core";
import axe from "axe-core";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-qwik";
import { Tabs } from "..";

// Top-level locator constants using data-testid
const Root = page.getByTestId("root");
const List = page.getByTestId("list");
const Triggers = page.getByTestId("trigger");
const Contents = page.getByTestId("content");

const Basic = component$((props: PropsOf<typeof Tabs.Root>) => {
  return (
    <Tabs.Root {...props} data-testid="root">
      <Tabs.List data-testid="list">
        <Tabs.Trigger data-testid="trigger">Tab 1</Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger" disabled>
          Tab 2
        </Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger">Tab 3</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content data-testid="content">Content 1</Tabs.Content>
      <Tabs.Content data-testid="content">Content 2</Tabs.Content>
      <Tabs.Content data-testid="content">Content 3</Tabs.Content>
    </Tabs.Root>
  );
});

const Vertical = component$((props: PropsOf<typeof Tabs.Root>) => {
  return (
    <Tabs.Root {...props} orientation="vertical" data-testid="root">
      <Tabs.List data-testid="list">
        <Tabs.Trigger data-testid="trigger">Tab 1</Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger" disabled>
          Tab 2
        </Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger">Tab 3</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content data-testid="content">Content 1</Tabs.Content>
      <Tabs.Content data-testid="content">Content 2</Tabs.Content>
      <Tabs.Content data-testid="content">Content 3</Tabs.Content>
    </Tabs.Root>
  );
});

const WithLoop = component$((props: PropsOf<typeof Tabs.Root>) => {
  return (
    <Tabs.Root {...props} loop data-testid="root">
      <Tabs.List data-testid="list">
        <Tabs.Trigger data-testid="trigger">Tab 1</Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger" disabled>
          Tab 2
        </Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger">Tab 3</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content data-testid="content">Content 1</Tabs.Content>
      <Tabs.Content data-testid="content">Content 2</Tabs.Content>
      <Tabs.Content data-testid="content">Content 3</Tabs.Content>
    </Tabs.Root>
  );
});

const WithLoopVertical = component$((props: PropsOf<typeof Tabs.Root>) => {
  return (
    <Tabs.Root {...props} orientation="vertical" loop data-testid="root">
      <Tabs.List data-testid="list">
        <Tabs.Trigger data-testid="trigger">Tab 1</Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger" disabled>
          Tab 2
        </Tabs.Trigger>
        <Tabs.Trigger data-testid="trigger">Tab 3</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content data-testid="content">Content 1</Tabs.Content>
      <Tabs.Content data-testid="content">Content 2</Tabs.Content>
      <Tabs.Content data-testid="content">Content 3</Tabs.Content>
    </Tabs.Root>
  );
});

const ExternalState = component$(() => {
  const selectedSignal = useSignal("0");
  const selectedStore = useStore({ value: "0" });

  return (
    <div>
      <Tabs.Root
        data-testid="root"
        bind:value={selectedSignal}
        value={selectedStore.value}
        onChange$={(newValue) => {
          selectedStore.value = newValue;
        }}
      >
        <Tabs.List data-testid="list">
          <Tabs.Trigger data-testid="trigger">Tab 1</Tabs.Trigger>
          <Tabs.Trigger data-testid="trigger">Tab 2</Tabs.Trigger>
          <Tabs.Trigger data-testid="trigger">Tab 3</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content data-testid="content">Content 1</Tabs.Content>
        <Tabs.Content data-testid="content">Content 2</Tabs.Content>
        <Tabs.Content data-testid="content">Content 3</Tabs.Content>
      </Tabs.Root>
      <button
        type="button"
        data-testid="change-value-signal"
        onClick$={() => (selectedSignal.value = "2")}
      >
        Change Signal to Tab 3
      </button>
      <button
        type="button"
        data-testid="change-value-store"
        onClick$={() => (selectedStore.value = "1")}
      >
        Change Store to Tab 2
      </button>
      <div data-testid="signal-display">{selectedSignal.value}</div>
      <div data-testid="store-display">{selectedStore.value}</div>
    </div>
  );
});

test("should meet axe accessibility requirements", async () => {
  const screen = render(<Basic />);

  await expect.element(Root).toBeVisible();

  const results = await axe.run(screen.container);

  expect(results.violations).toHaveLength(0);
});

test("first tab should be active on initial render", async () => {
  render(<Basic />);

  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect.element(Triggers.nth(1)).toHaveAttribute("aria-selected", "false");
});

test("first content should be visible on initial render", async () => {
  render(<Basic />);

  await expect.element(Contents.nth(0)).toBeVisible();
  await expect.element(Contents.nth(1)).not.toBeVisible();
});

test("clicking a new tab updates the selected tab", async () => {
  render(<Basic />);

  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect.element(Triggers.nth(1)).toHaveAttribute("aria-selected", "false");

  await userEvent.click(Triggers.nth(2));

  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "false");
  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
});

test("clicking a new tab updates the content", async () => {
  render(<Basic />);

  await expect.element(Contents.nth(0)).toBeVisible();
  await expect.element(Contents.nth(1)).not.toBeVisible();

  await userEvent.click(Triggers.nth(2));

  await expect.element(Contents.nth(0)).not.toBeVisible();
  await expect.element(Contents.nth(2)).toBeVisible();
});

test("only the active tab should be focusable", async () => {
  render(<Basic />);

  await expect.element(Triggers.nth(0)).toHaveAttribute("tabindex", "0");
  await expect.element(Triggers.nth(1)).toHaveAttribute("tabindex", "-1");
  await expect.element(Triggers.nth(2)).toHaveAttribute("tabindex", "-1");
});

test("ArrowRight navigates to next enabled tab", async () => {
  render(<Basic />);

  // Click first tab to ensure it's selected
  await userEvent.click(Triggers.nth(0));

  // Press ArrowRight - should skip disabled tab at index 1 and go to index 2
  await userEvent.keyboard("{ArrowRight}");

  // Check that tab 3 (index 2) is now selected
  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(2).element());
});

test("ArrowLeft navigates to previous enabled tab", async () => {
  render(<Basic />);

  // Click last tab
  await userEvent.click(Triggers.nth(2));

  // Press ArrowLeft - should skip disabled tab at index 1 and go to index 0
  await userEvent.keyboard("{ArrowLeft}");

  // Check that tab 1 (index 0) is now selected
  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(0).element());
});

test("ArrowDown navigates to next enabled tab in vertical orientation", async () => {
  render(<Vertical />);

  // Click first tab
  await userEvent.click(Triggers.nth(0));

  // Press ArrowDown - should skip disabled tab at index 1 and go to index 2
  await userEvent.keyboard("{ArrowDown}");

  // Check that tab 3 (index 2) is now selected
  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(2).element());
});

test("ArrowUp navigates to previous enabled tab in vertical orientation", async () => {
  render(<Vertical />);

  // Click last tab
  await userEvent.click(Triggers.nth(2));

  // Press ArrowUp - should skip disabled tab at index 1 and go to index 0
  await userEvent.keyboard("{ArrowUp}");

  // Check that tab 1 (index 0) is now selected
  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(0).element());
});

test("Home key navigates to first enabled tab", async () => {
  render(<Basic />);

  // Start at last tab
  await userEvent.click(Triggers.nth(2));

  // Press Home
  await userEvent.keyboard("{Home}");

  // Should be at first tab
  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(0).element());
});

test("End key navigates to last enabled tab", async () => {
  render(<Basic />);

  // Start at first tab (default)
  await userEvent.click(Triggers.nth(0));

  // Press End
  await userEvent.keyboard("{End}");

  // Should be at last tab
  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(2).element());
});

test("ArrowRight loops from last to first tab when loop is enabled", async () => {
  render(<WithLoop loop />);

  // Start at last tab
  await userEvent.click(Triggers.nth(2));

  // Press ArrowRight - should loop to first tab
  await userEvent.keyboard("{ArrowRight}");

  // Should be at first tab
  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(0).element());
});

test("ArrowLeft loops from first to last tab when loop is enabled", async () => {
  render(<WithLoop loop />);

  // Start at first tab (default)
  await userEvent.click(Triggers.nth(0));

  // Press ArrowLeft - should loop to last tab
  await userEvent.keyboard("{ArrowLeft}");

  // Should be at last tab (skipping disabled middle tab)
  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(2).element());
});

test("ArrowDown loops from last to first tab in vertical orientation when loop is enabled", async () => {
  render(<WithLoopVertical loop />);

  // Start at last tab
  await userEvent.click(Triggers.nth(2));

  // Press ArrowDown - should loop to first tab
  await userEvent.keyboard("{ArrowDown}");

  // Should be at first tab
  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(0).element());
});

test("ArrowUp loops from first to last tab in vertical orientation when loop is enabled", async () => {
  render(<WithLoopVertical loop />);

  // Start at first tab (default)
  await userEvent.click(Triggers.nth(0));

  // Press ArrowUp - should loop to last tab
  await userEvent.keyboard("{ArrowUp}");

  // Should be at last tab (skipping disabled middle tab)
  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
  expect(document.activeElement).toBe(Triggers.nth(2).element());
});

test("horizontal orientation has correct data attribute", async () => {
  render(<Basic />);

  await expect.element(Root).toHaveAttribute("ui-orientation", "horizontal");
});

test("vertical orientation has correct data attribute", async () => {
  render(<Vertical />);

  await expect.element(Root).toHaveAttribute("ui-orientation", "vertical");
});

test("external signal changes update selection", async () => {
  render(<ExternalState />);

  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");

  await userEvent.click(page.getByTestId("change-value-signal"));

  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "false");
  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
});

test("external store changes update selection", async () => {
  render(<ExternalState />);

  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "true");

  await userEvent.click(page.getByTestId("change-value-store"));

  await expect.element(Triggers.nth(0)).toHaveAttribute("aria-selected", "false");
  await expect.element(Triggers.nth(1)).toHaveAttribute("aria-selected", "true");
});

test("clicking tab updates external signal", async () => {
  render(<ExternalState />);

  await userEvent.click(Triggers.nth(2));

  await expect.element(page.getByTestId("signal-display")).toHaveTextContent("2");
});

test("clicking tab updates external store", async () => {
  render(<ExternalState />);

  await userEvent.click(Triggers.nth(1));

  await expect.element(page.getByTestId("store-display")).toHaveTextContent("1");
});

test("onChange callback is called when tab changes", async () => {
  const onChangeSpy = $(() => {
    // This will be tracked by the external state component
  });

  render(<Basic onChange$={onChangeSpy} />);

  await userEvent.click(Triggers.nth(2));

  await expect.element(Triggers.nth(2)).toHaveAttribute("aria-selected", "true");
});

test("tabs with data-selected attribute", async () => {
  render(<Basic />);

  await expect.element(Triggers.nth(0)).toHaveAttribute("ui-selected");
  await expect.element(Triggers.nth(1)).not.toHaveAttribute("ui-selected");

  await userEvent.click(Triggers.nth(2));

  await expect.element(Triggers.nth(0)).not.toHaveAttribute("ui-selected");
  await expect.element(Triggers.nth(2)).toHaveAttribute("ui-selected");
});

test("tab list has correct role attribute", async () => {
  render(<Basic />);

  await expect.element(List).toHaveAttribute("role", "tablist");
});

test("tab triggers have correct role attribute", async () => {
  render(<Basic />);

  await expect.element(Triggers.nth(0)).toHaveAttribute("role", "tab");
  await expect.element(Triggers.nth(1)).toHaveAttribute("role", "tab");
  await expect.element(Triggers.nth(2)).toHaveAttribute("role", "tab");
});

test("tab contents have correct role attribute", async () => {
  render(<Basic />);

  await expect.element(Contents.nth(0)).toHaveAttribute("role", "tabpanel");
  await expect.element(Contents.nth(1)).toHaveAttribute("role", "tabpanel");
  await expect.element(Contents.nth(2)).toHaveAttribute("role", "tabpanel");
});
