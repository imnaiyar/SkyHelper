import core from "@actions/core";
import { Octokit } from "@octokit/action";

const packageName = process.env.package;
const packageVersion = process.env.new_version;
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const octokit = new Octokit();
const packageRegex = /^@skyhelperbot\/(.+)$/;
const match = packageName.match(packageRegex);
if (!match && packageName !== "skyhelper") {
  core.setFailed("Invalid package name");
  process.exit(1);
}
const createRelease = async (body) => {
  try {
    const { data: release } = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: `${packageName}@${packageVersion}`,
      name: `${packageName}@${packageVersion}`,
      prerelease: false,
      draft: false,
      body,
      headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });
    core.setOutput("release_id", release.id);
  } catch (error) {
    core.setFailed(error);
  }
};
const packageLabel = `package:` + (match?.[1] ?? "skyhelper");
console.log("Package Label: ", packageLabel);
try {
  const { data: releases } = await octokit.repos.listReleases({ owner, repo });
  const prevRelease = releases.find((r) => !r.draft && r.name.startsWith(packageName));
  const { data: autoNotes } = await octokit.repos.generateReleaseNotes({
    owner,
    repo,
    tag_name: `${packageName}@${packageVersion}`,
  });

  if (!prevRelease) {
    await createRelease(autoNotes.body);
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
      const titleMatch = pr.title.match(
        /^(?<type>feat|fix|refactor|perf|types|docs|revert|style|test)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<subject>.+)$/,
      );
      if (!titleMatch) return null;
      const { type, scope, subject, breaking } = titleMatch.groups;
      return {
        title: subject ?? pr.title,
        number: pr.number,
        user: pr.user.login,
        scope: scope || null,
        breaking: Boolean(breaking),
        type: type || "misc",
      };
    })
    .filter((pr) => pr !== null);

  console.log(`Found ${filteredPr.length} PRs for ${packageName}`);
  if (filteredPr.length === 0) {
    await createRelease(autoNotes.body);
    process.exit(0);
  }
  const typeMappings = {
    feat: "features",
    fix: "fixes",
    refactor: "refactors",
    perf: "performance",
    types: "types",
    docs: "documentation",
    revert: "reverts",
    style: "styling",
  };

  const grouped = filteredPr.reduce((acc, { title, number, user, type, scope, breaking }) => {
    const key = typeMappings[type] ?? "misc";
    acc[key] = acc[key] || [];
    acc[key].push(`- ${breaking ? `BREAKING CHANGE ` : ""}${scope ? `${scope}: ` : ""}${title} (#${number}) by @${user}`);
    return acc;
  }, {});

  let changelogString = "# Changes";
  for (const [key, items] of Object.entries(grouped)) {
    if (items.length) {
      changelogString += `\n\n## ${key.charAt(0).toUpperCase() + key.slice(1)}\n` + items.join("\n");
    }
  }

  changelogString += `\n\nFull Changelog: https://github.com/${owner}/${repo}/compare/${prevRelease.tag_name}...${packageName}@${packageVersion}`;

  const contribIndex = autoNotes.body.indexOf("## New Contributors");
  if (contribIndex !== -1) {
    changelogString += `\n\n${autoNotes.body.slice(contribIndex)}`;
  }

  await createRelease(changelogString);
} catch (error) {
  core.setFailed(error);
}
