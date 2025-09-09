import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon, AlertCircle, CheckCircle, CreditCard, Calendar, Phone } from "lucide-react"

export function PbbInformationPanel() {
  return (
    <div className="space-y-4">
      {/* What is PBB */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Apa itu PBB?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Pajak Bumi dan Bangunan (PBB)</strong> adalah pajak yang dikenakan atas kepemilikan, 
            penguasaan, dan/atau pemanfaatan tanah dan/atau bangunan.
          </p>
          <p>
            PBB merupakan pajak tahunan yang harus dibayar oleh setiap pemilik objek pajak 
            berupa tanah dan/atau bangunan sesuai dengan ketentuan peraturan perundang-undangan.
          </p>
        </CardContent>
      </Card> */}

      {/* Payment Methods */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Cara Pembayaran PBB</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Bank & ATM:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Bank BRI, BNI, Mandiri</li>
                <li>• ATM dengan logo Link</li>
                <li>• Internet Banking</li>
                <li>• Mobile Banking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Online & Digital:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• GoPay, OVO, DANA</li>
                <li>• Tokopedia, Bukalapak</li>
                <li>• Indomaret, Alfamart</li>
                <li>• Kantor Pos Indonesia</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Tanggal Penting</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span><strong>Jatuh Tempo:</strong> 31 Agustus setiap tahun</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span><strong>Denda:</strong> 2% per bulan keterlambatan</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-blue-600" />
                <span><strong>Terbit SPPT:</strong> Mulai Januari</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-600" />
                <span><strong>Konsultasi:</strong> Kantor Pajak setempat</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Reminders */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tips untuk Wajib Pajak</AlertTitle>
        <AlertDescription className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <ul className="space-y-1">
              <li>✓ Bayar sebelum jatuh tempo untuk menghindari denda</li>
              <li>✓ Simpan bukti pembayaran dengan baik</li>
              <li>✓ Periksa kesesuaian data objek pajak</li>
            </ul>
            <ul className="space-y-1">
              <li>✓ Manfaatkan pembayaran online untuk kemudahan</li>
              <li>✓ Hubungi petugas jika ada ketidaksesuaian</li>
              <li>✓ Daftarkan perubahan objek pajak jika ada</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
