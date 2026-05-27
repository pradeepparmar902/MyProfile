"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button className="mt-5 w-full" onClick={() => window.print()}>
      <Printer size={16} /> Print / Save PDF
    </Button>
  );
}
