// Rendered for requests that never reach a locale segment (unknown top-level paths).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <h1>404</h1>
        <p>This page does not exist.</p>
      </body>
    </html>
  );
}
