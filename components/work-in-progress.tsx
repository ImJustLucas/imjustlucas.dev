import { Hammer } from "lucide-react";

export const WorkInProgress = () => {
  return (
    <div className="md:w-2/3 w-full">
      <div className="flex items-center  my-8 space-x-2">
        <h2 className="text-3xl font-bold text-center">Work in Progress</h2>
        <Hammer className="h-6 w-6 text-primary" />
      </div>
      <p className=" text-muted-foreground mb-8">
        This page is under construction. Please check back later.
      </p>
    </div>
  );
};
