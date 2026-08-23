export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatRupiah(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatDateOnly(date: string | Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
    new Date(date),
  );
}

export function normalizeWaNumber(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return digits;
}
