import { clientFetcher } from "@/lib/orval/mutator"
import useSWR from "swr"

export const getDashboardStats = () => {
  return clientFetcher<{
    total_sppt: number
    total_sppt_lunas: number
    total_sppt_belum_lunas: number
    total_pbb_terhutang: number
  }>({
    url: `/api/dashboard/stats`,
    method: "get",
  })
}

export const useGetDashboardStats = () => {
  const queryKey = ["dashboard", "stats"]

  return useSWR(queryKey, () => getDashboardStats(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  })
}