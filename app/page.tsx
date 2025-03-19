import { StatsCounter } from "@/components/StatsCounter";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ChevronRight,
  CreditCard,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
          Simplified invoicing for everyone
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Simple invoicing for{" "}
          <span className="text-primary">modern businesses</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Create professional invoices, track payments, and manage your finances
          with ease. Designed for freelancers, small businesses, and
          entrepreneurs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button size="lg" className="gap-2">
            Get Started <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            See how it works
          </Button>
        </div>
        <AnimatedGradient className="w-full mt-10 border shadow-md">
          <AspectRatio ratio={16 / 9}>
            <div className="bg-background/50 w-full h-full flex items-center justify-center">
              <div className="px-6 py-12 rounded-lg bg-card border shadow-lg">
                <span className="text-2xl font-semibold">
                  Dashboard Preview
                </span>
              </div>
            </div>
          </AspectRatio>
        </AnimatedGradient>
      </section>

      {/* Features Section */}
      <section className="py-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
            Features
          </div>
          <h2 className="text-3xl font-bold mb-3">
            Everything you need to manage invoices
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features to streamline your invoicing process and get paid
            faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary/20">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Professional Invoices</CardTitle>
              <CardDescription>
                Create customized, professional invoices in seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Multiple customizable templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Add your logo and branding</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>PDF and digital formats</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary/20">
            <CardHeader>
              <CreditCard className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Seamless Payments</CardTitle>
              <CardDescription>
                Get paid faster with integrated payment options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Online payment processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Multiple payment methods</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Automatic reminders</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary/20">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Financial Insights</CardTitle>
              <CardDescription>
                Track and analyze your business performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Income and expense tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Clear financial reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Tax preparation assistance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Counter */}
      <StatsCounter />

      {/* How it Works Section */}
      <section className="py-10 bg-muted/30 rounded-2xl p-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
            Simple Process
          </div>
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes with our simple three-step process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center group">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
              <span className="text-primary font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Create an account</h3>
            <p className="text-muted-foreground">
              Sign up for free and set up your business profile in minutes.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
              <span className="text-primary font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Create invoices</h3>
            <p className="text-muted-foreground">
              Design professional invoices using our templates and send them
              instantly.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
              <span className="text-primary font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Get paid</h3>
            <p className="text-muted-foreground">
              Receive payments directly through the platform and track your
              income.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
            Testimonials
          </div>
          <h2 className="text-3xl font-bold mb-3">
            Trusted by businesses everywhere
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what our customers have to say about their experience.
          </p>
        </div>

        <AnimatedGradient className="max-w-3xl mx-auto p-8">
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <p className="text-xl italic">
                  "This invoicing app has completely transformed how I manage my
                  freelance business. I've reduced the time spent on admin tasks
                  by 75% and my clients love how professional my invoices look."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold">Jane Doe</p>
                    <p className="text-sm text-muted-foreground">
                      Freelance Designer
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedGradient>
      </section>

      {/* CTA Section */}
      <AnimatedGradient className="py-16 px-6 text-center">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to simplify your invoicing?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of businesses that use our platform to manage their
            finances with ease.
          </p>
          <Button size="lg" variant="secondary" className="gap-2 group">
            Get Started Today
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </AnimatedGradient>
    </div>
  );
}
