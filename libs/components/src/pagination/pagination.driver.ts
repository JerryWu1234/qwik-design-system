// oxlint-disable no-empty-file
// import type { Locator, Page } from "@playwright/test";
// type OpenKeys = "Space" | "Enter";
// export type DriverLocator = Locator | Page;

// export function createTestDriver<T extends DriverLocator>(rootLocator: T) {
//   const getRoot = () => {
//     return rootLocator.locator("[ui-qds-pagination-root]");
//   };

//   const getNextButton = () => {
//     return getRoot().locator("[ui-qds-pagination-next]").first();
//   };

//   const getPrevButton = () => {
//     return getRoot().locator("[ui-qds-pagination-previous]").last();
//   };

//   const getLastButton = () => {
//     return getRoot().locator("[ui-qds-pagination-next]").last();
//   };

//   const getFirstButton = () => {
//     return getRoot().locator("[ui-qds-pagination-previous]").first();
//   };

//   const getPageAtIndex = (index: number) => {
//     return getRoot().getByRole("button").nth(index);
//   };

//   const getActivePage = () => {
//     return getRoot().locator("[ui-current]");
//   };

//   const getEllipsis = () => {
//     return getRoot().locator("[ui-qds-pagination-ellipsis]");
//   };

//   return {
//     ...rootLocator,
//     locator: rootLocator,
//     getRoot,
//     getNextButton,
//     getPrevButton,
//     getLastButton,
//     getFirstButton,
//     getPageAtIndex,
//     getEllipsis,
//     getActivePage
//   };
// }
