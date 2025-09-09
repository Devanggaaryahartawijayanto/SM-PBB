import { clientFetcher } from "@/lib/orval/mutator"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"

// Types based on backend schema
export interface ItemCreate {
  name: string
  description?: string | null
  quantity?: number | null
}

export interface ItemRead {
  id: string
  name: string
  description?: string | null
  quantity?: number | null
  user_id: string
}

// GET /api/items - Read items
export const getItems = () => {
  return clientFetcher<ItemRead[]>({
    url: `/api/items`,
    method: "get",
  })
}

export const useItemsReadItems = () => {
  const queryKey = ["items"]

  return useSWR(queryKey, () => getItems(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
}

// POST /api/items - Create item
export const createItem = (data: ItemCreate) => {
  return clientFetcher<ItemRead>({
    url: `/api/items`,
    method: "post",
    data,
  })
}

export const useItemsCreateItem = () => {
  return useSWRMutation(
    ["items"],
    async (key, { arg }: { arg: ItemCreate }) => {
      return await createItem(arg)
    }
  )
}

// DELETE /api/items/{item_id} - Delete item
export const deleteItem = (itemId: string) => {
  return clientFetcher<{ message: string }>({
    url: `/api/items/${itemId}`,
    method: "delete",
  })
}

export const useItemsDeleteItem = () => {
  return useSWRMutation(
    ["items"],
    async (key, { arg }: { arg: string }) => {
      return await deleteItem(arg)
    }
  )
}