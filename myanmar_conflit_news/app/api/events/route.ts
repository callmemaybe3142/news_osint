import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/event-service";
import { EventFilters } from "@/lib/event-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse filters from query parameters
        const filters: EventFilters = {
            startDate: searchParams.get("startDate") || undefined,
            endDate: searchParams.get("endDate") || undefined,
            actorId: searchParams.get("actorId") ? parseInt(searchParams.get("actorId")!) : undefined,
            interactionCode: searchParams.get("interactionCode") || undefined,
            admin1: searchParams.get("admin1") || undefined,
            admin2: searchParams.get("admin2") || undefined,
            admin3: searchParams.get("admin3") || undefined,
            eventType: searchParams.get("eventType") || undefined,
            subEventType: searchParams.get("subEventType") || undefined,
            searchText: searchParams.get("searchText") || undefined,
            searchOperator: (searchParams.get("searchOperator") as 'and' | 'or') || 'and',
            page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
            limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
        };

        const result = await getEvents(filters);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}
