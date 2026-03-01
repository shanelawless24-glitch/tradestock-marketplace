"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Shield,
  Check,
  TrendingUp,
  Search,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Menu,
  Car,
  Building2,
  Users,
} from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";

export default function HowItWorksPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="TradeStock"
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.href === "/how-it-works"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/apply">
              <Button size="sm">Apply Now</Button>
            </Link>
          </nav>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <Image
                    src="/logo.png"
                    alt="TradeStock"
                    width={140}
                    height={32}
                    className="h-8 w-auto"
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg font-medium py-2 hover:text-primary transition-colors ${
                      item.href === "/how-it-works" ? "text-primary" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="my-2" />
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Apply Now</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How <span className="text-brand-blue">TradeStock</span> Works
            </h1>
            <p className="text-xl text-muted-foreground">
              Simple, secure, and efficient B2B motor trading for Irish dealerships.
              Get started in three easy steps.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-brand-blue" />
                </div>
                <div className="text-sm font-semibold text-brand-blue mb-2">Step 1</div>
                <h3 className="text-2xl font-bold mb-4">Apply for Access</h3>
                <p className="text-muted-foreground mb-6">
                  Submit your dealership application with your business details, VAT number, 
                  and trade license information. Our team reviews each application to ensure 
                  only legitimate motor traders join the platform.
                </p>
                <ul className="space-y-3">
                  {[
                    "Complete online application form",
                    "Provide VAT number verification",
                    "Submit trade license documentation",
                    "Wait for approval (typically 24-48 hours)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="h-8 w-8 text-brand-blue" />
                </div>
                <div className="text-sm font-semibold text-brand-blue mb-2">Step 2</div>
                <h3 className="text-2xl font-bold mb-4">Get Verified & Subscribe</h3>
                <p className="text-muted-foreground mb-6">
                  Once approved, complete your dealership profile and set up your subscription. 
                  Early adopters can lock in our lifetime launch pricing.
                </p>
                <ul className="space-y-3">
                  {[
                    "Receive approval notification via email",
                    "Set up your dealership profile",
                    "Choose your subscription plan",
                    "Complete payment setup",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-brand-blue" />
                </div>
                <div className="text-sm font-semibold text-brand-blue mb-2">Step 3</div>
                <h3 className="text-2xl font-bold mb-4">Start Trading</h3>
                <p className="text-muted-foreground mb-6">
                  List your vehicles, browse stock from other verified dealers, negotiate 
                  directly, and close deals. All within a secure, professional environment.
                </p>
                <ul className="space-y-3">
                  {[
                    "List vehicles with photos and details",
                    "Browse stock from 32 counties",
                    "Message dealers directly",
                    "Negotiate and close deals",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to buy and sell vehicles wholesale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Car,
                title: "List Vehicles",
                description: "Add unlimited vehicle listings with photos, specs, and pricing.",
              },
              {
                icon: Search,
                title: "Browse Stock",
                description: "Search and filter vehicles from dealers across all 32 counties.",
              },
              {
                icon: MessageSquare,
                title: "Direct Messaging",
                description: "Negotiate directly with dealers through our secure chat system.",
              },
              {
                icon: Building2,
                title: "Dealer Profiles",
                description: "Build your reputation with ratings and verified badges.",
              },
              {
                icon: Users,
                title: "Network",
                description: "Connect with Ireland's largest network of motor traders.",
              },
              {
                icon: Shield,
                title: "Verified Only",
                description: "Trade with confidence knowing all dealers are vetted.",
              },
              {
                icon: CreditCard,
                title: "Simple Billing",
                description: "One monthly fee, no hidden charges or transaction fees.",
              },
              {
                icon: TrendingUp,
                title: "Market Insights",
                description: "Access pricing data and market trends to make informed decisions.",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join Ireland&apos;s premier B2B motor trading platform today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-brand-blue hover:bg-brand-blue-dark">
                Apply for Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Image
              src="/logo.png"
              alt="TradeStock"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/how-it-works" className="hover:text-foreground">How It Works</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
              <Link href="/apply" className="hover:text-foreground">Apply Now</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 TradeStock. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
