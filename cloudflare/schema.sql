-- Ball Battle analytics · run once in Cloudflare D1 Console
CREATE TABLE IF NOT EXISTS game_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view','match_start','match_end')),
  world TEXT NOT NULL DEFAULT '',
  season TEXT NOT NULL DEFAULT '',
  ball TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_game_events_created ON game_events(created_at);
CREATE INDEX IF NOT EXISTS idx_game_events_type_created ON game_events(event_type,created_at);
