import { CapabilityCard } from './CapabilityCard.js';

type TeamItem = { name: string; mascot?: string; members?: string[] };

export default function Teams() {
  return <CapabilityCard<TeamItem>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    itemsKey="teams"
    emptyMessage="No teams yet."
    renderItems={(teams) => <ul className="list-group list-group-flush">{teams.map((team) => <li className="list-group-item" key={team.name}>
      <strong>{team.name}</strong>{team.mascot ? ` · ${team.mascot}` : ''} · {team.members?.length ?? 0} members
    </li>)}</ul>}
  />;
}
