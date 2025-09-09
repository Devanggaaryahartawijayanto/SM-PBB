"use client"

import { saveTokenToCookie } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuthLogin } from "@/services/api/endpoints/auth/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
})

type LoginSchema = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const { trigger: login, isMutating } = useAuthLogin()
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginSchema) => {
    try {
      const result = await login({
        grant_type: "password",
        username: data.email,
        password: data.password,
        scope: "",
        client_id: undefined,
        client_secret: undefined,
      })

      localStorage.setItem("token", result.access_token)
      if (result.refresh_token) {
        localStorage.setItem("refresh_token", result.refresh_token)
      }

      await saveTokenToCookie(result.access_token)

      router.push("/profile")
    } catch (err) {
      alert("Login gagal, bang. Cek email/password lu.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>

        <div className="text-white font-medium text-lg text-center">
          Cek semua informasi PBB Anda dimanapun, kapanpun dengan I-PBB
        </div>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-lg text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">I-PBB</CardTitle>
          <CardDescription className="text-white text">
            PAJAK BUMI DAN BANGUNAN<br /> PERDESAAN DAN PERKOTAAN
          </CardDescription>
          {/* <CardTitle className="text-xl">Solo Kerja</CardTitle> */}
          {/* <CardDescription className="text-white">Dinas Tenaga Kerja</CardDescription> */}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/oauth/google/redirect`
                  }}
                  className="w-full border-1 border-white/30 dark:border-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 mr-2"
                  >
                    <title>Google</title>
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Masuk dengan Google
                </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full border-1 border-white/30 dark:border-0"
                      >
                        F.A.Q.
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                      <DialogTitle>FAQ (Frequently Asked Questions) Sistem I-PBB Kabupaten Tabanan</DialogTitle>
                      </DialogHeader>
                      <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-left">Apa itu Sistem I-PBB?</AccordionTrigger>
                        <AccordionContent>
                        Sistem I-PBB adalah platform digital milik <i>Badan Keuangan Daerah Kabupaten Tabanan</i> untuk menampilkan informasi <i>SPPT (Surat Pemberitahuan Pajak Terutang)</i> bagi wajib pajak, termasuk:<br />
                        <ul className="list-disc ml-4 mt-2">
                          <li>Daftar SPPT yang dimiliki</li>
                          <li>Status pembayaran (sudah/lunas atau belum dibayar)</li>
                          <li>Rincian objek pajak dan jumlah tagihan</li>
                        </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="text-left">Bagaimana cara masuk ke sistem I-PBB?</AccordionTrigger>
                        <AccordionContent>
                        Pengguna dapat masuk ke sistem I-PBB dengan langkah berikut:<br />
                        <ol className="list-decimal ml-4 mt-2">
                          <li>Klik tombol <b>“Masuk dengan Google”</b> di halaman utama.</li>
                          <li>Pilih akun <b>Gmail</b> yang ingin digunakan.</li>
                          <li>Setelah berhasil login, sistem akan menampilkan daftar SPPT yang terdaftar atas nama Anda.</li>
                        </ol>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className="text-left">Apakah saya harus memiliki akun Gmail untuk menggunakan sistem ini?</AccordionTrigger>
                        <AccordionContent>
                        Ya. Sistem hanya mengizinkan pengguna dengan akun <b>Gmail (Google Mail)</b> untuk masuk.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger className="text-left">Bagaimana jika saya belum memiliki akun Gmail?</AccordionTrigger>
                        <AccordionContent>
                        Jika Anda belum memiliki akun Gmail, Anda harus membuatnya terlebih dahulu:<br />
                        <ul className="list-disc ml-4 mt-2">
                          <li>Buka <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="underline">https://accounts.google.com/signup</a></li>
                          <li>Ikuti panduan pendaftaran hingga selesai</li>
                          <li>Setelah memiliki akun, kembali ke halaman I-PBB dan klik “Masuk dengan Google”</li>
                        </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger className="text-left">Apa saja informasi yang bisa saya lihat setelah login?</AccordionTrigger>
                        <AccordionContent>
                        Setelah login, Anda bisa melihat:<br />
                        <ul className="list-disc ml-4 mt-2">
                          <li><i>Nomor Objek Pajak (NOP)</i></li>
                          <li><i>Alamat objek pajak</i></li>
                          <li><i>Nama Wajib Pajak</i></li>
                          <li><i>Tahun SPPT</i></li>
                          <li><i>Jumlah tagihan</i></li>
                          <li><i>Status pembayaran (LUNAS/BELUM)</i></li>
                        </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-6">
                        <AccordionTrigger className="text-left">Apakah saya bisa mencetak SPPT dari sistem ini?</AccordionTrigger>
                        <AccordionContent>
                        Fitur pencetakan SPPT belum tersedia di semua wilayah. Namun jika tersedia, akan muncul tombol cetak pada tampilan SPPT Anda. Jika tidak tersedia, Anda bisa mencatat detail dan membayar melalui kanal resmi yang ditentukan.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-7">
                        <AccordionTrigger className="text-left">Bagaimana jika data saya tidak muncul atau salah?</AccordionTrigger>
                        <AccordionContent>
                        Silakan hubungi <i>Badan Keuangan Daerah Kabupaten Tabanan</i> atau datang langsung ke kantor dengan membawa:<br />
                        <ul className="list-disc ml-4 mt-2">
                          <li>KTP</li>
                          <li>Bukti kepemilikan tanah/bangunan</li>
                          <li>Bukti pembayaran terakhir (jika ada)</li>
                        </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-8">
                        <AccordionTrigger className="text-left">Apakah sistem ini bisa digunakan di HP atau hanya komputer?</AccordionTrigger>
                        <AccordionContent>
                        Sistem I-PBB bisa diakses melalui:<br />
                        <ul className="list-disc ml-4 mt-2">
                          <li><i>HP/smartphone</i> dengan browser seperti Chrome</li>
                          <li><i>Laptop/PC</i></li>
                        </ul>
                        Asalkan terhubung dengan internet dan Anda login menggunakan Gmail.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-9">
                        <AccordionTrigger className="text-left">Apakah sistem ini aman?</AccordionTrigger>
                        <AccordionContent>
                        Ya, sistem menggunakan <b>login Google resmi</b> untuk otentikasi dan tidak menyimpan sandi Anda. Data yang ditampilkan hanya sesuai dengan kepemilikan akun yang login.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-10">
                        <AccordionTrigger className="text-left">Saya sudah bayar, tapi status masih BELUM. Apa yang harus saya lakukan?</AccordionTrigger>
                        <AccordionContent>
                        Data pembayaran biasanya diperbarui secara berkala. Jika status tidak berubah setelah 3–5 hari kerja:<br />
                        <ul className="list-disc ml-4 mt-2">
                          <li>Pastikan pembayaran dilakukan di kanal resmi (bank, kantor pos, dll)</li>
                          <li>Hubungi petugas PBB dengan bukti pembayaran</li>
                        </ul>
                        </AccordionContent>
                      </AccordionItem>
                      {/* <AccordionItem value="item-11">
                        <AccordionTrigger className="text-left">Kontak bantuan</AccordionTrigger>
                        <AccordionContent>
                        Jika ada pertanyaan lebih lanjut, silakan hubungi:<br />
                        📍 Kantor Badan Keuangan Daerah Kabupaten Tabanan<br />
                        📞 (Nomor kontak dapat ditambahkan di sini)<br />
                        📧 Email: (Email resmi dapat ditambahkan)
                        </AccordionContent>
                      </AccordionItem> */}
                      </Accordion>
                    </DialogContent>
                  </Dialog>
              </div>

              <div className="hidden">
                <div className="relative flex items-center text-sm text-muted-foreground">
                  <div className="flex-grow border-t border-white/50" />
                  <span className="mx-4 px-2 rounded text-white">Atau lanjutkan dengan</span>
                  <div className="flex-grow border-t border-white/50" />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="m@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <a
                          href="/forgot-password"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Lupa password?
                        </a>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full border-1 border-white/30 dark:border-0"
                  disabled={isMutating}
                >
                  {isMutating ? "Masuk..." : "Login"}
                </Button>

                <div className="text-center text-sm">
                  Belum punya akun?{" "}
                  <a href="/register" className="underline underline-offset-4">
                    Daftar sekarang
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* <div className="text-white *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Dengan melanjutkan, Anda menyetujui <a href="/terms">Syarat Layanan</a> dan{" "}
        <a href="/privacy">Kebijakan Privasi</a> kami.
      </div> */}
    </div>
  )
}
