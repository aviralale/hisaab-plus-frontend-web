/**
 * Format a date string to a more readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Format: "Jan 1, 2023"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format a date with time
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Format: "Jan 1, 2023, 3:42 PM"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Get relative time (e.g., "2 days ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString?: string): string => {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return formatter.format(-minutes, "minute");
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return formatter.format(-hours, "hour");
  }

  // Less than a month
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return formatter.format(-days, "day");
  }

  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return formatter.format(-months, "month");
  }

  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return formatter.format(-years, "year");
};
