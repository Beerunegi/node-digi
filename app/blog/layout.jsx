/**
 * Blog- and CMS-scoped stylesheet, loaded only where its rules are used.
 * React hoists this <link> into <head>; `precedence` keeps ordering stable
 * relative to the global stylesheet.
 */
export default function BlogLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/css/next-blog.css?v=1.0.5" precedence="default" />
      {children}
    </>
  );
}
