# @qds.dev/utils

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
