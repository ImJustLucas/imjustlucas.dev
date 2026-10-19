import React from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Diploma names are in the message dictionaries; institutions are proper nouns. */
const DIPLOMAS = [
  { key: "master", institution: "IIM", years: "2023 - 2025" },
  { key: "bachelor", institution: "Need For School", years: "2020 - 2023" },
  {
    key: "baccalaureate",
    institution: "Lycée Galilée, Franqueville St Pierre",
    years: "2019",
  },
] as const;

export function DiplomaTable() {
  const t = useTranslations("Experiences.diplomas");

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("diploma")}</TableHead>
            <TableHead>{t("institution")}</TableHead>
            <TableHead>{t("year")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DIPLOMAS.map((diploma) => (
            <TableRow key={diploma.key}>
              <TableCell className="font-medium">{t(diploma.key)}</TableCell>
              <TableCell>{diploma.institution}</TableCell>
              <TableCell>
                <Badge variant="outline">{diploma.years}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
