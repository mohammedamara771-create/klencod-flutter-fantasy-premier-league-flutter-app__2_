import { db } from "@/db";
import { events, fixtures, players, syncLog, teams } from "@/db/schema";
import { getBootstrap, getFixtures } from "@/lib/fpl";
import { desc, sql } from "drizzle-orm";

const num = (value: string | number | null | undefined) => {
  const parsed = typeof value === "number" ? value : parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

export type SyncResult = {
  ok: boolean;
  players: number;
  teams: number;
  fixtures: number;
  events: number;
  message: string;
  syncedAt: string;
};

export async function syncFplData(): Promise<SyncResult> {
  const [bootstrap, fixtureList] = await Promise.all([
    getBootstrap(),
    getFixtures(),
  ]);

  const teamRows = bootstrap.teams.map((t) => ({
    id: t.id,
    code: t.code ?? 0,
    name: t.name,
    shortName: t.short_name,
    strength: t.strength ?? 0,
    strengthOverallHome: t.strength_overall_home ?? 0,
    strengthOverallAway: t.strength_overall_away ?? 0,
    strengthAttackHome: t.strength_attack_home ?? 0,
    strengthAttackAway: t.strength_attack_away ?? 0,
    strengthDefenceHome: t.strength_defence_home ?? 0,
    strengthDefenceAway: t.strength_defence_away ?? 0,
    position: t.position ?? 0,
    played: t.played ?? 0,
    win: t.win ?? 0,
    draw: t.draw ?? 0,
    loss: t.loss ?? 0,
    points: t.points ?? 0,
  }));

  await db
    .insert(teams)
    .values(teamRows)
    .onConflictDoUpdate({
      target: teams.id,
      set: {
        name: sql`excluded.name`,
        shortName: sql`excluded.short_name`,
        code: sql`excluded.code`,
        strength: sql`excluded.strength`,
        strengthOverallHome: sql`excluded.strength_overall_home`,
        strengthOverallAway: sql`excluded.strength_overall_away`,
        strengthAttackHome: sql`excluded.strength_attack_home`,
        strengthAttackAway: sql`excluded.strength_attack_away`,
        strengthDefenceHome: sql`excluded.strength_defence_home`,
        strengthDefenceAway: sql`excluded.strength_defence_away`,
        position: sql`excluded.position`,
        played: sql`excluded.played`,
        win: sql`excluded.win`,
        draw: sql`excluded.draw`,
        loss: sql`excluded.loss`,
        points: sql`excluded.points`,
      },
    });

  const playerRows = bootstrap.elements.map((p) => ({
    id: p.id,
    code: p.code ?? 0,
    firstName: p.first_name ?? "",
    secondName: p.second_name ?? "",
    webName: p.web_name,
    teamId: p.team,
    elementType: p.element_type,
    nowCost: p.now_cost,
    costChangeStart: p.cost_change_start ?? 0,
    costChangeEvent: p.cost_change_event ?? 0,
    status: p.status ?? "a",
    news: p.news ?? "",
    chanceOfPlayingNextRound: p.chance_of_playing_next_round,
    totalPoints: p.total_points ?? 0,
    eventPoints: p.event_points ?? 0,
    form: num(p.form),
    pointsPerGame: num(p.points_per_game),
    selectedByPercent: num(p.selected_by_percent),
    minutes: p.minutes ?? 0,
    starts: p.starts ?? 0,
    goalsScored: p.goals_scored ?? 0,
    assists: p.assists ?? 0,
    cleanSheets: p.clean_sheets ?? 0,
    goalsConceded: p.goals_conceded ?? 0,
    ownGoals: p.own_goals ?? 0,
    penaltiesSaved: p.penalties_saved ?? 0,
    penaltiesMissed: p.penalties_missed ?? 0,
    yellowCards: p.yellow_cards ?? 0,
    redCards: p.red_cards ?? 0,
    saves: p.saves ?? 0,
    bonus: p.bonus ?? 0,
    bps: p.bps ?? 0,
    influence: num(p.influence),
    creativity: num(p.creativity),
    threat: num(p.threat),
    ictIndex: num(p.ict_index),
    expectedGoals: num(p.expected_goals),
    expectedAssists: num(p.expected_assists),
    expectedGoalInvolvements: num(p.expected_goal_involvements),
    expectedGoalsConceded: num(p.expected_goals_conceded),
    defensiveContribution: p.defensive_contribution ?? 0,
    transfersInEvent: p.transfers_in_event ?? 0,
    transfersOutEvent: p.transfers_out_event ?? 0,
    valueSeason: num(p.value_season),
    epNext: num(p.ep_next),
    dreamteamCount: p.dreamteam_count ?? 0,
    photo: p.photo ?? "",
    penaltiesOrder: p.penalties_order,
  }));

  for (let i = 0; i < playerRows.length; i += 200) {
    const chunk = playerRows.slice(i, i + 200);
    await db
      .insert(players)
      .values(chunk)
      .onConflictDoUpdate({
        target: players.id,
        set: {
          webName: sql`excluded.web_name`,
          firstName: sql`excluded.first_name`,
          secondName: sql`excluded.second_name`,
          teamId: sql`excluded.team_id`,
          elementType: sql`excluded.element_type`,
          nowCost: sql`excluded.now_cost`,
          costChangeStart: sql`excluded.cost_change_start`,
          costChangeEvent: sql`excluded.cost_change_event`,
          status: sql`excluded.status`,
          news: sql`excluded.news`,
          chanceOfPlayingNextRound: sql`excluded.chance_next_round`,
          totalPoints: sql`excluded.total_points`,
          eventPoints: sql`excluded.event_points`,
          form: sql`excluded.form`,
          pointsPerGame: sql`excluded.points_per_game`,
          selectedByPercent: sql`excluded.selected_by_percent`,
          minutes: sql`excluded.minutes`,
          starts: sql`excluded.starts`,
          goalsScored: sql`excluded.goals_scored`,
          assists: sql`excluded.assists`,
          cleanSheets: sql`excluded.clean_sheets`,
          goalsConceded: sql`excluded.goals_conceded`,
          ownGoals: sql`excluded.own_goals`,
          penaltiesSaved: sql`excluded.penalties_saved`,
          penaltiesMissed: sql`excluded.penalties_missed`,
          yellowCards: sql`excluded.yellow_cards`,
          redCards: sql`excluded.red_cards`,
          saves: sql`excluded.saves`,
          bonus: sql`excluded.bonus`,
          bps: sql`excluded.bps`,
          influence: sql`excluded.influence`,
          creativity: sql`excluded.creativity`,
          threat: sql`excluded.threat`,
          ictIndex: sql`excluded.ict_index`,
          expectedGoals: sql`excluded.expected_goals`,
          expectedAssists: sql`excluded.expected_assists`,
          expectedGoalInvolvements: sql`excluded.expected_goal_involvements`,
          expectedGoalsConceded: sql`excluded.expected_goals_conceded`,
          defensiveContribution: sql`excluded.defensive_contribution`,
          transfersInEvent: sql`excluded.transfers_in_event`,
          transfersOutEvent: sql`excluded.transfers_out_event`,
          valueSeason: sql`excluded.value_season`,
          epNext: sql`excluded.ep_next`,
          dreamteamCount: sql`excluded.dreamteam_count`,
          photo: sql`excluded.photo`,
          penaltiesOrder: sql`excluded.penalties_order`,
        },
      });
  }

  const eventRows = bootstrap.events.map((e) => ({
    id: e.id,
    name: e.name,
    deadlineTime: e.deadline_time ? new Date(e.deadline_time) : null,
    finished: e.finished ?? false,
    isCurrent: e.is_current ?? false,
    isNext: e.is_next ?? false,
    isPrevious: e.is_previous ?? false,
    averageEntryScore: e.average_entry_score ?? 0,
    highestScore: e.highest_score,
    mostSelected: e.most_selected,
    mostCaptained: e.most_captained,
    mostTransferredIn: e.most_transferred_in,
    topElement: e.top_element,
    transfersMade: e.transfers_made ?? 0,
  }));

  await db
    .insert(events)
    .values(eventRows)
    .onConflictDoUpdate({
      target: events.id,
      set: {
        name: sql`excluded.name`,
        deadlineTime: sql`excluded.deadline_time`,
        finished: sql`excluded.finished`,
        isCurrent: sql`excluded.is_current`,
        isNext: sql`excluded.is_next`,
        isPrevious: sql`excluded.is_previous`,
        averageEntryScore: sql`excluded.average_entry_score`,
        highestScore: sql`excluded.highest_score`,
        mostSelected: sql`excluded.most_selected`,
        mostCaptained: sql`excluded.most_captained`,
        mostTransferredIn: sql`excluded.most_transferred_in`,
        topElement: sql`excluded.top_element`,
        transfersMade: sql`excluded.transfers_made`,
      },
    });

  const fixtureRows = fixtureList.map((f) => ({
    id: f.id,
    event: f.event,
    kickoffTime: f.kickoff_time ? new Date(f.kickoff_time) : null,
    teamH: f.team_h,
    teamA: f.team_a,
    teamHScore: f.team_h_score,
    teamAScore: f.team_a_score,
    teamHDifficulty: f.team_h_difficulty ?? 3,
    teamADifficulty: f.team_a_difficulty ?? 3,
    finished: f.finished ?? false,
    started: f.started ?? false,
    minutes: f.minutes ?? 0,
  }));

  for (let i = 0; i < fixtureRows.length; i += 200) {
    const chunk = fixtureRows.slice(i, i + 200);
    await db
      .insert(fixtures)
      .values(chunk)
      .onConflictDoUpdate({
        target: fixtures.id,
        set: {
          event: sql`excluded.event`,
          kickoffTime: sql`excluded.kickoff_time`,
          teamH: sql`excluded.team_h`,
          teamA: sql`excluded.team_a`,
          teamHScore: sql`excluded.team_h_score`,
          teamAScore: sql`excluded.team_a_score`,
          teamHDifficulty: sql`excluded.team_h_difficulty`,
          teamADifficulty: sql`excluded.team_a_difficulty`,
          finished: sql`excluded.finished`,
          started: sql`excluded.started`,
          minutes: sql`excluded.minutes`,
        },
      });
  }

  const result: SyncResult = {
    ok: true,
    players: playerRows.length,
    teams: teamRows.length,
    fixtures: fixtureRows.length,
    events: eventRows.length,
    message: "تمت المزامنة مع الواجهة الرسمية بنجاح",
    syncedAt: new Date().toISOString(),
  };

  await db.insert(syncLog).values({
    status: "ok",
    playersCount: playerRows.length,
    fixturesCount: fixtureRows.length,
    message: result.message,
  });

  return result;
}

export async function getLastSync() {
  const rows = await db
    .select()
    .from(syncLog)
    .orderBy(desc(syncLog.syncedAt))
    .limit(1);
  return rows[0] ?? null;
}

/** يزامن البيانات تلقائياً إذا كانت قاعدة البيانات فارغة أو قديمة */
export async function ensureData(maxAgeMinutes = 60) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(players);

  if (count === 0) {
    try {
      return await syncFplData();
    } catch (error) {
      console.error("sync failed", error);
      return null;
    }
  }

  const last = await getLastSync();
  const ageMs = last?.syncedAt
    ? Date.now() - new Date(last.syncedAt).getTime()
    : Infinity;
  if (ageMs > maxAgeMinutes * 60 * 1000) {
    try {
      return await syncFplData();
    } catch (error) {
      console.error("refresh failed", error);
      return null;
    }
  }
  return null;
}
