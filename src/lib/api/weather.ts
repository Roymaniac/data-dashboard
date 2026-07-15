import type { City, WeatherData } from '@/types/api';
import { fetchJson } from '@/shared/api/http-client';
import { apiEndpoints } from '@/shared/config/environment';

const WEATHER_CODES: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

export function weatherCodeToDescription(code: number): string {
    return WEATHER_CODES[code] || "Unknown weather condition";
}

export const CITIES: City[] = [
    { name: "New York", country: "USA", latitude: 40.7143, longitude: -74.006 },
    { name: "London", country: "UK", latitude: 51.5085, longitude: -0.1257 },
    { name: "Tokyo", country: "Japan", latitude: 35.6895, longitude: 139.6917 },
    { name: "Paris", country: "France", latitude: 48.8534, longitude: 2.3488 },
    { name: "Sydney", country: "Australia", latitude: -33.8678, longitude: 151.2073 },
    { name: "Dubai", country: "UAE", latitude: 25.2769, longitude: 55.2962 },
    { name: "Singapore", country: "Singapore", latitude: 1.2897, longitude: 103.8501 },
    { name: "São Paulo", country: "Brazil", latitude: -23.5475, longitude: -46.6361 },
    { name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
    { name: "Cape Town", country: "South Africa", latitude: -33.9249, longitude: 18.4241 },
    { name: "Ikorodu", country: "Nigeria", latitude: 6.6168, longitude: 3.5080 },
]

type WeatherApiResponse = {
    current: {
        temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number;
        wind_speed_10m: number; weather_code: number; precipitation: number; is_day: number;
    };
    hourly?: { time?: string[]; temperature_2m: number[]; precipitation_probability?: number[] };
    daily?: { time?: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[]; precipitation_probability_max?: number[] };
}

export async function fetchWeatherData(city: City, signal?: AbortSignal): Promise<WeatherData> {
    const params = new URLSearchParams({
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
        current: [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "wind_speed_10m",
            "weather_code",
            "precipitation",
            "is_day",
        ].join(","),
        hourly: ["temperature_2m", "precipitation_probability"].join(","),
        daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"].join(","),
        forecast_days: "7",
        timezone: "auto",
    });

    const json = await fetchJson<WeatherApiResponse>(`${apiEndpoints.weather}?${params.toString()}`, { signal });
    const hourly = json.hourly
    const daily = json.daily
    const hourlyData = (hourly?.time ?? []).map((time, i) => ({
        time,
        temperature: hourly?.temperature_2m[i] ?? 0,
        precipitationProbability: hourly?.precipitation_probability?.[i] ?? 0,
    }))

    const today = new Date().toISOString().slice(0, 10)
    const todayHourly = hourlyData.filter((h: { time: string }) => h.time.startsWith(today))

    const dailyData = (daily?.time ?? []).map((date, i) => ({
        date,
        tempMax: daily?.temperature_2m_max[i] ?? 0,
        tempMin: daily?.temperature_2m_min[i] ?? 0,
        weatherCode: daily?.weather_code[i] ?? 0,
        precipitationProbability: daily?.precipitation_probability_max?.[i] ?? 0,
    }))

    return {
        current: {
            temperature: json.current.temperature_2m,
            apparentTemperature: json.current.apparent_temperature,
            humidity: json.current.relative_humidity_2m,
            windSpeed: json.current.wind_speed_10m,
            weatherCode: json.current.weather_code,
            precipitation: json.current.precipitation,
            isDay: json.current.is_day === 1,
        },
        hourly: todayHourly,
        daily: dailyData,
        location: {
            name: city.name,
            country: city.country,
            latitude: city.latitude,
            longitude: city.longitude,
        },
    }
}
