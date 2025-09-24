"use client";

import {
  Callout,
  InfoCallout,
  SuccessCallout,
  WarningCallout,
  ErrorCallout,
  TipCallout,
  ImportantCallout,
  NoteCallout,
  FeatureCallout,
  PremiumCallout,
  SecurityCallout,
  TimeCallout,
} from "../components/Callout";

export default function ComponentsDemo() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Callout Components Demo
        </h1>

        <div className="space-y-6">
          {/* Basic Examples */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Basic Callouts</h2>
            <div className="space-y-4">
              <InfoCallout title="Information Callout">
                <p>This is an informational callout. Use it to provide helpful context or explanations.</p>
                <p>
                  It supports <strong>rich content</strong> and <em>markdown formatting</em>.
                </p>
              </InfoCallout>

              <SuccessCallout title="Success Message">
                <p>Great! Your action was completed successfully. This callout is perfect for confirmation messages.</p>
              </SuccessCallout>

              <WarningCallout title="Warning Notice">
                <p>Pay attention to this warning. It highlights important information that users should be aware of.</p>
              </WarningCallout>

              <ErrorCallout title="Error Alert">
                <p>Something went wrong. Use this callout to display error messages and troubleshooting information.</p>
              </ErrorCallout>
            </div>
          </section>

          {/* Special Types */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Special Purpose Callouts</h2>
            <div className="space-y-4">
              <TipCallout title="Pro Tip">
                <p>Here's a helpful tip to improve your experience:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use keyboard shortcuts for faster navigation</li>
                  <li>Bookmark frequently used commands</li>
                  <li>Join our Discord server for support</li>
                </ul>
              </TipCallout>

              <ImportantCallout title="Important Notice">
                <p>This information is crucial for proper functionality. Make sure to read and understand it completely.</p>
              </ImportantCallout>

              <FeatureCallout title="New Feature">
                <p>🎉 Check out this amazing new feature! It includes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Real-time updates</li>
                  <li>Enhanced performance</li>
                  <li>Better user experience</li>
                </ul>
              </FeatureCallout>

              <PremiumCallout title="Premium Feature">
                <p>This feature is available for premium subscribers. Upgrade your plan to unlock advanced functionality.</p>
              </PremiumCallout>
            </div>
          </section>

          {/* Collapsible Examples */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Collapsible Callouts</h2>
            <div className="space-y-4">
              <NoteCallout title="Collapsible Note" collapsible defaultExpanded={false}>
                <p>This callout is collapsible and starts collapsed. Click the header to expand it.</p>
                <p>Perfect for optional information or detailed explanations that don't need to be visible by default.</p>
              </NoteCallout>

              <SecurityCallout title="Security Guidelines" collapsible>
                <p>Important security information that users can collapse after reading:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Never share your bot token</li>
                  <li>Use environment variables for sensitive data</li>
                  <li>Regularly update your dependencies</li>
                  <li>Enable two-factor authentication</li>
                </ul>
              </SecurityCallout>

              <TimeCallout title="Time-Sensitive Information" collapsible>
                <p>This information is time-sensitive and may become outdated:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Event ends on December 31st, 2024</li>
                  <li>Limited-time offers available</li>
                  <li>Maintenance scheduled for next week</li>
                </ul>
              </TimeCallout>
            </div>
          </section>

          {/* Custom Examples */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Custom Callouts</h2>
            <div className="space-y-4">
              <Callout type="info" title="Custom Title Example">
                <p>You can customize the title of any callout to fit your specific needs.</p>
              </Callout>

              <Callout type="success" className="border-2">
                <p>This callout uses a custom CSS class for additional styling. Notice the thicker border.</p>
              </Callout>

              <Callout type="tip" title="Advanced Usage" collapsible defaultExpanded={false}>
                <div className="space-y-3">
                  <p>Callouts can contain complex content:</p>

                  <div className="bg-slate-800 rounded-lg p-4">
                    <code className="text-green-400">
                      {`<TipCallout title="Custom Title" collapsible>`}
                      <br />
                      {`  <p>Your content here</p>`}
                      <br />
                      {`</TipCallout>`}
                    </code>
                  </div>

                  <p>They support nested elements, code blocks, and more!</p>
                </div>
              </Callout>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
