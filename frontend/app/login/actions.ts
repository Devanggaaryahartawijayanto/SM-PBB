"use server"

import { cookies } from "next/headers"

export async function saveTokenToCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: false, // If you don't need SSR protection, else set true
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  })
}
