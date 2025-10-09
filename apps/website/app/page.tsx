import Link from "next/link";
import FeatureCard, { FeatureCardProps } from "./components/FeatureCard";
import FeatureModal from "./components/FeatureModal";
import Image from "next/image";
import { ModalContent, ModalProvider, ModalTrigger } from "./components/ui/Modal";

export default async function Home() {
  const featureImages = {
    events: [
      {
        id: "1",
        url: "/quest.png",
        title: "Daily Quest",
        description: "View all your daily quests in one convenient location.",
      },
      {
        id: "2",
        url: "/events-all.png",
        title: "Event Tracking",
        description: "Get upto-date event timings",
      },
      {
        id: "3",
        url: "/ts.png",
        title: "Traveling Spirit Schedule",
        description: "Keep track of traveling spirits and their visit schedules.",
      },
    ],
    spirits: [
      {
        id: "1",
        url: "/spirits-list.png",
        title: "Spirit Database",
        description: "Browse the complete database of all spirits with detailed information.",
      },
      {
        id: "2",
        url: "/spirit-lively.png",
        title: "Spirit Info",
        description: "Find spirits with interactive maps and location guides.",
      },
      {
        id: "3",
        url: "/lively-cosmetics.png",
        title: "Cosmetic Previews",
        description: "Preview all available cosmetics and their costs before purchasing.",
      },
      {
        id: "4",
        url: "/lively-emote.png",
        title: "Emotes Preview",
        description: "Preview the emotes offered by the spirit.",
      },
    ],
    calendar: [
      {
        id: "1",
        url: "/shard-info.png",
        title: "Shards",
        description: "Get detailed info about a shard with their locations and timings.",
      },
      {
        id: "2",
        url: "/shard-timeline.png",
        title: "Shards Timeline",
        description: "Get detailed information about shards timeline",
      },
      {
        id: "3",
        url: "/shard-calendar.png",
        title: "Shards Calendar",
        description: "Shard calendar detailing all the shards for a given month",
      },
    ],
    updates: [
      {
        id: "1",
        url: "/live-shards.png",
        title: "Real-time Shards",
        description: "Updates every 5 minute",
      },
    ],
    reminders: [
      {
        id: "1",
        url: "/grandma-reminders.png",
        title: "Grandma Reminders",
        description: "Reminders for grandma while pinging 'Grandma' role.",
      },
      {
        id: "2",
        url: "/aurora-reminders.png",
        title: "Aurora Reminders",
        description: "Reminders for aurora while pinging 'Aurora' role",
      },
      {
        id: "3",
        url: "/reminders-manage.png",
        title: "Manage Reminders",
        description: "Tab for managing all the reminders settings.",
      },
    ],
  };

  const features: (FeatureCardProps & { key: string })[] = [
    {
      icon: "📅",
      title: "Event Tracking",
      description: "Stay updated with daily quests, seasonal events, and special occasions in Sky: Children of the Light.",
      features: ["Daily quests", "In-gamme social events", "Special events", "Traveling spirit schedules"],
      images: featureImages.events,
      key: "events",
    },
    {
      icon: "👻",
      title: "Spirit Information",
      description: "Comprehensive database of all spirits, their locations, cosmetics, and detailed guides.",
      features: ["Complete spirit database", "Location guides", "Cosmetic previews", "Spirit tree information"],
      images: featureImages.spirits,
      key: "spirits",
    },
    {
      icon: "🗓️",
      title: "Shards",
      description: "Detailed shard information and shard calendar",
      features: ["About today's shard", "Interactive shard calendar", "Automated reminders", "Historical shard data"],
      images: featureImages.calendar,
      key: "calendar",
    },
    {
      icon: "🌍",
      title: "Multi-language Support",
      description: "Available in multiple languages thanks to our amazing community translators.",
      features: ["English", "Spanish", "Hindi", "Japanese"],
      key: "language",
      forwardDescription: (
        <span className="flex flex-row items-center gap-2">
          <img src="/crowdin.svg" className="h-5 w-5" /> Help us translate to more languages
        </span>
      ),
    },
    {
      icon: "⚡",
      title: "Real-time Updates",
      description: "Real time updates of social events and shards. (Updates every 5 minute)",
      features: ["Real time", "Shards", "Social Events", "Live event tracking"],
      images: featureImages.updates,
      key: "updates",
    },
    {
      icon: "📊",
      title: "Reminders",
      description:
        "Get reminded whenever an in-game social event happens, with an optional offset and role mention. Supported events are...",
      features: [
        "Geyser, Grandma, Turtle, Aurora, Aviary Fireworks, Dream Skater, Shards, Daily Quests, Eden/Daily Reset",
        "Easy to use command to manage them",
      ],
      images: featureImages.reminders,
      key: "reminders",
    },
  ];

  const stats = await fetch(process.env.NEXT_PUBLIC_API_URL! + "/stats", {
    headers: {
      "x-api-key": process.env.API_KEY ?? "",
    },
  }).then((r) => r.json());

  return (
    <>
      {" "}
      <section className="relative overflow-hidden">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-8">
          <div className="text-center max-w-4xl mx-auto">
            <Image
              alt="log"
              className="inline-flex items-center rounded-full justify-center mb-8"
              width={120}
              height={120}
              src={"/boticon.png"}
            />

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SkyHelper
              </span>
            </h1>

            <h2 className="text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed">
              The ultimate Discord bot for <span className="text-blue-400 font-semibold">Sky: Children of the Light</span>{" "}
              community
            </h2>

            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Track daily events, explore spirit information, never miss shard events, and enhance your Sky experience with
              comprehensive bot features designed by the community, for the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="https://skyhelper.xyz/invite"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
              >
                Add to Discord
              </Link>
              <Link
                href="#features"
                className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-800"
              >
                Explore Features
              </Link>
            </div>

            <div className="mt-16 grid xs:grid-cols-1 grid-cols-3 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stats?.totalServers || 0}</div>
                <div className="text-slate-400">Servers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stats?.totalUserInstalls || 0}</div>
                <div className="text-slate-400">User Installs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stats?.commands || 0}</div>
                <div className="text-slate-400">Commands</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Sky Players</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Everything you need to enhance your Sky: Children of the Light experience, from event tracking to spirit guides and
              community features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              return feature.key === "language" ? (
                <Link key={"language"} href={"https://docs.skyhelper.xyz/guide/docs/guides/translating"} target={"_blank"}>
                  <FeatureCard {...feature} key={`f-${index}`} />
                </Link>
              ) : (
                <ModalProvider key={index}>
                  <ModalTrigger>
                    <FeatureCard {...feature} key={`f-${index}`} />
                  </ModalTrigger>
                  <ModalContent>
                    <FeatureModal images={feature?.images || []} icon={feature.icon as string} />
                  </ModalContent>
                </ModalProvider>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
