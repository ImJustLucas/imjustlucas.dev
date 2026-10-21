import { FieldError, FieldLabel, Select } from "@/app/admin/admin-form";
import { INPUT } from "@/app/admin/field-style";
import { splitPoint } from "@/app/admin/period-input";
import type { Period } from "@/lib/content/types";
import { cn } from "@/lib/utils";

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

const PeriodPoint: React.FC<{
  name: string;
  label: string;
  defaultValue?: string;
  children?: React.ReactNode;
}> = ({ name, label, defaultValue, children }) => {
  const { year, month } = splitPoint(defaultValue);
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5">
        <FieldLabel label={label} />
      </legend>
      <div className="flex flex-wrap items-center gap-2">
        {/* Dimmed while "en cours" is ticked: the end's date is not read */}
        <div className="flex min-w-0 flex-1 gap-2 transition-opacity duration-hover group-has-[input:checked]/end:opacity-40">
          <Select
            name={`${name}.month`}
            aria-label={`${label} : mois`}
            defaultValue={month}
            className="min-w-[8.5rem] flex-1"
          >
            <option value="">Année seule</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
          <input
            name={`${name}.year`}
            aria-label={`${label} : année`}
            defaultValue={year}
            inputMode="numeric"
            placeholder="2024"
            maxLength={4}
            className={cn(INPUT, "w-[5.5rem] shrink-0 font-mono tabular-nums")}
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
  <div className="grid gap-4 lg:grid-cols-2">
    <PeriodPoint
      name={`${name}.start`}
      label="Début"
      defaultValue={defaultValue?.start}
    />
    <div className="group/end min-w-0">
      <PeriodPoint
        name={`${name}.end`}
        label="Fin"
        defaultValue={defaultValue?.end}
      >
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-seam bg-ground px-3.5 text-label text-ink transition-colors duration-hover hover:border-ink-muted/40 has-[input:checked]:border-online has-[input:checked]:bg-online has-[input:checked]:text-on-bright has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action-ink">
          <input
            type="checkbox"
            name={`${name}.end.ongoing`}
            defaultChecked={defaultValue?.end === "ongoing"}
            className="sr-only"
          />
          En cours
        </label>
      </PeriodPoint>
    </div>
  </div>
);
