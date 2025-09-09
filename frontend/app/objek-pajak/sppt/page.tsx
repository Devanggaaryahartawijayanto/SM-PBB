"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOpGetAllSpop, useOpGetSpptYears, useOpGetSpptDetail, opGetSpptDetail } from "@/services/api/endpoints/op/op"
import type { SpopResponse } from "@/services/api/models/spopResponse"
import type { SpptYearResponse } from "@/services/api/models/spptYearResponse"
import type { SpptResponse } from "@/services/api/models/spptResponse"
import { 
  MapPin, 
  Building, 
  Calendar, 
  Download, 
  FileText, 
  CreditCard, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Printer,
  Eye
} from "lucide-react"
import { formatCurrency, formatDate, getPaymentStatus, getDueDateStatus } from "./utils/formatters"
import { PbbInformationPanel } from "./components/PbbInformationPanel"
import { cn } from "@/lib/utils"

// Interface for year summary data including SPPT details
interface YearSummaryData {
  THN_PAJAK_SPPT: string;
  count: number;
  NM_WP_SPPT?: string;
  TGL_JATUH_TEMPO_SPPT?: string;
  LUAS_BUMI_SPPT?: number;
  LUAS_BNG_SPPT?: number;
  NJOP_BUMI_SPPT?: number;
  NJOP_BNG_SPPT?: number;
  PBB_YG_HARUS_DIBAYAR_SPPT?: number;
  STATUS_PEMBAYARAN_SPPT?: boolean | null;
  loading?: boolean;
  error?: boolean;
}

export default function Page() {
  const [selectedObject, setSelectedObject] = useState<SpopResponse | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [yearSummaries, setYearSummaries] = useState<YearSummaryData[]>([])
  const [yearsLoading, setYearsLoading] = useState(false)

  // Step 1: Fetch SPOP objects
  const { data: spopData, isLoading: spopLoading, error: spopError } = useOpGetAllSpop({})
  const objects = spopData?.data || []

  // Step 2: Fetch available years for selected NOP (mutation)
  const nop = selectedObject ? [
    selectedObject.KD_PROPINSI,
    selectedObject.KD_DATI2,
    selectedObject.KD_KECAMATAN,
    selectedObject.KD_KELURAHAN,
    selectedObject.KD_BLOK,
    selectedObject.NO_URUT,
    selectedObject.KD_JNS_OP
  ].join("") : ""
  const { trigger: fetchYears } = useOpGetSpptYears()

  // When object is selected, fetch years and their details
  const handleSelectObject = async (spop: SpopResponse) => {
    setSelectedObject(spop)
    setSelectedYear(null)
    setYearSummaries([])
    setYearsLoading(true)
    const selectedNop = [
      spop.KD_PROPINSI,
      spop.KD_DATI2,
      spop.KD_KECAMATAN,
      spop.KD_KELURAHAN,
      spop.KD_BLOK,
      spop.NO_URUT,
      spop.KD_JNS_OP
    ].join("")
    
    try {
      // First, get available years
      const res = await fetchYears({ nop: selectedNop })
      const availableYears = res.available_years || []
      
      // Initialize year summaries with loading state
      const initialSummaries: YearSummaryData[] = availableYears.map(year => ({
        ...year,
        loading: true,
        error: false
      }))
      setYearSummaries(initialSummaries)
      
      // Fetch detailed data for each year
      const detailedSummaries = await Promise.allSettled(
        availableYears.map(async (year) => {
          try {
            const data = await opGetSpptDetail(year.THN_PAJAK_SPPT, selectedNop)
            
            return {
              ...year,
              NM_WP_SPPT: data.NM_WP_SPPT,
              TGL_JATUH_TEMPO_SPPT: data.TGL_JATUH_TEMPO_SPPT,
              LUAS_BUMI_SPPT: data.LUAS_BUMI_SPPT,
              LUAS_BNG_SPPT: data.LUAS_BNG_SPPT,
              NJOP_BUMI_SPPT: data.NJOP_BUMI_SPPT,
              NJOP_BNG_SPPT: data.NJOP_BNG_SPPT,
              PBB_YG_HARUS_DIBAYAR_SPPT: data.PBB_YG_HARUS_DIBAYAR_SPPT,
              STATUS_PEMBAYARAN_SPPT: data.STATUS_PEMBAYARAN_SPPT,
              loading: false,
              error: false
            }
          } catch (error) {
            return {
              ...year,
              loading: false,
              error: true
            }
          }
        })
      )
      
      // Update state with detailed data
      const finalSummaries = detailedSummaries.map((result, index) => 
        result.status === 'fulfilled' ? result.value : { ...availableYears[index], loading: false, error: true }
      )
      setYearSummaries(finalSummaries)
      
    } catch (e) {
      setYearSummaries([])
    }
    setYearsLoading(false)
  }

  // Step 3: Fetch SPPT detail for selected year and NOP
  const { data: spptDetail, isLoading: detailLoading } = useOpGetSpptDetail(selectedYear || "", nop, { swr: { enabled: !!selectedYear && !!selectedObject } })

  // Handle print SPPT
  const handlePrintSppt = () => {
    if (selectedYear && nop) {
      // Open print URL in new window
      window.open(`/sppt-print?year=${selectedYear}&nop=${nop}`, '_blank')
    }
  }

  // Render property info card
  const renderPropertyInfo = (spop: SpopResponse, nop: string) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Informasi Objek Pajak</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">NOP:</span>
              <span className="font-mono text-primary">{nop}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Nama WP:</span>
              <span>{spop.NM_WP || '-'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Alamat:</span>
              <span>{spop.JALAN_OP || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">RT/RW:</span>
              <span>{spop.RT_OP || '-'}/{spop.RW_OP || '-'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Render SPPT detail card
  const renderSpptDetail = (sppt: SpptResponse) => (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibol">SPPT Tahun {selectedYear}</h3>
          <p className="text-sm">Surat Pemberitahuan Pajak Terhutang</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintSppt}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Detail
          </Button>
        </div>
      </div>

      {/* <iframe 
        src={`/api/sppt?year=${selectedYear}&nop=${nop}&name=${spptDetail?.NM_WP_SPPT || ''}&jln_wp=${spptDetail?.JLN_WP_SPPT || ''}&rt_rw_wp=${spptDetail?.RT_WP_SPPT || '-'}/${spptDetail?.RW_WP_SPPT || '-'}&kelurahan_wp=${spptDetail?.KELURAHAN_WP_SPPT || ''}&kota_wp=${spptDetail?.KOTA_WP_SPPT || ''}&kd_pos_wp=${spptDetail?.KD_POS_WP_SPPT || ''}&jln_op=${selectedObject?.JALAN_OP || ''}&rt_rw_op=${selectedObject?.RT_OP || '-'}/${selectedObject?.RW_OP || '-'}&kelurahan_op=${selectedObject?.KD_KELURAHAN || ''}&luas_bumi=${spptDetail?.LUAS_BUMI_SPPT || '0'}&luas_bng=${spptDetail?.LUAS_BNG_SPPT || '0'}&njop_bumi=${spptDetail?.NJOP_BUMI_SPPT || '0'}&njop_bng=${spptDetail?.NJOP_BNG_SPPT || '0'}&njop_sppt=${spptDetail?.NJOP_SPPT || '0'}&njoptkp=${spptDetail?.NJOPTKP_SPPT || '0'}&njkp=${spptDetail?.NJKP_SPPT || '0'}&pbb_terhutang=${spptDetail?.PBB_TERHUTANG_SPPT || '0'}&pbb_harus_dibayar=${spptDetail?.PBB_YG_HARUS_DIBAYAR_SPPT || '0'}&tgl_terbit=${spptDetail?.TGL_TERBIT_SPPT || ''}&tgl_jatuh_tempo=${spptDetail?.TGL_JATUH_TEMPO_SPPT || ''}&status_pembayaran=${spptDetail?.STATUS_PEMBAYARAN_SPPT ? 'Lunas' : 'Belum Lunas'}`}
        className="w-full h-screen border" 
        title="SPPT PDF Viewer" 
      /> */}

      {/* Taxpayer Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Data Wajib Pajak</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Nama Wajib Pajak:</span>
                <p className="text-sm font-semibold">{sppt.NM_WP_SPPT || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Alamat:</span>
                <p className="text-sm">{sppt.JLN_WP_SPPT || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">RT/RW:</span>
                <p className="text-sm">{sppt.RT_WP_SPPT || '-'}/{sppt.RW_WP_SPPT || '-'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Kelurahan:</span>
                <p className="text-sm">{sppt.KELURAHAN_WP_SPPT || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Kota:</span>
                <p className="text-sm">{sppt.KOTA_WP_SPPT || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Kode Pos:</span>
                <p className="text-sm">{sppt.KD_POS_WP_SPPT || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Valuation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Penilaian Objek Pajak</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-primary">Luas Bumi:</span>
              <p className="text-lg font-semibold text-primary">
                {sppt.LUAS_BUMI_SPPT ? `${sppt.LUAS_BUMI_SPPT} m²` : '-'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-green-600">Luas Bangunan:</span>
              <p className="text-lg font-semibold text-green-900">
                {sppt.LUAS_BNG_SPPT ? `${sppt.LUAS_BNG_SPPT} m²` : '-'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-purple-600">NJOP Bumi:</span>
              <p className="text-lg font-semibold text-purple-900">
                {formatCurrency(sppt.NJOP_BUMI_SPPT)}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-orange-600">NJOP Bangunan:</span>
              <p className="text-lg font-semibold text-orange-900">
                {formatCurrency(sppt.NJOP_BNG_SPPT)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">Perhitungan Pajak</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">NJOP Total:</span>
                  <span className="text-sm font-semibold">{formatCurrency(sppt.NJOP_SPPT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">NJOPTKP:</span>
                  <span className="text-sm font-semibold">{formatCurrency(sppt.NJOPTKP_SPPT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">NJKP:</span>
                  <span className="text-sm font-semibold">{formatCurrency(sppt.NJKP_SPPT)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">PBB Terhutang:</span>
                  <span className="text-sm font-semibold">{formatCurrency(sppt.PBB_TERHUTANG_SPPT)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                  <span className="text-lg font-semibold text-red-700">PBB yang Harus Dibayar:</span>
                  <span className="text-xl font-bold text-red-900">
                    {formatCurrency(sppt.PBB_YG_HARUS_DIBAYAR_SPPT)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Informasi Pembayaran</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Tanggal Terbit:</span>
              <p className="text-sm font-semibold">{formatDate(sppt.TGL_TERBIT_SPPT)}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-yellow-600">Jatuh Tempo:</span>
              <p className="text-sm font-semibold text-yellow-800">{formatDate(sppt.TGL_JATUH_TEMPO_SPPT)}</p>
              {(() => {
                const dueDateStatus = getDueDateStatus(sppt.TGL_JATUH_TEMPO_SPPT)
                return (
                  <p className={`text-xs mt-1 ${dueDateStatus.color}`}>
                    {dueDateStatus.text}
                  </p>
                )
              })()}
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-600">Status Pembayaran:</span>
              {(() => {
                const paymentStatus = getPaymentStatus(sppt.STATUS_PEMBAYARAN_SPPT)
                return (
                  <Badge variant={paymentStatus.variant}>
                    {paymentStatus.text}
                  </Badge>
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Informasi Penting untuk Wajib Pajak</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>• Pembayaran PBB dapat dilakukan di Bank, ATM, atau melalui aplikasi perbankan</p>
          <p>• Simpan bukti pembayaran sebagai arsip</p>
          <p>• Apabila terdapat keberatan atas penetapan pajak, dapat mengajukan keberatan sesuai ketentuan yang berlaku</p>
          <p>• Untuk informasi lebih lanjut, hubungi Kantor Pelayanan Pajak setempat</p>
        </AlertDescription>
      </Alert>
    </div>
  )

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
        <SiteHeader title="SPPT - Surat Pemberitahuan Pajak Terhutang" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            
            {/* Introduction Alert */}
            <Alert className="bg-blue-50 dark:bg-blue-800/20 border-blue-200 border-blue-800">
              <FileText className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary dark:text-primary">Tentang SPPT</AlertTitle>
              <AlertDescription className="text-primary dark:text-primary">
                SPPT (Surat Pemberitahuan Pajak Terhutang) adalah dokumen yang berisi informasi mengenai 
                besarnya Pajak Bumi dan Bangunan (PBB) yang harus dibayar oleh Wajib Pajak untuk tahun pajak tertentu.
              </AlertDescription>
            </Alert>

            {/* Step 1: Object selection */}
            {!selectedObject && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-primary font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <CardTitle className="text-xl">Pilih Objek Pajak (NOP)</CardTitle>
                      <CardDescription>
                        Silakan pilih salah satu objek pajak yang terdaftar atas nama Anda
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {spopLoading ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <span className="text-sm text-gray-600">Memuat data objek pajak...</span>
                      </div>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : spopError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Gagal Memuat Data</AlertTitle>
                      <AlertDescription>
                        Terjadi kesalahan saat memuat data objek pajak. Silakan coba lagi.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {objects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {objects.map((spop: SpopResponse) => {
                            const nopObj = [
                              spop.KD_PROPINSI,
                              spop.KD_DATI2,
                              spop.KD_KECAMATAN,
                              spop.KD_KELURAHAN,
                              spop.KD_BLOK,
                              spop.NO_URUT,
                              spop.KD_JNS_OP
                            ].join("")
                            return (
                              <Card key={nopObj} onClick={() => handleSelectObject(spop)} className="hover:shadow-md transition-shadow cursor-pointer bg-primary/10 hover:bg-primary/20">
                                <CardContent className="p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-primary dark:text-primary" />
                                        <span className="font-mono text-sm font-medium text-primary dark:text-primary">
                                          {nopObj}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                          {spop.NM_WP || 'Nama tidak tersedia'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">
                                          {spop.JALAN_OP || 'Alamat tidak tersedia'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {spop.LUAS_BUMI || 'Name not available'} m²
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">
                                          {(() => {
                                            switch (spop.JNS_BUMI) {
                                              case "1":
                                                return "Tanah + Bangunan";
                                              case "2":
                                                return "Kavling Siap Bangun";
                                              case "3":
                                                return "Tanah Kosong";
                                              case "4":
                                                return "Fasilitas Umum";
                                              default:
                                                return spop.JNS_BUMI || "-";
                                            }
                                          })()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Tidak Ada Data</AlertTitle>
                          <AlertDescription>
                            Tidak ada objek pajak ditemukan. Pastikan akun Anda telah terverifikasi 
                            dan memiliki objek pajak yang terdaftar.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Year selection */}
            {selectedObject && !selectedYear && (
              <div className="space-y-4">
                {renderPropertyInfo(selectedObject, nop)}
                
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                        2
                      </div>
                      <div>
                        <CardTitle className="text-xl">Pilih Tahun Pajak</CardTitle>
                        <CardDescription>
                          Pilih tahun pajak SPPT yang ingin Anda lihat untuk objek pajak dengan NOP{' '}
                          <span className="font-mono font-medium text-primary">{nop}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {yearsLoading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4" />
                          <span className="text-sm text-gray-600">Memuat data tahun pajak...</span>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[100px]">Tahun</TableHead>
                                <TableHead>Nama Wajib Pajak</TableHead>
                                <TableHead>Jatuh Tempo</TableHead>
                                <TableHead className="text-right">Luas Bumi</TableHead>
                                <TableHead className="text-right">Luas Bangunan</TableHead>
                                <TableHead className="text-right">NJOP Bumi</TableHead>
                                <TableHead className="text-right">NJOP Bangunan</TableHead>
                                <TableHead className="text-right">PBB Terhutang</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {yearSummaries.length > 0 ? (
                          <div className="space-y-4">
                            <p className="text-sm">
                              Tersedia {yearSummaries.length} tahun pajak untuk objek ini. Klik baris untuk melihat detail:
                            </p>
                            
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="h-14">
                                    <TableHead className="w-[100px]">Tahun</TableHead>
                                    <TableHead>Nama Wajib Pajak <br />Jatuh Tempo</TableHead>
                                    <TableHead className="text-right">Luas Bumi <br />Luas Bangunan</TableHead>
                                    <TableHead className="text-right">NJOP Bumi <br />NJOP Bangunan</TableHead>
                                    <TableHead className="text-right w-[80px]">Status</TableHead>
                                    <TableHead className="text-right">PBB</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {yearSummaries
                                    .sort((a, b) => parseInt(b.THN_PAJAK_SPPT) - parseInt(a.THN_PAJAK_SPPT))
                                    .map((yearData) => (
                                      <TableRow 
                                        key={yearData.THN_PAJAK_SPPT}
                                        className="cursor-pointer hover:bg-blue-50 hover:dark:bg-blue-800/20  transition-colors"
                                        onClick={() => setSelectedYear(yearData.THN_PAJAK_SPPT)}
                                      >
                                        <TableCell className="font-medium">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            {yearData.THN_PAJAK_SPPT}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-32" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">Error loading</span>
                                          ) : (
                                            yearData.NM_WP_SPPT || '-'
                                          )}
                                          <br />
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-24" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">-</span>
                                          ) : (
                                            formatDate(yearData.TGL_JATUH_TEMPO_SPPT) || '-'
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-16 ml-auto" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">-</span>
                                          ) : (
                                            yearData.LUAS_BUMI_SPPT ? `${yearData.LUAS_BUMI_SPPT} m²` : '-'
                                          )}
                                          <br />
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-16 ml-auto" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">-</span>
                                          ) : (
                                            yearData.LUAS_BNG_SPPT ? `${yearData.LUAS_BNG_SPPT} m²` : '-'
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-20 ml-auto" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">-</span>
                                          ) : (
                                            <span className="text-sm">{formatCurrency(yearData.NJOP_BUMI_SPPT)}</span>
                                          )}
                                          <br />
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-20 ml-auto" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">-</span>
                                          ) : (
                                            <span className="text-sm">{formatCurrency(yearData.NJOP_BNG_SPPT)}</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-20 ml-auto" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">-</span>
                                          ) : (
                                            (() => {
                                              const payment = getPaymentStatus(yearData.STATUS_PEMBAYARAN_SPPT);
                                              return <Badge variant={payment.variant}>{payment.text}</Badge>;
                                            })()
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {yearData.loading ? (
                                            <Skeleton className="h-4 w-24 ml-auto" />
                                          ) : yearData.error ? (
                                            <span className="text-red-500 text-sm">-</span>
                                          ) : (
                                            <span className="font-semibold">
                                              {formatCurrency(yearData.PBB_YG_HARUS_DIBAYAR_SPPT)}
                                            </span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Summary totals: Lunas vs Tunggakan */}
                            {(() => {
                              const totalLunas = yearSummaries.reduce((sum, y) => {
                                if (y.loading || y.error) return sum;
                                return y.STATUS_PEMBAYARAN_SPPT
                                  ? sum + (y.PBB_YG_HARUS_DIBAYAR_SPPT || 0)
                                  : sum;
                              }, 0);
                              const totalTunggakan = yearSummaries.reduce((sum, y) => {
                                if (y.loading || y.error) return sum;
                                return !y.STATUS_PEMBAYARAN_SPPT
                                  ? sum + (y.PBB_YG_HARUS_DIBAYAR_SPPT || 0)
                                  : sum;
                              }, 0);
                              return (
                                <div className="flex justify-end space-x-8 p-4 bg-primary/20 border-primary/40 rounded-lg">
                                  <div className="text-right">
                                    <span className="text-sm font-medium">Total Lunas:</span>
                                    <div className="text-lg font-semibold text-green-600">{formatCurrency(totalLunas)}</div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-medium">Total Tunggakan:</span>
                                    <div className="text-lg font-semibold text-red-600">{formatCurrency(totalTunggakan)}</div>
                                  </div>
                                </div>
                              );
                            })()}
                        
                        </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Tidak Ada Data SPPT</AlertTitle>
                            <AlertDescription>
                              Tidak ada tahun pajak SPPT ditemukan untuk objek pajak ini. 
                              Data SPPT mungkin belum tersedia atau sedang dalam proses.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => { 
                              setSelectedObject(null); 
                              setSelectedYear(null); 
                              setYearSummaries([]); 
                            }}
                            className="flex items-center gap-2"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Objek
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: SPPT detail */}
            {selectedObject && selectedYear && (
              <div className="space-y-4">
                {renderPropertyInfo(selectedObject, nop)}
                
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                        3
                      </div>
                      <div>
                        <CardTitle className="text-xl">Detail SPPT</CardTitle>
                        <CardDescription>
                          Detail lengkap SPPT untuk NOP{' '}
                          <span className="font-mono font-medium text-primary">{nop}</span>{' '}
                          tahun pajak {selectedYear}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {detailLoading ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4" />
                          <span className="text-sm text-gray-600">Memuat detail SPPT...</span>
                        </div>
                        {[1, 2, 3].map((i) => (
                          <Card key={i}>
                            <CardHeader>
                              <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {[1, 2, 3].map((j) => (
                                  <div key={j} className="flex justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : spptDetail ? (
                      renderSpptDetail(spptDetail)
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Data SPPT Tidak Ditemukan</AlertTitle>
                        <AlertDescription>
                          Detail SPPT untuk tahun {selectedYear} tidak dapat dimuat. 
                          Data mungkin belum tersedia atau terjadi kesalahan sistem.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="pt-6 border-t flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedYear(null)}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Tahun Pajak
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          setSelectedObject(null); 
                          setSelectedYear(null); 
                          setYearSummaries([]); 
                        }}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Objek
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Information Panel */}
            <PbbInformationPanel />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
