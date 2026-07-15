import { fetchJson } from '@/shared/api/http-client';
import { apiEndpoints } from '@/shared/config/environment';
import type { SportData, SportEvent, SportLeague, StandingEntry } from '@/types/api';

export const SPORT_LABELS: Record<SportLeague, string> = {
  NBA: 'National Basketball Association', NFL: 'National Football League', MLB: 'Major League Baseball', NHL: 'National Hockey League', MLS: 'Major League Soccer',
};

const SPORT_PATHS: Record<SportLeague, string> = { NBA: 'basketball/nba', NFL: 'football/nfl', MLB: 'baseball/mlb', NHL: 'hockey/nhl', MLS: 'soccer/usa.1' };

type RawCompetitor = { id: string; score: string; homeAway: string; records?: Array<{ type: string; summary: string }>; team?: { name?: string; abbreviation?: string; color?: string; logo?: string; displayName?: string } };
type RawCompetition = { competitors?: RawCompetitor[]; status?: { state?: string; period?: number; clock?: number; type?: { shortDetail?: string } } };
type RawSportEvent = { id: string; date: string; name: string; shortName: string; status?: { type?: { name?: string; shortDetail?: string } }; competitions?: RawCompetition[] };
type RawStandingsEntry = { stats?: Array<{ name: string; value: number; summary?: string; displayValue?: string }>; team?: { id: string; name?: string; abbreviation?: string; displayName?: string; logos?: Array<{ href: string }>; color?: string } };
type RawStandingsResponse = { children?: Array<{ standings?: { entries?: RawStandingsEntry[] } }> };

export async function fetchSportData(league: SportLeague, signal?: AbortSignal): Promise<SportData> {
  const [events, standings] = await Promise.all([fetchEvents(league, signal), fetchStandings(league, signal)]);
  return { events, standings };
}

async function fetchEvents(league: SportLeague, signal?: AbortSignal): Promise<SportEvent[]> {
  const data = await fetchJson<{ events?: RawSportEvent[] }>(`${apiEndpoints.sportsScoreboard}/${getSportPath(league)}/scoreboard`, { signal });
  return (data.events ?? []).map((event) => ({
    id: event.id, date: event.date, name: event.name, shortName: event.shortName,
    status: event.status?.type?.shortDetail ?? event.status?.type?.name ?? '',
    competitions: (event.competitions ?? []).map((competition) => ({
      competitors: (competition.competitors ?? []).map((competitor) => ({
        id: competitor.id,
        name: competitor.team?.displayName ?? competitor.team?.name ?? competitor.team?.abbreviation ?? 'Unknown',
        abbreviation: competitor.team?.abbreviation ?? '', score: competitor.score,
        homeAway: competitor.homeAway === 'home' ? 'home' : 'away', records: competitor.records ?? [],
        color: competitor.team?.color, logo: competitor.team?.logo,
      })),
      status: { state: competition.status?.state ?? '', period: competition.status?.period ?? 0, clock: competition.status?.clock ?? 0, type: { shortDetail: competition.status?.type?.shortDetail ?? '' } },
    })),
  }));
}

async function fetchStandings(league: SportLeague, signal?: AbortSignal): Promise<StandingEntry[]> {
  try {
    const data = await fetchJson<RawStandingsResponse>(`${apiEndpoints.sportsStandings}/${getSportPath(league)}/standings?region=us&lang=en&contentorigin=espn&type=0&level=2&sort=winpercent%3Adesc`, { signal });
    return (data.children ?? []).flatMap((group) => group.standings?.entries ?? []).map(mapStanding).sort((a, b) => b.winPercentage - a.winPercentage).slice(0, 16).map((entry, index) => ({ ...entry, rank: index + 1 }));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    return [];
  }
}

function mapStanding(entry: RawStandingsEntry): StandingEntry {
  const value = (name: string) => entry.stats?.find((stat) => stat.name === name)?.value ?? 0;
  const streak = entry.stats?.find((stat) => stat.name === 'streak');
  return { rank: 0, teamId: entry.team?.id ?? '', teamName: entry.team?.displayName ?? entry.team?.name ?? 'Unknown', teamAbbreviation: entry.team?.abbreviation ?? '', wins: value('wins'), losses: value('losses'), winPercentage: value('winPercent'), streak: streak?.summary ?? streak?.displayValue ?? '', logo: entry.team?.logos?.[0]?.href, color: entry.team?.color ? `#${entry.team.color}` : undefined };
}

function getSportPath(league: SportLeague): string {
  return SPORT_PATHS[league];
}
