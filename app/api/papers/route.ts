import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data: papers, error } = await supabase
    .from("papers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching papers:", error)
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 })
  }

  return NextResponse.json(papers)
}
