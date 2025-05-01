/**
 * Generates a unique invoice number with format: INV-YYYYMMDDHHMMSS-XXX
 * @returns Formatted invoice number string
 */
export const generateInvoiceNumber = (invoice_type: string): string => {
  const now = new Date();

  // Format date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Format time components
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Generate a random 3-digit index with leading zeros
  const index = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

  // Combine all parts into final invoice number
  return `${
    invoice_type === "sale" ? "INV" : "STE"
  }-${year}${month}${day}${hours}${minutes}${seconds}-${index}`;
};
