import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { arSA } from "date-fns/locale";

export function getTodayDateKey() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDateLabel(value: string, formatString = "d MMM") {
  return format(new Date(`${value}T00:00:00`), formatString, { locale: arSA });
}

export function daysBetween(left?: string, right?: string) {
  if (!left || !right) {
    return 0;
  }

  return differenceInCalendarDays(new Date(`${left}T00:00:00`), new Date(`${right}T00:00:00`));
}

export function getLastNDays(days: number, end = new Date()) {
  return eachDayOfInterval({ start: subDays(end, days - 1), end });
}

export function getWeekWindow(date = new Date(), spanDays = 7) {
  const start = startOfWeek(date, { weekStartsOn: 6 });
  return eachDayOfInterval({ start, end: addDays(start, spanDays - 1) });
}

export function getFortnightWindow(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 6 });
  return eachDayOfInterval({ start, end: addDays(start, 13) });
}

export function isDateToday(value: string) {
  return isSameDay(new Date(`${value}T00:00:00`), new Date());
}

export function getWeekStart(value: string) {
  return startOfWeek(new Date(`${value}T00:00:00`), { weekStartsOn: 6 });
}

export function getWeekEnd(value: string) {
  return endOfWeek(new Date(`${value}T00:00:00`), { weekStartsOn: 6 });
}
