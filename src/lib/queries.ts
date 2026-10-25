import { db } from "@/db";
import {
  events,
  fixtures,
  players,
  squadPicks,
  squads,
  teams,
  watchlist,
} from "@/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export type PlayerRow = typeof players.$inferSelect & {
  teamName: string;
  teamShort: string;
  teamCode: number;
};

const SORTABLE = {
  totalPoints: players.totalPoints,
  form: players.form,
  nowCost: players.nowCost,
  selectedByPercent: players.selectedByPercent,
  pointsPerGame: players.pointsPerGame,
  goalsScored: players.goalsScored,
  assists: players.assists,
  cleanSheets: players.cleanSheets,
  bonus: players.bonus,
  bps: players.bps,
  ictIndex: players.ictIndex,
  expectedGoals: players.expectedGoals,
  expectedAssists: players.expectedAssists,
  expectedGoalInvolvements: players.expectedGoalInvolvements,
  minutes: players.minutes,
  valueSeason: players.valueSeason,
  transfersInEvent: players.transfersInEvent,
  defensiveContribution: players.defensiveContribution,
  epNext: players.epNext,
  saves: players.saves,
} as const;

export type SortKey = keyof typeof SORTABLE;

export type PlayerFilters = {
  search?: string;
  position?: number;
  teamId?: number;
  maxCost?: number;
  minCost?: number;
  minMinutes?: number;
  availableOnly?: boolean;
  sort?: SortKey;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

const baseSelect = getTableColumns(players);

export async function listPlayers(filters: PlayerFilters = {}) {
  const conditions: SQL[] = [];
  if (filters.search) {
    const term = `%${filters.search}%`;
    const clause = or(
      ilike(players.webName, term),
      ilike(players.firstName, term),
      ilike(players.secondName, term),
    );
    if (clause) conditions.push(clause);
  }
  if (filters.position) conditions.push(eq(players.elementType, filters.position));
  if (filters.teamId) conditions.push(eq(players.teamId, filters.teamId));
  if (filters.maxCost) conditions.push(lte(players.nowCost, filters.maxCost));
  if (filters.minCost) conditions.push(gte(players.nowCost, filters.minCost));
  if (filters.minMinutes)
    conditions.push(gte(players.minutes, filters.minMinutes));
  if (filters.availableOnly) conditions.push(eq(players.status, "a"));

  const sortCol = SORTABLE[filters.sort ?? "totalPoints"] ?? players.totalPoints;
  const orderBy = filters.dir === "asc" ? asc(sortCol) : desc(sortCol);

  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      ...baseSelect,
      teamName: teams.name,
      teamShort: teams.shortName,
      teamCode: teams.code,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(where)
    .orderBy(orderBy, desc(players.totalPoints))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(players)
    .where(where);

  return { rows: rows as PlayerRow[], total: count };
}

export async function getPlayer(id: number) {
  const rows = await db
    .select({
      ...baseSelect,
      teamName: teams.name,
      teamShort: teams.shortName,
      teamCode: teams.code,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(eq(players.id, id))
    .limit(1);
  return (rows[0] as PlayerRow | undefined) ?? null;
}

export async function getPlayersByIds(ids: number[]) {
  if (!ids.length) return [] as PlayerRow[];
  const rows = await db
    .select({
      ...baseSelect,
      teamName: teams.name,
      teamShort: teams.shortName,
      teamCode: teams.code,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(inArray(players.id, ids));
  return rows as PlayerRow[];
}

export const listTeams = () => db.select().from(teams).orderBy(asc(teams.name));

export const listEvents = () => db.select().from(events).orderBy(asc(events.id));

export async function getCurrentEvent() {
  const rows = await db
    .select()
    .from(events)
    .where(or(eq(events.isCurrent, true), eq(events.isNext, true)))
    .orderBy(asc(events.id))
    .limit(2);
  return {
    current: rows.find((r) => r.isCurrent) ?? null,
    next: rows.find((r) => r.isNext) ?? rows[0] ?? null,
  };
}

export async function listFixtures(eventId?: number) {
  const where = eventId ? eq(fixtures.event, eventId) : undefined;
  return db
    .select()
    .from(fixtures)
    .where(where)
    .orderBy(asc(fixtures.kickoffTime));
}

export async function upcomingFixturesByTeam(fromEvent: number, count = 5) {
  const rows = await db
    .select()
    .from(fixtures)
    .where(and(gte(fixtures.event, fromEvent), eq(fixtures.finished, false)))
    .orderBy(asc(fixtures.event));

  const map = new Map<
    number,
    { event: number | null; opponent: number; home: boolean; difficulty: number }[]
  >();
  for (const f of rows) {
    const home = map.get(f.teamH) ?? [];
    if (home.length < count)
      home.push({
        event: f.event,
        opponent: f.teamA,
        home: true,
        difficulty: f.teamHDifficulty ?? 3,
      });
    map.set(f.teamH, home);

    const away = map.get(f.teamA) ?? [];
    if (away.length < count)
      away.push({
        event: f.event,
        opponent: f.teamH,
        home: false,
        difficulty: f.teamADifficulty ?? 3,
      });
    map.set(f.teamA, away);
  }
  return map;
}

export async function overviewStats() {
  const top = (sort: SortKey, limit = 8) =>
    listPlayers({ sort, limit }).then((r) => r.rows);

  const [
    topPoints,
    topForm,
    topValue,
    mostOwned,
    topXgi,
    topBonus,
    transfersIn,
    totals,
  ] = await Promise.all([
    top("totalPoints"),
    top("form"),
    top("valueSeason"),
    top("selectedByPercent"),
    top("expectedGoalInvolvements"),
    top("bonus"),
    top("transfersInEvent"),
    db
      .select({
        playersCount: sql<number>`count(*)::int`,
        avgCost: sql<number>`coalesce(avg(${players.nowCost}),0)`,
        goals: sql<number>`coalesce(sum(${players.goalsScored}),0)::int`,
        assists: sql<number>`coalesce(sum(${players.assists}),0)::int`,
      })
      .from(players),
  ]);

  const differentials = await db
    .select({
      ...baseSelect,
      teamName: teams.name,
      teamShort: teams.shortName,
      teamCode: teams.code,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(and(lte(players.selectedByPercent, 7), gte(players.form, 1)))
    .orderBy(desc(players.form))
    .limit(8);

  const risers = await db
    .select({
      ...baseSelect,
      teamName: teams.name,
      teamShort: teams.shortName,
      teamCode: teams.code,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .orderBy(desc(players.costChangeStart))
    .limit(6);

  const fallers = await db
    .select({
      ...baseSelect,
      teamName: teams.name,
      teamShort: teams.shortName,
      teamCode: teams.code,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .orderBy(asc(players.costChangeStart))
    .limit(6);

  const injuries = await db
    .select({
      ...baseSelect,
      teamName: teams.name,
      teamShort: teams.shortName,
      teamCode: teams.code,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(and(sql`${players.status} <> 'a'`, gte(players.selectedByPercent, 1)))
    .orderBy(desc(players.selectedByPercent))
    .limit(10);

  return {
    topPoints: topPoints as PlayerRow[],
    topForm: topForm as PlayerRow[],
    topValue: topValue as PlayerRow[],
    mostOwned: mostOwned as PlayerRow[],
    topXgi: topXgi as PlayerRow[],
    topBonus: topBonus as PlayerRow[],
    transfersIn: transfersIn as PlayerRow[],
    differentials: differentials as PlayerRow[],
    risers: risers as PlayerRow[],
    fallers: fallers as PlayerRow[],
    injuries: injuries as PlayerRow[],
    totals: totals[0],
  };
}

/* ------------------------- التشكيلة وقائمة المتابعة ------------------------- */

export async function getOrCreateSquad(owner = "default") {
  const existing = await db
    .select()
    .from(squads)
    .where(eq(squads.owner, owner))
    .limit(1);
  if (existing[0]) return existing[0];
  const created = await db.insert(squads).values({ owner }).returning();
  return created[0];
}

export async function getSquadWithPlayers(owner = "default") {
  const squad = await getOrCreateSquad(owner);
  const picks = await db
    .select()
    .from(squadPicks)
    .where(eq(squadPicks.squadId, squad.id));
  const ids = picks.map((p) => p.playerId);
  const playerRows = await getPlayersByIds(ids);
  const merged = picks
    .map((pick) => {
      const player = playerRows.find((p) => p.id === pick.playerId);
      return player ? { ...pick, player } : null;
    })
    .filter((v): v is { player: PlayerRow } & typeof picks[number] => v !== null);
  return { squad, picks: merged };
}

export async function getWatchlist() {
  const rows = await db.select().from(watchlist).orderBy(desc(watchlist.createdAt));
  const playerRows = await getPlayersByIds(rows.map((r) => r.playerId));
  return rows
    .map((row) => {
      const player = playerRows.find((p) => p.id === row.playerId);
      return player ? { ...row, player } : null;
    })
    .filter((v): v is { player: PlayerRow } & typeof rows[number] => v !== null);
}
