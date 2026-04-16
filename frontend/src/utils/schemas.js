import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const INTL_PHONE_RE = /^\+?[0-9\s\-]{6,25}$/;
const PLATE_REGEX = /^[A-Z]{2,3}\s?\d{3,4}[A-Z]?$/;

// Common refinements
const plateNumberValidation = z
  .string()
  .min(6, "Plate number must be at least 6 characters")
  .max(10, "Plate number too long")
  .regex(PLATE_REGEX, "Invalid plate format (e.g., KCA 123A)")
  .transform((val) => val.toUpperCase().trim());

const phoneValidation = z
  .string()
  .optional()
  .refine(
    (val) => !val || INTL_PHONE_RE.test(val),
    "Enter a valid phone number (e.g. +254712345678)"
  );

const COUNTRY_PREFIX_TO_ISO = {
  "+254": "KE",
  "+256": "UG",
  "+255": "TZ",
  "+1": "US",
  "+44": "GB",
};

const validatePhoneForCountry = (phone, dialCode) => {
  if (!phone || !phone.trim()) return true;
  const regionCode = COUNTRY_PREFIX_TO_ISO[dialCode];
  if (!regionCode) return false;
  const phoneNumber = parsePhoneNumberFromString(phone.trim(), regionCode);
  return !!phoneNumber && phoneNumber.isValid() && phoneNumber.country === regionCode;
};

const ID_DOCUMENT_TYPES = ["KENYA_NATIONAL_ID", "PASSPORT", "FOREIGN_ID"];

const normalizeDocValue = (value) => (value || "").trim().toUpperCase();

// Asset Schema
export const AssetSchema = z.object({
  asset_type: z.string().min(1, "Asset type is required").max(50),
  serial_number: z.string().min(3).max(100).transform(val => val.toUpperCase().trim()),
  model_name: z.string().min(2, "Model name requires at least 2 characters").max(100).transform(val => val.trim()),
});

// Vehicle Schema
export const VehicleSchema = z.object({
  plate_number: plateNumberValidation,
  make: z.string().min(2).max(50).trim(),
  model: z.string().min(2).max(50).trim(),
  color: z.string().min(2).max(30).trim(),
});

// Login Schema
export const LoginSchema = z.object({
  username: z.string().min(1, "Username/Email is required").transform(val => val.trim()),
  password: z.string().min(1, "Password is required"),
});

// Password Update Schema
export const ChangePasswordSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export const AdminUserFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  username: z.string().min(3, "Username must be at least 3 characters").max(150).regex(/^[a-zA-Z0-9@.+\-_]+$/, "Only letters, digits, and @/./+/-/_ characters"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: phoneValidation,
  role: z.enum(["student", "staff", "guard", "admin"], {
    errorMap: () => ({ message: "Invalid role" })
  }),
  student_id: z.string().max(20).optional(),
  is_day_scholar: z.boolean().default(false),
  password: z.string().optional()
}).refine(data => {
  if (data.role === 'student' && (!data.student_id || data.student_id.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Student ID is required for student accounts",
  path: ["student_id"]
});

export const VisitorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  document_type: z.enum(ID_DOCUMENT_TYPES),
  national_id: z.string().min(5, "ID must be at least 5 characters").max(20),
  phone: phoneValidation,
  phone_country: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  organization: z.string().max(100).optional(),
  purpose_category: z.string(),
  expected_duration: z.coerce.number().min(15).max(480),
  purpose_details: z.string().min(10, "Details must be at least 10 characters").max(500),
  host_name: z.string().min(3, "Host name must be a least 3 characters").max(100),
  host_phone: phoneValidation,
  host_phone_country: z.string().optional(),
  department: z.string().max(100).optional(),
  office_location: z.string().max(100).optional(),
  host_email: z.string().email("Invalid email").optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  const idValue = normalizeDocValue(data.national_id);
  if (data.document_type === "KENYA_NATIONAL_ID" && !/^\d{7,8}$/.test(idValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Kenyan National ID must be 7 or 8 digits.",
      path: ["national_id"],
    });
  }
  if (data.document_type === "PASSPORT" && !/^[A-Z0-9]{6,9}$/.test(idValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passport number must be 6-9 letters/digits (no spaces).",
      path: ["national_id"],
    });
  }
  if (data.document_type === "FOREIGN_ID" && !/^[A-Z0-9-]{5,20}$/.test(idValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Foreign ID must be 5-20 letters/digits (hyphen allowed).",
      path: ["national_id"],
    });
  }

  if (data.phone && !validatePhoneForCountry(data.phone, data.phone_country)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid number for the selected country.",
      path: ["phone"],
    });
  }

  if (data.host_phone && !validatePhoneForCountry(data.host_phone, data.host_phone_country)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid host number for the selected country.",
      path: ["host_phone"],
    });
  }
});
