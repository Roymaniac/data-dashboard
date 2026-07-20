import { useMemo, useState } from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts"
import { CloudRain, Droplets, Eye, RefreshCw, Thermometer, Wind } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApiData } from "@/hooks/use-api-data"
import { CITIES, fetchWeatherData, weatherCodeToDescription } from "@/lib/api/weather"
import { ExportButton } from "@/components/ExportButton"
import { AutoRefreshControl, intervalToMs, type RefreshInterval } from "@/components/AutoRefreshButton"
import type { City } from "@/types/api"

const chartConfig = {
    temperature: { label: "Temperature", color: "var(--chart-1)" },
    precipitation: { label: "Precipitation %", color: "var(--chart-2)" },
    tempMax: { label: "High", color: "var(--chart-1)" },
    tempMin: { label: "Low", color: "var(--chart-3)" },
} satisfies ChartConfig

function formatHour(time: string): string {
    const d = new Date(time)
    return d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
}

function formatDay(date: string): string {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { weekday: "short" })
}

function WeatherSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-48" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-80 rounded-lg" />
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-56 rounded-lg" />
                <Skeleton className="h-56 rounded-lg" />
            </div>
        </div>
    )
}

export function WeatherPanel() {
    const [selectedCity, setSelectedCity] = useState<City>(CITIES[0])
    const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>("off")
    const { data, loading, error, refetch } = useApiData(
        (signal) => fetchWeatherData(selectedCity, signal),
        [selectedCity.latitude, selectedCity.longitude],
        intervalToMs(refreshInterval),
    )

    const hourlyData = useMemo(
        () => (data?.hourly ?? []).map((h) => ({ time: formatHour(h.time), temperature: h.temperature, precipitation: h.precipitationProbability })),
        [data],
    )

    const dailyData = useMemo(
        () => (data?.daily ?? []).map((d) => ({ date: formatDay(d.date), tempMax: d.tempMax, tempMin: d.tempMin })),
        [data],
    )

    const weather = useMemo(() => data?.daily ?? [], [data])

    const exportData = useMemo(
        () =>
            weather.map((w) => ({
                date: w.date,
                temp_max_c: w.tempMax,
                temp_min_c: w.tempMin,
                precipitation_pct: w.precipitationProbability,
                weather: weatherCodeToDescription(w.weatherCode)
            })),
        [weather]
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Weather Forecast</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Real-time conditions and 7-day forecast via Open-Meteo
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <AutoRefreshControl interval={refreshInterval} onIntervalChange={setRefreshInterval} />
                    <ExportButton data={exportData}
                        filename={`weather-${selectedCity.name.toLocaleLowerCase().replace(/\s+/g, "-")}`}
                    />
                    <Select
                        value={`${selectedCity.latitude},${selectedCity.longitude}`}
                        onValueChange={(val) => {
                            const city = CITIES.find((c) => `${c.latitude},${c.longitude}` === val)
                            if (city) setSelectedCity(city)
                        }}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                            {CITIES.map((city) => (
                                <SelectItem key={`${city.latitude},${city.longitude}`} value={`${city.latitude},${city.longitude}`}>
                                    {city.name}, {city.country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

            {loading && <WeatherSkeleton />}

            {data && !loading && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Current conditions — 4 columns on lg */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-1.5">
                                    <Thermometer className="h-4 w-4" /> Temperature
                                </CardDescription>
                                <CardTitle className="text-3xl tracking-tight">
                                    {Math.round(data.current.temperature)}°C
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    Feels like {Math.round(data.current.apparentTemperature)}°C
                                </p>
                                <Badge variant="secondary" className="mt-3">
                                    {weatherCodeToDescription(data.current.weatherCode)}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-1.5">
                                    <Droplets className="h-4 w-4" /> Humidity
                                </CardDescription>
                                <CardTitle className="text-3xl tracking-tight">{data.current.humidity}%</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    Precipitation: {data.current.precipitation} mm
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-1.5">
                                    <Wind className="h-4 w-4" /> Wind Speed
                                </CardDescription>
                                <CardTitle className="text-3xl tracking-tight">
                                    {Math.round(data.current.windSpeed)} km/h
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {data.current.isDay ? "Daytime" : "Nighttime"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-1.5">
                                    <CloudRain className="h-4 w-4" /> Rain Chance
                                </CardDescription>
                                <CardTitle className="text-3xl tracking-tight">
                                    {data.hourly[0]?.precipitationProbability ?? 0}%
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">Next hour forecast</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Hourly temperature chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Hourly Temperature</CardTitle>
                            <CardDescription>
                                Today's hourly forecast for {data.location.name}, {data.location.country}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-72 w-full">
                                <AreaChart data={hourlyData} accessibilityLayer>
                                    <defs>
                                        <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-temperature)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-temperature)" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="°" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        dataKey="temperature"
                                        type="monotone"
                                        stroke="var(--color-temperature)"
                                        fill="url(#tempFill)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Precipitation + 7-day forecast */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Precipitation Probability</CardTitle>
                                <CardDescription>Chance of rain throughout the day</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-56 w-full">
                                    <BarChart data={hourlyData} accessibilityLayer>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="%" />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="precipitation" fill="var(--color-precipitation)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">7-Day Forecast</CardTitle>
                                <CardDescription>Daily high and low temperatures</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-56 w-full">
                                    <AreaChart data={dailyData} accessibilityLayer>
                                        <defs>
                                            <linearGradient id="maxFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-tempMax)" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="var(--color-tempMax)" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="°" />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            dataKey="tempMax"
                                            type="monotone"
                                            stroke="var(--color-tempMax)"
                                            fill="url(#maxFill)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            dataKey="tempMin"
                                            type="monotone"
                                            stroke="var(--color-tempMin)"
                                            fill="none"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        Data from Open-Meteo · Updated {new Date().toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    )
}
