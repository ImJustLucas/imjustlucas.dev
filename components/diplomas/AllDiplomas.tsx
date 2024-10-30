import React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DiplomaTable() {
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Diploma</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Year</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              Master • Manager de l’Ingénierie numérique
            </TableCell>
            <TableCell>IIM</TableCell>
            <TableCell>
              <Badge variant="outline">2023 - 2025</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              Bachelor • Concepteur développeur web
            </TableCell>
            <TableCell>Need For School</TableCell>
            <TableCell>
              <Badge variant="outline">2020 - 2023</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              Baccalauréat Scientifique
            </TableCell>
            <TableCell>Lycée Galilée, Franqueville St Pierre</TableCell>
            <TableCell>
              <Badge variant="outline">2019</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
