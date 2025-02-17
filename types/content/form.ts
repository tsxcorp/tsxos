import type { User } from '../system';

export interface Form {
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  key?: string | null;
  on_success?: string | null;
  redirect_url?: string | null;
  /** The fields for the form. */
  fields?: FormField[];
  sort?: number | null;
  status?: string;
  /** The text for the submit button label. */
  submit_label?: string | null;
  success_message?: string | null;
  title?: string | null;
  user_created?: string | User | null;
  user_updated?: string | User | null;
}

export interface FormField {
  id: string;
  key?: string;  // Mã định danh của trường
  name: string;  // Nhãn của trường
  type: string;  // Loại trường (text, select, checkbox, ...)
  placeholder?: string;  // Placeholder
  options?: string[];  // Các lựa chọn (dành cho select)
  validation?: string;  // Quy tắc validation (ví dụ: "required|min:6")
  validation_messages?: string | null;  // Thông báo lỗi cho các quy tắc validation
  width?: string | null;
  label?: string;
  description?: string;
}

// Tạo type `FormError` nếu không có từ thư viện
export interface FormError {
	path: string;
	message: string;
  }
  