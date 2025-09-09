import { Suspense } from "react"
import SpptPrintClient from "./sppt-print-client"

export default function SpptPrintPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-500">Loading SPPT...</p>}>
      <SpptPrintClient />
    </Suspense>
  )
}