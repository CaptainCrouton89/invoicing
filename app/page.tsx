import { AnimatedGradient } from "@/components/ui/animated-gradient";
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
  CheckCircle,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Github,
  Heart,
  LinkedinIcon,
  Sparkles,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
          100% Free Invoicing for Independent Contractors
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Simple, <span className="text-primary">lightweight</span> invoicing
          <span className="flex items-center justify-center gap-2 mt-2">
            made with <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Create professional invoices, track payments, and manage your finances
          with ease. Designed specifically for freelancers and independent
          contractors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button size="lg" asChild className="gap-2">
            <Link href="/sign-up">
              Get Started (Free Forever) <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <AnimatedGradient className="w-full mt-10 border shadow-md relative">
          <div className="overflow-auto h-[40vh] md:h-[50vh]">
            <div className="w-full h-auto min-h-full">
              <Image
                src="/demo.png"
                alt="Invoice Example"
                layout="responsive"
                width={1600}
                height={1000}
                className="object-contain"
              />
            </div>
          </div>
        </AnimatedGradient>
      </section>

      {/* Features Section */}
      <section className="py-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
            Simplicity for Independent Contractors
          </div>
          <h2 className="text-3xl font-bold mb-3">
            Everything you need, nothing you don't
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Lightweight tools that save you time and energy, so you can focus on
            what you do best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary/20">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Simple Invoicing</CardTitle>
              <CardDescription>
                Create clean, professional invoices in seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No complicated templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Just what you need</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>PDF format for easy sharing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary/20">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Lightweight & Fast</CardTitle>
              <CardDescription>
                No bloat, just pure efficiency for busy contractors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Minimal interface</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Lightning fast operation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No unnecessary features</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary/20 bg-primary/5">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Free Forever</CardTitle>
              <CardDescription>
                No subscriptions, no hidden fees, no catches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>100% free to use</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Open-source project</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No ads or data selling</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-10 bg-muted/30 rounded-2xl p-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
            Quick & Easy
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
            <h3 className="text-xl font-semibold mb-3">Enter your details</h3>
            <p className="text-muted-foreground">
              No account needed. Just enter your contractor information once.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
              <span className="text-primary font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Create invoice</h3>
            <p className="text-muted-foreground">
              Add your client, services, and rates with our simple interface.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
              <span className="text-primary font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Download & send</h3>
            <p className="text-muted-foreground">
              Get your professional PDF invoice instantly, ready to share.
            </p>
          </div>
        </div>
      </section>

      {/* Made with Love Section */}
      <section className="py-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
            A Personal Project
          </div>
          <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
            Made with <Heart className="h-6 w-6 text-red-500 fill-red-500" />{" "}
            for Independent Contractors
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Created by a developer who understands the challenges of independent
            contracting. This tool is my contribution to making your business
            life a little easier.
          </p>
        </div>

        <AnimatedGradient className="max-w-3xl mx-auto p-8">
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <p className="text-xl">
                  "As an independent contractor myself, I was tired of complex
                  invoicing solutions that cost too much and did too much. I
                  built this simple tool to make invoicing straightforward and
                  free for everyone in the independent contractor community."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">SR</span>
                  </div>
                  <div>
                    <p className="font-semibold">Silas Rhyneer</p>
                    <p className="text-sm text-muted-foreground">
                      Rhyneer Consulting
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
            Join other independent contractors who use this free tool to manage
            their invoices with ease.
          </p>
          <Button size="lg" variant="secondary" className="gap-2 group">
            Get Started (It's Free!)
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </AnimatedGradient>

      {/* Links Section */}
      <section className="pt-0 pb-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
          <a
            href="https://github.com/CaptainCrouton89/invoicing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg hover:text-primary transition-colors group"
          >
            <Github className="h-6 w-6" />
            <span>GitHub Repo</span>
            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="https://rhyneerconsulting.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg hover:text-primary transition-colors group"
          >
            <CreditCard className="h-6 w-6" />
            <span>Rhyneer Consulting</span>
            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="https://linkedin.com/in/silas-rhyneer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg hover:text-primary transition-colors group"
          >
            <LinkedinIcon className="h-6 w-6" />
            <span>Connect on LinkedIn</span>
            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} • Open-source and free forever</p>
        </div>
      </section>
    </div>
  );
}
