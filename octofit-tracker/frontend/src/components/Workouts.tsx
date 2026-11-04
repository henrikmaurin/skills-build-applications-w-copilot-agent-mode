import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };

export default function Workouts() {
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    itemsKey="suggestions"
    emptyMessage="No workout suggestions yet."
    renderItems={(suggestions) => <ul className="list-group list-group-flush">{suggestions.map((workout) => <li className="list-group-item" key={workout.title}>
      <strong>{workout.title}</strong>{workout.focus ? ` · ${workout.focus}` : ''}{workout.minutes ? ` · ${workout.minutes} minutes` : ''}{workout.difficulty ? ` · ${workout.difficulty}` : ''}
      {workout.reason && <p className="mb-0">{workout.reason}</p>}
    </li>)}</ul>}
  />;
}
