import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <p className="text-muted-foreground">
              NeuroCalm collects information you provide directly to us, such as when you create an account, 
              complete daily check-ins, or interact with our AI coach. This includes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Account information (email, name)</li>
              <li>Daily wellness data (mood, sleep, diet, exercise, stressors)</li>
              <li>Chat interactions with our AI coach</li>
              <li>Usage analytics and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use your information to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Provide personalized AI coaching and recommendations</li>
              <li>Generate your Calm Index and Productivity Index scores</li>
              <li>Improve our services and develop new features</li>
              <li>Communicate with you about your account and our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. Your data is encrypted 
              in transit and at rest using industry-standard protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share aggregated, 
              non-personally identifiable information for research and improvement purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of certain data processing activities</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              <a href="mailto:hm2257153@gmail.com" className="text-primary hover:underline">
                hm2257153@gmail.com
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
