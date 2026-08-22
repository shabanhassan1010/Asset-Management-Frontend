// src/app/core/models/api-response.model.ts

// الشكل الملفوف اللي أغلب endpoints الكتابة عندك بترجّعه (BaseResponse<T>).
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}