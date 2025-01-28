<h1 align="center">
  <br>
  <a href="https://github.com/imnaiyar/SkyHelper"><img src="https://skyhelper.xyz/assets/img/boticon.png" height="200" alt="SkyHelper"></a>
  <br>
  SkyHelper
  <br>
</h1>

<p align="center">A Sky CotL Discord Bot</p>
<p align="center"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript logo"/> <br />
 <img src="https://img.shields.io/github/stars/imnaiyar/SkyHelper" alt="Stars"/> <img alt="GitHub release (with filter)" src="https://img.shields.io/github/v/release/imnaiyar/SkyHelper"> <img alt="GitHub License" src="https://img.shields.io/github/license/imnaiyar/SkyHelper">
 <a href="https://github.com/imnaiyar/skyhelper/actions"><img src="https://github.com/imnaiyar/skyhelper/actions/workflows/test.yml/badge.svg" alt="Tests status" /></a>
 <a href="https://github.com/imnaiyar/skyhelper/actions"><img src="https://github.com/imnaiyar/skyhelper/actions/workflows/check-build.yml/badge.svg" alt="Build status" /></a>
 <a href="https://crowdin.com/project/skyhelper"><img src="https://badges.crowdin.net/skyhelper/localized.svg" alt="Localisation" /></a>
 </p>
<br>

<p align="center">
  <a href="https://skyhelper.xyz">Website</a>
  •
  <a href="https://dash.skyhelper.xyz">Dashboard</a>
  •
  <a href="https://skyhelper.xyz/invite">Invite</a>
  •
  <a href="https://skyhelper.xyz/vote">Vote</a>
  •
  <a href="https://docs.skyhelper.xyz">Docs</a>
  •
  <a href="https://discord.com/invite/2rjCRKZsBb">Support Server</a>
</p>

<br>

This is a monorepo containing projects related to SkyHelper bot. Project included are:

- [@skyhelperbot/docs](/packages/docs/) - Documentation for skyhelper bot
- [@skyhelperbot/utils](/packages/utils/) - Package for utilities that is used by skyhelper bot
- [@skyhelperbot/jobs](/packages/jobs/) - Cron jobs that runs the reminder features
- [@skyhelperbot/constants](/packages/constants/) - Package for constant datas that is used by various skyhelper projects (like localizations, spirit/realm datas, etc..)
- [skyhelper](/packages/skyhelper/) - Main repository for the skyhelper bot

# Contributing

- Install dependencies `pnpm i --frozen-lockfile`
- Build the project `pnpm run build`
- Make changes and lint, test and commit

For any issues or help, feel free to contact me at discord server [here](https://discord.com/invite/2rjCRKZsBb)
