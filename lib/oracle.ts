// ============================================================================
// Project: Kinder Pets - Oracle Database Connection Pool & Adapter
// Target: Oracle Database 19c / 21c / 23ai Free (Thin Mode)
// Environment Variables:
//   - ORACLE_USER (default: KINDERPETS)
//   - ORACLE_PASSWORD
//   - ORACLE_CONNECT_STRING (default: localhost:1521/FREEPDB1)
// ============================================================================

import oracledb from 'oracledb';

// Global singleton for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __oracle_pool: oracledb.Pool | undefined;
}

// Configure oracledb default fetch format
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export async function getOraclePool(): Promise<oracledb.Pool> {
  if (!global.__oracle_pool) {
    const user = process.env.ORACLE_USER || 'KINDERPETS';
    const password = process.env.ORACLE_PASSWORD;
    const connectString = process.env.ORACLE_CONNECT_STRING || 'localhost:1521/FREEPDB1';

    if (!password) {
      throw new Error(
        'Missing ORACLE_PASSWORD. Please configure ORACLE_PASSWORD in your .env.local file or environment.'
      );
    }

    try {
      global.__oracle_pool = await oracledb.createPool({
        user,
        password,
        connectString,
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 60,
      });
      console.log(`[Oracle] Connected to pool: ${user}@${connectString}`);
    } catch (err: any) {
      console.error('[Oracle] Failed to create connection pool:', err);
      throw err;
    }
  }

  return global.__oracle_pool;
}

export async function withConnection<T>(
  callback: (conn: oracledb.Connection) => Promise<T>
): Promise<T> {
  const pool = await getOraclePool();
  const conn = await pool.getConnection();
  try {
    return await callback(conn);
  } catch (err: any) {
    throw cleanOracleError(err);
  } finally {
    try {
      await conn.close();
    } catch (closeErr) {
      console.error('[Oracle] Error closing connection:', closeErr);
    }
  }
}

/**
 * Transforms Oracle uppercase column names into lowercase object keys
 * to match TypeScript interfaces (e.g., SHELTER_ID -> shelter_id).
 */
export function toLowerKeys<T = any>(data: any): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map((item) => toLowerKeys(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const normalized: any = {};
    for (const key of Object.keys(data)) {
      normalized[key.toLowerCase()] = toLowerKeys(data[key]);
    }
    return normalized as T;
  }
  return data as T;
}

/**
 * Extracts a user-friendly error message from Oracle ORA-XXXXX exceptions,
 * removing stack traces and line numbers (e.g. ORA-06512).
 */
export function cleanOracleError(err: any): Error {
  if (!err) return new Error('Unknown database error');
  const msg = typeof err === 'string' ? err : err.message || String(err);

  // Extract primary ORA message line
  const lines = msg.split('\n');
  const primaryLine = lines.find((l: string) => l.startsWith('ORA-')) || lines[0];

  // Strip ORA-XXXXX code if desired, or present clean line
  const cleanMsg = primaryLine.replace(/Help: https:\/\/.*$/, '').trim();
  return new Error(cleanMsg || msg);
}
