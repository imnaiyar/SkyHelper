import core from "@actions/core";
import { Octokit } from "@octokit/action";

const packageName = process.env.package;
const packageVersion = process.env.new_version;
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const octokit = new Octokit();

const packageMappings = {
  "@skyhelperbot/utils": "package:utils",
  "@skyhelperbot/docs": "package:docs",
  "@skyhelperbot/jobs": "package:jobs",
  "@skyhelperbot/constants": "package:constants",
  skyhelper: "package:skyhelper",
};

const packageLabel = packageMappings[packageName];
if (!packageLabel) {
  core.setFailed(`Invalid package name: ${packageName}`);
  process.exit(1);
}

try {
  const { data: releases } = await octokit.repos.listReleases({ owner, repo });
  const prevRelease = releases.find((r) => !r.draft && r.name.includes(packageName));
  const { data: autoNotes } = await octokit.repos.generateReleaseNotes({
    owner,
    repo,
    tag_name: `${packageName}@${packageVersion}`,
  });

  if (!prevRelease) {
    core.setOutput("changelog", autoNotes.body);
    process.exit(0);
  }
  console.log("Found previous release for: " + packageName + " with tag: " + prevRelease.tag_name);

  const lastTimestamp = new Date(prevRelease.published_at).getTime();
  const { data: prs } = await octokit.pulls.list({ owner, repo, state: "closed" });

  const filteredPr = prs
    .filter(
      (pr) => pr.merged_at && new Date(pr.merged_at).getTime() > lastTimestamp && pr.labels.some((l) => l.name === packageLabel),
    )
    .map((pr) => {
      const titleMatch = pr.title.match(/^(feat|fix|refactor|chore)(?:\([^)]*\))?/i);
      return {
        title: titleMatch?.[3] ?? pr.title,
        number: pr.number,
        user: pr.user.login,
        scope: titleMatch?.[2] || null,
        type: titleMatch?.[1] || "misc",
      };
    })
    .filter((pr) => pr.type !== "chore");

  console.log(`Found ${filteredPr.length} PRs for ${packageName}`);
  if (filteredPr.length === 0) {
    core.setOutput("changelog", autoNotes.body);
    process.exit(0);
  }
  const typeMappings = {
    feat: "features",
    fix: "fixes",
    refactor: "refactors",
  };
  const grouped = { features: [], fixes: [], refactors: [], misc: [] };
  filteredPr.forEach(({ title, number, user, type, scope }) => {
    grouped[typeMappings[type] ?? "misc"].push(`- ${scope ? `${scope}: ` : ""}${title} [#${number}] by @${user}`);
  });

  let changelogString = "# Changes";
  for (const [key, items] of Object.entries(grouped)) {
    if (items.length > 0) {
      changelogString += `\n\n## ${key.charAt(0).toUpperCase() + key.slice(1)}\n` + items.join("\n");
    }
  }

  changelogString += `\n\nFull Changelog: https://github.com/${owner}/${repo}/compare/${prevRelease.tag_name}...${packageName}@${packageVersion}`;

  const contribIndex = autoNotes.body.indexOf("## New Contributors");
  if (contribIndex !== -1) {
    changelogString += `\n\n${autoNotes.body.slice(contribIndex)}`;
  }

  core.setOutput("changelog", changelogString);
} catch (error) {
  core.setFailed(error.message);
}
