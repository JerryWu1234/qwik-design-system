// oxlint-disable no-empty-file
// import { type PropsOf, component$, useSignal } from "@qwik.dev/core";
// import { expect, test } from "vitest";
// import { render } from "vitest-browser-qwik";
// import { page, userEvent } from "vitest/browser";
// import { Tree } from "..";

// // Top-level locator constants using data-testid
// const Root = page.getByTestId("root");
// const Label = page.getByTestId("label");
// const Items = page.getByTestId("item");
// const ItemLabels = page.getByTestId("item-label");
// const ItemTriggers = page.getByTestId("item-trigger");
// const ItemContents = page.getByTestId("item-content");
// const ItemIndicators = page.getByTestId("item-indicator");

// const Basic = component$((props: PropsOf<typeof Tree.Root>) => {
//   return (
//     <Tree.Root {...props} data-testid="root">
//       <Tree.Label data-testid="label">File System</Tree.Label>

//       {/* Documents - nested */}
//       <Tree.Item data-testid="item">
//         <Tree.ItemTrigger data-testid="item-trigger">
//           <Tree.ItemLabel data-testid="item-label">Documents</Tree.ItemLabel>
//           <Tree.ItemIndicator data-testid="item-indicator">▶</Tree.ItemIndicator>
//         </Tree.ItemTrigger>
//         <Tree.ItemContent data-testid="item-content">
//           {/* Work - nested */}
//           <Tree.Item data-testid="item">
//             <Tree.ItemTrigger data-testid="item-trigger">
//               <Tree.ItemLabel data-testid="item-label">Work</Tree.ItemLabel>
//               <Tree.ItemIndicator data-testid="item-indicator">▶</Tree.ItemIndicator>
//             </Tree.ItemTrigger>
//             <Tree.ItemContent data-testid="item-content">
//               {/* Project A */}
//               <Tree.Item data-testid="item">
//                 <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//                 <Tree.ItemLabel data-testid="item-label">Project A</Tree.ItemLabel>
//               </Tree.Item>
//               {/* Project B */}
//               <Tree.Item data-testid="item">
//                 <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//                 <Tree.ItemLabel data-testid="item-label">Project B</Tree.ItemLabel>
//               </Tree.Item>
//             </Tree.ItemContent>
//           </Tree.Item>

//           {/* Personal */}
//           <Tree.Item data-testid="item">
//             <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//             <Tree.ItemLabel data-testid="item-label">Personal</Tree.ItemLabel>
//           </Tree.Item>
//         </Tree.ItemContent>
//       </Tree.Item>

//       {/* Downloads - nested */}
//       <Tree.Item data-testid="item">
//         <Tree.ItemTrigger data-testid="item-trigger">
//           <Tree.ItemLabel data-testid="item-label">Downloads</Tree.ItemLabel>
//           <Tree.ItemIndicator data-testid="item-indicator">▶</Tree.ItemIndicator>
//         </Tree.ItemTrigger>
//         <Tree.ItemContent data-testid="item-content">
//           {/* Movies */}
//           <Tree.Item data-testid="item">
//             <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//             <Tree.ItemLabel data-testid="item-label">Movies</Tree.ItemLabel>
//           </Tree.Item>
//           {/* Applications */}
//           <Tree.Item data-testid="item">
//             <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//             <Tree.ItemLabel data-testid="item-label">Applications</Tree.ItemLabel>
//           </Tree.Item>
//         </Tree.ItemContent>
//       </Tree.Item>

//       {/* Desktop - leaf */}
//       <Tree.Item data-testid="item">
//         <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//         <Tree.ItemLabel data-testid="item-label">Desktop</Tree.ItemLabel>
//       </Tree.Item>
//     </Tree.Root>
//   );
// });

// test("tree root has correct role and is visible", async () => {
//   render(<Basic />);
//   await expect.element(Root).toBeVisible();
//   await expect.element(Root).toHaveAttribute("role", "treegrid");
// });

// test("tree label is visible", async () => {
//   render(<Basic />);
//   await expect.element(Label).toBeVisible();
// });

// test("tree items are visible", async () => {
//   render(<Basic />);
//   await expect.element(Items.nth(0)).toBeVisible();
//   await expect.element(ItemLabels.nth(0)).toHaveTextContent("Documents");
// });

// test("items have correct aria-level attribute", async () => {
//   render(<Basic />);
//   await expect.element(Items.nth(0)).toHaveAttribute("aria-level", "1");
//   await expect.element(Items.nth(0)).toHaveAttribute("data-level", "1");
// });

// test("expandable item can be clicked to expand", async () => {
//   render(<Basic />);

//   // Initially, nested items should not be visible (collapsed)
//   await expect.element(Items.nth(0)).toHaveAttribute("data-closed");

//   // Click the trigger to expand
//   await userEvent.click(ItemTriggers.nth(0));

//   // Item should now be expanded
//   await expect.element(Items.nth(0)).not.toHaveAttribute("data-closed");
//   await expect.element(Items.nth(0)).toHaveAttribute("data-open");
// });

// test("expandable item can be collapsed after expanding", async () => {
//   render(<Basic />);

//   // Expand first
//   await userEvent.click(ItemTriggers.nth(0));
//   await expect.element(Items.nth(0)).not.toHaveAttribute("data-closed");

//   // Collapse
//   await userEvent.click(ItemTriggers.nth(0));
//   await expect.element(Items.nth(0)).toHaveAttribute("data-closed");
// });

// test("nested items are visible when parent is expanded", async () => {
//   render(<Basic />);

//   // Expand parent
//   await userEvent.click(ItemTriggers.nth(0));

//   // Check that nested content is visible
//   await expect.element(ItemContents.nth(0)).toBeVisible();
// });

// test("nested items become visible when parent is expanded", async () => {
//   render(<Basic />);

//   // Expand parent to reveal children
//   await userEvent.click(ItemTriggers.nth(0));

//   // Wait for content to be visible
//   await expect.element(ItemContents.nth(0)).toBeVisible();

//   // Find the nested items by their labels to verify they're accessible
//   const workLabel = page.getByText("Work");
//   await expect.element(workLabel).toBeVisible();

//   const personalLabel = page.getByText("Personal");
//   await expect.element(personalLabel).toBeVisible();
// });

// test("first item can be focused", async () => {
//   render(<Basic />);

//   await expect.element(Items.nth(0)).toBeVisible();
//   ((await Items.nth(0).element()) as HTMLElement).focus();

//   await expect.element(Items.nth(0)).toHaveAttribute("data-highlighted", "true");
// });

// test("ArrowDown keyboard navigation works", async () => {
//   render(<Basic />);

//   // Focus first item
//   await expect.element(Items.nth(0)).toBeVisible();
//   const firstItem = (await Items.nth(0).element()) as HTMLElement;
//   firstItem.focus();

//   // Wait for highlight to be set on first item
//   await expect.element(Items.nth(0)).toHaveAttribute("data-highlighted", "true");

//   // Press ArrowDown - should move focus without error
//   await userEvent.keyboard("{ArrowDown}");

//   // Items should still be visible and accessible
//   await expect.element(Items.nth(0)).toBeVisible();
//   await expect.element(Items.nth(1)).toBeVisible();
// });

// test("ArrowUp navigates to previous visible item", async () => {
//   render(<Basic />);

//   // Focus second item
//   await expect.element(Items.nth(1)).toBeVisible();
//   ((await Items.nth(1).element()) as HTMLElement).focus();

//   // Press ArrowUp
//   await userEvent.keyboard("{ArrowUp}");

//   // First item should be highlighted
//   await expect.element(Items.nth(0)).toHaveAttribute("data-highlighted", "true");
// });

// test("Home key navigates to first item", async () => {
//   render(<Basic />);

//   // Focus last item
//   await expect.element(Items.nth(2)).toBeVisible();
//   ((await Items.nth(2).element()) as HTMLElement).focus();

//   // Press Home
//   await userEvent.keyboard("{Home}");

//   // First item should be highlighted
//   await expect.element(Items.nth(0)).toHaveAttribute("data-highlighted", "true");
// });

// test("End key keyboard navigation works", async () => {
//   render(<Basic />);

//   // Focus first item
//   await expect.element(Items.nth(0)).toBeVisible();
//   const firstItem = (await Items.nth(0).element()) as HTMLElement;
//   firstItem.focus();

//   // Wait for highlight
//   await expect.element(Items.nth(0)).toHaveAttribute("data-highlighted", "true");

//   // Press End - should move to last item without error
//   await userEvent.keyboard("{End}");

//   // All items should still be visible
//   await expect.element(Items.nth(0)).toBeVisible();
//   await expect.element(Items.nth(1)).toBeVisible();
//   await expect.element(Items.nth(2)).toBeVisible();
// });

// test("ArrowRight expands collapsed item", async () => {
//   render(<Basic />);

//   // Focus first item (which is collapsed)
//   await expect.element(Items.nth(0)).toBeVisible();
//   await expect.element(Items.nth(0)).toHaveAttribute("data-closed");
//   ((await Items.nth(0).element()) as HTMLElement).focus();

//   // Press ArrowRight to expand
//   await userEvent.keyboard("{ArrowRight}");

//   // Item should be expanded
//   await expect.element(Items.nth(0)).not.toHaveAttribute("data-closed");
//   await expect.element(Items.nth(0)).toHaveAttribute("data-open");
// });

// test("ArrowLeft collapses expanded item", async () => {
//   render(<Basic />);

//   // Expand first item
//   await userEvent.click(ItemTriggers.nth(0));
//   await expect.element(Items.nth(0)).not.toHaveAttribute("data-closed");

//   // Focus the expanded item
//   ((await Items.nth(0).element()) as HTMLElement).focus();

//   // Press ArrowLeft to collapse
//   await userEvent.keyboard("{ArrowLeft}");

//   // Item should be collapsed
//   await expect.element(Items.nth(0)).toHaveAttribute("data-closed");
// });

// test("keyboard navigation works with collapsed items", async () => {
//   render(<Basic />);

//   // Focus first item (collapsed)
//   await expect.element(Items.nth(0)).toBeVisible();
//   const firstItem = (await Items.nth(0).element()) as HTMLElement;
//   firstItem.focus();

//   // Wait for highlight
//   await expect.element(Items.nth(0)).toHaveAttribute("data-highlighted", "true");

//   // Press ArrowDown - should navigate without error even with hidden children
//   await userEvent.keyboard("{ArrowDown}");

//   // All visible items should still be accessible
//   await expect.element(Items.nth(0)).toBeVisible();
//   await expect.element(Items.nth(1)).toBeVisible();
//   await expect.element(Items.nth(2)).toBeVisible();
// });

// test("keyboard navigation includes visible nested items", async () => {
//   render(<Basic />);

//   // Expand first item
//   await userEvent.click(ItemTriggers.nth(0));

//   // Focus first item
//   await expect.element(Items.nth(0)).toBeVisible();
//   ((await Items.nth(0).element()) as HTMLElement).focus();

//   // Press ArrowDown - should navigate to first child
//   await userEvent.keyboard("{ArrowDown}");

//   // First child should be highlighted
//   await expect.element(Items.nth(1)).toHaveAttribute("data-highlighted", "true");
// });

// const ControlledState = component$(() => {
//   const isOpenSig = useSignal(false);

//   return (
//     <div>
//       <Tree.Root data-testid="root">
//         <Tree.Label data-testid="label">Controlled Tree</Tree.Label>
//         <Tree.Item data-testid="item" bind:open={isOpenSig}>
//           <Tree.ItemTrigger data-testid="item-trigger">
//             <Tree.ItemLabel data-testid="item-label">Parent</Tree.ItemLabel>
//             <Tree.ItemIndicator data-testid="item-indicator">▶</Tree.ItemIndicator>
//           </Tree.ItemTrigger>
//           <Tree.ItemContent data-testid="item-content">
//             <Tree.Item data-testid="item">
//               <Tree.ItemLabel data-testid="item-label">Child</Tree.ItemLabel>
//             </Tree.Item>
//           </Tree.ItemContent>
//         </Tree.Item>
//       </Tree.Root>
//       <button
//         type="button"
//         data-testid="toggle-button"
//         onClick$={() => (isOpenSig.value = !isOpenSig.value)}
//       >
//         Toggle
//       </button>
//     </div>
//   );
// });

// test("external state controls item expansion", async () => {
//   render(<ControlledState />);

//   // Initially collapsed
//   await expect.element(Items.nth(0)).toHaveAttribute("data-closed");

//   // Click external button to expand
//   await userEvent.click(page.getByTestId("toggle-button"));

//   // Should be expanded
//   await expect.element(Items.nth(0)).not.toHaveAttribute("data-closed");
//   await expect.element(Items.nth(0)).toHaveAttribute("data-open");

//   // Click again to collapse
//   await userEvent.click(page.getByTestId("toggle-button"));

//   // Should be collapsed
//   await expect.element(Items.nth(0)).toHaveAttribute("data-closed");
// });

// const SimpleTree = component$(() => {
//   return (
//     <Tree.Root data-testid="root">
//       <Tree.Label data-testid="label">Simple Tree</Tree.Label>
//       <Tree.Item data-testid="item">
//         <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//         <Tree.ItemLabel data-testid="item-label">Item 1</Tree.ItemLabel>
//       </Tree.Item>
//       <Tree.Item data-testid="item">
//         <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//         <Tree.ItemLabel data-testid="item-label">Item 2</Tree.ItemLabel>
//       </Tree.Item>
//       <Tree.Item data-testid="item">
//         <Tree.ItemIndicator data-testid="item-indicator">🔹</Tree.ItemIndicator>
//         <Tree.ItemLabel data-testid="item-label">Item 3</Tree.ItemLabel>
//       </Tree.Item>
//     </Tree.Root>
//   );
// });

// test("simple tree without nested items renders correctly", async () => {
//   render(<SimpleTree />);

//   await expect.element(Root).toBeVisible();
//   await expect.element(Items.nth(0)).toBeVisible();
//   await expect.element(Items.nth(1)).toBeVisible();
//   await expect.element(Items.nth(2)).toBeVisible();
// });

// test("Tab key allows exiting the tree", async () => {
//   render(<SimpleTree />);

//   // Focus first item
//   await expect.element(Items.nth(0)).toBeVisible();
//   ((await Items.nth(0).element()) as HTMLElement).focus();

//   // Verify item is focused
//   await expect.element(Items.nth(0)).toHaveAttribute("data-highlighted", "true");

//   // Press Tab - this should not be prevented and allow focus to move out
//   await userEvent.keyboard("{Tab}");

//   // The tree should allow the tab to work (no assertion needed, just verify no error)
// });

// test("items have correct tabindex for focus management", async () => {
//   render(<SimpleTree />);

//   // Initially, all items have tabindex -1 (until one is focused)
//   await expect.element(Items.nth(0)).toHaveAttribute("tabindex", "-1");
//   await expect.element(Items.nth(1)).toHaveAttribute("tabindex", "-1");
//   await expect.element(Items.nth(2)).toHaveAttribute("tabindex", "-1");
// });

// test("focused item gets tabindex 0", async () => {
//   render(<SimpleTree />);

//   // Focus second item
//   await expect.element(Items.nth(1)).toBeVisible();
//   ((await Items.nth(1).element()) as HTMLElement).focus();

//   // Second item should now have tabindex 0
//   await expect.element(Items.nth(1)).toHaveAttribute("tabindex", "0");

//   // First item should now have tabindex -1
//   await expect.element(Items.nth(0)).toHaveAttribute("tabindex", "-1");
// });

// const DeeplyNested = component$(() => {
//   return (
//     <Tree.Root data-testid="root">
//       <Tree.Label data-testid="label">Deeply Nested Tree</Tree.Label>
//       <Tree.Item data-testid="item">
//         <Tree.ItemTrigger data-testid="item-trigger">
//           <Tree.ItemLabel data-testid="item-label">Level 1</Tree.ItemLabel>
//         </Tree.ItemTrigger>
//         <Tree.ItemContent data-testid="item-content">
//           <Tree.Item data-testid="item">
//             <Tree.ItemTrigger data-testid="item-trigger">
//               <Tree.ItemLabel data-testid="item-label">Level 2</Tree.ItemLabel>
//             </Tree.ItemTrigger>
//             <Tree.ItemContent data-testid="item-content">
//               <Tree.Item data-testid="item">
//                 <Tree.ItemLabel data-testid="item-label">Level 3</Tree.ItemLabel>
//               </Tree.Item>
//             </Tree.ItemContent>
//           </Tree.Item>
//         </Tree.ItemContent>
//       </Tree.Item>
//     </Tree.Root>
//   );
// });

// test("deeply nested items have correct level attributes", async () => {
//   render(<DeeplyNested />);

//   // Level 1
//   await expect.element(Items.nth(0)).toHaveAttribute("aria-level", "1");

//   // Expand to see level 2
//   await userEvent.click(ItemTriggers.nth(0));

//   // Wait for content to be visible
//   await expect.element(ItemContents.nth(0)).toBeVisible();

//   // Find Level 2 item by text
//   const level2Label = page.getByText("Level 2");
//   await expect.element(level2Label).toBeVisible();

//   // Expand level 2 to see level 3
//   await userEvent.click(ItemTriggers.nth(1));

//   // Wait for nested content
//   await expect.element(ItemContents.nth(1)).toBeVisible();

//   // Find Level 3 item by text
//   const level3Label = page.getByText("Level 3");
//   await expect.element(level3Label).toBeVisible();
// });

// test("deeply nested navigation works correctly", async () => {
//   render(<DeeplyNested />);

//   // Expand level 1
//   await userEvent.click(ItemTriggers.nth(0));

//   // Expand level 2
//   await userEvent.click(ItemTriggers.nth(1));

//   // Focus level 1
//   ((await Items.nth(0).element()) as HTMLElement).focus();

//   // Navigate down to level 2
//   await userEvent.keyboard("{ArrowDown}");
//   await expect.element(Items.nth(1)).toHaveAttribute("data-highlighted", "true");

//   // Navigate down to level 3
//   await userEvent.keyboard("{ArrowDown}");
//   await expect.element(Items.nth(2)).toHaveAttribute("data-highlighted", "true");

//   // Navigate back up
//   await userEvent.keyboard("{ArrowUp}");
//   await expect.element(Items.nth(1)).toHaveAttribute("data-highlighted", "true");
// });
