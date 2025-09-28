import { APIGuild, GuildFeature } from "discord-api-types/v10";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface GuildCardProps {
  guild: APIGuild;
}

export default function GuildCard({ guild }: GuildCardProps) {
  const [imageError, setImageError] = useState(false);

  // Discord CDN URL for guild icon
  const guildIconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=128`
    : null;

  // Fallback to guild initials if no icon
  const getGuildInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  return (
    <Link href={`/dashboard/${guild.id}`} className="block transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <div className=" hover:bg-slate-700/50 h-full rounded-lg p-6 text-left border border-slate-700 hover:border-slate-500 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center">
            {guildIconUrl && !imageError ? (
              <Image
                height={32}
                width={32}
                src={guildIconUrl}
                alt={`${guild.name} icon`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-slate-300">{getGuildInitials(guild.name)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate mb-1">{guild.name}</h3>

            {/* Guild Features/Badges */}
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              {guild.owner && <span className="bg-yellow-600 px-2 py-1 rounded-full text-xs font-medium">Owner</span>}
            </div>

            {/* Member Count (if available) */}
            {guild.approximate_member_count && (
              <p className="text-sm text-slate-400 mt-2">{guild.approximate_member_count.toLocaleString()} members</p>
            )}
          </div>

          {/* Arrow Icon */}
          <div className="text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
