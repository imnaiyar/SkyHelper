"use client";

import { type getRoleConnections } from "@/app/lib/discord";
import LinkedRoleForm from "./components/LinkedRoleForm";
import RoleCard from "./components/RoleCard";

export default function LinkedRolePage({ connections }: { connections?: Awaited<ReturnType<typeof getRoleConnections>> }) {
  if (!connections) {
    return (
      <RoleCard>
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">Failed to get any role connections</p>
        </div>
      </RoleCard>
    );
  }

  return (
    <RoleCard>
      <LinkedRoleForm connections={connections} />
    </RoleCard>
  );
}
