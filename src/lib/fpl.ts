/**
 * عميل واجهة فانتازي الدوري الإنجليزي الرسمية
 * Official Fantasy Premier League API client
 * https://fantasy.premierleague.com/api/
 */

export const FPL_BASE = "https://fantasy.premierleague.com/api";

export type FplElement = {
  id: number;
  code: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  cost_change_start: number;
  cost_change_event: number;
  status: string;
  news: string;
  chance_of_playing_next_round: number | null;
  total_points: number;
  event_points: number;
  form: string;
  points_per_game: string;
  selected_by_percent: string;
  minutes: number;
  starts: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  defensive_contribution: number;
  transfers_in_event: number;
  transfers_out_event: number;
  value_season: string;
  ep_next: string;
  dreamteam_count: number;
  photo: string;
  penalties_order: number | null;
};

export type FplTeam = {
  id: number;
  code: number;
  name: string;
  short_name: string;
  strength: number | null;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  position: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  points: number;
};

export type FplEvent = {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  is_previous: boolean;
  average_entry_score: number;
  highest_score: number | null;
  most_selected: number | null;
  most_captained: number | null;
  most_transferred_in: number | null;
  top_element: number | null;
  transfers_made: number;
};

export type FplBootstrap = {
  events: FplEvent[];
  teams: FplTeam[];
  elements: FplElement[];
  element_types: {
    id: number;
    singular_name: string;
    singular_name_short: string;
    plural_name: string;
  }[];
  total_players: number;
};

export type FplFixture = {
  id: number;
  event: number | null;
  kickoff_time: string | null;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  team_h_difficulty: number;
  team_a_difficulty: number;
  finished: boolean;
  started: boolean | null;
  minutes: number;
};

export type FplElementSummary = {
  fixtures: {
    id: number;
    event: number | null;
    event_name: string | null;
    team_h: number;
    team_a: number;
    is_home: boolean;
    difficulty: number;
    kickoff_time: string | null;
  }[];
  history: {
    element: number;
    fixture: number;
    opponent_team: number;
    total_points: number;
    was_home: boolean;
    kickoff_time: string;
    round: number;
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    expected_goals: string;
    expected_assists: string;
    value: number;
    selected: number;
    transfers_balance: number;
    team_h_score: number | null;
    team_a_score: number | null;
  }[];
  history_past: {
    season_name: string;
    total_points: number;
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    start_cost: number;
    end_cost: number;
  }[];
};

export type FplEntry = {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number | null;
  summary_event_points: number;
  summary_event_rank: number | null;
  current_event: number | null;
  last_deadline_bank: number | null;
  last_deadline_value: number | null;
  last_deadline_total_transfers: number | null;
};

export type FplEntryHistory = {
  current: {
    event: number;
    points: number;
    total_points: number;
    rank: number | null;
    overall_rank: number | null;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  }[];
  past: { season_name: string; total_points: number; rank: number }[];
  chips: { name: string; event: number }[];
};

async function fplFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${FPL_BASE}${path}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/json",
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`فشل الاتصال بواجهة FPL (${path}) — الحالة ${res.status}`);
  }
  return (await res.json()) as T;
}

export const getBootstrap = () =>
  fplFetch<FplBootstrap>("/bootstrap-static/", 300);
export const getFixtures = () => fplFetch<FplFixture[]>("/fixtures/", 300);
export const getElementSummary = (id: number) =>
  fplFetch<FplElementSummary>(`/element-summary/${id}/`, 300);
export const getEntry = (id: number) => fplFetch<FplEntry>(`/entry/${id}/`, 60);
export const getEntryHistory = (id: number) =>
  fplFetch<FplEntryHistory>(`/entry/${id}/history/`, 60);
export const getEventLive = (eventId: number) =>
  fplFetch<{ elements: { id: number; stats: Record<string, number> }[] }>(
    `/event/${eventId}/live/`,
    60,
  );
