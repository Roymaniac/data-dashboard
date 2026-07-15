import type { CryptoCoin } from "@/types/api";
import { fetchJson } from "@/shared/api/http-client";
import { apiEndpoints } from "@/shared/config/environment";

const COIN_IDS = ["bitcoin", "ethereum", "solana", "cardano", "chainlink"] as const
export type CoinId = (typeof COIN_IDS)[number]

export const COIN_LABELS: Record<CoinId, string> = {
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    solana: "Solana",
    cardano: "Cardano",
    chainlink: "Chainlink",
}

export async function fetchCryptoData(signal?: AbortSignal): Promise<CryptoCoin[]> {
    const params = new URLSearchParams({
        ids: COIN_IDS.join(","),
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: "5",
        page: "1",
        sparkline: "true",
        price_change_percentage: "24h",
    })

    const json = await fetchJson<Array<{
        id: string
        symbol: string
        name: string
        current_price: number
        price_change_24h: number
        price_change_percentage_24h: number
        market_cap: number
        total_volume: number
        sparkline_in_7d?: { price: number[] }
        image: string
    }>>(`${apiEndpoints.crypto}/coins/markets?${params}`, { signal })

    return json.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        currentPrice: coin.current_price,
        priceChange24h: coin.price_change_24h,
        priceChangePercentage24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        totalVolume: coin.total_volume,
        sparkline: coin.sparkline_in_7d?.price ?? [],
        history: [],
        image: coin.image,
    }))
}

export async function fetchCoinHistory(coinId: string, days = 7, signal?: AbortSignal): Promise<Array<{ date: string; price: number }>> {
    const json = await fetchJson<{ prices: Array<[number, number]> }>(
        `${apiEndpoints.crypto}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
        { signal },
    )
    return json.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toISOString(),
        price,
    }))
}
