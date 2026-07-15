import { useEffect, useMemo, useState } from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts"
import { ArrowDown, ArrowUp, DollarSign, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApiData } from "@/hooks/use-api-data"
import { COIN_LABELS, fetchCoinHistory, fetchCryptoData, type CoinId } from "@/lib/api/crypto"

const chartConfig = {
    price: { label: "Price (USD)", color: "var(--chart-1)" },
} satisfies ChartConfig

function formatPrice(value: number): string {
    if (value >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    if (value >= 1) return `$${value.toFixed(2)}`
    return `$${value.toFixed(4)}`
}

function formatLargeValue(value: number): string {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString("en-US")}`
}

function formatChartDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function CryptoSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-lg" />
        </div>
    )
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
    const chartData = data.map((price, i) => ({ i, price }))
    const color = positive ? "var(--chart-2)" : "var(--chart-1)"
    return (
        <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                    <linearGradient id={`spark-${positive ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    dataKey="price"
                    type="monotone"
                    stroke={color}
                    strokeWidth={1.5}
                    fill={`url(#spark-${positive ? "up" : "down"})`}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export function CryptoPanel() {
    const { data: coins, loading, error, refetch } = useApiData(fetchCryptoData, [])
    const [selectedCoin, setSelectedCoin] = useState<CoinId>("bitcoin")
    const [history, setHistory] = useState<Array<{ date: string; price: number }>>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    useEffect(() => {
        if (!coins || coins.length === 0) return
        const controller = new AbortController()
        fetchCoinHistory(selectedCoin, 7, controller.signal)
            .then((h) => {
                if (!controller.signal.aborted) {
                    setHistory(h)
                    setHistoryLoading(false)
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setHistory([])
                    setHistoryLoading(false)
                }
            })
        return () => {
            controller.abort()
        }
    }, [selectedCoin, coins])

    const chartData = useMemo(
        () => history.map((h) => ({ date: formatChartDate(h.date), price: h.price })),
        [history],
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Crypto Markets</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Live prices and 7-day trends via CoinGecko
                    </p>
                </div>
                <Button variant="outline" size="icon" onClick={refetch} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
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

            {loading && <CryptoSkeleton />}

            {coins && !loading && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Coin stat cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {coins.map((coin) => {
                            const positive = coin.priceChangePercentage24h >= 0
                            return (
                                <Card
                                    key={coin.id}
                                    className={
                                        selectedCoin === coin.id ? "border-primary ring-1 ring-primary/30" : ""
                                    }
                                >
                                    <CardHeader className="pb-2">
                                        <img
                                            src={coin.image}
                                            alt={coin.name}
                                            className="h-5 w-5 rounded-full"
                                        />
                                        <CardDescription className="flex items-center justify-between">
                                            <span className="font-medium uppercase">{coin.symbol}</span>
                                            <Badge variant={positive ? "default" : "destructive"} className="text-xs">
                                                {positive ? (
                                                    <TrendingUp className="mr-0.5 h-3 w-3" />
                                                ) : (
                                                    <TrendingDown className="mr-0.5 h-3 w-3" />
                                                )}
                                                {Math.abs(coin.priceChangePercentage24h).toFixed(2)}%
                                            </Badge>
                                        </CardDescription>
                                        <CardTitle className="mt-1 text-xl tracking-tight">
                                            {formatPrice(coin.currentPrice)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        {coin.sparkline.length > 0 && (
                                            <Sparkline data={coin.sparkline} positive={positive} />
                                        )}
                                        <button
                                            className="mt-2 w-full text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                                            onClick={() => setSelectedCoin(coin.id as CoinId)}
                                        >
                                            {coin.name} →
                                        </button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Price history chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-lg">{COIN_LABELS[selectedCoin]} Price History</CardTitle>
                                    <CardDescription className="mt-1">7-day price trend in USD</CardDescription>
                                </div>
                                <Tabs
                                    value={selectedCoin}
                                    onValueChange={(v) => {
                                        setHistoryLoading(true)
                                        setSelectedCoin(v as CoinId)
                                    }}
                                >
                                    <TabsList>
                                        {(Object.keys(COIN_LABELS) as CoinId[]).map((id) => (
                                            <TabsTrigger key={id} value={id} className="text-xs">
                                                {COIN_LABELS[id]}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {historyLoading ? (
                                <Skeleton className="h-80 w-full rounded-lg" />
                            ) : chartData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-80 w-full">
                                    <LineChart data={chartData} accessibilityLayer>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            domain={["auto", "auto"]}
                                            tickFormatter={(v: number) => formatPrice(v)}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent formatter={(v) => formatPrice(Number(v))} />}
                                        />
                                        <Line
                                            dataKey="price"
                                            type="monotone"
                                            stroke="var(--color-price)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                                    No historical data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Market stats */}
                    <div>
                        <h3 className="scroll-m-20 mb-4 text-xl font-semibold tracking-tight">Market Statistics</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {coins.slice(0, 3).map((coin) => {
                                const positive = coin.priceChange24h >= 0
                                return (
                                    <Card key={`stats-${coin.id}`}>
                                        <CardHeader className="pb-3">
                                            <CardDescription className="flex items-center gap-1.5">
                                                {/* <DollarSign className="h-4 w-4" /> */}
                                                <img
                                                    src={coin.image}
                                                    alt={coin.name}
                                                    className="h-6 w-6"
                                                />
                                                {coin.name}
                                            </CardDescription>
                                            <CardTitle className="text-2xl tracking-tight">
                                                {formatPrice(coin.currentPrice)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">24h Change</span>
                                                <span className={positive ? "text-chart-2" : "text-chart-1"}>
                                                    {positive ? "+" : ""}
                                                    {formatPrice(coin.priceChange24h)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Market Cap</span>
                                                <span className="font-medium">{formatLargeValue(coin.marketCap)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Volume (24h)</span>
                                                <span className="font-medium">{formatLargeValue(coin.totalVolume)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">24h Trend</span>
                                                <Badge variant={positive ? "default" : "destructive"} className="text-xs">
                                                    {positive ? (
                                                        <ArrowUp className="mr-0.5 h-3 w-3" />
                                                    ) : (
                                                        <ArrowDown className="mr-0.5 h-3 w-3" />
                                                    )}
                                                    {Math.abs(coin.priceChangePercentage24h).toFixed(2)}%
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-right">
                        Data from CoinGecko · Updated {new Date().toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    )
}
