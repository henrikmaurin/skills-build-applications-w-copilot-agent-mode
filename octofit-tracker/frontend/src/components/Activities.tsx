import { CapabilityCard } from './CapabilityCard.js';

type ActivityItem = { type: string; minutes: number; points: number; occurredAt?: string };

export default function Activities() {
  return <CapabilityCard<ActivityItem>
    title="Activities"
    description="Track student activity minutes and points."
    endpoint="/api/activities"
    itemsKey="activities"
    emptyMessage="No activities yet."
    renderItems={(activities) => <ul className="list-group list-group-flush">{activities.map((activity, activityIndex) => <li className="list-group-item" key={`${activity.type}-${activity.occurredAt ?? activityIndex}`}>
      <strong>{activity.type}</strong> · {activity.minutes} minutes · {activity.points} points
    </li>)}</ul>}
  />;
}
