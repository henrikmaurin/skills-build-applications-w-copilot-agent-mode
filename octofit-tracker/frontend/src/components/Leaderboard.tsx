import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardItem = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardItem>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    itemsKey="leaderboard"
    emptyMessage="No leaderboard rankings yet."
    renderItems={(entries) => <ol className="list-group list-group-numbered">{entries.map((entry) => <li className="list-group-item" key={entry.teamName}>
      <strong>{entry.teamName}</strong> · {entry.totalPoints} points (rank {entry.rank})
    </li>)}</ol>}
  />;
}
