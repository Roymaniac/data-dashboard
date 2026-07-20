import type { PropsWithChildren } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { Toaster } from "sonner";

/**
 * Keeps cross-cutting React providers in one predictable composition root.
 * Feature components should not depend on application bootstrap concerns.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  )
}
