import useSWR from 'swr'
import { clientFetcher } from '@/lib/orval/mutator'

export interface DatSubjekPajakResponse {
  SUBJEK_PAJAK_ID: string
  NM_WP?: string | null
  JALAN_WP?: string | null
  BLOK_KAV_NO_WP?: string | null
  RW_WP?: string | null
  RT_WP?: string | null
  KELURAHAN_WP?: string | null
  KOTA_WP?: string | null
  KD_POS_WP?: string | null
  TELP_WP?: string | null
  NPWP?: string | null
  STATUS_PEKERJAAN_WP?: string | null
  EMAIL_WP?: string | null
}

export const useGetMyProfile = () => {
  return useSWR<DatSubjekPajakResponse>(
    '/profile/me',
    (url: string) => clientFetcher({ url, method: 'GET' }),
    {
      errorRetryCount: 2,
      revalidateOnFocus: false,
    }
  )
}

export const getMyProfile = () => {
  return clientFetcher<DatSubjekPajakResponse>({
    url: '/profile/me',
    method: 'GET',
  })
}
