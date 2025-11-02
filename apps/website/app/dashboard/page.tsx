"use client";
import Loading from "@/components/ui/Loading";
import { useGuildsQuery } from "../../hooks/discord";
import { useToast } from "../../hooks/useToast";
import { PermissionsUtil } from "@/utils/PermissionUtils";
import GuildCard from "@/components/ui/GuildCard";

export default function Page() {
  const data = useGuildsQuery();
  const { error } = useToast();

  if (data.isLoading) return <Loading size="lg" variant="bot" />;

  if (data.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-400 text-xl mb-2">⚠️ Error Loading Guilds</div>
        <div className="text-slate-300">
          {data.error.message ?? "Failed to load your Discord servers. Please try again later."}
        </div>
      </div>
    );
  }

  const filteredGuilds =
    data.data?.filter((guild) => new PermissionsUtil(guild.permissions! as `${number}`).has("ManageGuild")) ?? [];

  if (filteredGuilds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-slate-300 text-xl mb-2">🏰 No Manageable Servers</div>
        <div className="text-slate-400 max-w-md">
          You need "Manage Server" permissions to configure SkyHelper. Contact a server administrator to get the necessary
          permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Servers</h1>
        <p className="text-slate-400">
          Select a server to configure SkyHelper settings. You have manage permissions for {filteredGuilds.length} server
          {filteredGuilds.length !== 1 ? "s" : ""}.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredGuilds.map((guild) => (
          <GuildCard key={guild.id} guild={guild} />
        ))}
      </div>
    </div>
  );
}
