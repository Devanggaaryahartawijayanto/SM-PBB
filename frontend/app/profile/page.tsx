"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { useGetMyProfile } from "@/services/api/profile"
import { Loader2, User, Mail, Phone, MapPin, Building2, CreditCard, Briefcase } from "lucide-react"

export default function ProfilePage() {
  const { data: profile, error, isLoading } = useGetMyProfile()

  const renderProfileField = (label: string, value: string | null | undefined, icon: React.ReactNode) => {
    if (!value) return null
    
    return (
      <div className="flex items-start gap-3 p-4 bg-primary/10 border-primary/40 border-1 rounded-lg">
        <div className="text-gray-500 dark:text-gray-400 mt-1">{icon}</div>
        <div className="flex-1">
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">{value}</dd>
        </div>
      </div>
    )
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
        <SiteHeader title="Profil Wajib Pajak" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              {isLoading && (
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 dark:text-gray-300">Memuat data profil...</span>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Gagal memuat data profil. Silakan coba lagi nanti.
                  </AlertDescription>
                </Alert>
              )}

              {profile && (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informasi Wajib Pajak
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderProfileField("ID Subjek Pajak", profile.SUBJEK_PAJAK_ID, <CreditCard className="h-4 w-4" />)}
                        {renderProfileField("Nama Wajib Pajak", profile.NM_WP, <User className="h-4 w-4" />)}
                        {renderProfileField("NPWP", profile.NPWP, <CreditCard className="h-4 w-4" />)}
                        {renderProfileField("Email", profile.EMAIL_WP, <Mail className="h-4 w-4" />)}
                        {renderProfileField("Telepon", profile.TELP_WP, <Phone className="h-4 w-4" />)}
                        {renderProfileField("Status Pekerjaan", profile.STATUS_PEKERJAAN_WP, <Briefcase className="h-4 w-4" />)}
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Alamat Wajib Pajak
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderProfileField("Jalan", profile.JALAN_WP, <MapPin className="h-4 w-4" />)}
                        {renderProfileField("Blok/Kavling/No", profile.BLOK_KAV_NO_WP, <Building2 className="h-4 w-4" />)}
                        {renderProfileField("RT", profile.RT_WP, <Building2 className="h-4 w-4" />)}
                        {renderProfileField("RW", profile.RW_WP, <Building2 className="h-4 w-4" />)}
                        {renderProfileField("Kelurahan", profile.KELURAHAN_WP, <MapPin className="h-4 w-4" />)}
                        {renderProfileField("Kota", profile.KOTA_WP, <MapPin className="h-4 w-4" />)}
                        {renderProfileField("Kode Pos", profile.KD_POS_WP, <MapPin className="h-4 w-4" />)}
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
