"use client";

import { useState, useEffect, JSX } from "react";
import { ChevronDown, ChevronUp, Search, Filter, Command, Hash, Folder, SlashSquare } from "lucide-react";
import useFetchHook from "../hooks/useFetchHook";
import {
  APIApplicationCommand,
  APIApplicationCommandBasicOption,
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionContextType,
} from "discord-api-types/v10";
import { PermissionsUtil } from "@/utils/PermissionUtils";
import { parsePerms } from "@/utils/parsePerms";

import { SecurityCallout } from "../components/ui/Callout";
import Loading from "../components/ui/Loading";

const CommandTypeMap = {
  [ApplicationCommandType.ChatInput]: "Slash",
  [ApplicationCommandType.User]: "User Command",
  [ApplicationCommandType.Message]: "Message Command",
};

export default function CommandsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set());

  const { data: commands, loading, error } = useFetchHook<APIApplicationCommand[]>("/api/commands");

  const toggleCommand = (commandId: string) => {
    const newExpanded = new Set(expandedCommands);
    if (newExpanded.has(commandId)) {
      newExpanded.delete(commandId);
    } else {
      newExpanded.add(commandId);
    }
    setExpandedCommands(newExpanded);
  };

  const flattenCommands = (
    commands: APIApplicationCommand[],
  ): Array<APIApplicationCommand & { parentName?: string; isSubcommand?: boolean }> => {
    const flattened: Array<APIApplicationCommand & { parentName?: string; isSubcommand?: boolean }> = [];

    commands.forEach((command) => {
      let hadSubs = false;
      if (command.options?.length) {
        command.options.forEach((option) => {
          if (option.type === 1) {
            hadSubs = true;
            // Subcommand
            flattened.push({
              ...command,
              id: `${command.id}-${option.name}`,
              name: option.name,
              description: option.description,
              options: option.options,
              parentName: command.name,
              isSubcommand: true,
            });
          } else if (option.type === 2) {
            // Subcommand group
            hadSubs = true;
            option.options?.forEach((subOption) => {
              if (subOption.type === 1) {
                flattened.push({
                  ...command,
                  id: `${command.id}-${option.name}-${subOption.name}`,
                  name: `${option.name} ${subOption.name}`,
                  description: subOption.description,
                  options: subOption.options,
                  parentName: command.name,
                  isSubcommand: true,
                });
              }
            });
          }
        });
      }
      if (!hadSubs) flattened.push(command);
    });

    return flattened;
  };

  const filteredCommands = flattenCommands(commands ?? []).filter((command) => {
    const matchesSearch =
      command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (command.parentName && command.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      selectedType === "all" ||
      (selectedType === "slash" && command.type === 1) ||
      (selectedType === "user" && command.type === 2) ||
      (selectedType === "message" && command.type === 3);

    return matchesSearch && matchesType;
  });

  const renderOption = (option: APIApplicationCommandOption, depth = 0) => {
    const indent = depth * 16;

    return (
      <div key={option.name} className="mb-2" style={{ marginLeft: `${indent}px` }}>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono text-blue-400">/{option.name}</span>
          <span className="px-2 py-1 bg-slate-700 rounded text-xs">
            {ApplicationCommandOptionType[option.type] || `Type ${option.type}`}
          </span>
          {"autocomplete" in option && option.autocomplete && (
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Autocomplete</span>
          )}
          {option.required && <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">Required</span>}
        </div>
        <div className="ml-4">
          <p className="text-slate-300 text-sm mt-1">{option.description}</p>

          {"choices" in option && (option.choices?.length ?? 0) > 0 && (
            <div>
              <span className="text-xs text-slate-400">Choices:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {option.choices?.map((choice) => (
                  <span key={choice.value} className="px-2 py-1 bg-slate-600 rounded text-xs">
                    {choice.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {("min_value" in option || "max_value" in option) && (
            <p className="text-xs text-slate-400 mt-1">
              Range: {option.min_value || "No min value"} - {option.max_value || "No max value"}
            </p>
          )}
        </div>

        {"options" in option && option.options?.map((subOption) => renderOption(subOption, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loading variant="bot" size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Bot Commands
        </h1>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Commands</option>
              <option value="slash">Slash Commands</option>
              <option value="user">User Commands</option>
              <option value="message">Message Commands</option>
            </select>
          </div>
        </div>

        <div className="mb-6 text-slate-400">
          Found {filteredCommands.length} command{filteredCommands.length !== 1 ? "s" : ""}
        </div>

        <div className="space-y-4">
          {filteredCommands.map((command) => (
            <div key={command.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-slate-750 transition-colors" onClick={() => toggleCommand(command.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {command.type === ApplicationCommandType.ChatInput ? (
                          <SlashSquare className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Command className="w-5 h-5 text-green-400" />
                        )}
                        <h3 className="text-l sm:text-xl font-semibold text-white">
                          {command.isSubcommand && command.parentName && (
                            <span className="text-slate-400">{command.parentName} → </span>
                          )}
                          /{command.name}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {CommandTypeMap[command.type as keyof typeof CommandTypeMap] ||
                          ApplicationCommandType[command.type] ||
                          `Type ${command.type}`}
                      </span>
                      {command.nsfw && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs sm:text-sm">NSFW</span>
                      )}
                      {command.contexts?.every((c) => c === InteractionContextType.Guild) && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs sm:text-sm">
                          Server Only
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300">{command.description}</p>
                  </div>
                  <div className="ml-4">
                    {expandedCommands.has(command.id) ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedCommands.has(command.id) && (
                <div className="px-4 pb-4 border-t border-slate-700">
                  {command.default_member_permissions &&
                    (() => {
                      const perms = new PermissionsUtil(command.default_member_permissions as `${number}`).toArray();
                      // @ts-expect-error some perms are missing so..
                      const parsed = parsePerms(perms);
                      return (
                        <SecurityCallout title="Permissions" collapsible defaultExpanded={false} className="rounded-lg mt-3">
                          <div className="text-xs sm:text-sm flex flex-row flex-wrap items-center gap-2">
                            This command requires the following permissions:{" "}
                            {parsed.map((perm, i) => (
                              <code className="bg-slate-900/50 rounded-lg px-2 py-1" key={i}>
                                {perm}
                              </code>
                            ))}
                          </div>
                        </SecurityCallout>
                      );
                      return <></>;
                    })()}
                  {command.options?.length ? (
                    <>
                      <h4 className="text-lg font-semibold mb-3 mt-3 text-slate-200">Options & Parameters:</h4>
                      <div className="space-y-2">{command.options.map((option) => renderOption(option))}</div>
                    </>
                  ) : (
                    <p className="text-slate-400 italic mt-3">This command has no additional options.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No commands found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
