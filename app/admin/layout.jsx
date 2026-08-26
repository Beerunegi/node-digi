export const metadata = {
  title: 'Admin CMS | Digi Web Tech',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/css/next-blog.css?v=1.0.7" precedence="default" />
      {children}
    </>
  );
}
