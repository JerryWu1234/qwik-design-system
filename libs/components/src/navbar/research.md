# Navbar Research

## Overview

A Navbar component provides a responsive and accessible navigation header for websites and applications. It serves as the primary navigation interface, offering users quick access to different sections or pages. The component supports branding elements, navigation links, disclosures, and interactive controls while maintaining proper accessibility semantics.

The navbar focuses on desktop navigation patterns with horizontal menu items and dropdown disclosure menus. For mobile viewports, developers should compose the navbar with the Modal component to create mobile menu experiences. This separation of concerns keeps the navbar component focused on navigation structure while delegating mobile menu behavior to the modal pattern. The component follows WAI-ARIA navigation patterns and uses semantic HTML elements enhanced with additional functionality.

## Features
Target features. Some are essential, others are nice to have. Checked items are already implemented in our component.

### Core Features
- [ ] Navigation links with active state
- [ ] Disclosure menu support
- [ ] Nested disclosure support
- [ ] Hover and click interactions for disclosures
- [ ] Delay/closeDelay for hover behavior
- [ ] Multiple disclosure management (one open at a time vs multiple)

### Composition Features
- [ ] Custom link rendering via asChild pattern (for client-side routing)
- [ ] Nested navbar support (sub-navigation)

### Interaction Features
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Disabled state for links
- [ ] Disclosure state handling

## Accessibility Features
- [ ] ARIA attributes support
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management
- [ ] aria-expanded state management
- [ ] aria-controls attribute linking
- [ ] Proper landmark roles

## Research Links
Here are some resources that can inform and inspire our implementation

### Component Libraries

#### [Base UI Navigation Menu](https://base-ui.com/react/navigation-menu)
- Comprehensive headless implementation with extensive API
- Uses namespace components (NavigationMenu.Root, NavigationMenu.List, etc.)
- Supports nested submenus and custom link rendering
- Popover-based popup positioning with collision avoidance
- Includes viewport clipping and arrow positioning
- Horizontal orientation with dropdown menus
- Rich animation support with data attributes for styling states
- Provides delay/closeDelay props for hover interactions
- Arrow component for visual popup indicators

#### [Astro Navbar](https://github.com/surjithctly/astro-navbar)
- Fully responsive and accessible headless navigation bar
- Supports nested dropdowns
- Custom icon support (OpenIcon/CloseIcon)
- StickyHeader utility component for scroll-based styling
- Group-based styling (e.g., group-open class)
- Minimal API with flexible styling options
- Note: Uses built-in mobile toggle, but we'll use Modal composition instead

#### [Bootstrap Navbar](https://getbootstrap.com/docs/4.0/components/navbar/)
- Industry-standard navbar implementation
- Supports brand, nav, toggler, form, and text sub-components
- Responsive behavior with .navbar-expand classes
- Color scheme utilities (navbar-light/navbar-dark)
- Multiple placement options (static, fixed-top, fixed-bottom, sticky-top)
- Form/search integration
- Dropdown support within navigation
- Uses native HTML elements with utility classes

### Official Accessibility Guidance
- [WAI-ARIA Navigation Landmark](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html)
- Should use `<nav>` element or `role="navigation"`
- Navigation landmarks should be labeled with `aria-label` or `aria-labelledby`
- Current page indicator using `aria-current="page"`
- Expandable menus should use `aria-expanded` attribute

## Component Structure
Based on Base UI and namespace component pattern:

```
- Root (renders <nav> or <div> if nested)
  - List
    - Item
      - ItemLink
      - ItemTrigger (for disclosures)
      - ItemContent (disclosure content)
        - ItemLink(s) / nested content
        - Nested Item (for submenus)
        - Arrow (optional)
```

Note: For mobile menus, compose with Modal component:
```
- Modal.Root
  - Modal.Trigger (e.g., hamburger button in navbar)
  - Modal.Content
    - Navbar.List (reused navigation structure)
```

## State Management

### Navigation State
```tsx
interface NavigationState {
  isOpen: boolean; // Mobile menu open/closed
  activeValue: string | null; // Currently active dropdown
  orientation: 'horizontal' | 'vertical';
}
```

### Dropdown State
```tsx
interface DropdownState {
  value: any;
  isOpen: boolean;
  activationDirection?: 'left' | 'right';
}
```

### Position State (for popups)
```tsx
interface PositionState {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  isAnchorHidden: boolean;
}
```

## Keyboard Interactions

### Top-level Navigation
- **Tab/Shift+Tab**: Navigate between focusable elements
- **Enter/Space**: Activate link or toggle disclosure
- **Escape**: Close open disclosures
- **Arrow Left/Right**: Navigate between top-level items (horizontal orientation)
- **Arrow Up/Down**: Navigate between top-level items (vertical orientation)
- **Home**: Focus first navigation item
- **End**: Focus last navigation item

### Disclosure Menu
- **Arrow Down**: Open disclosure and focus first item (from trigger)
- **Arrow Up**: Open disclosure and focus last item (from trigger)
- **Arrow Down/Up**: Navigate between disclosure items
- **Escape**: Close disclosure and return focus to trigger
- **Tab**: Close disclosure and move to next focusable element

Note: Mobile menu keyboard interactions are handled by the Modal component when composed together.

## Attributes

### ARIA Attributes
- `role="navigation"` - Navigation landmark (or use `<nav>` element)
- `aria-label` - Label for the navigation region
- `aria-labelledby` - Reference to label element
- `aria-expanded` - Indicates toggle/dropdown state
- `aria-controls` - Links trigger to controlled element
- `aria-current="page"` - Indicates current active page
- `aria-haspopup="true"` - Indicates trigger opens a menu
- `aria-hidden` - Hide collapsed content from screen readers

### Data Attributes
- `data-qds-navbar-root`
- `data-qds-navbar-brand`
- `data-qds-navbar-list`
- `data-qds-navbar-item`
- `data-qds-navbar-link`
- `data-qds-navbar-trigger`
- `data-qds-navbar-content`
- `data-qds-navbar-disclosure`
- `data-open` - Indicates open state
- `data-closed` - Indicates closed state
- `data-active` - Indicates active/current page
- `data-pressed` - Indicates pressed state
- `data-disclosure-open` - Indicates disclosure is open
- `data-side` - Disclosure positioning side
- `data-align` - Disclosure alignment
- `data-starting-style` - Animation start state
- `data-ending-style` - Animation end state
- `data-activation-direction` - Direction of activation (left/right)

### CSS Variables (for positioned disclosures)
- `--anchor-width` - Width of anchor element
- `--anchor-height` - Height of anchor element
- `--available-width` - Available width in viewport
- `--available-height` - Available height in viewport
- `--positioner-width` - Fixed positioner width
- `--positioner-height` - Fixed positioner height
- `--disclosure-width` - Fixed disclosure width
- `--disclosure-height` - Fixed disclosure height
- `--transform-origin` - Transform origin for animations

## Focus Management
- Focus moves through navigation items in a logical order
- Active page link maintains focus indication
- Disclosure triggers are focusable and indicate expandable state
- Focus trapped within open disclosures when navigating with arrows
- Focus returns to trigger when disclosure closes
- Visible focus indicators on all interactive elements
- Mobile menu focus management handled by Modal component

## Use Cases
- Primary website navigation
- Application header navigation
- Multi-level menu systems with disclosures
- E-commerce category navigation
- Documentation site navigation
- Dashboard/admin navigation
- Marketing website headers
- Desktop navigation patterns (compose with Modal for mobile)

## API Design

### Root
```tsx
interface NavbarRootProps {
  // Disclosure state management
  value?: any; // Uncontrolled - which disclosure is open
  'bind:value'?: Signal<any>; // Controlled - which disclosure is open
  onChange$?: (value: any) => void; // Fires when active disclosure changes
  
  // Behavior
  delay?: number; // Hover delay for disclosure (default: 50)
  closeDelay?: number; // Close delay for disclosure (default: 50)
  orientation?: 'horizontal' | 'vertical'; // Affects keyboard navigation direction
  
  class?: string;
  asChild?: boolean; // Render as child component instead of default element
}
```

### List
```tsx
interface NavbarListProps {
  class?: string;
  asChild?: boolean;
}
```

### Item
```tsx
interface NavbarItemProps {
  value?: any; // For disclosure items
  class?: string;
  asChild?: boolean;
}
```

### ItemLink
```tsx
interface NavbarItemLinkProps {
  href?: string;
  active?: boolean; // Manually set active state
  disabled?: boolean;
  class?: string;
  asChild?: boolean; // Use for custom link components (Next.js Link, etc.)
}
```

### ItemTrigger (Disclosure)
```tsx
interface NavbarItemTriggerProps {
  class?: string;
  asChild?: boolean;
}
// Attributes: data-disclosure-open, data-pressed
```

### Icon
```tsx
interface NavbarIconProps {
  class?: string;
  asChild?: boolean;
}
// Typically rotates when data-disclosure-open
```

### ItemContent (Disclosure)
```tsx
interface NavbarItemContentProps {
  class?: string;
  asChild?: boolean;
}
// Attributes: data-open, data-closed, data-activation-direction, data-starting-style, data-ending-style
```

### Arrow
```tsx
interface NavbarArrowProps {
  class?: string;
  asChild?: boolean;
}
// Attributes: data-side, data-align, data-uncentered
```


## Styling Hooks
As a headless component, styling is left entirely to the user. The component provides:

### Data Attributes
- Data attributes for all interactive and state changes
- Consistent naming with `data-qds-navbar-*` prefix
- State attributes: `data-open`, `data-closed`, `data-active`, `data-disabled`, etc.
<!-- - Animation state attributes: `data-starting-style`, `data-ending-style` -->

### CSS Variables (for positioned disclosures)
- Use CSS Anchor Positioning

## Known Issues
- Focus management with nested disclosure menus
- Keyboard navigation conflicts with nested interactive elements
- Hover vs click behavior for disclosure triggers on touch devices
- Coordinating multiple disclosure animations

## Questions
- Support mega menus (large disclosure content)?
- Include search/form components as first-class parts or leave as composition slots?
- Support for nested navigation beyond 2 levels?
- Should active state detection be automatic (route-based) or manual prop?
- What is the primary use case for onChange$ - tracking which disclosure is open?
