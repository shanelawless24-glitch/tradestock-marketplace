"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Check,
  Shield,
  ArrowRight,
  Menu,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import { PUBLIC_NAV_ITEMS, IRISH_COUNTIES } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function ApplyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Application submitted! We'll review and get back to you within 24-48 hours.");
    setIsSubmitting(false);
    setStep(3);
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
                    className="text-lg font-medium py-2 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="my-2" />
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
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
              Apply for <span className="text-brand-blue">Access</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Join Ireland&apos;s premier B2B motor trading platform. 
              Complete the application below to get started.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            {step < 3 && (
              <div className="flex items-center justify-center mb-12">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${step >= 1 ? "text-brand-blue" : "text-muted-foreground"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-brand-blue text-white" : "bg-muted"}`}>
                      1
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">Business Info</span>
                  </div>
                  <div className="w-12 h-px bg-border" />
                  <div className={`flex items-center gap-2 ${step >= 2 ? "text-brand-blue" : "text-muted-foreground"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-brand-blue text-white" : "bg-muted"}`}>
                      2
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">Verification</span>
                  </div>
                  <div className="w-12 h-px bg-border" />
                  <div className={`flex items-center gap-2 ${step >= 3 ? "text-brand-blue" : "text-muted-foreground"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-brand-blue text-white" : "bg-muted"}`}>
                      3
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">Complete</span>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-brand-blue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Business Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about your dealership</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input id="businessName" placeholder="ABC Motors Ltd" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vatNumber">VAT Number *</Label>
                        <Input id="vatNumber" placeholder="IE1234567X" required />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name *</Label>
                        <Input id="contactName" placeholder="John Smith" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position *</Label>
                        <Input id="position" placeholder="Director / Manager" required />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="john@abcmotors.ie" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" placeholder="+353 87 123 4567" required />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="county">County *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select county" />
                          </SelectTrigger>
                          <SelectContent>
                            {IRISH_COUNTIES.map((county) => (
                              <SelectItem key={county} value={county.toLowerCase()}>
                                {county}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address *</Label>
                        <Input id="address" placeholder="123 Main Street" required />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="w-full md:w-auto">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-brand-blue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Verification</h2>
                      <p className="text-sm text-muted-foreground">Help us verify your dealership</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="tradeLicense">Trade License Number *</Label>
                      <Input id="tradeLicense" placeholder="Your motor trade license number" required />
                      <p className="text-xs text-muted-foreground">
                        This helps us verify you are a legitimate motor trader
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input id="website" placeholder="https://www.yourdealership.ie" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="search">Google Search</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="referral">Referral from another dealer</SelectItem>
                          <SelectItem value="sdr">TradeStock SDR</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">Verification Process</p>
                          <p className="text-muted-foreground">
                            We verify all applications to ensure only legitimate motor dealers 
                            join our platform. This typically takes 24-48 hours. You&apos;ll receive 
                            an email once your application is approved.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
                  <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                    Thank you for applying to join TradeStock. Our team will review your 
                    application and verify your dealership details. You&apos;ll receive an email 
                    within 24-48 hours with the next steps.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                      <Button variant="outline">
                        Back to Home
                      </Button>
                    </Link>
                    <Link href="/how-it-works">
                      <Button>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
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
