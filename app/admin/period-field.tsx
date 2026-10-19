import { FieldError } from "@/app/admin/admin-form";
import { splitPoint } from "@/app/admin/period-input";
import type { Period } from "@/lib/content/types";

/**
 * A Period as the Owner enters it: a start and an end, each a year with an
 * optional month, and "en cours" as an end. Read it back with `readPeriod`
 * (`app/admin/period-input.ts`); errors are reported on `<name>.start` and
 * `<name>.end`.
 */

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: new Intl.DateTimeFormat("fr", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, i))),
}));

const inputClass = "rounded-md border border-input bg-background px-3 py-2";

const PeriodPoint: React.FC<{
  name: string;
  label: string;
  defaultValue?: string;
  children?: React.ReactNode;
}> = ({ name, label, defaultValue, children }) => {
  const { year, month } = splitPoint(defaultValue);
  return (
    <fieldset className="flex flex-col gap-1 text-sm">
      <legend className="mb-1 font-medium">{label}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-2 group-has-[:checked]/end:opacity-40">
          <select
            name={`${name}.month`}
            aria-label={`${label} : mois`}
            defaultValue={month}
            className={inputClass}
          >
            <option value="">Année seule</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <input
            name={`${name}.year`}
            aria-label={`${label} : année`}
            defaultValue={year}
            inputMode="numeric"
            placeholder="2024"
            maxLength={4}
            className={`${inputClass} w-24`}
          />
        </div>
        {children}
      </div>
      <FieldError name={name} />
    </fieldset>
  );
};

export const PeriodField: React.FC<{
  name: string;
  defaultValue?: Period;
}> = ({ name, defaultValue }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <PeriodPoint
      name={`${name}.start`}
      label="Début"
      defaultValue={defaultValue?.start}
    />
    <div className="group/end">
      <PeriodPoint
        name={`${name}.end`}
        label="Fin"
        defaultValue={defaultValue?.end}
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name={`${name}.end.ongoing`}
            defaultChecked={defaultValue?.end === "ongoing"}
          />
          En cours
        </label>
      </PeriodPoint>
    </div>
  </div>
);
