import {
  NumberSystem,
  PageStatus,
  ReviewMode,
  SessionType,
  TajweedCategory,
  ThemeMode,
} from "@/types";

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export const WEEKDAY_LABELS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  memorization: "حفظ",
  review: "مراجعة",
  test: "اختبار",
  stop: "وقفة",
  ramadan: "رمضان",
  tajweed: "تجويد",
  mixed: "مختلطة",
};

export const REVIEW_MODE_LABELS: Record<ReviewMode, string> = {
  light: "خفيف",
  normal: "عادي",
  intensive: "موسع",
};

export const STATUS_LABELS: Record<PageStatus, string> = {
  not_started: "غير محفوظة",
  fresh: "حديثة",
  stable: "مستقرة",
  strong: "قوية",
  weak: "ضعيفة",
  critical: "حرجة",
  overdue: "متأخرة",
};

export const TAJWEED_CATEGORY_LABELS: Record<TajweedCategory, string> = {
  makharij: "مخارج",
  ghunnah: "غنة",
  madd: "مدود",
  waqf: "وقف وابتداء",
  qalqalah: "قلقلة",
  sifaat: "صفات",
  ikhfa: "إخفاء",
  idghaam: "إدغام",
};

export const THEME_LABELS: Record<ThemeMode, string> = {
  nour: "نور",
  sand: "رمل",
  night: "ليل",
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function range(startPage: number, endPage: number) {
  return Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, index) => startPage + index);
}

export function uniqueSortedNumbers(values: number[]) {
  return [...new Set(values)].sort((left, right) => left - right);
}

export function chunkNumbers(values: number[], chunkSize: number) {
  const result: number[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    result.push(values.slice(index, index + chunkSize));
  }

  return result;
}

export function toDigitSystem(value: number | string, numerals: NumberSystem) {
  const stringValue = String(value);

  if (numerals === "latin") {
    return stringValue;
  }

  return stringValue.replace(/\d/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)] ?? digit);
}

export function formatPageRange(pages: number[], numerals: NumberSystem) {
  const uniquePages = uniqueSortedNumbers(pages);

  if (uniquePages.length === 0) {
    return "لا توجد صفحات";
  }

  const ranges: string[] = [];
  let start = uniquePages[0];
  let previous = uniquePages[0];

  for (let index = 1; index < uniquePages.length; index += 1) {
    const current = uniquePages[index];

    if (current === previous + 1) {
      previous = current;
      continue;
    }

    ranges.push(start === previous ? toDigitSystem(start, numerals) : `${toDigitSystem(start, numerals)} - ${toDigitSystem(previous, numerals)}`);
    start = current;
    previous = current;
  }

  ranges.push(start === previous ? toDigitSystem(start, numerals) : `${toDigitSystem(start, numerals)} - ${toDigitSystem(previous, numerals)}`);

  return ranges.join("، ");
}

export function formatMinutes(minutes: number, numerals: NumberSystem) {
  if (minutes < 60) {
    return `${toDigitSystem(minutes, numerals)} د`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${toDigitSystem(hours, numerals)} س ${rest ? `${toDigitSystem(rest, numerals)} د` : ""}`.trim();
}

export function percentage(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}
