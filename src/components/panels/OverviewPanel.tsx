import { Activity, CloudSun, RefreshCw, TrendingDown, TrendingUp, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiData } from "@/hooks/use-api-data"
import { fetchCryptoData } from "@/lib/api/crypto"
import { fetchSportData, SPORT_LABELS } from "@/lib/api/sport"
import { CITIES, fetchWeatherData, weatherCodeToDescription } from "@/lib/api/weather"

const DEFAULT_CITY = CITIES.find((city) => city.name === "Ikorodu") ?? CITIES[0]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value >= 1_000 ? 0 : 2 }).format(value)
}

function OverviewSkeleton() {
  return <div className="space-y-6"><Skeleton className="h-12 w-full" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36 rounded-lg" />)}</div><Skeleton className="h-72 w-full rounded-lg" /></div>
}

export function OverviewPanel() {
  const { data, loading, error, refetch } = useApiData(
    async (signal) => {
      const [weather, crypto, sports] = await Promise.all([
        fetchWeatherData(DEFAULT_CITY, signal),
        fetchCryptoData(signal),
        fetchSportData("NBA", signal),
      ])
      return { weather, crypto, sports }
    },
    [],
    60_000,
  )

  const marketLeaders = data?.crypto.slice(0, 5) ?? []
  const gainers = marketLeaders.filter((coin) => coin.priceChangePercentage24h >= 0).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Live Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">A consolidated view of the market, weather, and today’s NBA action.</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh data
        </Button>
      </div>

      {error && <Card className="border-destructive"><CardContent className="pt-6"><p className="text-sm text-destructive">{error}</p><Button className="mt-3" size="sm" variant="outline" onClick={refetch}>Try again</Button></CardContent></Card>}
      {loading && <OverviewSkeleton />}

      {data && !loading && <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><CloudSun className="h-4 w-4" /> {data.weather.location.name}</CardDescription><CardTitle className="text-3xl">{Math.round(data.weather.current.temperature)}°C</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{weatherCodeToDescription(data.weather.current.weatherCode)}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Market leader</CardDescription><CardTitle className="text-2xl">{marketLeaders[0]?.name ?? "—"}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{marketLeaders[0] ? formatCurrency(marketLeaders[0].currentPrice) : "No quote available"}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Activity className="h-4 w-4" /> 24h momentum</CardDescription><CardTitle className="text-3xl">{gainers}/{marketLeaders.length || 0}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Tracked assets gaining today</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Trophy className="h-4 w-4" /> NBA scoreboard</CardDescription><CardTitle className="text-3xl">{data.sports.events.length}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Games currently listed by ESPN</p></CardContent></Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader><CardTitle className="text-lg">Crypto market pulse</CardTitle><CardDescription>Top tracked assets ranked by market capitalization</CardDescription></CardHeader>
            <CardContent className="space-y-3">{marketLeaders.map((coin) => { const positive = coin.priceChangePercentage24h >= 0; return <div key={coin.id} className="flex items-center justify-between rounded-lg border p-3"><div className="flex min-w-0 items-center gap-3">{coin.image && <img alt="" className="h-8 w-8 rounded-full" src={coin.image} />}<div><p className="font-medium">{coin.name}</p><p className="text-xs uppercase text-muted-foreground">{coin.symbol}</p></div></div><div className="text-right"><p className="font-medium">{formatCurrency(coin.currentPrice)}</p><Badge variant={positive ? "secondary" : "destructive"} className="mt-1">{positive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}{coin.priceChangePercentage24h.toFixed(2)}%</Badge></div></div> })}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">NBA snapshot</CardTitle><CardDescription>{SPORT_LABELS.NBA}</CardDescription></CardHeader>
            <CardContent className="space-y-3">{data.sports.events.slice(0, 4).map((event) => <div key={event.id} className="rounded-lg border p-3"><div className="flex justify-between gap-3"><p className="font-medium">{event.shortName}</p><Badge variant="outline">{event.status}</Badge></div><p className="mt-2 text-xs text-muted-foreground">{new Date(event.date).toLocaleString()}</p></div>)}{data.sports.events.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No NBA games are currently listed.</p>}</CardContent>
          </Card>
        </div>
        <p className="text-right text-xs text-muted-foreground">Auto-refreshes every minute · Sources: Open-Meteo, CoinGecko, ESPN</p>
      </>}
    </div>
  )
}
