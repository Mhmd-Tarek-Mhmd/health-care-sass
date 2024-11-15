import { Pagination } from "@types";

export const AUTH_STORAGE_KEY = "auth-store";

export const datTimeFormat = "DD/MM/YYYY hh:mm A";

export const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const userTypes = {
  SUPER: "SUPER",
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  PATIENT: "PATIENT",
} as const;

export const paginationInitState: Pagination = {
  page: 1,
  perPage: 1,
  totalPages: 1,
  totalCount: 10,
};

export const priceUnits = [
  "EGP", // Egyptian Pound
  "USD", // United States Dollar
  "SAR", // Saudi Riyal
  "AED", // United Arab Emirates Dirham
  "GBP", // British Pound Sterling
  "EUR", // Euro
  "JPY", // Japanese Yen
  "AUD", // Australian Dollar
  "CAD", // Canadian Dollar
  "CHF", // Swiss Franc
  "CNY", // Chinese Yuan
  "SEK", // Swedish Krona
  "NZD", // New Zealand Dollar
  "MXN", // Mexican Peso
  "SGD", // Singapore Dollar
  "HKD", // Hong Kong Dollar
  "NOK", // Norwegian Krone
  "KRW", // South Korean Won
  "TRY", // Turkish Lira
  "RUB", // Russian Ruble
  "INR", // Indian Rupee
  "BRL", // Brazilian Real
  "ZAR", // South African Rand
  "MYR", // Malaysian Ringgit
  "THB", // Thai Baht
  "IDR", // Indonesian Rupiah
  "PLN", // Polish Zloty
  "CZK", // Czech Koruna
  "HUF", // Hungarian Forint
  "DKK", // Danish Krone
  "PHP", // Philippine Peso
];

export const doctorSpecializations = [
  "General Practitioner",
  "Internal Medicine",
  "General Surgeon",
  "Orthopedic Surgeon",
  "Neurosurgeon",
  "Cardiothoracic Surgeon",
  "Plastic Surgeon",
  "Cardiologist",
  "Pulmonologist",
  "Gastroenterologist",
  "Nephrologist",
  "Hepatologist",
  "Endocrinologist",
  "Dermatologist",
  "Neurologist",
  "Psychiatrist",
  "Psychologist",
  "Obstetrician/Gynecologist (OB/GYN)",
  "Pediatrician",
  "Neonatologist",
  "Ophthalmologist",
  "Optometrist",
  "Otolaryngologist (ENT)",
  "Physiotherapist",
  "Speech Therapist",
  "Oncologist",
  "Hematologist",
  "Anesthesiologist",
  "Emergency Medicine Specialist",
];
