import { useState } from "react"
import { Calendar, RefreshCw, Trophy } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useApiData } from "@/hooks/use-api-data"
import { type SportLeague } from "@/types/api"
import type { SportEvent } from "@/types/api"
import { fetchSportData, SPORT_LABELS } from "@/lib/api/sport"

function SportsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-36" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-lg" />
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-96 rounded-lg" />
            </div>
        </div>
    )
}

function GameCard({ event }: { event: SportEvent }) {
    const comp = event.competitions[0]
    if (!comp) return null

    const home = comp.competitors.find((c) => c.homeAway === "home")
    const away = comp.competitors.find((c) => c.homeAway === "away")
    if (!home || !away) return null

    const homeScore = parseInt(home.score, 10) || 0
    const awayScore = parseInt(away.score, 10) || 0
    const isFinal = event.status.toLowerCase().includes("final")
    const isLive = event.status.toLowerCase().includes("in") || event.status.toLowerCase().includes("progress")

    return (
        <Card className={isLive ? "border-primary/50" : ""}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">
                        {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        })}
                    </CardDescription>
                    <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
                        {isLive && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-background animate-pulse" />}
                        {event.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {away.logo ? (
                            <img src={away.logo} alt="" className="h-7 w-7 object-contain" />
                        ) : (
                            <div
                                className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white"
                                style={{ background: away.color ? `#${away.color}` : "var(--muted)" }}
                            >
                                {away.abbreviation.slice(0, 3)}
                            </div>
                        )}
                        <span className="text-sm font-medium">{away.abbreviation || away.name}</span>
                    </div>
                    <span className={`text-lg font-bold ${awayScore > homeScore ? "text-foreground" : "text-muted-foreground"}`}>
                        {isFinal || isLive ? awayScore : "-"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {home.logo ? (
                            <img src={home.logo} alt="" className="h-7 w-7 object-contain" />
                        ) : (
                            <div
                                className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white"
                                style={{ background: home.color ? `#${home.color}` : "var(--muted)" }}
                            >
                                {home.abbreviation.slice(0, 3)}
                            </div>
                        )}
                        <span className="text-sm font-medium">{home.abbreviation || home.name}</span>
                    </div>
                    <span className={`text-lg font-bold ${homeScore > awayScore ? "text-foreground" : "text-muted-foreground"}`}>
                        {isFinal || isLive ? homeScore : "-"}
                    </span>
                </div>
                <p className="pt-1 text-xs text-muted-foreground">{event.shortName}</p>
            </CardContent>
        </Card>
    )
}

export function SportsPanel() {
    const [league, setLeague] = useState<SportLeague>("NBA")
    const { data, loading, error, refetch } = useApiData(
        (signal) => fetchSportData(league, signal),
        [league],
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Sports Scores</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Live scores and standings via ESPN
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={league} onValueChange={(v) => setLeague(v as SportLeague)}>
                        <TabsList>
                            {(Object.keys(SPORT_LABELS) as SportLeague[]).map((l) => (
                                <TabsTrigger key={l} value={l} className="text-xs">
                                    {SPORT_LABELS[l]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" size="icon" onClick={refetch} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>
                            Try again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {loading && <SportsSkeleton />}

            {data && !loading && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Scoreboard */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                {SPORT_LABELS[league]} Scoreboard
                            </h3>
                        </div>
                        {data.events.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {data.events.slice(0, 9).map((event) => (
                                    <GameCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                    No games scheduled today
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Standings */}
                    {data.standings.length > 0 && (
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-muted-foreground" />
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                    {SPORT_LABELS[league]} Standings
                                </h3>
                            </div>
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">#</TableHead>
                                                <TableHead>Team</TableHead>
                                                <TableHead className="text-right">W</TableHead>
                                                <TableHead className="text-right">L</TableHead>
                                                <TableHead className="text-right">PCT</TableHead>
                                                <TableHead className="hidden text-right sm:table-cell">Streak</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.standings.map((entry) => (
                                                <TableRow key={entry.teamId}>
                                                    <TableCell className="font-medium text-muted-foreground">{entry.rank}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {entry.logo ? (
                                                                <img src={entry.logo} alt="" className="h-5 w-5 object-contain" />
                                                            ) : (
                                                                <div
                                                                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                                                                    style={{ background: entry.color ?? "var(--muted)" }}
                                                                >
                                                                    {entry.teamAbbreviation.slice(0, 2)}
                                                                </div>
                                                            )}
                                                            <span className="font-medium">{entry.teamName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{entry.wins}</TableCell>
                                                    <TableCell className="text-right">{entry.losses}</TableCell>
                                                    <TableCell className="text-right">{entry.winPercentage.toFixed(3)}</TableCell>
                                                    <TableCell className="hidden text-right sm:table-cell">
                                                        {entry.streak && (
                                                            <Badge
                                                                variant={entry.streak.startsWith("W") ? "default" : "destructive"}
                                                                className="text-xs"
                                                            >
                                                                {entry.streak}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground text-right">
                        Data from ESPN · Updated {new Date().toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    )
}
