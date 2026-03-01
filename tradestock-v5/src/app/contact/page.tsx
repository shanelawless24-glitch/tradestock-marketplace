"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Menu,
  Clock,
} from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you soon.");
    setIsSubmitting(false);
    
    // Reset form
    const form = e.target as HTMLFormElement;
    form.reset();
  };

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
                  item.href === "/contact"
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
                      item.href === "/contact" ? "text-primary" : ""
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
              Get in <span className="text-brand-blue">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We&apos;re here to help. Reach out to our team 
              and we&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="h-5 w-5 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    For general inquiries
                  </p>
                  <a 
                    href="mailto:info@tradestock.ie" 
                    className="text-brand-blue hover:underline"
                  >
                    info@tradestock.ie
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <Phone className="h-5 w-5 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mon-Fri, 9am-5pm
                  </p>
                  <a 
                    href="tel:+353123456789" 
                    className="text-brand-blue hover:underline"
                  >
                    +353 1 234 5678
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-5 w-5 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold mb-1">Visit Us</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Our headquarters
                  </p>
                  <p className="text-sm">
                    123 Motor Trade Centre<br />
                    Dublin 2, Ireland<br />
                    D02 AB12
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-5 w-5 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday - Sunday: Closed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          placeholder="John Smith" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john@example.com" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+353 87 123 4567" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject" 
                          placeholder="How can we help?" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
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
