// Required for static export - admin pages are client-side rendered
// Return placeholder ID - actual content is loaded client-side
export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function CarIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
