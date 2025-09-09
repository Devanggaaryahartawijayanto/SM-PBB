import useSWRMutation from 'swr/mutation'
import { clientFetcher } from '@/lib/orval/mutator'

interface LoginRequest {
  grant_type: string;
  username: string;
  password: string;
  scope: string;
  client_id?: string;
  client_secret?: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export const useAuthLogin = () => {
  return useSWRMutation<LoginResponse, any, string, LoginRequest>(
    '/auth/jwt/login',
    (url: string, { arg }: { arg: LoginRequest }) => 
      clientFetcher({ 
        url, 
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(arg as any).toString()
      })
  )
}
