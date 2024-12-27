// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import express from "npm:express@4.21.2";
import bodyParser from "npm:body-parser@1.20.3";
import cors from "npm:cors@2.8.5"
import moment from "npm:moment@2.30.1"
import { createHash } from "node:crypto"

import {
  getDistinctScores,
  getDistinctScoresPerPlayer,
  getGameById,
  getScores,
  persistScore,
  ScorePost,
} from "./db.ts";

// Create Express server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const port = 3000;

export const validateScore = async (score: ScorePost): Promise<boolean> => {
  const game = await getGameById(score.gameId)
  if (!game.strictValidation) {
    return true
  }
  const timeDifference = moment().diff(score.time, "minute")
  if (Math.abs(timeDifference) > 3) {
    console.log("Posted score time too much different from server clock", score)
    return false
  }
  const toValidate = `${score.gameId}-${score.score}-${score.player}-${score.time}-${game.secret}`
  const validationHash = createHash("md5").update(toValidate).digest("hex")

  return validationHash === score.validation
}

app.get("/game/:gameId/scores", async (req, res) => {
  const gameId = req.params["gameId"];
  const { distinct, perPlayer, count } = req.query;
  const query = distinct
    ? getDistinctScores
    : (perPlayer ? getDistinctScoresPerPlayer : getScores);
  const scores = await query(gameId, Number(count || 10));
  res.json(scores);
});

app.post("/game/:gameId/score", async (req, res, next) => {
  try {
    const gameId = req.params["gameId"]
    const { player, score, meta, validation, time } = req.body
    if (await validateScore({ gameId, player, score, meta, validation, time })) {
      await persistScore(gameId, player, score, meta)
      res.status(204).send()
    } else {
      res.status(403).send()
    }
  } catch (e) {
    next(e)
  }
})

app.listen(port, () => {
  console.log(`Express on port ${port}`);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-scores' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
