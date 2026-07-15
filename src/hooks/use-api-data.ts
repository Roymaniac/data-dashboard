import { useCallback, useEffect, useRef, useState } from "react"

export type FetchState<T> = {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useApiData<T>(
    fetcher: (signal: AbortSignal) => Promise<T>,
    deps: unknown[] = [],
    refreshIntervalMs?: number,
): FetchState<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refetchCount, setRefetchCount] = useState(0)
    const fetcherRef = useRef(fetcher)

    useEffect(() => {
        fetcherRef.current = fetcher
    }, [fetcher])

    const refetch = useCallback(() => setRefetchCount((c) => c + 1), [])

    useEffect(() => {
        const controller = new AbortController()

        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const result = await fetcherRef.current(controller.signal)
                if (!controller.signal.aborted) {
                    setData(result)
                    setLoading(false)
                }
            } catch (err: unknown) {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : "Failed to fetch data")
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            controller.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, refetchCount])

    useEffect(() => {
        if (!refreshIntervalMs) return
        const id = setInterval(refetch, refreshIntervalMs)
        return () => clearInterval(id)
    }, [refreshIntervalMs, refetch])

    return { data, loading, error, refetch }
}
