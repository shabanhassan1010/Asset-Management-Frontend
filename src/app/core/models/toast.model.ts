// The shape of one toast message.
// It lives in core/models like the rest of the app's models, so both the
// service and the component import the same type instead of redefining it.

// ToastType decides only the colour/icon of the toast.
// A union of strings (not an enum) because these values never leave the front-end,
// so we don't need the extra enum object at runtime.
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;      // unique inside this browser tab — used to remove the right toast
  type: ToastType;
  text: string;    // the message shown to the user
}
