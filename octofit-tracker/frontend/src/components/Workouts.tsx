import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };

function loadWorkouts() {
  return getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
    .then(({ suggestions }) => suggestions);
}

export default function Workouts() {
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    loadItems={loadWorkouts}
    emptyMessage="No workout suggestions yet."
    renderItems={(suggestions) => <ul className="list-group list-group-flush">{suggestions.map((workout) => <li className="list-group-item" key={workout.title}>
      <strong>{workout.title}</strong>{workout.focus ? ` · ${workout.focus}` : ''}{workout.minutes ? ` · ${workout.minutes} minutes` : ''}{workout.difficulty ? ` · ${workout.difficulty}` : ''}
      {workout.reason && <p className="mb-0">{workout.reason}</p>}
    </li>)}</ul>}
  />;
}
