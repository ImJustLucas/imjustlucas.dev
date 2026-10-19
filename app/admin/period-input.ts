// Plain functions shared by `PeriodField` and the Server Actions reading it.

/**
 * A Period entered in the Admin: a year and an optional month for the start
 * and for the end, or "ongoing" as the end. `PeriodField` names its inputs
 * `<name>.start.year`, `<name>.start.month`, `<name>.end.year`,
 * `<name>.end.month` and `<name>.end.ongoing`.
 */

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

/** `YYYY` or `YYYY-MM`; empty without a year (the schema reports it). */
const readPoint = (form: FormData, name: string) => {
  const year = text(form, `${name}.year`);
  const month = text(form, `${name}.month`);
  if (!year) return "";
  return month ? `${year}-${month}` : year;
};

/** The Period a `PeriodField` posted, unvalidated. */
export const readPeriod = (
  form: FormData,
  name: string,
): { readonly start: string; readonly end: string } => ({
  start: readPoint(form, `${name}.start`),
  end: form.get(`${name}.end.ongoing`)
    ? "ongoing"
    : readPoint(form, `${name}.end`),
});

/** A point as the year and month inputs show it. */
export const splitPoint = (point: string | undefined) => {
  if (!point || point === "ongoing") return { year: "", month: "" };
  const [year = "", month = ""] = point.split("-");
  return { year, month };
};
