"use client"

import { useSearchParams } from "next/navigation"
import { useOpGetSpptDetail } from "@/services/api/endpoints/op/op"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer, Download } from "lucide-react"
import { formatCurrency, formatDate } from "../objek-pajak/sppt/utils/formatters"

export default function SpptPrintClient() {
  const searchParams = useSearchParams()
  const year = searchParams.get('year')
  const nop = searchParams.get('nop')

  const { data: spptDetail, isLoading } = useOpGetSpptDetail(year || "", nop || "", { 
    swr: { enabled: !!year && !!nop } 
  })

  const handlePrint = () => window.print()

  const handleDownloadPdf = () => {
    alert("Fitur download PDF akan segera tersedia")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memuat data SPPT...</p>
        </div>
      </div>
    )
  }

  if (!spptDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Data SPPT tidak ditemukan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden fixed top-4 right-4 z-10 flex gap-2">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownloadPdf} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-2xl font-bold mb-2">SURAT PEMBERITAHUAN PAJAK TERHUTANG</h1>
          <h2 className="text-xl font-semibold mb-2">PAJAK BUMI DAN BANGUNAN</h2>
          <h3 className="text-lg">TAHUN PAJAK {year}</h3>
        </div>

        {/* Property Information */}
        <Card className="mb-6 print:mb-4">
          <CardHeader className="pb-4">
            <CardTitle>OBJEK PAJAK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>NOP:</strong> {nop}
              </div>
              <div>
                <strong>Tahun Pajak:</strong> {year}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxpayer Information */}
        <Card className="mb-6 print:mb-4">
          <CardHeader className="pb-4">
            <CardTitle>WAJIB PAJAK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <strong>Nama:</strong> {spptDetail.NM_WP_SPPT || '-'}
              </div>
              <div>
                <strong>Alamat:</strong> {spptDetail.JLN_WP_SPPT || '-'}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <strong>RT/RW:</strong> {spptDetail.RT_WP_SPPT || '-'}/{spptDetail.RW_WP_SPPT || '-'}
                </div>
                <div>
                  <strong>Kelurahan:</strong> {spptDetail.KELURAHAN_WP_SPPT || '-'}
                </div>
                <div>
                  <strong>Kota:</strong> {spptDetail.KOTA_WP_SPPT || '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Valuation */}
        <Card className="mb-6 print:mb-4">
          <CardHeader className="pb-4">
            <CardTitle>PENILAIAN OBJEK PAJAK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Luas Bumi:</span>
                  <span>{spptDetail.LUAS_BUMI_SPPT ? `${spptDetail.LUAS_BUMI_SPPT} m²` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luas Bangunan:</span>
                  <span>{spptDetail.LUAS_BNG_SPPT ? `${spptDetail.LUAS_BNG_SPPT} m²` : '-'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>NJOP Bumi:</span>
                  <span>{formatCurrency(spptDetail.NJOP_BUMI_SPPT)}</span>
                </div>
                <div className="flex justify-between">
                  <span>NJOP Bangunan:</span>
                  <span>{formatCurrency(spptDetail.NJOP_BNG_SPPT)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Calculation */}
        <Card className="mb-6 print:mb-4">
          <CardHeader className="pb-4">
            <CardTitle>PERHITUNGAN PAJAK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>NJOP Total:</span>
                <span className="font-semibold">{formatCurrency(spptDetail.NJOP_SPPT)}</span>
              </div>
              <div className="flex justify-between">
                <span>NJOPTKP:</span>
                <span className="font-semibold">{formatCurrency(spptDetail.NJOPTKP_SPPT)}</span>
              </div>
              <div className="flex justify-between">
                <span>NJKP:</span>
                <span className="font-semibold">{formatCurrency(spptDetail.NJKP_SPPT)}</span>
              </div>
              <div className="flex justify-between">
                <span>PBB Terhutang:</span>
                <span className="font-semibold">{formatCurrency(spptDetail.PBB_TERHUTANG_SPPT)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold bg-gray-100 p-3 rounded">
                <span>TOTAL HARUS DIBAYAR:</span>
                <span>{formatCurrency(spptDetail.PBB_YG_HARUS_DIBAYAR_SPPT)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="mb-6 print:mb-4">
          <CardHeader className="pb-4">
            <CardTitle>INFORMASI PEMBAYARAN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <strong>Tanggal Terbit:</strong> {formatDate(spptDetail.TGL_TERBIT_SPPT)}
              </div>
              <div>
                <strong>Jatuh Tempo:</strong> {formatDate(spptDetail.TGL_JATUH_TEMPO_SPPT)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-xs text-gray-600 mt-8 print:mt-6 space-y-2">
          <p>• Pembayaran dapat dilakukan di Bank, ATM, atau melalui aplikasi perbankan</p>
          <p>• Simpan bukti pembayaran sebagai arsip</p>
          <p>• Untuk informasi lebih lanjut hubungi Kantor Pelayanan Pajak setempat</p>
        </div>

        {/* Print timestamp */}
        <div className="text-xs text-gray-500 mt-4 print:mt-2 text-right">
          Dicetak pada: {new Date().toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  )
}
