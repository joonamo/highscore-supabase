import * as postgres from "https://deno.land/x/postgres@v0.19.3/mod.ts";

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!;

// Create a database pool with three connections that are lazily established
const dbPool = new postgres.Pool(databaseUrl, 3, true);

export interface ScoreEntry {
  id: string;
  time: string;
  player: string;
  score: number;
  gameId: string;
  meta: unknown;
}

export interface ScorePost extends Omit<ScoreEntry, "id"> {
  validation: string;
}

interface ScoreEntryFromDb extends Omit<ScoreEntry, "score"> {
  score: string;
  // time: unknown
}

const fixDbOutput = (values: ScoreEntryFromDb[]): ScoreEntry[] =>
  values.map((v) => ({
    ...v,
    score: Number(v.score),
    // time: String(v.time)
  }));

export const getScores = async (
  gameId: string,
  numScores: number = 10,
): Promise<ScoreEntry[]> => {
  const connection = await dbPool.connect();

  const result = await connection.queryObject<ScoreEntryFromDb>`
    SELECT id, time, player, score, game_id as "gameId", meta
    FROM scores
    WHERE game_id = ${gameId}
    ORDER BY score DESC
    LIMIT ${numScores};
  `;

  return fixDbOutput(result.rows);
};

export const getDistinctScores = async (
  gameId: string,
  numScores: number = 10,
): Promise<ScoreEntry[]> => {
  const connection = await dbPool.connect();

  const result = await connection.queryObject<ScoreEntryFromDb>`
    SELECT id, score, time, meta, player
    FROM (
      SELECT distinct on (a.player) player as distinctPlayer, *
      FROM (
        SELECT distinct on (score) score, player, id, time, game_id as "gameId", meta
        FROM scores
        WHERE game_id = ${gameId}
        ORDER BY score DESC, player desc, time ASC
        LIMIT 10000
      ) a
      ORDER BY distinctPlayer DESC, score DESC
    ) b
    ORDER BY score DESC
    LIMIT ${numScores};
    `;

  return fixDbOutput(result.rows);
};

export const getDistinctScoresPerPlayer = async (
  gameId: string,
  numScores: number = 10,
): Promise<ScoreEntry[]> => {
  const connection = await dbPool.connect();

  const result = await connection.queryObject<ScoreEntryFromDb>`
    select score, player, id, time, game_id as "gameId", meta from (
      select distinct on (player) *
      from scores
      WHERE game_id = ${gameId}
      order by player, score desc
    ) a
    order by score desc, time asc
    limit ${numScores};
  `;
  return fixDbOutput(result.rows);
};
