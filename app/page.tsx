'use client'

import dynamic from "next/dynamic";

// Dynamically import the DashboardLayout with no SSR to avoid DOM-related errors from react-pdf
const DashboardLayout = dynamic(
  () => import("@/components/layout/dashboard-layout").then(mod => ({ default: mod.DashboardLayout })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading AI PDF Form Interaction...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return <DashboardLayout />;
}