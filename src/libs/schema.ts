import * as Yup from "yup";

// libs/schema.ts
export const validationRegisterSchema = Yup.object().shape({
  fullName: Yup.string().required("Fullname is required"), // Changed from 'nama' to 'fullName'
  username: Yup.string().required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export const validationLoginSchema = Yup.object({
  data: Yup.string()
    .required('Email/Username wajib diisi'),
  password: Yup.string()
    .required('Password wajib diisi')
    .min(6, 'Password minimal 6 karakter')
});

export const validationStokSchema = Yup.object({
  serialNumber: Yup.string()
    .trim()
    .required("Serial Number is required")
    .min(3, "Serial Number terlalu pendek"),
  expiredDate: Yup.date()
    .required("Expired Date is required")
    .min(new Date(), "Expired Date tidak boleh di masa lalu"),
  status: Yup.string()
    .oneOf(["Retur", "Rusak", "Kadaluarsa"], "Status tidak valid")
    .required("Status is required"),
})