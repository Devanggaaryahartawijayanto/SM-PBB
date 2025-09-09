// frontend/app/auth/oauth/google/callback/page.tsx
import { Suspense } from "react"
import GoogleCallbackHandler from "./google-callback-handler"

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<p className="text-white text-center">Preparing OAuth login...</p>}>
      <GoogleCallbackHandler />
    </Suspense>
  )
}
