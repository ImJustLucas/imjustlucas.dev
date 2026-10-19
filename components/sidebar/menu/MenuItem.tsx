import Link from "next/link";

import useSound from "use-sound";

import { Button } from "@/components/ui/button";
import type { Route } from "@/config/routes";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  route: Route;
  isActive?: boolean;
}

export default function MenuItem({ route, isActive = false }: MenuItemProps) {
  const [play] = useSound("/sounds/click.mp3");
  const { closeMenu } = useMobileMenu();

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 transition-all duration-200 ease-in-out",
        "hover:bg-primary/10 hover:text-primary",
        "focus:bg-primary/20 focus:text-primary focus:outline-none",
        "active:scale-95",
        isActive && "bg-primary/10 text-primary font-medium",
      )}
    >
      <Link
        href={route.path}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          closeMenu();
          play();
        }}
      >
        <span className="flex-1 text-left">{route.label}</span>
        {isActive && (
          <span className="h-2 w-2 rounded-full bg-primary transition-all duration-200 ease-in-out" />
        )}
      </Link>
    </Button>
  );
}
