import { GalleryVerticalEnd } from "lucide-react"

import Fireflies from "@/components/fireflies"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="bg-black/20 dark:bg-black/50 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Fireflies />
      <div className="w-full max-w-7xl flex flex-col items-center gap-6">
        <img
          src="/logo.png"
          alt="Logo Tabanan"
          className="h-20 md:h-32 object-contain"
        />
        <div className="text-white font-medium text-lg md:text-2xl text-center">
          PEMERINTAHAN KABUPATEN TABANAN <br />BADAN KEUANGAN DAERAH
        </div>

        <div className="flex flex-row items-center justify-center gap-4 w-7xl md:hidden">
          <img
            src="/bup.png"
            alt="Bupati"
            className="h-48 object-contain"
          />

          <img
            src="/wabup.png"
            alt="Wakil Bupati"
            className="h-48 object-contain"
          />
        </div>

        {/* Responsive: stack horizontally on desktop, above on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
          <img
            src="/bup.png"
            alt="Bupati"
            className="h-48 md:h-60 lg:h-[500px] object-contain hidden md:block"
          />

          {/* Login form stays in center */}
          <div className="w-full max-w-sm">
            <LoginForm />
            <div className="mt-6 text-center text-sm text-white/80">
              Jl. Pahlawan No.19, Delod Peken, Kec. Tabanan, <br />Kabupaten Tabanan, Bali 82121
            </div>
            <div className="flex justify-between mt-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/bakeudatabanan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  <img src="/instagram-icon.png" alt="Instagram" className="inline h-4 w-4 mr-1" /> 
                  @bakeudatabanan
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span>Telepon:</span>
                <span>(0361) 811310</span>
              </div>
            </div>
          </div>

          <img
            src="/wabup.png"
            alt="Wakil Bupati"
            className="h-48 md:h-60 lg:h-[500px] object-contain hidden md:block"
          />
        </div>
      </div>
    </div>
  );
}


