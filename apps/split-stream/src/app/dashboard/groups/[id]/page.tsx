import ManageGroup from "@/components/dashboard/views/manage-group";

export default function ManageGroupPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <ManageGroup id={params.id} />
    </div>
  );
}
