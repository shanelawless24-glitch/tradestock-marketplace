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
  Check,
  Sparkles,
  ArrowRight,
  Menu,
  HelpCircle,
} from "lucide-react";
import { PUBLIC_NAV_ITEMS, PRICING } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";

export default function PricingPage() {
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
                  item.href === "/pricing"
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
                      item.href === "/pricing" ? "text-primary" : ""
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
              Simple, Transparent <span className="text-brand-blue">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              One plan, full access. No hidden fees, no surprises. 
              Choose between our standard monthly plan or lock in lifetime savings.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Standard Plan */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Standard Plan</h3>
                <p className="text-muted-foreground mb-6">
                  Full access to all platform features
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold">€{PRICING.STANDARD.monthlyPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited vehicle listings",
                    "Browse all dealer stock",
                    "Direct dealer messaging",
                    "Save favourite listings",
                    "Real-time notifications",
                    "Priority support",
                    "Market insights & analytics",
                    "Verified dealer badge",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/apply">
                  <Button className="w-full" size="lg">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Lifetime Plan */}
            <Card className="border-2 border-brand-blue shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-blue text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                LIMITED OFFER
              </div>
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold">Lifetime Launch</h3>
                  <Sparkles className="h-5 w-5 text-brand-blue" />
                </div>
                <p className="text-muted-foreground mb-6">
                  First 100 dealerships only - Price locked forever
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold">€{PRICING.LIFETIME.monthlyPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Everything in Standard Plan",
                    "Price locked for life",
                    "Early access to new features",
                    "Priority support queue",
                    "Exclusive dealer events",
                    "Lifetime member badge",
                    "No future price increases",
                    "Cancel anytime",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-brand-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-brand-blue" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/apply">
                  <Button className="w-full" size="lg" variant="default">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Claim Lifetime Offer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Lifetime Notice */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900">Limited Time Offer</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    Only 100 lifetime spots available. Once they&apos;re gone, the standard 
                    monthly rate of €{PRICING.STANDARD.monthlyPrice} will apply. Apply now to secure your lifetime pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {[
                {
                  q: "What's included in the subscription?",
                  a: "Your subscription includes unlimited vehicle listings, full access to browse all dealer stock, direct messaging with other dealers, saved listings, real-time notifications, market insights, analytics, and priority customer support.",
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period.",
                },
                {
                  q: "What is the Lifetime Launch offer?",
                  a: "The Lifetime Launch offer is available to the first 100 dealerships that join TradeStock. You'll pay just €49.99/month for life, with no future price increases. This is a limited-time offer.",
                },
                {
                  q: "Are there any transaction fees?",
                  a: "No, TradeStock does not charge any transaction fees. You keep 100% of your sales. Your monthly subscription is the only fee you'll pay.",
                },
                {
                  q: "How do I get verified?",
                  a: "During the application process, we verify your VAT number and trade license. This ensures only legitimate motor dealers can access the platform, creating a trusted trading environment.",
                },
                {
                  q: "Can I switch from Standard to Lifetime later?",
                  a: "The Lifetime Launch offer is only available to the first 100 dealerships. Once these spots are filled, the offer will no longer be available. We recommend applying early to secure lifetime pricing.",
                },
              ].map((faq, index) => (
                <div key={index} className="border-b pb-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Apply now and start trading with Ireland&apos;s best motor dealers.
          </p>
          <Link href="/apply">
            <Button size="lg" className="bg-brand-blue hover:bg-brand-blue-dark">
              Apply for Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
