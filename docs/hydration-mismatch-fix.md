# Hydration Mismatch Resolution (Browser Extension Attributes)

## Problem
A Next.js hydration error was thrown in the browser console:
```text
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
...
<body
  className="bg-[#E4DCD1] text-[#3A332F] font-sans antialiased overflow-x-hidden min-h-screen"
- cz-shortcut-listen="true"
>
```

## Root Cause
Browser extensions (notably **ColorZilla**, eye-dropper extensions, and shortcut listeners) inject DOM attributes like `cz-shortcut-listen="true"` directly into the `<body>` element immediately as the initial HTML document loads, before React hydrates the client component tree. React detects this unexpected attribute on the server-rendered `<body>` and flags a hydration mismatch.

## Solution
Added `suppressHydrationWarning` to both `<html>` and `<body>` tags in [`src/app/layout.tsx`](../src/app/layout.tsx).

As per React and Next.js documentation, `suppressHydrationWarning` tells React to ignore 1-level deep attribute differences on the root elements typically modified by user browser extensions or system themes, eliminating console warnings without impacting SSR performance.
