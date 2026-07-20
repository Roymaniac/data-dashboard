import { useCallback, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
    Activity,
    Cloud,
    Info,
    LayoutGrid,
    Moon,
    RefreshCw,
    Sun,
    Wallet,
} from "lucide-react"
import { toast } from "sonner"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { CITIES } from "@/lib/api/weather"
import { COIN_LABELS, type CoinId } from "@/lib/api/crypto"
import type { SportLeague } from "@/types/api"
import { SPORT_LABELS } from "@/lib/api/sport"
import type { PanelSection } from "@/components/panels"

export function CommandPalette({
    open,
    onOpenChange,
    onNavigate,
    onRefresh,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onNavigate: (section: PanelSection) => void
    onRefresh: () => void
}) {
    const { theme, setTheme } = useTheme()

    const close = useCallback(() => onOpenChange(false), [onOpenChange])

    const navigate = useCallback(
        (s: PanelSection) => {
            onNavigate(s)
            close()
        },
        [onNavigate, close],
    )

    const refresh = useCallback(() => {
        onRefresh()
        close()
        toast.success("Panel refreshed")
    }, [onRefresh, close])

    const toggleTheme = useCallback(() => {
        const next = theme === "dark" ? "light" : "dark"
        setTheme(next)
        close()
        toast.success(`Switched to ${next} mode`)
    }, [theme, setTheme, close])

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => navigate("overview")}>
                        <LayoutGrid className="h-4 w-4" />
                        <span>Go to Overview</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate("weather")}>
                        <Cloud className="h-4 w-4" />
                        <span>Go to Weather</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate("crypto")}>
                        <Wallet className="h-4 w-4" />
                        <span>Go to Crypto</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate("sports")}>
                        <Activity className="h-4 w-4" />
                        <span>Go to Sports</span>
                    </CommandItem>
                    <CommandItem onSelect={() => navigate("about")}>
                        <Info className="h-4 w-4" />
                        <span>Go to About</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Actions">
                    <CommandItem onSelect={refresh}>
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh current panel</span>
                        <CommandShortcut>R</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={toggleTheme}>
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span>Toggle dark mode</span>
                        <CommandShortcut>D</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Cities">
                    {CITIES.slice(0, 6).map((city) => (
                        <CommandItem key={city.name} onSelect={() => navigate("weather")}>
                            <Cloud className="h-4 w-4" />
                            <span>{city.name}, {city.country}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Coins">
                    {(Object.keys(COIN_LABELS) as CoinId[]).map((id) => (
                        <CommandItem key={id} onSelect={() => navigate("crypto")}>
                            <Wallet className="h-4 w-4" />
                            <span>{COIN_LABELS[id]}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Leagues">
                    {(Object.keys(SPORT_LABELS) as SportLeague[]).map((id) => (
                        <CommandItem key={id} onSelect={() => navigate("sports")}>
                            <Activity className="h-4 w-4" />
                            <span>{SPORT_LABELS[id]}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}


export function useCommandPalette() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setOpen((v) => !v)
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    return { open, setOpen }
}

export { Kbd }
