const environment = import.meta.env

export const apiEndpoints = {
  crypto: environment.VITE_APP_CRYPTO_URL ?? "https://api.coingecko.com/api/v3",
  sportsStandings: environment.VITE_APP_SPORT_URL ?? "https://site.web.api.espn.com/apis/v2/sports",
  sportsScoreboard: environment.VITE_APP_SPORT_API_URL ?? "https://site.api.espn.com/apis/site/v2/sports",
  weather: environment.VITE_APP_WEATHER_URL ?? "https://api.open-meteo.com/v1/forecast",
} as const
