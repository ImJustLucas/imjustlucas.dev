const parisHour = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  hour: "numeric",
  hourCycle: "h23",
});

/**
 * Whether it is night for Lucas, in Paris (`Europe/Paris`, daylight saving
 * included): from 21:00 to 07:00. The chibi's day or night outfit follows it,
 * never the visitor's clock or theme.
 */
export const isNightInParis = (date: Date): boolean => {
  const hour = Number(parisHour.format(date));
  return hour >= 21 || hour < 7;
};

const parisMonth = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  month: "numeric",
});

/** Whether it is December for Lucas, in Paris: the Christmas banner's month. */
export const isDecemberInParis = (date: Date): boolean =>
  Number(parisMonth.format(date)) === 12;

// en-CA formats a date as YYYY-MM-DD.
const parisDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Lucas's calendar day in Paris, as `YYYY-MM-DD`: the Streak's today. */
export const parisDay = (date: Date): string => parisDate.format(date);
