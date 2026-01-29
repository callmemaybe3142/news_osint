import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("Fetching event filter options...");

        // Fetch actors (excluding created_at)
        const actorsResult = await query(
            `SELECT actor_id, actor_name 
       FROM acled_actors 
       ORDER BY actor_name ASC`
        );
        console.log(`Fetched ${actorsResult.rows?.length || 0} actors`);

        // Fetch interactions (excluding created_at)
        const interactionsResult = await query(
            `SELECT code, title 
       FROM acled_interactions 
       ORDER BY code ASC`
        );
        console.log(`Fetched ${interactionsResult.rows?.length || 0} interactions`);

        // Fetch locations (excluding created_at)
        const locationsResult = await query(
            `SELECT DISTINCT admin1, admin2, admin3 
       FROM acled_locations 
       WHERE admin1 IS NOT NULL
       ORDER BY admin1, admin2, admin3`
        );
        console.log(`Fetched ${locationsResult.rows?.length || 0} locations`);

        // Fetch event types (excluding created_at)
        const eventTypesResult = await query(
            `SELECT event_type, sub_event_type 
       FROM acled_event_types 
       ORDER BY event_type, sub_event_type`
        );
        console.log(`Fetched ${eventTypesResult.rows?.length || 0} event types`);

        const options = {
            actors: actorsResult.rows || [],
            interactions: interactionsResult.rows || [],
            locations: locationsResult.rows || [],
            eventTypes: eventTypesResult.rows || [],
        };

        console.log("Successfully prepared filter options");
        return NextResponse.json(options);
    } catch (error) {
        console.error("Error fetching event filter options:", error);
        // Return empty arrays instead of error to prevent UI breaking
        return NextResponse.json({
            actors: [],
            interactions: [],
            locations: [],
            eventTypes: [],
        });
    }
}
