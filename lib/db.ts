import { Pool, types } from 'pg';

// SECURITY FIX: Force pg to parse TIMESTAMP without time zone (OID 1114) as UTC
// This prevents the driver from interpreting DB times as local system time
types.setTypeParser(1114, (str) => {
    return str.replace(' ', 'T') + 'Z';
});

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create a connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for Supabase
    },
});

// Helper function for queries
export async function query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}
