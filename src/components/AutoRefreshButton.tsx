import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type RefreshInterval = "off" | "30s" | "1m" | "5m"

const INTERVAL_MS: Record<RefreshInterval, number | undefined> = {
    off: undefined,
    "30s": 30_000,
    "1m": 60_000,
    "5m": 300_000,
}

export function intervalToMs(interval: RefreshInterval): number | undefined {
    return INTERVAL_MS[interval]
}

export function AutoRefreshControl({
    interval,
    onIntervalChange,
}: {
    interval: RefreshInterval
    onIntervalChange: (v: RefreshInterval) => void
}) {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

    useEffect(() => {
        const ms = INTERVAL_MS[interval]
        if (!ms) {
            setSecondsLeft(null)
            return
        }
        setSecondsLeft(Math.round(ms / 1000))
        const id = setInterval(() => {
            setSecondsLeft((s) => (s !== null && s > 1 ? s - 1 : Math.round(ms / 1000)))
        }, 1000)
        return () => clearInterval(id)
    }, [interval])

    return (
        <div className="flex items-center gap-2">
            {secondsLeft !== null && (
                <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                    <RefreshCw className="h-3 w-3" />
                    {secondsLeft}s
                </span>
            )}
            <ToggleGroup
                type="single"
                value={interval}
                onValueChange={(v) => {
                    if (v) onIntervalChange(v as RefreshInterval)
                }}
                size="sm"
                variant="outline"
            >
                <ToggleGroupItem value="off" className="text-xs">Off</ToggleGroupItem>
                <ToggleGroupItem value="30s" className="text-xs">30s</ToggleGroupItem>
                <ToggleGroupItem value="1m" className="text-xs">1m</ToggleGroupItem>
                <ToggleGroupItem value="5m" className="text-xs">5m</ToggleGroupItem>
            </ToggleGroup>
        </div>
    )
}
