"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function GoogleCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const access_token = searchParams.get("access_token")
    const refresh_token = searchParams.get("refresh_token")

    console.log("Google OAuth Callback Params:", { access_token, refresh_token })

    if (access_token && refresh_token) {
      localStorage.setItem("token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      document.cookie = `token=${access_token}; path=/;`
      router.replace("/profile")
    } else {
      router.replace("/login?error=oauth_failed")
    }
  }, [searchParams, router])

  return <p className="text-white text-center">Logging you in with Google...</p>
}
