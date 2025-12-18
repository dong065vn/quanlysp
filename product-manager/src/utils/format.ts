/**
 * Format price to Vietnamese currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('vi-VN');
}

/**
 * Format datetime to Vietnamese locale
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('vi-VN');
}
