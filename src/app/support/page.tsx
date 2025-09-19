'use client';

import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from './components/contact-form';

export const metadata: Metadata = {
  title: 'Support - NeuroCalm',
  description: 'Get help and support for NeuroCalm',
};

const faqs = [
  {
    question: 'How do I get started with NeuroCalm?',
    answer: 'Simply sign up for an account and complete your profile to get started with NeuroCalm.'
  },
  {
    question: 'Is there a mobile app available?',
    answer: 'Yes, NeuroCalm is available on both iOS and Android devices.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click on the "Forgot Password" link on the login page and follow the instructions.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards and PayPal.'
  },
  {
    question: 'How can I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your account settings.'
  },
];

export default function SupportPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">How can we help?</h1>
        <p className="text-xl text-muted-foreground">Find answers or get in touch with our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <h3 className="font-medium text-lg">{faq.question}</h3>
                    <p className="text-muted-foreground mt-2">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
              </p>
            </CardHeader>
            <CardContent>
              <ContactForm />
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">Prefer email?</h4>
                <p className="text-sm text-muted-foreground">
                  Email us at:{' '}
                  <a 
                    href="mailto:hm2257153@gmail.com" 
                    className="text-primary hover:underline"
                  >
                    hm2257153@gmail.com
                  </a>
                </p>
                <p className="text-muted-foreground mt-2">
                  1234 Calm Street<br />
                  Serenity, CA 90210<br />
                  United States
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
