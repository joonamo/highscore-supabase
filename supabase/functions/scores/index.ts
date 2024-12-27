// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import express from "npm:express@4.21.2";
import bodyParser from "npm:body-parser@1.20.3";
import cors from "npm:cors@2.8.5"

import {
  getDistinctScores,
  getDistinctScoresPerPlayer,
  getScores,
} from "./db.ts";

// Create Express server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const port = 3000;

app.get("/scores/:gameId/scores", async (req, res) => {
  const gameId = req.params["gameId"];
  const { distinct, perPlayer, count } = req.query;
  const query = distinct
    ? getDistinctScores
    : (perPlayer ? getDistinctScoresPerPlayer : getScores);
  const scores = await query(gameId, Number(count || 10));
  res.json(scores);
});

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
