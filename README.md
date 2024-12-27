# Highscore

A Supabase app for storing scoreboards for gamejam games. One server instance can serve multiple games and store arbitrary metadata with scores. API-only, doesn't come with any GUI. Supports posting the scores over HTTP as JSON or form data, metadata supported only on JSON. Supports simple verification of posted scores to avoid someone just spamming whatever score they want.

## Example games

- [Conway's Garden Life](https://www.joonamo.com/games/garden)
- [Unstables](https://www.joonamo.com/games/unstables)

## Adding new games

Adding a new game requires game info to be added in the `games`-table. Connect to your database with your favourite database browser and create new row with at least `name` field filled. If you want to use strict validation, provide validation secret in `secret` field and set `strict_validation` `TRUE`.

## Clients

Example clients are provided in `example-clients` [folder of the old repo](https://github.com/joonamo/highscore/tree/master/example-clients). The server works with rest API, so creating new clients on different platforms shouldn't be too difficult.
