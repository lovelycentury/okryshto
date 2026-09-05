import { Button, TextField, InlineAction } from "@okkly/react";

/**
 * Manual test bench — not a story, not published. Swap the contents below for
 * whatever you're checking; nothing here needs to stay tidy or committed.
 */
export function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        background: "var(--okkly-bg-canvas)",
        fontFamily: "var(--okkly-font-family-sans)",
      }}
    >
      <Button>Hello, playground</Button>
      <TextField placeholder="Type something..." />
      <InlineAction placeholder="Type something..." />
    </div>
  );
}
