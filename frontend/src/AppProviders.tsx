// Providers are mounted in App.tsx; this passthrough is kept only so older imports still resolve.
import type { ReactNode } from 'react';

export default function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
