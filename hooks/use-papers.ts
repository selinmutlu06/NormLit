import useSWR from "swr"
import { Paper } from "@/lib/types"

async function fetchPapers(): Promise<Paper[]> {
  const response = await fetch("/api/papers")
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch papers")
  }
  return data
}

export function usePapers() {
  const { data, error, isLoading, mutate } = useSWR<Paper[]>(
    "/api/papers",
    fetchPapers
  )

  return {
    papers: data || [],
    error,
    isLoading,
    mutate,
  }
}
