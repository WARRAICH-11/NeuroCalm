'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using NeuroCalm, you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do not 
              use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Description of Service</h2>
            <p className="text-muted-foreground">
              NeuroCalm is a wellness application that provides AI-powered mental health coaching, 
              daily check-ins, and personalized recommendations. Our service is designed for 
              informational and educational purposes only and is not intended to replace professional 
              medical advice, diagnosis, or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Medical Disclaimer</h2>
            <p className="text-muted-foreground">
              <strong>Important:</strong> NeuroCalm is not a medical device and does not provide 
              medical advice, diagnosis, or treatment. The AI coach is an assistant for wellness 
              guidance and is not a substitute for professional medical care. Always consult with 
              qualified healthcare professionals for medical concerns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">User Responsibilities</h2>
            <p className="text-muted-foreground">
              As a user of NeuroCalm, you agree to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Provide accurate and truthful information in your daily check-ins</li>
              <li>Use the service responsibly and in accordance with these terms</li>
              <li>Not attempt to reverse engineer or compromise the security of the service</li>
              <li>Respect the privacy and rights of other users</li>
              <li>Seek professional medical help when needed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
            <p className="text-muted-foreground">
              The NeuroCalm service, including its original content, features, and functionality, 
              is owned by NeuroCalm and is protected by international copyright, trademark, patent, 
              trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall NeuroCalm, nor its directors, employees, partners, agents, suppliers, 
              or affiliates, be liable for any indirect, incidental, special, consequential, or 
              punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and bar access to the service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any 
              time. If a revision is material, we will provide at least 30 days notice prior to any 
              new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at:
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
