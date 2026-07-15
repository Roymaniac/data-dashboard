import { lazy } from "react"
import type { ComponentType, FC, LazyExoticComponent } from "react"
import { Activity, Bitcoin, Cloud } from "lucide-react"

export type PanelSection = "weather" | "crypto" | "sports"

export type PanelConfig = {
    id: PanelSection
    label: string
    icon: ComponentType<{ className?: string }>
    subtitle: string
    component: LazyExoticComponent<FC>
}

const loadWeatherPanel = () => import("./WeatherPanel").then((module) => ({ default: module.WeatherPanel }))
const loadCryptoPanel = () => import("./CryptoPanel").then((module) => ({ default: module.CryptoPanel }))
const loadSportsPanel = () => import("./SportsPanel").then((module) => ({ default: module.SportsPanel }))

export const PANEL_CONFIGS: PanelConfig[] = [
    {
        id: "weather",
        label: "Weather",
        icon: Cloud,
        subtitle: "Real-time conditions & forecast",
        component: lazy(loadWeatherPanel),
    },
    {
        id: "crypto",
        label: "Crypto",
        icon: Bitcoin,
        subtitle: "Live crypto prices & market data",
        component: lazy(loadCryptoPanel),
    },
    {
        id: "sports",
        label: "Sports",
        icon: Activity,
        subtitle: "Scores, standings & live updates",
        component: lazy(loadSportsPanel),
    },
]

export const PANEL_CONFIG_MAP: Record<PanelSection, PanelConfig> = Object.fromEntries(
    PANEL_CONFIGS.map((entry) => [entry.id, entry]),
) as Record<PanelSection, PanelConfig>
