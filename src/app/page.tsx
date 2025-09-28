import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Bot, LineChart, ShieldCheck, Zap, Dna, Telescope, Sparkles, Activity, Target } from "lucide-react";
import Link from "next/link";
import { NeuroCalmIcon } from "@/components/icons";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background dark:bg-[#0B0C10] text-foreground">
      <header className="container mx-auto px-2 xxs:px-3 xs:px-4 sm:px-6 lg:px-8 py-1 xxs:py-2 xs:py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50 bg-background/80 dark:bg-[#0B0C10]/80 backdrop-blur-sm">
        <div className="flex items-center gap-1 xxs:gap-1 xs:gap-2">
          <NeuroCalmIcon className="w-5 h-5 xxs:w-6 xxs:h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-base xxs:text-lg xs:text-xl sm:text-2xl font-bold font-headline text-foreground">NeuroCalm</h1>
        </div>
        <div className="flex items-center gap-0.5 xxs:gap-1 xs:gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" asChild className="hidden xs:flex h-6 xxs:h-7 xs:h-8 sm:h-9">
            <Link href="#features" className="text-xs xs:text-sm">Features</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex h-6 xxs:h-7 xs:h-8 sm:h-9">
            <Link href="#how-it-works" className="text-xs xs:text-sm">How It Works</Link>
          </Button>
          <Button size="sm" asChild className="h-6 xxs:h-7 xs:h-8 sm:h-9 compact-mobile-button">
            <Link href="/dashboard" className="text-xs xxs:text-xs xs:text-sm sm:text-base">
              <span className="hidden xs:inline">Access Dashboard</span>
              <span className="xs:hidden">Dashboard</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-8 xxs:py-12 xs:py-16 sm:py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.03]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
          <div className="container mx-auto px-2 xxs:px-3 xs:px-4 sm:px-6 lg:px-8 text-center relative">
            <h1 className="text-xl xxs:text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary tracking-tighter">
              Unlock Your Brain's Potential
            </h1>
            <p className="mt-3 xxs:mt-4 xs:mt-6 max-w-3xl mx-auto text-xs xxs:text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground">
              Leverage the power of AI and neuroscience to reduce stress, enhance focus, and build life-changing habits. Your journey to a calmer, more productive mind starts now.
            </p>
            <div className="mt-4 xxs:mt-6 xs:mt-8 sm:mt-10">
              <Button size="sm" className="xxs:hidden font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform duration-300 compact-mobile-button" asChild>
                <Link href="/dashboard">Begin</Link>
              </Button>
              <Button size="sm" className="hidden xxs:flex xs:hidden font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform duration-300 compact-mobile-button" asChild>
                <Link href="/dashboard">Start Journey</Link>
              </Button>
              <Button size="lg" className="hidden xs:flex font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform duration-300" asChild>
                <Link href="/dashboard">Begin Your Transformation</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 2: Core Pillars */}
        <section id="features" className="py-16 md:py-24 bg-card dark:bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">The NeuroCalm Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={<BrainCircuit className="w-10 h-10 text-primary" />} title="Track & Understand" description="Log daily moods and habits in seconds to build a dynamic map of your mental landscape." />
              <FeatureCard icon={<Bot className="w-10 h-10 text-primary" />} title="AI-Powered Insights" description="Receive personalized recommendations from your AI coach to detox mindsets and boost focus." />
              <FeatureCard icon={<LineChart className="w-10 h-10 text-primary" />} title="Visualize Progress" description="Intuitive charts reveal your unique patterns and track your growth towards your goals over time." />
              <FeatureCard icon={<ShieldCheck className="w-10 h-10 text-primary" />} title="Private & Secure" description="Your data is encrypted and yours alone. We adhere to the highest privacy standards." />
            </div>
          </div>
        </section>
        
        {/* Section 3: How it Works */}
        <section id="how-it-works" className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Your Daily Path to Clarity</h2>
                <div className="relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <StepCard number="1" title="Daily Check-in" description="Start your day with a 60-second check-in. It’s a simple yet powerful habit to build self-awareness."/>
                        <StepCard number="2" title="Instant Analysis" description="Our AI processes your input to generate your Calm and Productivity scores for the day."/>
                        <StepCard number="3" title="Actionable Guidance" description="Receive tailored recommendations and tools to navigate your day with intention and focus."/>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 4: The Science */}
        <section className="py-16 md:py-24 bg-card dark:bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Grounded in Science</h2>
                <p className="text-muted-foreground mb-6 text-lg">NeuroCalm is built on the principles of neuroplasticity—the brain's ability to reorganize itself by forming new neural connections. By consistently practicing small, positive habits, you are actively 'rewiring' your brain for greater well-being and performance.</p>
                 <Button variant="link" asChild className="p-0 h-auto text-lg">
                  <Link href="#">Learn More About Neuroplasticity</Link>
                </Button>
              </div>
              <div className="relative h-80 w-full">
                <Image src="https://picsum.photos/seed/brain/600/400" data-ai-hint="abstract brain network" alt="Abstract neural network" fill style={{ objectFit: 'cover' }} className="rounded-lg"/>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Features Deep Dive */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">A Toolkit for Your Mind</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InfoCard icon={<Zap className="w-8 h-8 text-accent"/>} title="Habit Tools" description="Access a library of exercises and techniques, from mindfulness to cognitive reframing, tailored to your needs."/>
              <InfoCard icon={<Dna className="w-8 h-8 text-accent"/>} title="Personalized Goals" description="Set your own goals, and our AI will help you break them down into manageable steps and track your progress."/>
              <InfoCard icon={<Telescope className="w-8 h-8 text-accent"/>} title="Long-Term Trends" description="Go beyond daily scores. See your mental wellness evolution over weeks and months to spot larger patterns."/>
            </div>
          </div>
        </section>
        
        {/* Section 6: Testimonial */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <blockquote className="max-w-4xl mx-auto">
              <p className="text-2xl md:text-3xl font-semibold italic">"NeuroCalm has been a game-changer. I feel more in control of my days and less reactive to stress. Seeing my scores improve is incredibly motivating."</p>
              <footer className="mt-6 text-xl font-bold">- Alex R, Software Engineer</footer>
            </blockquote>
          </div>
        </section>

        {/* Section 7: AI Coach */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-80 w-full order-last md:order-first">
                 <Image src="https://picsum.photos/seed/aicoach/600/400" data-ai-hint="futuristic abstract" alt="AI Coach Interface" fill style={{ objectFit: 'cover' }} className="rounded-lg"/>
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Your Personal AI Brain Coach</h2>
                    <p className="text-muted-foreground mb-6 text-lg">Have a question? Feeling stuck? Your AI coach is available 24/7 to provide guidance, answer questions about mental wellness, and offer encouragement based on your unique data profile. It's like having a neuroscience expert in your pocket.</p>
                </div>
            </div>
          </div>
        </section>

        {/* Section 8: Target Audience */}
        <section className="py-16 md:py-24 bg-card dark:bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Who is NeuroCalm For?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <InfoCard icon={<Sparkles className="w-8 h-8 text-primary"/>} title="High-Achievers" description="Optimize your mental performance to stay ahead without burning out."/>
              <InfoCard icon={<Activity className="w-8 h-8 text-primary"/>} title="Wellness Enthusiasts" description="Deepen your self-awareness and add a data-driven layer to your wellness routine."/>
              <InfoCard icon={<Target className="w-8 h-8 text-primary"/>} title="Anyone Seeking Growth" description="If you're ready to understand your mind better and make positive changes, you're in the right place."/>
            </div>
          </div>
        </section>

        {/* Section 9: Disclaimer */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 md:p-12 shadow-lg bg-secondary dark:bg-secondary/50 border-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">For Informational Purposes Only</h2>
                <p className="mt-4 max-w-4xl mx-auto text-muted-foreground">
                  NeuroCalm is a wellness tool designed for personal growth and is not a medical device. It does not diagnose or treat medical conditions. The term 'rewire your brain' refers to building habits based on neuroplasticity. The AI coach is an assistant, not a doctor. Your privacy is paramount.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 10: Final CTA */}
        <section className="py-20 md:py-32 lg:py-40 text-center" style={{background: 'radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 70%)'}}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl md:text-5xl font-bold font-headline">Ready to Rewire?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Join thousands of users on the journey to a more focused and peaceful mind. Your first step is just a click away.</p>
                <div className="mt-8">
                     <Button size="lg" asChild className="font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform duration-300">
                        <Link href="/dashboard">Start For Free</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-4 xs:py-6 bg-background dark:bg-[#0B0C10] border-t">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p className="text-xs xs:text-sm">&copy; {new Date().getFullYear()} NeuroCalm. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="text-center p-6 rounded-lg transition-all duration-300 hover:bg-card/50 dark:hover:bg-card/80 hover:scale-105">
    <div className="flex justify-center items-center mb-4">{icon}</div>
    <h3 className="text-xl font-bold font-headline">{title}</h3>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: string, title: string, description: string }) => (
    <div className="bg-card p-6 rounded-lg shadow-lg relative z-10">
        <div className="absolute -top-5 -left-5 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">{number}</div>
        <h3 className="text-xl font-bold font-headline mt-8">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
);

const InfoCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="p-6 text-center">
    <div className="flex justify-center items-center mb-4">{icon}</div>
    <CardTitle className="text-xl">{title}</CardTitle>
    <CardContent className="p-0 mt-2">
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const BgGrid = () => (
    <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
    </div>
)
