// Utility functions for SPPT formatting

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (!amount) return "Rp 0"
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return "Rp 0"
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

/**
 * Format date to Indonesian format
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-"
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

/**
 * Format NOP (Nomor Objek Pajak) with proper spacing
 */
export const formatNOP = (nop: string): string => {
  if (!nop || nop.length !== 18) return nop
  
  // Format: XX.XX.XXX.XXX.XXX-XXXX.X
  return [
    nop.slice(0, 2),   // Province code
    nop.slice(2, 4),   // Regency code
    nop.slice(4, 7),   // District code
    nop.slice(7, 10),  // Village code
    nop.slice(10, 13), // Block code
    nop.slice(13, 17), // Number
    nop.slice(17, 18)  // Type code
  ].join('.')
}

/**
 * Format area in square meters
 */
export const formatArea = (area: number | string | null | undefined): string => {
  if (!area) return "-"
  const num = typeof area === 'string' ? parseFloat(area) : area
  if (isNaN(num)) return "-"
  
  return `${num.toLocaleString('id-ID')} m²`
}

/**
 * Get payment status badge variant and text
 */
export const getPaymentStatus = (status: boolean | null | undefined) => {
  return {
    variant: status ? 'default' as const : 'destructive' as const,
    text: status ? 'Lunas' : 'Belum Lunas',
    color: status ? 'text-green-700' : 'text-red-700'
  }
}

/**
 * Calculate days until due date
 */
export const getDaysUntilDue = (dueDateStr: string | null | undefined): number | null => {
  if (!dueDateStr) return null
  
  try {
    const dueDate = new Date(dueDateStr)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch {
    return null
  }
}

/**
 * Get due date status with appropriate styling
 */
export const getDueDateStatus = (dueDateStr: string | null | undefined) => {
  const daysUntilDue = getDaysUntilDue(dueDateStr)
  
  if (daysUntilDue === null) {
    return {
      text: 'Tidak diketahui',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    }
  }
  
  if (daysUntilDue < 0) {
    return {
      text: `Terlambat ${Math.abs(daysUntilDue)} hari`,
      color: 'text-red-700',
      bgColor: 'bg-red-50'
    }
  }
  
  if (daysUntilDue <= 30) {
    return {
      text: `${daysUntilDue} hari lagi`,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50'
    }
  }
  
  return {
    text: `${daysUntilDue} hari lagi`,
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  }
}
