import core from "@actions/core";
import { Octokit } from "@octokit/action";

const packageName = core.getInput("packageName");
const packageVersion = process.env.new_version;
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const octokit = new Octokit();
try {
  const prevReleases = await octokit.repos.listReleases({
    owner,
    repo,
  });

  const prevRelease = prevReleases.data.find((r) => !r.draft && r.name.includes(packageName));
  // Get auto generated release note
  const autoNotes = await octokit.repos.generateReleaseNotes({
    repo,
    owner,
    tag_name: `${packageName}@${packageVersion}`,
  });

  // If no previous releae found with matching filter, output aut generated notes
  if (!prevRelease) {
    core.setOutput("changelog", autoNotes.data.body);
    process.exit(0);
  }
  const lastTimestamp = new Date(prevRelease.published_at).getTime();
  const prs = await octokit.pulls.list({
    owner,
    repo,
    state: "closed",
  });

  // Filter prs by package name and merged after last release
  const changelog = prs.data
    .filter(
      (pr) =>
        pr.merged_at &&
        new Date(pr.created_at).getTime() > lastTimestamp &&
        pr.labels.some((l) => packageName.includes(l.name.split(":")[0])),
    )
    .map((pr) => `- ${pr.title} [#${pr.number}] by @${pr.user.login}`);

  // filter items and group prs by their scope
  const filtered = changelog.filter((item) => !item.split(":")[0].includes("chore"));
  const bugFixes = filtered.filter((item) => item.split(":")[0].includes("fix"));
  const features = filtered.filter((item) => item.split(":")[0].includes("feat"));
  const refactors = filtered.filter((item) => item.split(":")[0].includes("refactor"));
  const misc = filtered.filter(
    (item) =>
      !item.split(":")[0].includes("fix") && !item.split(":")[0].includes("feat") && !item.split(":")[0].includes("refactor"),
  );
  let changelogString = "# Changes";
  if (features.length > 0) {
    changelogString += "\n\n## Features\n";
    changelogString += features.join("\n");
  }
  if (bugFixes.length > 0) {
    changelogString += "\n\n## Bug Fixes\n";
    changelogString += bugFixes.join("\n");
  }
  if (refactors.length > 0) {
    changelogString += "\n\n## Refactors\n";
    changelogString += refactors.join("\n");
  }
  if (misc.length > 0) {
    changelogString += "\n\n## Miscellaneous\n";
    changelogString += misc.join("\n");
  }

  changelogString += `\n\nFull Changelog: [${prevRelease.tag_name}...${packageName}@${packageVersion}](https://github.com/imnaiyar/SkyHelper/compare/${prevRelease.tag_name}...${packageName}@${packageVersion})`;

  // if new contribs, add a entry for that
  const contribIndex = autoNotes.data.body.indexOf("## New Contributors");
  if (contribIndex !== -1) changelogString += `\n\n${autoNotes.data.body.slice(contribIndex)}`;

  core.setOutput("changelog", changelogString);
} catch (error) {
  core.setFailed(error.message);
}
