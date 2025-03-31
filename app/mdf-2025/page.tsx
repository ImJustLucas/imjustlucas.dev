import { TypographyH2 } from "@/components/typography";
import MasterDevScene from "./components/master-dev-scene";

export default function MasterDevFrance2025Page() {
  return (
    <div className="w-full h-full">
      <TypographyH2 border={false}>MasterDevFrance 2025</TypographyH2>
      <div className="relative w-full h-[600px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-800 via-indigo-600 to-purple-500">
        <MasterDevScene />
      </div>
      <div className="mt-6 text-muted-foreground">
        <p>
          Proud winner of the MasterDevFrance 2025 competition - a national
          recognition for technical excellence and innovation in software
          development.
        </p>
      </div>
    </div>
  );
}
