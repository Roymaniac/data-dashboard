export class HttpError extends Error {
  public readonly status: number
  public readonly url: string

  constructor(
    message: string,
    status: number,
    url: string,
  ) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.url = url
  }
}

type FetchJsonOptions = Omit<RequestInit, "body" | "method"> & {
  signal?: AbortSignal
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new HttpError(`Request failed with status ${response.status}`, response.status, url)
  }

  return response.json() as Promise<T>
}
