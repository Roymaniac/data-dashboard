import {
    Cloud,
    Coins,
    Code2,
    Database,
    GitBranch,
    Layers,
    Moon,
    Palette,
    Trophy,
    Zap,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const TECH_STACK = [
    { name: "React 19", icon: Code2 },
    { name: "TypeScript", icon: Code2 },
    { name: "Vite 7", icon: Zap },
    { name: "Tailwind CSS v4", icon: Palette },
    { name: "shadcn/ui", icon: Layers },
    { name: "Recharts", icon: Layers },
    { name: "Radix UI", icon: Layers },
    { name: "Lucide Icons", icon: Layers },
    { name: "Sonner", icon: Moon },
    { name: "cmdk", icon: Code2 },
    { name: "next-themes", icon: Moon },
    { name: "localStorage", icon: Database },
]

const APIS = [
    {
        name: "Open-Meteo",
        icon: Cloud,
        url: "https://open-meteo.com",
        description: "Free weather API with no key required. Provides current conditions, hourly forecasts, and 7-day daily forecasts with global coverage.",
        rateLimit: "10,000 requests/day",
        endpoints: "/v1/forecast",
    },
    {
        name: "CoinGecko",
        icon: Coins,
        url: "https://www.coingecko.com/api",
        description: "Cryptocurrency market data API. Tracks prices, market cap, volume, and 7-day sparkline trends for top coins. Free tier with generous limits.",
        rateLimit: "~30 calls/min",
        endpoints: "/coins/markets, /coins/{id}/market_chart",
    },
    {
        name: "ESPN",
        icon: Trophy,
        url: "https://site.api.espn.com",
        description: "Unofficial ESPN API for live scores, game schedules, and standings across NBA, NFL, MLB, and NHL. No key required, returns rich team metadata.",
        rateLimit: "No official limit",
        endpoints: "/scoreboard, /standings",
    },
]

const ARCHITECTURE = [
    {
        title: "Hook-Based Data Layer",
        description: "A generic useApiData hook manages fetch lifecycle, loading/error states, and optional auto-refresh intervals. Each panel declares its fetcher and dependencies — the hook handles the rest.",
        icon: Database,
    },
    {
        title: "Component Composition",
        description: "Panels are self-contained components with their own state and data fetching. The dashboard shell handles navigation, layout, and shared UI like the command palette and theme toggle.",
        icon: Layers,
    },
    {
        title: "Design Token System",
        description: "All colors, spacing, and typography use OKLCH-based CSS variables mapped through Tailwind v4. Dark mode activates via a single .dark class — no inline styles or hardcoded values.",
        icon: Palette,
    },
    {
        title: "Zero-Config Persistence",
        description: "Favorites are stored in localStorage via a custom useFavorites hook, keeping the app fully static-friendly. No backend, no auth, no environment variables required.",
        icon: Database,
    },
]

export function AboutPanel() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">About This Project</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    A real-time data dashboard built with React, shadcn/ui, and free public APIs
                </p>
            </div>

            {/* Hero image */}
            <Card className="overflow-hidden">
                <div className="relative aspect-[3/1] w-full">
                    <img
                        src="/ui.png"
                        alt="Abstract dashboard illustration"
                        className="h-full w-full object-cover"
                    />
                </div>
            </Card>

            {/* Project description */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="leading-7 text-muted-foreground">
                        This dashboard aggregates live data from three independent public APIs — weather forecasts,
                        cryptocurrency markets, and sports scores — into a single, cohesive interface. It demonstrates
                        real-world API integration, responsive chart visualization, and a polished design system
                        implementation.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">No API keys required</Badge>
                        <Badge variant="secondary">Fully static-friendly</Badge>
                        <Badge variant="secondary">Dark mode</Badge>
                        <Badge variant="secondary">Command palette (Cmd+K)</Badge>
                        <Badge variant="secondary">Data export (CSV/JSON)</Badge>
                        <Badge variant="secondary">Auto-refresh</Badge>
                        <Badge variant="secondary">localStorage favorites</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Tech stack */}
            <div>
                <h3 className="scroll-m-20 mb-4 text-xl font-semibold tracking-tight">Tech Stack</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {TECH_STACK.map((tech) => (
                        <Card key={tech.name}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <tech.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{tech.name}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* API integrations */}
            <div>
                <h3 className="scroll-m-20 mb-4 text-xl font-semibold tracking-tight">API Integrations</h3>
                <div className="grid gap-4 lg:grid-cols-3">
                    {APIS.map((api) => (
                        <Card key={api.name}>
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-1.5">
                                    <api.icon className="h-4 w-4" />
                                    {api.name}
                                </CardDescription>
                                <CardTitle className="text-lg">{api.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm leading-6 text-muted-foreground">{api.description}</p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Rate limit</span>
                                        <span className="font-medium">{api.rateLimit}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Endpoints</span>
                                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{api.endpoints}</code>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <a href={api.url} target="_blank" rel="noopener noreferrer">
                                        View Documentation
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Architecture */}
            <div>
                <h3 className="scroll-m-20 mb-4 text-xl font-semibold tracking-tight">Architecture Decisions</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    {ARCHITECTURE.map((item) => (
                        <Card key={item.title}>
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-1.5">
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Data sources footer */}
            <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <GitBranch className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Built with care, deployed without a backend</p>
                            <p className="text-xs text-muted-foreground">All data fetched client-side — zero server costs</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <a href="https://github.com/Roymaniac/data-dashboard/">
                            <GitBranch className="h-4 w-4" />
                            View Source
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
