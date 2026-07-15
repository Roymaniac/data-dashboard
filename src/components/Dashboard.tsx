import { Suspense, useState } from "react"
import { BarChart3 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "./Toggle"
import { PANEL_CONFIGS, PANEL_CONFIG_MAP, type PanelSection } from "@/components/panels"

type Section = PanelSection

const NAV_ITEMS = PANEL_CONFIGS

function AppSidebar({ active, onSelect }: { active: Section; onSelect: (s: Section) => void }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold leading-tight">Data Dashboard</span>
            <span className="truncate text-xs text-muted-foreground leading-tight">Live analytics</span>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={active === id}
                    tooltip={label}
                    onClick={() => onSelect(id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <div className="flex items-center justify-center group-data-[collapsible=icon]:justify-center group-data-[state=expanded]:justify-between group-data-[state=expanded]:px-2">
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            No API keys required
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function Dashboard() {
  const [active, setActive] = useState<Section>("weather")

  const activePanel = PANEL_CONFIG_MAP[active]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full">
        <AppSidebar active={active} onSelect={setActive} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background/90 px-6 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-base font-semibold leading-tight">
                  {activePanel.label}
                </h1>
                <p className="text-xs text-muted-foreground leading-tight hidden sm:block">
                  {activePanel.subtitle}
                </p>
              </div>
              <Toggle />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl px-6 py-8">
              <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading panel…</div>}>
                {(() => {
                  const Panel = PANEL_CONFIG_MAP[active].component
                  return <Panel />
                })()}
              </Suspense>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Data sourced from Open-Meteo · CoinGecko · ESPN
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
