import { getUserGroups } from '@/lib/queries/groups';
import GroupsView from '@/components/groups-view';

export default async function GroupsPage() {
  const groups = await getUserGroups();

  return <GroupsView groups={groups} />;
}
