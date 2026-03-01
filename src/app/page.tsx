import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { LAUNCH_DATE, formatDate, PRICING } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-tradestock-500 to-tradestock-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">TS</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight">TradeStock</span>
              <span className="text-xs text-muted-foreground">Marketplace</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link href="/auth/login">
              <Button>Dealer Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tradestock-50 via-background to-background" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              Launching {formatDate(LAUNCH_DATE)}
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Ireland&apos;s Premier{" "}
              <span className="gradient-text">B2B Motor</span>
              <br />
              Trading Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with verified motor dealers across all 32 counties. 
              Buy and sell vehicles wholesale with confidence on Ireland&apos;s most trusted trading platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Dealer Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "32", label: "Counties" },
                { value: "100+", label: "Dealerships" },
                { value: "€99", label: "Per Month" },
                { value: "24/7", label: "Support" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
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
                description: "Get real-time market data and pricing insights to make better trades.
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
            ].map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              One plan, full access. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="relative border-2 border-primary shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="px-4 py-1 text-sm">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Standard Plan</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Full access to all platform features
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">
                      €{PRICING.STANDARD.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
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
                
                <Link href="/auth/login">
                  <Button className="w-full" size="lg">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Lifetime Promo Notice */}
            <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 text-lg">🎉</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Lifetime Launch Offer</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    First 100 dealerships to activate get €49.99/month for life! 
                    Limited spots available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-tradestock-900 to-tradestock-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of Irish motor dealers already using TradeStock to grow their business.
          </p>
          <Link href="/auth/login">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-tradestock-500 to-tradestock-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <span className="font-bold">TradeStock</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Ireland&apos;s trusted B2B motor trading platform connecting verified dealers nationwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/auth/login" className="hover:text-foreground transition-colors">
                    Dealer Login
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="mailto:support@tradestock.ie" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    FAQ
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
            © 2026 TradeStock Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
