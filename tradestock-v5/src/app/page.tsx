"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Car,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Lock,
  Check,
  ArrowRight,
  MapPin,
  MessageCircle,
  Menu,
  X,
  Building2,
  Search,
  MessageSquare,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { LAUNCH_DATE, formatDate, PUBLIC_NAV_ITEMS } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";

export default function HomePage() {
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
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
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
                    className="text-lg font-medium py-2 hover:text-primary transition-colors"
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/5 via-background to-background" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              Launching {formatDate(LAUNCH_DATE)}
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Ireland&apos;s Premier{" "}
              <span className="text-brand-blue">B2B Motor</span>
              <br />
              Trading Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with verified motor dealers across all 32 counties. 
              Buy and sell vehicles wholesale with confidence on Ireland&apos;s most trusted trading platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 bg-navy hover:bg-navy-light">
                  Apply for Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Stats - No Prices */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "32", label: "Counties Covered" },
                { value: "100+", label: "Dealerships" },
                { value: "Verified", label: "Dealers Only" },
                { value: "24/7", label: "Platform Access" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-navy">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How TradeStock Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, secure, and efficient B2B motor trading for Irish dealerships.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Apply for Access",
                description: "Submit your dealership details for verification. We validate your VAT number and trade license.",
                icon: Shield,
              },
              {
                step: "2",
                title: "Get Verified",
                description: "Once approved, set up your subscription and complete your dealership profile.",
                icon: Check,
              },
              {
                step: "3",
                title: "Start Trading",
                description: "List your vehicles, browse stock from other dealers, and make deals directly.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <Card key={item.step} className="card-hover border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <item.icon className="h-8 w-8 text-brand-blue" />
                  </div>
                  <div className="text-sm font-semibold text-brand-blue mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">
                View Full Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose TradeStock?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Irish motor dealers, our platform offers everything you need to grow your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Verified Dealers Only",
                description: "Every dealer is thoroughly vetted with valid VAT numbers and trade licenses.",
              },
              {
                icon: Zap,
                title: "Instant Connections",
                description: "Reach buyers across Ireland instantly. No more waiting for the right customer.",
              },
              {
                icon: Lock,
                title: "Secure Transactions",
                description: "Built-in security features protect both buyers and sellers on every deal.",
              },
              {
                icon: Car,
                title: "Vehicle History",
                description: "Access comprehensive vehicle history reports for informed purchasing decisions.",
              },
              {
                icon: Users,
                title: "Trade Network",
                description: "Join Ireland's largest network of professional motor traders.",
              },
              {
                icon: TrendingUp,
                title: "Market Insights",
                description: "Get real-time market data and pricing insights to make better trades.",
              },
              {
                icon: MapPin,
                title: "32 County Coverage",
                description: "Connect with dealers from every corner of Ireland, North and South.",
              },
              {
                icon: MessageCircle,
                title: "Direct Messaging",
                description: "Negotiate directly with other dealers through our secure messaging system.",
              },
              {
                icon: Building2,
                title: "Dealer Profiles",
                description: "Showcase your dealership with a professional profile and ratings.",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-brand-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of Irish motor dealers already using TradeStock to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="text-base px-8 bg-brand-blue hover:bg-brand-blue-dark">
                Apply for Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-base px-8 border-white/30 hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="TradeStock"
                  width={140}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <p className="text-sm text-muted-foreground">
                Ireland&apos;s trusted B2B motor trading platform connecting verified dealers nationwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/apply" className="hover:text-foreground transition-colors">
                    Apply Now
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-foreground transition-colors">
                    Dealer Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            © 2026 TradeStock. The B2B Dealership Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
