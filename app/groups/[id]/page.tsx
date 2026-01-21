import { getGroupDetail } from '@/lib/queries/groups';
import { notFound } from 'next/navigation';
import GroupDetailView from '@/components/group-detail-view';

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const groupId = parseInt(id, 10);

  if (isNaN(groupId)) {
    notFound();
  }

  const group = await getGroupDetail(groupId);

  if (!group) {
    notFound();
  }

  return <GroupDetailView group={group} />;
}
