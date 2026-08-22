// كل الـ endpoints في الباك اند بترجّع الـ payload ملفوف في الشكل ده.
// T بيكون object في الـ GET by id، وarray في الـ list endpoints.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}