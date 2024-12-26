CREATE TABLE IF NOT EXISTS games (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  secret TEXT NOT NULL,
  strict_validation BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS scores (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  player TEXT NOT NULL,
  score BIGINT NOT NULL,
  game_id UUID REFERENCES games(id),
  meta JSONB
);

CREATE INDEX IF NOT EXISTS scores_time_idx ON scores (time);
CREATE INDEX IF NOT EXISTS scores_player_idx ON scores (player);
CREATE INDEX IF NOT EXISTS scores_score_idx ON scores (score);
CREATE INDEX IF NOT EXISTS scores_game_id_idx ON scores (game_id);
