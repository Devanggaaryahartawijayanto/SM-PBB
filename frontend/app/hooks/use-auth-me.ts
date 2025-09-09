import { useGetMyProfile } from "@/services/api/profile"
import { handleAuthError } from "@/lib/error-handler"
import type { ErrorResponse } from "@/services/api/models"

export const useAuthMeWithRedirect = () => {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useGetMyProfile()

  // Handle auth errors if needed
  if (error) {
    handleAuthError(error?.response?.data as unknown as ErrorResponse)
  }

  return { user, error, isLoading, mutate }
}
