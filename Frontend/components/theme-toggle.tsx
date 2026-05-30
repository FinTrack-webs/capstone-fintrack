"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button aria-label="Ganti dark mode" size="icon" variant="ghost" onClick={toggleTheme}>
      <Icon className="h-5 w-5" />
    </Button>
  );
}
