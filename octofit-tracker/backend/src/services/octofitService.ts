import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type HttpError = Error & { status: number };

function badRequest(message: string): HttpError {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string): HttpError {
  return Object.assign(new Error(message), { status: 404 });
}

function asRecord(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = asRecord(input);
  if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) throw badRequest('A valid userId is required');
  if (typeof teamId !== 'string' || !Types.ObjectId.isValid(teamId)) throw badRequest('A valid teamId is required');
  if (typeof type !== 'string' || !type.trim()) throw badRequest('An activity type is required');
  if (typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 1) throw badRequest('Minutes must be a positive whole number');

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user) throw notFound('User not found');
  if (!team) throw notFound('Team not found');

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members = [] } = asRecord(input);
  if (typeof name !== 'string' || !name.trim()) throw badRequest('A team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw badRequest('A team mascot is required');
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !Types.ObjectId.isValid(member))) {
    throw badRequest('Members must be valid user IDs');
  }

  const memberIds = [...new Set(members as string[])];
  const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
  if (existingMembers !== memberIds.length) throw notFound('One or more team members were not found');
  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const totalsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: totalsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function focusForActivity(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized === 'run' || normalized === 'cycle' || normalized === 'swim') return 'endurance';
  if (normalized === 'walk' || normalized === 'yoga' || normalized === 'mobility') return 'mobility';
  return normalized;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw notFound('User not found');

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean(),
    Workout.find().lean(),
  ]);
  const recentFocuses = activities.map((activity) => ({
    focus: focusForActivity(activity.type),
    type: activity.type,
  }));
  const goal = user.fitnessGoal.toLowerCase();

  return workouts
    .map((workout) => {
      const recentMatch = recentFocuses.find(({ focus }) => focus === workout.focus.toLowerCase());
      const matchesGoal = workout.focus.toLowerCase() === goal;
      const reason = matchesGoal
        ? `Recommended for your ${user.fitnessGoal} goal.`
        : recentMatch
          ? `Based on your recent ${recentMatch.type} activity.`
          : 'Suggested to support varied training.';
      return { ...workout, reason, relevance: matchesGoal ? 2 : recentMatch ? 1 : 0 };
    })
    .sort((left, right) => right.relevance - left.relevance || left.title.localeCompare(right.title))
    .map(({ relevance: _relevance, ...workout }) => workout);
}

export { User };
