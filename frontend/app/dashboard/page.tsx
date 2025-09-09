"use client"

import { useAuthMeWithRedirect } from "../hooks/use-auth-me"
import { useGetDashboardStats } from "../api/endpoints/dashboard/dashboard"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  useAuthMeWithRedirect()
  const { data: stats, isLoading } = useGetDashboardStats()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Profil Wajib Pajak" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="h-full px-4 py-6 lg:px-6">
                <SectionCards isLoading={isLoading} stats={stats} />
                {/* <ChartAreaInteractive /> */}
                {/* <DataTable /> */}
              </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
