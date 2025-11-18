import { format, parseISO, differenceInDays, isPast, isToday, isFuture } from 'date-fns';
import ja from 'date-fns/locale/ja';

export const formatDate = (date: string | Date, formatStr: string = 'yyyy年MM月dd日'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ja });
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy年MM月dd日 HH:mm');
};

export const getDaysUntil = (date: string | Date): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(dateObj, new Date());
};

export const isDatePast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isPast(dateObj) && !isToday(dateObj);
};

export const isDateToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
};

export const isDateFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isFuture(dateObj);
};

