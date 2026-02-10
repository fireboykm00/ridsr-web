# RIDSR UI Design System

## Design Philosophy: Glassmorphic Minimalism

The RIDSR platform uses a **borderless, content-first** design approach that prioritizes data clarity and reduces visual fatigue for health workers.

---

## Core Principles

### 1. No Borders Philosophy
- **Whitespace as divider** - Use spacing and subtle background changes instead of lines
- **Soft elevations** - Subtle shadows (shadow-sm) for depth, not borders
- **Edge-to-edge content** - Information floats on a clean surface
- **Breathing room** - Generous padding (p-6, p-8) between sections

### 2. Color Hierarchy

#### Primary Palette
```css
Primary Blue: #1E40AF (blue-700) - Actions, links, focus states
Background: #FFFFFF (white) - Main canvas
Surface: #F9FAFB (gray-50) - Subtle section separation
Text Primary: #111827 (gray-900) - Headings, important text
Text Secondary: #6B7280 (gray-500) - Supporting text
```

#### Accent Colors
```css
Success: #10B981 (green-500) - Confirmed cases, positive actions
Warning: #F59E0B (amber-500) - Pending, needs attention
Danger: #EF4444 (red-500) - Urgent alerts, critical actions
Info: #3B82F6 (blue-500) - Informational states
```

#### Rwanda Theme Accents
```css
Rwanda Blue: #1E40AF (blue-700) - Primary brand
Rwanda Green: #059669 (green-600) - Secondary accent
Rwanda Yellow: #F59E0B (amber-500) - Highlights
```

### 3. Button Hierarchy

#### Primary Actions (Solid)
- Dark solid background (#1E40AF or #111827)
- White text
- Used for: Submit, Save, Confirm, Create
- Hover: Slightly darker shade

```tsx
<Button className="bg-blue-700 text-white hover:bg-blue-800">
  Submit Case
</Button>
```

#### Secondary Actions (Ghost/Bordered)
- Transparent background
- Colored border (1px)
- Colored text
- Used for: Cancel, View, Edit, Back
- Hover: Light tint (10% opacity)

```tsx
<Button variant="bordered" className="border-blue-700 text-blue-700 hover:bg-blue-50">
  Cancel
</Button>
```

#### Tertiary Actions (Ghost)
- No border, no background
- Colored text only
- Used for: Less important actions, navigation
- Hover: Light background

```tsx
<Button variant="light" className="text-gray-600 hover:bg-gray-100">
  View Details
</Button>
```

### 4. Input Fields

#### Minimal Input Style
- No 4-sided border
- Bottom border only (1px) or subtle background
- Focus state: Blue bottom border (2px) or subtle glow
- Label: Small, gray, above input

```tsx
<Input
  variant="underlined"
  label="National ID"
  classNames={{
    input: "text-base",
    label: "text-sm text-gray-600"
  }}
/>
```

### 5. Cards & Surfaces

#### Elevated Cards
- No border
- Subtle shadow (shadow-sm)
- White background
- Rounded corners (rounded-xl or rounded-2xl)
- Hover: shadow-md transition

```tsx
<div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
  {/* Content */}
</div>
```

#### Flat Sections
- Light gray background (bg-gray-50)
- No shadow
- Used for: Large content areas, sidebars

```tsx
<div className="bg-gray-50 p-8">
  {/* Content */}
</div>
```

### 6. Typography Scale

```css
Display: text-5xl (48px) font-bold - Hero sections
H1: text-3xl (30px) font-bold - Page titles
H2: text-2xl (24px) font-semibold - Section headers
H3: text-xl (20px) font-semibold - Subsections
Body Large: text-base (16px) - Primary content
Body: text-sm (14px) - Secondary content
Caption: text-xs (12px) - Labels, metadata
```

### 7. Spacing System

```css
Micro: space-y-1 (4px) - Tight grouping
Small: space-y-2 (8px) - Related items
Medium: space-y-4 (16px) - Section items
Large: space-y-6 (24px) - Major sections
XLarge: space-y-8 (32px) - Page sections
```

### 8. Status Indicators

#### Dot + Text (No Boxes)
```tsx
<div className="flex items-center gap-2">
  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
  <span className="text-sm text-gray-700">Urgent</span>
</div>
```

#### Subtle Badges
```tsx
<span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
  Pending
</span>
```

### 9. Navigation

#### Sidebar Navigation
- Flat, no borders
- Icons + text
- Active state: Subtle blue background (bg-blue-50)
- Hover: Light gray background (bg-gray-100)

```tsx
<Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
  <Icon />
  <span>Dashboard</span>
</Link>
```

#### Top Navigation
- Minimal, borderless
- Subtle shadow or background change
- Sticky positioning

### 10. Modals & Overlays

#### Glassmorphic Modal
- Backdrop blur (backdrop-blur-sm)
- No border on modal
- Soft shadow (shadow-2xl)
- Rounded corners (rounded-2xl)

```tsx
<div className="fixed inset-0 bg-black/20 backdrop-blur-sm">
  <div className="bg-white rounded-2xl shadow-2xl p-8">
    {/* Modal content */}
  </div>
</div>
```

### 11. Data Tables

#### Borderless Tables
- No cell borders
- Row hover: Light gray background
- Header: Bold text, no background
- Zebra striping: Optional, very subtle

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="text-left py-3 text-sm font-semibold text-gray-900">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-4 text-sm text-gray-700">Data</td>
    </tr>
  </tbody>
</table>
```

### 12. Icons

- Use outline style (not solid) for consistency
- Size: w-5 h-5 (20px) for inline, w-6 h-6 (24px) for standalone
- Color: Inherit from parent text color

### 13. Animations

#### Subtle Transitions
```css
transition-colors duration-150 ease-in-out
transition-shadow duration-200 ease-in-out
transition-transform duration-200 ease-in-out
```

#### Pulse for Alerts
```tsx
<span className="animate-pulse" />
```

#### Hover Lift
```tsx
<div className="hover:scale-105 transition-transform" />
```

### 14. Accessibility

- Focus rings: Blue outline (ring-2 ring-blue-500 ring-offset-2)
- Minimum touch target: 44x44px
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Keyboard navigation: Full support

### 15. Responsive Breakpoints

```css
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
2xl: 1536px - Extra large
```

---

## Component Patterns

### Stat Card
```tsx
<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6 text-blue-700" />
    </div>
    <span className="text-sm text-green-600 font-medium">+12%</span>
  </div>
  <h3 className="text-2xl font-bold text-gray-900">1,234</h3>
  <p className="text-sm text-gray-600 mt-1">Total Cases</p>
</div>
```

### Alert Banner
```tsx
<div className="bg-red-50 rounded-lg p-4 flex items-start gap-3">
  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1" />
  <div className="flex-1">
    <p className="text-sm font-medium text-red-900">Urgent Alert</p>
    <p className="text-sm text-red-700 mt-1">3 new cholera cases in Rubavu</p>
  </div>
</div>
```

### Form Section
```tsx
<div className="space-y-6">
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
    <div className="space-y-4">
      <Input variant="underlined" label="National ID" />
      <Input variant="underlined" label="Full Name" />
    </div>
  </div>
</div>
```

---

## Do's and Don'ts

### ✅ Do
- Use whitespace generously
- Keep shadows subtle (shadow-sm, shadow-md max)
- Use color for meaning (red = urgent, green = success)
- Make primary actions obvious (solid buttons)
- Use consistent spacing (4px grid)
- Animate transitions subtly (150-200ms)

### ❌ Don't
- Add borders everywhere
- Use heavy shadows (shadow-2xl except modals)
- Mix button styles randomly
- Create visual clutter
- Use bright, saturated backgrounds
- Animate everything

---

## Rwanda-Specific Guidelines

### National Colors Usage
- **Blue (#1E40AF)**: Primary actions, links, government branding
- **Green (#059669)**: Success states, health indicators
- **Yellow (#F59E0B)**: Warnings, pending states

### Cultural Considerations
- Professional, clean aesthetic reflects government standards
- High contrast for outdoor tablet use
- Large touch targets for field workers
- Offline indicators prominent
- Multi-language support visible

### Government Branding
- Rwanda coat of arms: Top left in header
- "Republic of Rwanda" text in header
- Ministry of Health / RBC attribution in footer
- Official color scheme throughout

---

## Performance Guidelines

- Minimize CSS: Use Tailwind utilities
- Lazy load images
- Optimize fonts (Geist Sans/Mono)
- Use CSS transforms for animations (GPU accelerated)
- Avoid layout shifts (CLS)

---

## Dark Mode (Future)

When implementing dark mode:
- Background: #111827 (gray-900)
- Surface: #1F2937 (gray-800)
- Text: #F9FAFB (gray-50)
- Borders: #374151 (gray-700)
- Maintain same color accents

---

**Last Updated**: February 10, 2026
**Design System Version**: 1.0
**Status**: Active
