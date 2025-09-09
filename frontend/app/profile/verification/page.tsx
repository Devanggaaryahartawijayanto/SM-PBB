"use client"

import { useState, useEffect } from "react"
import Fireflies from "@/components/fireflies"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { ModeToggle } from "@/components/mode-toggle"
import { useOpVerifikasi } from "@/services/api/endpoints/op/op"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircleIcon, AlertTriangle } from "lucide-react"

const formSchema = z.object({
  nik: z.string(),
  nop: z.string().length(18, "NOP harus 18 digit"),
  nm_wp: z.string(),
  tahun: z.coerce.number().min(1990, "Tahun harus lebih dari 1990").max(2100, "Tahun tidak valid"),
  telp_wp: z.coerce.number().min(0, "Jumlah pajak tidak boleh negatif"),
})

type FormData = z.infer<typeof formSchema>

export default function VerificationPage() {
  const router = useRouter()
  const { trigger, isMutating } = useOpVerifikasi()
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: "",
      nop: "",
      nm_wp: "",
      tahun: new Date().getFullYear(),
      telp_wp: 0,
    },
  })

  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (success && countdown === 0) {
      router.push("/objek-pajak/sppt")
    }
  }, [success, countdown, router])

  type VerificationResult = {
    exists: boolean
    [key: string]: unknown
  }

  /*
  {
    "SUBJEK_PAJAK_ID": "1271025502730004",
    "NOP": "510203000102400180",
    "NM_WP": "NI WAYAN MURNIASIH",
    "THN_PAJAK_SPPT": "2025",
    "PBB_YG_HARUS_DIBAYAR_SPPT": 432044
  }
  */
  const onSubmit = async (data: FormData) => {
    const nop = data.nop
    const payload = {
      SUBJEK_PAJAK_ID: data.nik,
      NM_WP: data.nm_wp,
      KD_PROPINSI: nop.slice(0, 2),
      KD_DATI2: nop.slice(2, 4),
      KD_KECAMATAN: nop.slice(4, 7),
      KD_KELURAHAN: nop.slice(7, 10),
      KD_BLOK: nop.slice(10, 13),
      NO_URUT: nop.slice(13, 17),
      KD_JNS_OP: nop.slice(17, 18),
      TELP_WP: data.telp_wp.toString(),
    }

    try {
      const result = (await trigger(payload)) as VerificationResult
      console.log("✅ Verification result:", result)

      if (result?.exists === true) {
        setSuccess(true)
        setErrorMessage(null)
      } else {
        throw new Error("Data tidak ditemukan")
      }
    } catch (error) {
      console.error("❌ Verification failed:", error)
      setSuccess(false)
      setErrorMessage("🚨 Data yang Anda masukkan tidak dapat diverifikasi. Jika NIK tidak berhasil, silakan coba gunakan Nomor Paspor, SIM, atau NOP (Nomor Objek Pajak).")
    }
  }

  const logout = async () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    document.cookie = "token=; Max-Age=0; path=/"
    router.push("/login")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black/20 dark:bg-black/50 p-6">
      <Fireflies />

      <Card className="w-full max-w-xl border border-zinc-700 backdrop-blur-md shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Verifikasi Akun</CardTitle>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="outline" onClick={logout}>
                Log out
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {success && (
            <Alert className="bg-green-100 dark:bg-green-900/20 border-l-4 border-green-600">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-700 font-bold">Verifikasi Berhasil</AlertTitle>
              <AlertDescription className="text-green-500">
                Verifikasi berhasil. Halaman SPPT akan terbuka dalam {countdown} detik...
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive" className="border-l-4 border-red-600">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-700 font-bold">GAGAL!</AlertTitle>
              <AlertDescription className="text-red-500">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm">Untuk dapat melihat informasi SPPT diperlukan verifikasi data. Masukkan data salah satu SPPT objek pajak Anda:</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Subjek Pajak/NIK/NOP</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NOP</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nm_wp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama (sesuai SPPT)</FormLabel>
                    <FormControl>
                      <Input placeholder="Mimi Peri" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telp_wp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Telepon / WA Pemilik</FormLabel>
                    <FormControl>
                      <Input placeholder="081234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isMutating || success}>
                {isMutating ? "Mengecek..." : "Klaim Akses"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
