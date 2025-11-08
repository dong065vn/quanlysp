/**
 * Configuration constants for the application
 * Centralized place for all magic numbers and configuration values
 */

export const CONFIG = {
  // Sync & Polling
  POLL_INTERVAL_MS: 30000, // 30 seconds
  AUTO_SAVE_DELAY_MS: 2000, // 2 seconds

  // File & Image Constraints
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE_MB: 5,

  // UI Display
  MAX_VISIBLE_LINKS: 3,
  LOW_STOCK_THRESHOLD: 10,

  // Google Drive
  DRIVE_FOLDER_NAME: 'ProductManagerData',
  DRIVE_FILE_NAME: 'products.json',

  // Toast Messages
  TOAST_DURATION_MS: 3000,
  TOAST_AUTO_DISMISS_DELAY_MS: 5000,

  // Local Storage Keys
  STORAGE_KEYS: {
    PRODUCTS: 'productManager_products',
    CATEGORIES: 'productManager_categories',
    DRIVE_SYNC_ENABLED: 'productManager_driveSyncEnabled',
    SYNC_HISTORY: 'productManager_syncHistory',
    GOOGLE_CREDENTIALS: 'productManager_googleCredentials',
  },

  // Date & Time
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm:ss',

  // Validation
  MIN_PRODUCT_NAME_LENGTH: 1,
  MAX_PRODUCT_NAME_LENGTH: 200,
  MIN_PRICE: 0,
  MAX_QUANTITY: 999999,

  // Google OAuth
  GOOGLE_SCOPES: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],

  // Sync Status Messages
  MESSAGES: {
    SYNC_SUCCESS: 'Đồng bộ thành công',
    SYNC_ERROR: 'Lỗi đồng bộ',
    SAVE_SUCCESS: 'Lưu thành công',
    SAVE_ERROR: 'Lỗi lưu dữ liệu',
    DELETE_SUCCESS: 'Xóa thành công',
    DELETE_ERROR: 'Lỗi xóa',
    UPLOAD_SUCCESS: 'Tải lên thành công',
    UPLOAD_ERROR: 'Lỗi tải lên',
    DOWNLOAD_SUCCESS: 'Tải xuống thành công',
    DOWNLOAD_ERROR: 'Lỗi tải xuống',
    IMPORT_SUCCESS: 'Import thành công',
    IMPORT_ERROR: 'Lỗi import file',
    EXPORT_SUCCESS: 'Export thành công',
    EXPORT_ERROR: 'Lỗi export file',
    IMAGE_TOO_LARGE: 'Kích thước ảnh quá lớn (tối đa 5MB)',
    INVALID_FILE_TYPE: 'Loại file không hợp lệ',
    NETWORK_ERROR: 'Lỗi kết nối mạng',
  },
} as const;

// Export individual constants for convenience
export const {
  POLL_INTERVAL_MS,
  AUTO_SAVE_DELAY_MS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  MAX_VISIBLE_LINKS,
  LOW_STOCK_THRESHOLD,
  STORAGE_KEYS,
  MESSAGES,
} = CONFIG;
