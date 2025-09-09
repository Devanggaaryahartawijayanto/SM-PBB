"use client"

import { useOpGetAllSpop } from "@/services/api/endpoints/op/op"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { SpopResponse } from "@/services/api/models"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { useRouter } from "next/navigation"

export default function OpTablePage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [sortBy, setSortBy] = useState<"KD_PROPINSI" | "JALAN_OP" | "LUAS_BUMI">("KD_PROPINSI")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { data, error, isLoading } = useOpGetAllSpop({
    search: debouncedSearch,
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  const totalPages = data?.meta.total ? Math.ceil(data.meta.total / perPage) : 1

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const getNop = (item: SpopResponse) =>
    `${item.KD_PROPINSI}.${item.KD_DATI2}.${item.KD_KECAMATAN}.${item.KD_KELURAHAN}.${item.KD_BLOK}-${item.NO_URUT}.${item.KD_JNS_OP}`

  const wajibPajak = {
    nama: "John Doe",
    email: "john@example.com",
    telp: "081234567890",
    nop: "51.02.030.001.024-0062.0",
  }

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
        <SiteHeader title="Objek Pajak" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:p-6">
              <Card className="w-full shadow-none rounded-lg">
                <CardContent>
                  <div className="grid grid-cols-[160px_1fr] gap-y-1 gap-x-4 text-sm">
                    <div>NIK / Subjek Pajak ID</div>
                    <div>: {wajibPajak.nop}</div>

                    <div>Nama</div>
                    <div>: {wajibPajak.nama}</div>

                    <div>Email</div>
                    <div>: {wajibPajak.email}</div>

                    <div>Telepon / WA</div>
                    <div>: {wajibPajak.telp}</div>
                  </div>
                </CardContent>
              </Card>

              <Input
                placeholder="Cari berdasarkan Jalan"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm"
              />

              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        onClick={() => handleSort("KD_PROPINSI")}
                        className="cursor-pointer"
                      >
                        NOP {sortBy === "KD_PROPINSI" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("JALAN_OP")} className="cursor-pointer">
                        Jalan OP {sortBy === "JALAN_OP" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("LUAS_BUMI")} className="cursor-pointer">
                        Luas Bumi {sortBy === "LUAS_BUMI" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={3}>Loading...</TableCell>
                      </TableRow>
                    )}
                    {error && (
                      <TableRow>
                        <TableCell colSpan={3}>Error loading data</TableCell>
                      </TableRow>
                    )}
                    {!isLoading &&
                      !error &&
                      data?.data?.map((item: SpopResponse, i: number) => (
                        <TableRow
                          key={getNop(item)}
                          className="cursor-pointer"
                          onClick={() => router.push("/objek-pajak/sppt")}
                        >
                          <TableCell>{getNop(item)}</TableCell>
                          <TableCell>{item.JALAN_OP}</TableCell>
                          <TableCell>{item.LUAS_BUMI}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-disabled={page <= 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={i + 1 === page}
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(i + 1)
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {totalPages > 5 && page < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
