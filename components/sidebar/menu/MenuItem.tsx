import * as React from "react";

import useSound from "use-sound";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function MenuItem({
  label,
  isActive = false,
  onClick: onClickProp,
}: MenuItemProps) {
  const [play] = useSound("/sounds/click.mp3");

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 transition-all duration-200 ease-in-out",
        "hover:bg-primary/10 hover:text-primary",
        "focus:bg-primary/20 focus:text-primary focus:outline-none",
        "active:scale-95",
        isActive && "bg-primary/10 text-primary font-medium",
      )}
      onClick={() => {
        onClickProp?.();
        play();
      }}
    >
      <span className="flex-1 text-left">{label}</span>
      {isActive && (
        <div className="h-2 w-2 rounded-full bg-primary transition-all duration-200 ease-in-out" />
      )}
    </Button>
  );
}
