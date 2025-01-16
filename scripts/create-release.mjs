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
  if (!prevRelease) {
    return core.setOutput(
      "changelog",
      `Full changelog: [v7.1.0...v${packageVersion}](https://github.com/imnaiyar/SkyHelper/compare/v7.1.0...${packageName}@${packageVersion})`,
    );
  }
  const lastTimestamp = new Date(prevRelease.published_at).getTime();
  const prs = await octokit.pulls.list({
    owner,
    repo,
  });
  const changelog = prs.data
    .filter(
      (pr) =>
        new Date(pr.created_at).getTime() > lastTimestamp && pr.labels.some((l) => packageName.includes(l.name.split(":")[0])),
    )
    .map((pr) => `- ${pr.title} [#${pr.number}] by @${pr.user.login}`);
  const filtered = changelog.filter((item) => !item.split(":")[0].includes("chore"));
  filtered.push(`\nFull changelog: [v\${prevRelease.tag_name}...${packageName}@${packageVersion}](`);
  core.setOutput("changelog", filtered.join("\n"));
} catch (error) {
  core.setFailed(error.message);
}
