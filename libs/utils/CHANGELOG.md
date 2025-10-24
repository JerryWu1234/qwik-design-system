# @qds.dev/utils

## 0.4.3

## 0.4.2

### Patch Changes

- 5e5aae7: ### Major Changes

  - **Scoped Styles System** (#307): Complete rewrite of the styling system with significant architectural improvements
    - Implemented v2 scoped styles architecture
    - Simplified checkbox root attributes
    - Correct backpatch handling for reactive updates
    - Proper SSR unmount behavior
    - Managed ARIA IDs for accessibility
    - Isomorphic DOM nodes for better SSR/CSR consistency
    - Global observer for SSR unmount optimization
    - Transform function for library builds
    - QRL injection with unit tests
    - Improved value binding system that ignores adding attributes in the DOM
    - Better DX ergonomics for edge cases

  ### Minor Changes

  - **Vitest 4 Upgrade** (#310): Migrated to Vitest 4 with improved testing infrastructure

    - Updated test runners across multiple components
    - Partial conversion to new vitest system (#293)
    - Updated QR Code tests (#292)
    - Updated Progress tests (#291)
    - Updated Scroll Area tests (#295)
    - Updated Slider tests (#296)
    - Updated Switch tests (#300)
    - Updated Tabs tests (#301)
    - Updated Toggle tests (#302)
    - Added pagination tests (#288)
    - Added Label and Menu tests (#286)
    - Fixed last tests + nesting scopes (#314)
    - SSR tests working (#315)

  - **Modal & Collapsible Enhancements** (#312):

    - Added data attributes to Modal component
    - Changed scope naming convention
    - Added data attributes to Collapsible component

  - **Field Component Data Attributes** (#309): Added proper data attributes to Field component for better styling and state management

  - **Icon Improvements** (#311): Icons now respect `1em` as the default size, improving typography integration

  ### Patch Changes

  - **Checkbox Layout Fix** (#313): Fixed layout issues in checkbox component
  - **Slider Update** (#308): V2 slider improvements and updates
  - **Dependencies Update** (#305): Updated package dependencies and pnpm lockfile
  - **Documentation**:
    - Removed broken SVG in README
    - Updated index.mdx (#299)
  - **Testing**:
    - Added additional tests (#303)

## 0.4.1

## 0.4.0

### Minor Changes

- 4b74fe7: ## New Components

  ### Field Component

  Introduces a new headless Field component for building accessible form inputs with proper labeling, descriptions, and error handling.

  **Components:**

  - `Field.Root` - Root container with value management and context provider
  - `Field.Label` - Accessible label that associates with the input
  - `Field.Input` - Input element with automatic accessibility attributes
  - `Field.Textarea` - Optional Textarea element when Input is not present with automatic accessibility attributes
  - `Field.Description` - Optional description text for additional context
  - `Field.Error` - Error message display with proper ARIA linking

  **Features:**

  - Automatic ARIA attribute management (`aria-describedby`, `aria-invalid`, `aria-required`)
  - Flexible value handling (supports both root-level and component-level `bind:value` and `value` props)
  - Built-in support for required, disabled, and readonly states
  - Full accessibility compliance with comprehensive test coverage

  ## Utilities

  ### mergeRefs

  Adds a new `mergeRefs` utility function in `@qds.dev/utils` for composing multiple refs together. This utility is useful when you need to forward a ref to a child component while also maintaining your own ref to the same element.

## 0.3.3

## 0.3.2

## 0.3.1

## 0.3.0

## 0.2.0

## 0.1.0

## 0.0.12

## 0.0.11

### Patch Changes

- 28b38c9: feat: add license

## 0.0.10
