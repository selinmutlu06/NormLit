import useSWR from "swr"
import { Paper } from "@/lib/types"

async function fetchPapers(): Promise<Paper[]> {
  const response = await fetch("/api/papers")
  if (!response.ok) {
    throw new Error("Failed to fetch papers")
  }
  return response.json()
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
