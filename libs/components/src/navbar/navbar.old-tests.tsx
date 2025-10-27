// oxlint-disable no-empty-file
// import { type PropsOf, component$, useSignal, useStore } from "@qwik.dev/core";
// import { page, userEvent } from "vitest/browser";
// import { expect, test } from "vitest";
// import { render } from "vitest-browser-qwik";
// import { Navbar } from "..";

// // Top-level locator constants using data-testid
// const Root = page.getByTestId("root");
// const List = page.getByTestId("list");
// const Items = page.getByTestId("item");
// const Links = page.getByTestId("link");
// const Triggers = page.getByTestId("trigger");
// const Contents = page.getByTestId("content");
// const DisclosureLinks = page.getByTestId("disclosure-link");

// const Basic = component$((props: PropsOf<typeof Navbar.Root>) => {
//   return (
//     <Navbar.Root {...props} data-testid="root">
//       <Navbar.List data-testid="list">
//         <Navbar.Item data-testid="item">
//           <Navbar.ItemLink href="/" data-testid="link">
//             Home
//           </Navbar.ItemLink>
//         </Navbar.Item>
//         <Navbar.Item data-testid="item">
//           <Navbar.ItemLink href="/about" data-testid="link">
//             About
//           </Navbar.ItemLink>
//         </Navbar.Item>
//         <Navbar.Item data-testid="item">
//           <Navbar.ItemLink href="/contact" data-testid="link">
//             Contact
//           </Navbar.ItemLink>
//         </Navbar.Item>
//       </Navbar.List>
//     </Navbar.Root>
//   );
// });

// const WithDisclosure = component$((props: PropsOf<typeof Navbar.Root>) => {
//   return (
//     <Navbar.Root {...props} data-testid="root">
//       <Navbar.List data-testid="list">
//         <Navbar.Item data-testid="item">
//           <Navbar.ItemLink href="/" data-testid="link">
//             Home
//           </Navbar.ItemLink>
//         </Navbar.Item>

//         <Navbar.Item data-testid="item">
//           <Navbar.ItemTrigger data-testid="trigger">Products</Navbar.ItemTrigger>
//           {/* <Navbar.ItemContent data-testid="content">
//             <Navbar.ItemLink href="/products/software" data-testid="disclosure-link">
//               Software
//             </Navbar.ItemLink>
//             <Navbar.ItemLink href="/products/hardware" data-testid="disclosure-link">
//               Hardware
//             </Navbar.ItemLink>
//           </Navbar.ItemContent> */}
//         </Navbar.Item>

//         <Navbar.Item data-testid="item">
//           <Navbar.ItemLink href="/contact" data-testid="link">
//             Contact
//           </Navbar.ItemLink>
//         </Navbar.Item>
//       </Navbar.List>
//     </Navbar.Root>
//   );
// });

// const NestedDisclosure = component$(() => {
//   return (
//     <Navbar.Root data-testid="root">
//       <Navbar.List data-testid="list">
//         <Navbar.Item data-testid="item">
//           <Navbar.ItemTrigger data-testid="trigger">Products</Navbar.ItemTrigger>
//           <Navbar.ItemContent data-testid="content">
//             <Navbar.Item data-testid="nested-item">
//               <Navbar.ItemTrigger data-testid="nested-trigger">
//                 Software
//               </Navbar.ItemTrigger>
//               <Navbar.ItemContent data-testid="nested-content">
//                 <Navbar.ItemLink
//                   href="/products/software/desktop"
//                   data-testid="nested-link"
//                 >
//                   Desktop Apps
//                 </Navbar.ItemLink>
//               </Navbar.ItemContent>
//             </Navbar.Item>
//           </Navbar.ItemContent>
//         </Navbar.Item>
//       </Navbar.List>
//     </Navbar.Root>
//   );
// });

// const ExternalState = component$(() => {
//   const openSignal = useSignal(false);
//   const openStore = useStore({ open: false });

//   return (
//     <div>
//       <Navbar.Root data-testid="root">
//         <Navbar.List data-testid="list">
//           <Navbar.Item
//             // test signal
//             bind:open={openSignal}
//             // test value based
//             open={openStore.open}
//             onChange$={(open: boolean) => {
//               openStore.open = open;
//             }}
//             data-testid="item"
//           >
//             <Navbar.ItemTrigger data-testid="trigger">Products</Navbar.ItemTrigger>
//             <Navbar.ItemContent data-testid="content">
//               <Navbar.ItemLink href="/products/software" data-testid="disclosure-link">
//                 Software
//               </Navbar.ItemLink>
//             </Navbar.ItemContent>
//           </Navbar.Item>
//         </Navbar.List>
//       </Navbar.Root>
//       <div data-testid="open-signal">Signal: {openSignal.value.toString()}</div>
//       <div data-testid="open-store">Store: {openStore.open.toString()}</div>
//       <button
//         type="button"
//         data-testid="change-signal"
//         onClick$={() => {
//           openSignal.value = !openSignal.value;
//         }}
//       >
//         Toggle Signal
//       </button>
//       <button
//         type="button"
//         data-testid="change-store"
//         onClick$={() => {
//           openStore.open = !openStore.open;
//         }}
//       >
//         Toggle Store
//       </button>
//     </div>
//   );
// });

// test("navbar root is visible", async () => {
//   render(<Basic />);
//   await expect.element(Root).toBeVisible();
// });

// test("navbar list is visible", async () => {
//   render(<Basic />);
//   await expect.element(List).toBeVisible();
// });

// test("navbar items are visible", async () => {
//   render(<Basic />);
//   await expect.element(Items.nth(0)).toBeVisible();
//   await expect.element(Items.nth(1)).toBeVisible();
//   await expect.element(Items.nth(2)).toBeVisible();
// });

// test("navigation links are visible", async () => {
//   render(<Basic />);
//   await expect.element(Links.nth(0)).toBeVisible();
//   await expect.element(Links.nth(1)).toBeVisible();
//   await expect.element(Links.nth(2)).toBeVisible();
// });

// test("navigation links have correct href attributes", async () => {
//   render(<Basic />);
//   await expect.element(Links.nth(0)).toHaveAttribute("href", "/");
//   await expect.element(Links.nth(1)).toHaveAttribute("href", "/about");
//   await expect.element(Links.nth(2)).toHaveAttribute("href", "/contact");
// });

// test("navigation links have correct text content", async () => {
//   render(<Basic />);
//   await expect.element(Links.nth(0)).toHaveTextContent("Home");
//   await expect.element(Links.nth(1)).toHaveTextContent("About");
//   await expect.element(Links.nth(2)).toHaveTextContent("Contact");
// });

// test("disclosure trigger can be clicked to show content", async () => {
//   render(<WithDisclosure />);

//   await userEvent.click(Triggers.nth(0));
//   await expect.element(Contents.nth(0)).toBeVisible();
// });

// test("disclosure content has correct disclosure links", async () => {
//   render(<WithDisclosure />);

//   await userEvent.click(Triggers.nth(0));
//   await expect.element(DisclosureLinks.nth(0)).toBeVisible();
//   await expect.element(DisclosureLinks.nth(1)).toBeVisible();
//   await expect
//     .element(DisclosureLinks.nth(0))
//     .toHaveAttribute("href", "/products/software");
//   await expect
//     .element(DisclosureLinks.nth(1))
//     .toHaveAttribute("href", "/products/hardware");
// });

// test("clicking disclosure trigger toggles content visibility", async () => {
//   render(<WithDisclosure />);

//   await userEvent.click(Triggers.nth(0));
//   await expect.element(Contents.nth(0)).toBeVisible();

//   await userEvent.click(Triggers.nth(0));
//   await expect.element(Contents.nth(0)).not.toBeVisible();
// });

// test("nested disclosure can be opened", async () => {
//   render(<NestedDisclosure />);

//   await userEvent.click(Triggers.nth(0));
//   await expect.element(page.getByTestId("nested-item")).toBeVisible();

//   await userEvent.click(page.getByTestId("nested-trigger"));
//   await expect.element(page.getByTestId("nested-content")).toBeVisible();
//   await expect.element(page.getByTestId("nested-link")).toBeVisible();
// });

// test("Escape key closes open disclosure", async () => {
//   render(<WithDisclosure />);

//   await userEvent.click(Triggers.nth(0));
//   await expect.element(Contents.nth(0)).toBeVisible();

//   await userEvent.keyboard("{Escape}");
//   await expect.element(Contents.nth(0)).not.toBeVisible();
// });

// test("Enter key activates disclosure trigger", async () => {
//   render(<WithDisclosure />);

//   await expect.element(Triggers.nth(0)).toBeVisible();
//   ((await Triggers.nth(0).element()) as HTMLButtonElement).focus();
//   await userEvent.keyboard("{Enter}");

//   await expect.element(Contents.nth(0)).toBeVisible();
// });

// test("Space key activates disclosure trigger", async () => {
//   render(<WithDisclosure />);

//   await expect.element(Triggers.nth(0)).toBeVisible();
//   ((await Triggers.nth(0).element()) as HTMLButtonElement).focus();
//   await userEvent.keyboard("{Space}");

//   await expect.element(Contents.nth(0)).toBeVisible();
// });

// test("trigger has popovertarget attribute", async () => {
//   render(<WithDisclosure />);
//   await expect.element(Triggers.nth(0)).toHaveAttribute("popovertarget");
// });

// test("content has popover attribute", async () => {
//   render(<WithDisclosure />);
//   await expect.element(Contents.nth(0)).toHaveAttribute("popover");
// });

// test("external store value changes update disclosure state", async () => {
//   render(<ExternalState />);

//   await expect.element(page.getByText("Store: false")).toBeVisible();

//   await userEvent.click(page.getByTestId("change-store"));
//   await expect.element(Contents.nth(0)).toBeVisible();
//   await expect.element(page.getByText("Store: true")).toBeVisible();
// });

// test("external signal changes update disclosure state", async () => {
//   render(<ExternalState />);

//   await expect.element(page.getByText("Signal: false")).toBeVisible();

//   await userEvent.click(page.getByTestId("change-signal"));
//   await expect.element(Contents.nth(0)).toBeVisible();
//   await expect.element(page.getByText("Signal: true")).toBeVisible();
// });

// test("onChange$ fires when disclosure state changes", async () => {
//   render(<ExternalState />);

//   await expect.element(page.getByText("Store: false")).toBeVisible();

//   await userEvent.click(Triggers.nth(0));
//   await expect.element(page.getByText("Store: true")).toBeVisible();
// });
