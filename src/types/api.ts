export type WeatherData = {
    current: {
        temperature: number;
        apparentTemperature: number;
        humidity: number;
        windSpeed: number;
        weatherCode: number;
        precipitation: number;
        isDay: boolean;
    }
    hourly: Array<{
        time: string;
        temperature: number;
        precipitationProbability: number;
    }>
    daily: Array<{
        date: string;
        tempMax: number;
        tempMin: number;
        weatherCode: number;
        precipitationProbability: number;
    }>
    location: {
        name: string;
        country: string;
        latitude: number;
        longitude: number;
    }
}

export type CryptoCoin = {
    id: string;
    symbol: string;
    name: string;
    currentPrice: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    marketCap: number;
    totalVolume: number;
    sparkline: number[];
    image?: string;
    history?: Array<{
        date: string;
        price: number;
    }>;
}

export type SportEvent = {
    id: string;
    date: string;
    name: string;
    shortName: string;
    status: string;
    competitions: Array<{
        competitors: Array<{
            id: string;
            name: string;
            abbreviation: string;
            score: string;
            homeAway: "home" | "away";
            records: Array<{
                type: string;
                summary: string;
            }>;
            color?: string;
            logo?: string;
        }>
        status: {
            state: string;
            period: number;
            clock: number;
            type: { shortDetail: string }
        }
    }>
}

export type StandingEntry = {
    rank: number;
    teamId: string;
    teamName: string;
    teamAbbreviation: string;
    wins: number;
    losses: number;
    winPercentage: number;
    streak: string;
    logo?: string;
    color?: string;
}

export type SportLeague = "NBA" | "NFL" | "MLB" | "NHL" | "MLS";

export type SportData = {
    events: SportEvent[];
    standings: StandingEntry[];
}

export type City = {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}
