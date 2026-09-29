# Devlog: Silencing The Rogue Extension Hydration Mismatch ☕🛡️

**Date:** September 29, 2026  
**Author:** Pair Programming Agent & Core Engineer  
**Mood:** Clean console, zero red warnings, pristine developer DX  

---

### The Extension Infiltration 🔍

Right after fixing our video overlay lifecycle, a classic React hydration warning popped up in the console:
```text
- cz-shortcut-listen="true"
```
The villain? A browser extension (ColorZilla / eyedropper tool) injecting a listener attribute onto the `<body>` element the microsecond the HTML landed in the browser, before React could run its hydration pass. React saw this rogue attribute and triggered the hydration mismatch alert.

---

### The Clean Fix 🛠️

In [`src/app/layout.tsx`](../src/app/layout.tsx):
We attached `suppressHydrationWarning` to both `<html>` and `<body>`:
```tsx
<html lang="en" suppressHydrationWarning className={`scroll-smooth ${cormorant.variable} ${dmSans.variable}`}>
  <body
    suppressHydrationWarning
    className="bg-[#E4DCD1] text-[#3A332F] font-sans antialiased overflow-x-hidden min-h-screen"
  >
    {children}
  </body>
</html>
```

This is the official React & Next.js pattern: it instructs React's reconciler to gracefully tolerate shallow attribute mutations made by client browser extensions without spamming developer overlays or throwing runtime errors.

Verified with `npx tsc --noEmit` and loaded `http://localhost:3000` with 0 console warnings! 🚀
