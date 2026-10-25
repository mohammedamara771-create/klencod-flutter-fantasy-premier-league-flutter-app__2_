import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: integer("id").primaryKey(),
  code: integer("code").notNull().default(0),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  strength: integer("strength").default(0),
  strengthOverallHome: integer("strength_overall_home").default(0),
  strengthOverallAway: integer("strength_overall_away").default(0),
  strengthAttackHome: integer("strength_attack_home").default(0),
  strengthAttackAway: integer("strength_attack_away").default(0),
  strengthDefenceHome: integer("strength_defence_home").default(0),
  strengthDefenceAway: integer("strength_defence_away").default(0),
  position: integer("position").default(0),
  played: integer("played").default(0),
  win: integer("win").default(0),
  draw: integer("draw").default(0),
  loss: integer("loss").default(0),
  points: integer("points").default(0),
});

export const players = pgTable("players", {
  id: integer("id").primaryKey(),
  code: integer("code").notNull().default(0),
  firstName: text("first_name").notNull().default(""),
  secondName: text("second_name").notNull().default(""),
  webName: text("web_name").notNull(),
  teamId: integer("team_id").notNull(),
  elementType: integer("element_type").notNull(),
  nowCost: integer("now_cost").notNull().default(0),
  costChangeStart: integer("cost_change_start").default(0),
  costChangeEvent: integer("cost_change_event").default(0),
  status: text("status").notNull().default("a"),
  news: text("news").default(""),
  chanceOfPlayingNextRound: integer("chance_next_round"),
  totalPoints: integer("total_points").default(0),
  eventPoints: integer("event_points").default(0),
  form: real("form").default(0),
  pointsPerGame: real("points_per_game").default(0),
  selectedByPercent: real("selected_by_percent").default(0),
  minutes: integer("minutes").default(0),
  starts: integer("starts").default(0),
  goalsScored: integer("goals_scored").default(0),
  assists: integer("assists").default(0),
  cleanSheets: integer("clean_sheets").default(0),
  goalsConceded: integer("goals_conceded").default(0),
  ownGoals: integer("own_goals").default(0),
  penaltiesSaved: integer("penalties_saved").default(0),
  penaltiesMissed: integer("penalties_missed").default(0),
  yellowCards: integer("yellow_cards").default(0),
  redCards: integer("red_cards").default(0),
  saves: integer("saves").default(0),
  bonus: integer("bonus").default(0),
  bps: integer("bps").default(0),
  influence: real("influence").default(0),
  creativity: real("creativity").default(0),
  threat: real("threat").default(0),
  ictIndex: real("ict_index").default(0),
  expectedGoals: real("expected_goals").default(0),
  expectedAssists: real("expected_assists").default(0),
  expectedGoalInvolvements: real("expected_goal_involvements").default(0),
  expectedGoalsConceded: real("expected_goals_conceded").default(0),
  defensiveContribution: integer("defensive_contribution").default(0),
  transfersInEvent: integer("transfers_in_event").default(0),
  transfersOutEvent: integer("transfers_out_event").default(0),
  valueSeason: real("value_season").default(0),
  epNext: real("ep_next").default(0),
  dreamteamCount: integer("dreamteam_count").default(0),
  photo: text("photo").default(""),
  penaltiesOrder: integer("penalties_order"),
});

export const events = pgTable("events", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  deadlineTime: timestamp("deadline_time", { withTimezone: true }),
  finished: boolean("finished").default(false),
  isCurrent: boolean("is_current").default(false),
  isNext: boolean("is_next").default(false),
  isPrevious: boolean("is_previous").default(false),
  averageEntryScore: integer("average_entry_score").default(0),
  highestScore: integer("highest_score"),
  mostSelected: integer("most_selected"),
  mostCaptained: integer("most_captained"),
  mostTransferredIn: integer("most_transferred_in"),
  topElement: integer("top_element"),
  transfersMade: integer("transfers_made").default(0),
});

export const fixtures = pgTable("fixtures", {
  id: integer("id").primaryKey(),
  event: integer("event"),
  kickoffTime: timestamp("kickoff_time", { withTimezone: true }),
  teamH: integer("team_h").notNull(),
  teamA: integer("team_a").notNull(),
  teamHScore: integer("team_h_score"),
  teamAScore: integer("team_a_score"),
  teamHDifficulty: integer("team_h_difficulty").default(3),
  teamADifficulty: integer("team_a_difficulty").default(3),
  finished: boolean("finished").default(false),
  started: boolean("started").default(false),
  minutes: integer("minutes").default(0),
});

export const syncLog = pgTable("sync_log", {
  id: serial("id").primaryKey(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow(),
  status: text("status").notNull().default("ok"),
  playersCount: integer("players_count").default(0),
  fixturesCount: integer("fixtures_count").default(0),
  message: text("message").default(""),
});

export const squads = pgTable("squads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("فريقي"),
  owner: text("owner").notNull().default("default"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const squadPicks = pgTable(
  "squad_picks",
  {
    id: serial("id").primaryKey(),
    squadId: integer("squad_id").notNull(),
    playerId: integer("player_id").notNull(),
    isCaptain: boolean("is_captain").default(false),
    isViceCaptain: boolean("is_vice_captain").default(false),
    purchasePrice: integer("purchase_price").default(0),
  },
  (table) => [uniqueIndex("squad_player_idx").on(table.squadId, table.playerId)],
);

export const watchlist = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull(),
    note: text("note").default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("watchlist_player_idx").on(table.playerId)],
);

export type Player = typeof players.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type GameEvent = typeof events.$inferSelect;
export type Fixture = typeof fixtures.$inferSelect;
