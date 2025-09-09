import { z as zod } from 'zod'

/**
 * Item schemas based on backend models
 */

export const itemsCreateItemBody = zod.object({
  name: zod.string().min(1, "Name is required"),
  description: zod.string().optional().nullable(),
  quantity: zod.number().int().min(0).optional().nullable(),
})

export const itemsReadItemResponse = zod.object({
  id: zod.string().uuid(),
  name: zod.string(),
  description: zod.string().optional().nullable(),
  quantity: zod.number().int().optional().nullable(),
  user_id: zod.string().uuid(),
})

export const itemsDeleteItemResponse = zod.object({
  message: zod.string(),
})