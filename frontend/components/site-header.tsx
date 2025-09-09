"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ModeToggle } from "./mode-toggle"

type SiteHeaderProps = {
  title?: string
}

export function SiteHeader({ title = "Document" }: SiteHeaderProps) {
  const router = useRouter()

  const logout = () => {
    // Nuke localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")

    // Nuke cookie (if using cookie-based token)
    document.cookie = "token=; Max-Age=0; path=/"

    // Optionally clear any app cache or state here...

    // Redirect to login
    router.push("/login")
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
