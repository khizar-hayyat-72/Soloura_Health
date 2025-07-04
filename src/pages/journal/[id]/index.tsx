// src/app/(app)/journal/[id]/page.tsx

// This is a Server Component by default
import JournalEntryClientPage from './journal-entry-client';

// Required for static export of dynamic routes.
// We don't pre-render any specific entry pages at build time for this user-specific content.
// Client-side fetching will handle it.
export async function generateStaticParams() {
  return [];
}

export default function JournalEntryDetailPage({ params }: { params: { id: string } }) {
  // The `params` prop is automatically passed by Next.js to Server Components
  // for dynamic route segments. We then pass it to the client component.
  return <JournalEntryClientPage params={params} />;
}
