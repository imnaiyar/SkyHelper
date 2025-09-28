import { Metadata } from "next";
import React from "react";
import { generateOGMetadata } from "../../lib/og";

interface Privacy {
  title: React.ReactNode;
  description?: React.ReactNode;
  subtitles?: Omit<Privacy, "subtitles">[];
}

const privacies: Privacy[] = [
  {
    title: "Information We Collect",
    description: "",
    subtitles: [
      {
        title: "Discord Data",
        description: (
          <>
            {"When you use SkyHelper, we may collect:"}
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>Discord user ID and username</li>
              <li>Server information where the bot is used</li>
              <li>User preferences and settings</li>
            </ul>
          </>
        ),
      },
      {
        title: "Usage Data",
        description: (
          <>
            {"We automatically collect information about how you use our services:"}
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>Command usage statistics</li>
              <li>Error logs and debugging information</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    title: "How We Use Your Information",
    description: (
      <>
        {"We use the collected information to:"}
        <ul className="list-disc list-inside text-slate-300 mt-2 mb-4 space-y-2">
          <li>Provide and maintain our Discord bot services</li>
          <li>Respond to your commands and requests</li>
          <li>Send notifications and reminders (when enabled)</li>
          <li>Improve our services and develop new features</li>
          <li>Analyze usage patterns to optimize performance</li>
          <li>Prevent abuse and ensure service security</li>
        </ul>
      </>
    ),
  },
  {
    title: "Data Storage and Security",
    description: (
      <>
        {"We implement appropriate security measures to protect your information:"}
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>Data is stored securely using industry-standard encryption</li>
          <li>Access to user data is limited to authorized personnel only</li>
          <li>Regular security audits and updates are performed</li>
          <li>Data is backed up regularly to prevent loss</li>
        </ul>
      </>
    ),
  },
  {
    title: "Data Sharing and Disclosure",
    description: (
      <>
        {
          "We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:"
        }
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>With your explicit consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and prevent fraud</li>
        </ul>
      </>
    ),
  },
  {
    title: "Data Retention",
    description:
      "We retain your information only as long as necessary to provide our services and comply with legal obligations. You can request deletion of your data at any time by contacting us.",
  },
  {
    title: "Your Rights",
    description: (
      <>
        {"You have the right to:"}
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>Access your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Object to data processing</li>
          <li>Data portability</li>
        </ul>
      </>
    ),
  },
  {
    title: "Children's Privacy",
    description:
      "Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.",
  },
  {
    title: "Third-Party Services",
    description:
      "Our bot may interact with third-party services (Discord API, hosting providers). This Privacy Policy does not cover the privacy practices of these third parties. We encourage you to review their privacy policies.",
  },
  {
    title: "Changes to This Policy",
    description:
      'We may update this Privacy Policy from time to time. We will notify users of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
  },
  {
    title: "Contact Us",
    description: (
      <>
        {"If you have any questions about this Privacy Policy or our data practices, please contact us:"}
        <ul className="list-none text-slate-300 mb-4 space-y-2">
          <li>
            • Discord Support Server:{" "}
            <a href="https://discord.com/invite/2rjCRKZsBb" className="text-blue-400 hover:text-blue-300">
              Join our server
            </a>
          </li>
          <li>
            • GitHub Issues:{" "}
            <a href="https://github.com/imnaiyar/SkyHelper/issues" className="text-blue-400 hover:text-blue-300">
              Report on GitHub
            </a>
          </li>
        </ul>
      </>
    ),
  },
];

export const metadata: Metadata = generateOGMetadata({
  title: "Privacy Policy | SkyHelper",
  description: "Privacy Policy for SkyHelper Discord Bot",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
            <p className="text-xl text-slate-400">Last updated: September 24, 2025</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  SkyHelper ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when you use our Discord bot and related services.
                </p>
              </section>
              {privacies.map((privacy, i) => (
                <section className="mb-8" key={`${privacy.title}-${i}`}>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {i + 1}. {privacy.title}
                  </h2>
                  {privacy.description && privacy.description}
                  {privacy.subtitles &&
                    privacy.subtitles.map((sub, i2) => (
                      <div key={"x" + i2}>
                        <h3 className="text-xl font-semibold text-blue-400 mb-3">
                          {i + 1}.{i2 + 1} {sub.title}
                        </h3>
                        {sub.description && sub.description}
                      </div>
                    ))}
                </section>
              ))}

              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-slate-300 text-sm">
                  <strong>Note:</strong> SkyHelper is not affiliated with thatgamecompany or Sky: Children of the Light. This is a
                  community-created Discord bot designed to enhance the player experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
