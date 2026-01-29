import { NextResponse } from "next/server";
import { getFilterOptions } from "@/lib/aggregated-service";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    const options = await getFilterOptions();
    return NextResponse.json(options);
}
