/**
 * Renders a legacy EJS page body.
 *
 * `suppressHydrationWarning` is required here, not cosmetic. The lead-form
 * anti-spam token embedded in these views is an HMAC over a `Date.now()`
 * timestamp (see `createLeadFormMeta` in lib/form-security.js), and Next's dev
 * server renders the tree twice -- once for the HTML, once for the RSC
 * payload. The two passes stamp timestamps milliseconds apart, so the `__html`
 * strings differ and React logs a hydration mismatch on every page carrying a
 * form.
 *
 * React does not re-run `dangerouslySetInnerHTML` during hydration, so the
 * server's markup (and therefore the server's valid token) is what stays in
 * the DOM either way. Production renders once and the two payloads are already
 * identical; this only silences the dev-only diff.
 */
export default function LegacyHtml({ html }) {
  return (
    <div
      style={{ display: 'contents' }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
