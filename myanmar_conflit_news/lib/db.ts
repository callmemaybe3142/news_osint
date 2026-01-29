import { Pool } from "pg";

// Create a singleton pool instance
let pool: Pool | null = null;

/**
 * Get PostgreSQL connection pool
 */
export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 60000,
            connectionTimeoutMillis: 30000,
        });
    }
    return pool;
}

/**
 * Execute a query with error handling
 */
export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<{ rows: T[] }> {
    const pool = getPool();
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}

/**
 * Close the pool (useful for cleanup)
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
