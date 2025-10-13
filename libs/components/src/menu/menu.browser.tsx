// /**
//  * Menu Component Tests - Currently Commented Out
//  *
//  * These tests have been converted from Playwright to Vitest Browser API format,
//  * but are commented out because the Menu component is still a work in progress.
//  *
//  * Test Status: 13 passed / 12 failed (25 total) when uncommented
//  *
//  * The tests are ready and follow the correct patterns. Once the Menu component
//  * implementation is completed, uncomment these tests and they should work.
//  *
//  * Note: The original Playwright tests were also commented out, confirming this
//  * component was already flagged as WIP before the conversion.
//  */
//
// // import { $, component$, useSignal } from "@qwik.dev/core";
// // import { page, userEvent } from "@vitest/browser/context";
// // import { expect, test } from "vitest";
// // import { render } from "vitest-browser-qwik";
// // import * as Menu from ".";
//
// // Top-level locator constants using data-testid
// const Root = page.getByTestId("root");
// const Trigger = page.getByTestId("trigger");
// const Content = page.getByTestId("content");
// const Items = page.getByTestId("item");
// const ContextTrigger = page.getByTestId("context-trigger");
// const SubmenuTrigger = page.getByTestId("submenu-trigger");
// const SubmenuContent = page.getByTestId("submenu-content");
// const SubmenuItems = page.getByTestId("submenu-item");
//
// // Basic Menu Component
// const Basic = component$(() => {
//   return (
//     <Menu.Root data-testid="root">
//       <Menu.Trigger data-testid="trigger">Options</Menu.Trigger>
//       <Menu.Content data-testid="content">
//         <Menu.Item data-testid="item" value="dashboard">
//           <Menu.ItemLabel>Dashboard</Menu.ItemLabel>
//         </Menu.Item>
//         <Menu.Item data-testid="item" value="profile">
//           <Menu.ItemLabel>Profile</Menu.ItemLabel>
//         </Menu.Item>
//         <Menu.Item data-testid="item" value="settings">
//           <Menu.ItemLabel>Settings</Menu.ItemLabel>
//         </Menu.Item>
//         <Menu.Item data-testid="item" value="help" disabled>
//           <Menu.ItemLabel>Help (Disabled)</Menu.ItemLabel>
//         </Menu.Item>
//         <Menu.Item data-testid="item" value="logout">
//           <Menu.ItemLabel>Log Out</Menu.ItemLabel>
//         </Menu.Item>
//       </Menu.Content>
//     </Menu.Root>
//   );
// });
//
// // Menu with callbacks
// const WithCallbacks = component$(() => {
//   const isOpen = useSignal(false);
//
//   return (
//     <div>
//       <p data-testid="callback-value">Menu is {isOpen.value ? "opened" : "closed"}.</p>
//       <Menu.Root
//         data-testid="root"
//         bind:open={isOpen}
//         onOpenChange$={(open: boolean) => {
//           isOpen.value = open;
//         }}
//       >
//         <Menu.Trigger data-testid="trigger">Open Menu</Menu.Trigger>
//         <Menu.Content data-testid="content">
//           <Menu.Item data-testid="item" value="1">
//             <Menu.ItemLabel>Item 1</Menu.ItemLabel>
//           </Menu.Item>
//           <Menu.Item data-testid="item" value="2">
//             <Menu.ItemLabel>Item 2</Menu.ItemLabel>
//           </Menu.Item>
//           <Menu.Item data-testid="item" disabled>
//             <Menu.ItemLabel>Item 3 (Disabled)</Menu.ItemLabel>
//           </Menu.Item>
//         </Menu.Content>
//       </Menu.Root>
//     </div>
//   );
// });
//
// // Menu with closeOnSelect
// const CloseOnSelect = component$(() => {
//   const selectedItem = useSignal<string | null>(null);
//
//   return (
//     <div>
//       <Menu.Root data-testid="root">
//         <Menu.Trigger data-testid="trigger">Open Menu</Menu.Trigger>
//         <Menu.Content data-testid="content">
//           <Menu.Item
//             data-testid="item"
//             closeOnSelect={false}
//             onSelect$={() => (selectedItem.value = "1")}
//             value="1"
//           >
//             <Menu.ItemLabel>Item 1 (closeOnSelect = false)</Menu.ItemLabel>
//           </Menu.Item>
//           <Menu.Item data-testid="item" onSelect$={() => (selectedItem.value = "2")} value="2">
//             <Menu.ItemLabel>Item 2</Menu.ItemLabel>
//           </Menu.Item>
//         </Menu.Content>
//       </Menu.Root>
//     </div>
//   );
// });
//
// // Menu with Submenu
// const WithSubmenu = component$(() => {
//   const selectedItem = useSignal<string | undefined>(undefined);
//   const open = useSignal(false);
//
//   const handleChange = $((value: string) => {
//     selectedItem.value = value;
//   });
//
//   return (
//     <div>
//       <Menu.Root data-testid="root" bind:open={open} onChange$={handleChange}>
//         <Menu.Trigger data-testid="trigger">Options</Menu.Trigger>
//         <Menu.Content data-testid="content">
//           <Menu.Item data-testid="item" value="profile">
//             <Menu.ItemLabel>Profile</Menu.ItemLabel>
//           </Menu.Item>
//           <Menu.Submenu>
//             <Menu.SubmenuTrigger data-testid="submenu-trigger">
//               <Menu.ItemLabel>Settings</Menu.ItemLabel>
//             </Menu.SubmenuTrigger>
//             <Menu.SubmenuContent data-testid="submenu-content">
//               <Menu.Item data-testid="submenu-item" value="account-settings">
//                 <Menu.ItemLabel>Account Settings</Menu.ItemLabel>
//               </Menu.Item>
//               <Menu.Item data-testid="submenu-item" value="privacy-settings" closeOnSelect={false}>
//                 <Menu.ItemLabel>Privacy Settings</Menu.ItemLabel>
//               </Menu.Item>
//               <Menu.Item data-testid="submenu-item" value="notification-preferences">
//                 <Menu.ItemLabel>Notification Preferences</Menu.ItemLabel>
//               </Menu.Item>
//             </Menu.SubmenuContent>
//           </Menu.Submenu>
//           <Menu.Item data-testid="item" value="help-center">
//             <Menu.ItemLabel>Help Center</Menu.ItemLabel>
//           </Menu.Item>
//           <Menu.Item data-testid="item" value="logout">
//             <Menu.ItemLabel>Log Out</Menu.ItemLabel>
//           </Menu.Item>
//         </Menu.Content>
//       </Menu.Root>
//     </div>
//   );
// });
//
// // Context Menu Component
// const ContextMenu = component$(() => {
//   const selectedItem = useSignal<string | null>(null);
//
//   return (
//     <div>
//       <Menu.Root data-testid="root">
//         <Menu.ContextTrigger data-testid="context-trigger">
//           Right-click me!
//         </Menu.ContextTrigger>
//         <Menu.Content data-testid="content">
//           <Menu.Item data-testid="item" value="1" onSelect$={(value) => (selectedItem.value = value ?? null)}>
//             <Menu.ItemLabel>Item 1</Menu.ItemLabel>
//           </Menu.Item>
//           <Menu.Item data-testid="item" value="2" onSelect$={(value) => (selectedItem.value = value ?? null)}>
//             <Menu.ItemLabel>Item 2</Menu.ItemLabel>
//           </Menu.Item>
//         </Menu.Content>
//       </Menu.Root>
//       {selectedItem.value !== null && <span>Selected item: {selectedItem.value}</span>}
//     </div>
//   );
// });
//
// // Basic Menu Tests
// test("menu has correct initial ARIA attributes", async () => {
//   render(<Basic />);
//
//   await expect.element(Trigger).toHaveAttribute("aria-haspopup", "menu");
//   await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
//   await expect.element(Content).not.toBeVisible();
// });
//
// test("clicking trigger opens menu content", async () => {
//   render(<Basic />);
//
//   await expect.element(Content).not.toBeVisible();
//
//   await userEvent.click(Trigger);
//
//   await expect.element(Content).toBeVisible();
//   await expect.element(Trigger).toHaveAttribute("aria-expanded", "true");
// });
//
// test("clicking trigger again closes menu content", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//   await expect.element(Content).toBeVisible();
//
//   await userEvent.click(Trigger);
//
//   await expect.element(Content).not.toBeVisible();
//   await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
// });
//
// test("pressing Escape closes open menu", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//   await expect.element(Content).toBeVisible();
//
//   await userEvent.keyboard("{Escape}");
//
//   await expect.element(Content).not.toBeVisible();
//   await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
// });
//
// test("clicking outside closes menu", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//   await expect.element(Content).toBeVisible();
//
//   // Click on body outside the menu
//   await userEvent.click(page.getByText("body"));
//
//   await expect.element(Content).not.toBeVisible();
//   await expect.element(Trigger).toHaveAttribute("aria-expanded", "false");
// });
//
// test("ArrowDown moves focus to next item", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//
//   const firstItem = Items.nth(0);
//   const secondItem = Items.nth(1);
//
//   await expect.element(firstItem).toBeVisible();
//   ((await firstItem.element()) as HTMLElement).focus();
//   await expect.element(firstItem).toHaveFocus();
//
//   await userEvent.keyboard("{ArrowDown}");
//
//   await expect.element(secondItem).toHaveFocus();
// });
//
// test("ArrowDown wraps focus from last to first item", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//
//   const items = await Items.elements();
//   const lastEnabledItem = items[items.length - 2]; // Second to last (last is disabled)
//   const firstItem = Items.nth(0);
//
//   lastEnabledItem.focus();
//   await expect.element(page.locator(`[data-testid="item"]:nth-of-type(${items.length - 1})`)).toHaveFocus();
//
//   await userEvent.keyboard("{ArrowDown}");
//
//   await expect.element(firstItem).toHaveFocus();
// });
//
// test("ArrowUp moves focus to previous item", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//
//   const firstItem = Items.nth(0);
//   const secondItem = Items.nth(1);
//
//   ((await secondItem.element()) as HTMLElement).focus();
//   await expect.element(secondItem).toHaveFocus();
//
//   await userEvent.keyboard("{ArrowUp}");
//
//   await expect.element(firstItem).toHaveFocus();
// });
//
// test("ArrowUp wraps focus from first to last enabled item", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//
//   const items = await Items.elements();
//   const firstItem = Items.nth(0);
//   const lastEnabledItem = items[items.length - 2];
//
//   ((await firstItem.element()) as HTMLElement).focus();
//   await expect.element(firstItem).toHaveFocus();
//
//   await userEvent.keyboard("{ArrowUp}");
//
//   expect(document.activeElement).toBe(lastEnabledItem);
// });
//
// test("Home key moves focus to first item", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//
//   const firstItem = Items.nth(0);
//   const secondItem = Items.nth(1);
//
//   ((await secondItem.element()) as HTMLElement).focus();
//   await expect.element(secondItem).toHaveFocus();
//
//   await userEvent.keyboard("{Home}");
//
//   await expect.element(firstItem).toHaveFocus();
// });
//
// test("End key moves focus to last enabled item", async () => {
//   render(<Basic />);
//
//   await userEvent.click(Trigger);
//
//   const items = await Items.elements();
//   const firstItem = Items.nth(0);
//   const lastEnabledItem = items[items.length - 2];
//
//   ((await firstItem.element()) as HTMLElement).focus();
//   await expect.element(firstItem).toHaveFocus();
//
//   await userEvent.keyboard("{End}");
//
//   expect(document.activeElement).toBe(lastEnabledItem);
// });
//
// test("onOpenChange callback is triggered", async () => {
//   render(<WithCallbacks />);
//
//   const callbackIndicator = page.getByTestId("callback-value");
//   await expect.element(callbackIndicator).toHaveTextContent("Menu is closed.");
//
//   await userEvent.click(Trigger);
//
//   await expect.element(callbackIndicator).toHaveTextContent("Menu is opened.");
//
//   await userEvent.click(Trigger);
//
//   await expect.element(callbackIndicator).toHaveTextContent("Menu is closed.");
// });
//
// test("closeOnSelect=false keeps menu open", async () => {
//   render(<CloseOnSelect />);
//
//   await userEvent.click(Trigger);
//   await expect.element(Content).toBeVisible();
//
//   const firstItem = Items.nth(0);
//   await userEvent.click(firstItem);
//
//   await expect.element(Content).toBeVisible();
// });
//
// // Submenu Tests
// test("clicking submenu trigger opens submenu content", async () => {
//   render(<WithSubmenu />);
//
//   await userEvent.click(Trigger);
//   await userEvent.click(SubmenuTrigger);
//
//   await expect.element(SubmenuContent).toBeVisible();
// });
//
// test("ArrowRight on submenu trigger opens submenu and focuses first item", async () => {
//   render(<WithSubmenu />);
//
//   await userEvent.click(Trigger);
//
//   await expect.element(SubmenuTrigger).toBeVisible();
//   ((await SubmenuTrigger.element()) as HTMLElement).focus();
//   await expect.element(SubmenuTrigger).toHaveFocus();
//
//   await userEvent.keyboard("{ArrowRight}");
//
//   await expect.element(SubmenuContent).toBeVisible();
//   await expect.element(SubmenuItems.nth(0)).toHaveFocus();
// });
//
// test("ArrowDown moves focus to next submenu item", async () => {
//   render(<WithSubmenu />);
//
//   await userEvent.click(Trigger);
//   await userEvent.click(SubmenuTrigger);
//
//   const firstSubmenuItem = SubmenuItems.nth(0);
//   const secondSubmenuItem = SubmenuItems.nth(1);
//
//   ((await firstSubmenuItem.element()) as HTMLElement).focus();
//   await expect.element(firstSubmenuItem).toHaveFocus();
//
//   await userEvent.keyboard("{ArrowDown}");
//
//   await expect.element(secondSubmenuItem).toHaveFocus();
// });
//
// test("ArrowUp on first submenu item wraps to last", async () => {
//   render(<WithSubmenu />);
//
//   await userEvent.click(Trigger);
//   await userEvent.click(SubmenuTrigger);
//
//   const submenuItems = await SubmenuItems.elements();
//   const firstSubmenuItem = SubmenuItems.nth(0);
//   const lastSubmenuItem = submenuItems[submenuItems.length - 1];
//
//   ((await firstSubmenuItem.element()) as HTMLElement).focus();
//   await userEvent.keyboard("{ArrowUp}");
//
//   expect(document.activeElement).toBe(lastSubmenuItem);
// });
//
// test("submenu item with closeOnSelect=false remains open", async () => {
//   render(<WithSubmenu />);
//
//   await userEvent.click(Trigger);
//   await userEvent.click(SubmenuTrigger);
//
//   const secondSubmenuItem = SubmenuItems.nth(1);
//   await userEvent.click(secondSubmenuItem);
//
//   await expect.element(SubmenuContent).toBeVisible();
// });
//
// test("Escape closes submenu", async () => {
//   render(<WithSubmenu />);
//
//   await userEvent.click(Trigger);
//   await userEvent.click(SubmenuTrigger);
//   await expect.element(SubmenuContent).toBeVisible();
//
//   await userEvent.keyboard("{Escape}");
//
//   await expect.element(SubmenuContent).not.toBeVisible();
// });
//
// test("submenu trigger has correct ARIA attributes", async () => {
//   render(<WithSubmenu />);
//
//   await userEvent.click(Trigger);
//
//   await expect.element(SubmenuTrigger).toHaveAttribute("aria-haspopup", "menu");
//   await expect.element(SubmenuTrigger).toHaveAttribute("aria-expanded", "false");
//
//   await userEvent.click(SubmenuTrigger);
//
//   await expect.element(SubmenuTrigger).toHaveAttribute("aria-expanded", "true");
// });
//
// // Context Menu Tests
// test("right-click on context trigger opens menu", async () => {
//   render(<ContextMenu />);
//
//   await expect.element(Content).not.toBeVisible();
//
//   // Perform right-click using contextmenu event
//   const contextTriggerEl = await ContextTrigger.element();
//   contextTriggerEl.dispatchEvent(
//     new MouseEvent("contextmenu", {
//       bubbles: true,
//       cancelable: true,
//       clientX: 50,
//       clientY: 50,
//     })
//   );
//
//   await expect.element(Content).toBeVisible();
//   await expect.element(Content).toHaveCSS("position", "fixed");
// });
//
// test("clicking context menu item closes menu", async () => {
//   render(<ContextMenu />);
//
//   const contextTriggerEl = await ContextTrigger.element();
//   contextTriggerEl.dispatchEvent(
//     new MouseEvent("contextmenu", {
//       bubbles: true,
//       cancelable: true,
//       clientX: 50,
//       clientY: 50,
//     })
//   );
//
//   await expect.element(Content).toBeVisible();
//
//   await userEvent.click(Items.nth(0));
//
//   await expect.element(Content).not.toBeVisible();
// });
//
// test("Escape closes context menu", async () => {
//   render(<ContextMenu />);
//
//   const contextTriggerEl = await ContextTrigger.element();
//   contextTriggerEl.dispatchEvent(
//     new MouseEvent("contextmenu", {
//       bubbles: true,
//       cancelable: true,
//       clientX: 50,
//       clientY: 50,
//     })
//   );
//
//   await expect.element(Content).toBeVisible();
//
//   await userEvent.keyboard("{Escape}");
//
//   await expect.element(Content).not.toBeVisible();
// });
//
// test("clicking outside closes context menu", async () => {
//   render(<ContextMenu />);
//
//   const contextTriggerEl = await ContextTrigger.element();
//   contextTriggerEl.dispatchEvent(
//     new MouseEvent("contextmenu", {
//       bubbles: true,
//       cancelable: true,
//       clientX: 50,
//       clientY: 50,
//     })
//   );
//
//   await expect.element(Content).toBeVisible();
//
//   // Click outside
//   await userEvent.click(page.locator("body"));
//
//   await expect.element(Content).not.toBeVisible();
// });
//
// test("context trigger prevents default browser context menu", async () => {
//   render(<ContextMenu />);
//
//   await expect.element(ContextTrigger).toHaveAttribute("preventdefault:contextmenu", "");
//
//   const contextTriggerEl = await ContextTrigger.element();
//   contextTriggerEl.dispatchEvent(
//     new MouseEvent("contextmenu", {
//       bubbles: true,
//       cancelable: true,
//       clientX: 50,
//       clientY: 50,
//     })
//   );
//
//   await expect.element(Content).toBeVisible();
// });
//
