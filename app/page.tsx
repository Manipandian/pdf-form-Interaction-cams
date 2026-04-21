'use client'

import dynamic from "next/dynamic";

// Dynamically import the DashboardLayout with no SSR to avoid DOM-related errors from react-pdf
const DashboardLayout = dynamic(
  () => import("@/components/layout/dashboard-layout").then(mod => ({ default: mod.DashboardLayout })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4 p-8 rounded-xl bg-card/80 backdrop-blur shadow-lg">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Loading AI PDF Form Interaction...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return <DashboardLayout />;
}