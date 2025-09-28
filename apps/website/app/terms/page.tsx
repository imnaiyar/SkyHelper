import { Metadata } from "next";
import React from "react";
import { generateOGMetadata } from "../../lib/og";
interface TOS {
  title: React.ReactNode;
  description?: React.ReactNode;
  subtitles?: Omit<TOS, "subtitles">[];
}

const toss: TOS[] = [
  {
    title: "Description of Service",
    description: (
      <>
        {"SkyHelper is a Discord bot designed for the Sky: Children of the Light community. Our service provides:"}
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>Event tracking and notifications</li>
          <li>Spirit information and guides</li>
          <li>Shards calendar and reminders</li>
          <li>Community features and utilities</li>
          <li>Multi-language support</li>
        </ul>
      </>
    ),
  },
  {
    title: "User Eligibility",
    description: (
      <>
        {"To use SkyHelper, you must:"}
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>Have a valid Discord account</li>
          <li>Be at least 13 years old (Discord's minimum age requirement)</li>
          <li>Comply with Discord's Terms of Service</li>
          <li>Not be prohibited from using our service under applicable law</li>
        </ul>
      </>
    ),
  },
  {
    title: "Acceptable Use",
    description: "",
    subtitles: [
      {
        title: "Permitted Use",
        description:
          "You may use SkyHelper for its intended purpose: enhancing your Sky: Children of the Light experience within Discord servers.",
      },
      {
        title: "Prohibited Activities",
        description: (
          <>
            {"You agree NOT to:"}
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>Attempt to reverse engineer, decompile, or hack the bot</li>
              <li>Use the bot for spamming or harassment</li>
              <li>Exploit bugs or vulnerabilities for malicious purposes</li>
              <li>Use the bot to violate Discord's Terms of Service</li>
              <li>Impersonate the bot or its developers</li>
              <li>Use the bot for illegal activities</li>
              <li>Attempt to overload or disrupt the service</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    title: "Service Availability",
    description: (
      <>
        {
          "While we strive to maintain high availability, we do not guarantee that SkyHelper will be available 100% of the time. The service may be temporarily unavailable due to:"
        }
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>Scheduled maintenance</li>
          <li>Technical difficulties</li>
          <li>Discord API limitations</li>
          <li>Third-party service interruptions</li>
        </ul>
      </>
    ),
  },
  {
    title: "Intellectual Property",
    description: (
      <>
        {"SkyHelper is open-source software. However:"}
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>The SkyHelper name and branding are owned by the development team</li>
          <li>Sky: Children of the Light content belongs to thatgamecompany</li>
          <li>Our code is available under the ISC License on GitHub</li>
          <li>User-generated content remains the property of the respective users</li>
        </ul>
      </>
    ),
  },
  {
    title: "Privacy and Data",
    description:
      "Your privacy is important to us. Our data collection and usage practices are detailed in our Privacy Policy. By using SkyHelper, you also agree to our privacy practices.",
  },
  {
    title: "Disclaimers",
    description: "",
    subtitles: [
      {
        title: "No Warranty",
        description:
          'SkyHelper is provided "as is" without any warranties, express or implied. We do not guarantee that the service will meet your requirements or be error-free.',
      },
      {
        title: "Third-Party Content",
        description:
          "Information about Sky: Children of the Light is provided for convenience and may not always be current or accurate. We are not responsible for any third-party content or services.",
      },
      {
        title: "Unofficial Service",
        description:
          "SkyHelper is not affiliated with, endorsed by, or sponsored by thatgamecompany or Sky: Children of the Light. This is a community-created service.",
      },
    ],
  },
  {
    title: "Limitation of Liability",
    description:
      "To the maximum extent permitted by law, the SkyHelper team shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from your use of the service.",
  },
  {
    title: "Termination",
    description:
      "We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. You may stop using our service at any time by removing the bot from your Discord server.",
  },
  {
    title: "Changes to Terms",
    description: (
      <>
        {"We may modify these Terms at any time. We will notify users of any material changes by:"}
        <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
          <li>Posting the updated Terms on this page</li>
          <li>Updating the "Last updated" date</li>
          <li>Announcing changes in our Discord support server</li>
        </ul>
      </>
    ),
  },
  {
    title: "Governing Law",
    description:
      "These Terms shall be governed by and construed in accordance with applicable international laws. Any disputes arising from these Terms will be resolved through appropriate legal channels.",
  },
  {
    title: "Contact Information",
    description: (
      <>
        {"If you have any questions about these Terms, please contact us:"}
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
  {
    title: "Severability",
    description:
      "If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.",
  },
];

export const metadata: Metadata = generateOGMetadata({
  title: "Terms of Service | SkyHelper",
  description: "Terms of Service for SkyHelper Discord Bot",
  pathname: "/terms",
});

export default function TermsPage() {
  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Terms of Service</h1>
            <p className="text-xl text-slate-400">Last updated: September 24, 2025</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              {toss.map((t, i) => (
                <section className="mb-8" key={`${t.title}-${i}`}>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {i + 1}. {t.title}
                  </h2>
                  {t.description && t.description}
                  {t.subtitles &&
                    t.subtitles.map((sub, i2) => (
                      <div key={"x" + i2}>
                        <h3 className="text-xl font-semibold text-blue-400 mt-2 mb-3">
                          {i + 1}.{i2 + 1} {sub.title}
                        </h3>
                        {sub.description && sub.description}
                      </div>
                    ))}
                </section>
              ))}

              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-slate-300 text-sm">
                  <strong>Acknowledgment:</strong> By using SkyHelper, you acknowledge that you have read, understood, and agree
                  to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
