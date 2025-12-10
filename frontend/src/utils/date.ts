import { useSettingsStore } from "@/store/settingsStore";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * Converts a date string from one format to another
 * @param dateString - Date string in any format
 * @param fromFormat - Format of the input date (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY')
 * @param toFormat - Desired output format (e.g., 'DD/MM/YYYY', 'MM/DD/YYYY')
 * @returns Formatted date string
 */
export const convertDateFormat = (dateString: string, fromFormat: string, toFormat: string): string => {
  if (!dateString) return "";
  
  const date = dayjs(dateString, fromFormat);
  if (!date.isValid()) return dateString;
  
  return date.format(toFormat);
};

/**
 * Formats a date according to the user's preferred format from settings
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @returns Formatted date string according to settings
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  
  const settings = useSettingsStore.getState().settings;
  const dateFormat = settings.date_format || "DD/MM/YYYY";
  
  let dateObj: dayjs.Dayjs;
  if (typeof date === "string") {
    // Try to parse as ISO or common formats
    dateObj = dayjs(date);
  } else {
    dateObj = dayjs(date);
  }
  
  if (!dateObj.isValid()) return "";
  
  return dateObj.format(dateFormat);
};

/**
 * Converts a date from user's preferred format to YYYY-MM-DD (for HTML5 date inputs)
 * @param dateString - Date string in user's preferred format
 * @returns Date string in YYYY-MM-DD format
 */
export const toDateInputFormat = (dateString: string): string => {
  if (!dateString) return "";
  
  const settings = useSettingsStore.getState().settings;
  const dateFormat = settings.date_format || "DD/MM/YYYY";
  
  const date = dayjs(dateString, dateFormat);
  if (!date.isValid()) return dateString;
  
  return date.format("YYYY-MM-DD");
};

/**
 * Converts a date from YYYY-MM-DD (from HTML5 date inputs) to user's preferred format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date string in user's preferred format
 */
export const fromDateInputFormat = (dateString: string): string => {
  if (!dateString) return "";
  
  const settings = useSettingsStore.getState().settings;
  const dateFormat = settings.date_format || "DD/MM/YYYY";
  
  const date = dayjs(dateString, "YYYY-MM-DD");
  if (!date.isValid()) return dateString;
  
  return date.format(dateFormat);
};

/**
 * Gets the date format pattern from settings
 * @returns Date format string (e.g., 'DD/MM/YYYY')
 */
export const getDateFormat = (): string => {
  const settings = useSettingsStore.getState().settings;
  return settings.date_format || "DD/MM/YYYY";
};

