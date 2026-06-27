/**
 * Sanitize a phone number for use in wa.me links.
 * - Strips everything except digits
 * - If 10 digits, prepends Indian country code 91
 */
export function toWaNumber(raw = "") {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return "91" + digits;
  return digits;
}

/**
 * Build a wa.me URL for a given phone number and optional message text.
 */
export function buildWaUrl(phone, message = "") {
  const num = toWaNumber(phone);
  if (!num) return "https://wa.me/";
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
