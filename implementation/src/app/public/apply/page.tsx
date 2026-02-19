// TradeStock Marketplace - Dealer Application Form
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/layout/logo';
import { DEALERSHIP_TYPES, IRISH_COUNTIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const applicationSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  tradingName: z.string().optional(),
  vatNumber: z.string().regex(/^IE[0-9]{7}[A-Z]$/i, 'Invalid VAT number format (IE1234567A)').optional().or(z.literal('')),
  addressLine1: z.string().min(2, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  county: z.string().min(1, 'County is required'),
  eircode: z.string().regex(/^[A-Z]{1}[0-9]{2}\s?[A-Z0-9]{4}$/i, 'Invalid Eircode').optional().or(z.literal('')),
  contactName: z.string().min(2, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().regex(/^\+353[\s]?[1-9][0-9]{7,8}$/, 'Phone must be in format +353XXXXXXXXX'),
  dealershipType: z.string().min(1, 'Dealership type is required'),
  brandsSold: z.string().optional(),
  stockVolumeMonthly: z.string().optional(),
  message: z.string().max(500, 'Message must be under 500 characters').optional(),
  howDidYouHear: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: '',
      tradingName: '',
      vatNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      county: '',
      eircode: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      dealershipType: '',
      brandsSold: '',
      stockVolumeMonthly: '',
      message: '',
      howDidYouHear: '',
      termsAccepted: false,
    },
  });

  async function onSubmit(data: ApplicationFormData) {
    setIsSubmitting(true);
    try {
      // Check if email already has an application
      const { data: existingApp } = await supabase
        .from('dealer_applications')
        .select('id, status')
        .eq('contact_email', data.contactEmail)
        .single();

      if (existingApp) {
        if (existingApp.status === 'pending') {
          toast.info('You already have a pending application. We will contact you soon.');
          router.push('/');
          return;
        }
        if (existingApp.status === 'approved') {
          toast.info('Your application has already been approved. Please sign in.');
          router.push('/login');
          return;
        }
      }

      // Submit application
      const { error } = await supabase.from('dealer_applications').insert({
        company_name: data.companyName,
        trading_name: data.tradingName || null,
        vat_number: data.vatNumber || null,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || null,
        city: data.city,
        county: data.county,
        eircode: data.eircode || null,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        dealership_type: data.dealershipType,
        brands_sold: data.brandsSold ? data.brandsSold.split(',').map(b => b.trim()) : null,
        stock_volume_monthly: data.stockVolumeMonthly ? parseInt(data.stockVolumeMonthly) : null,
        message: data.message || null,
        how_did_you_hear: data.howDidYouHear || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Application submitted successfully! We will review it within 2 business days.');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <Logo className="mx-auto h-12 w-auto mb-4" />
          <h1 className="text-3xl font-bold">Apply for TradeStock Access</h1>
          <p className="text-muted-foreground mt-2">
            Join Ireland&apos;s premier B2B motor dealer marketplace
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dealership Information</CardTitle>
            <CardDescription>
              Tell us about your dealership. We review all applications within 2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Company Details</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC Motors Ltd" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tradingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trading Name (if different)</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC Cars" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Number</FormLabel>
                        <FormControl>
                          <Input placeholder="IE1234567A" {...field} />
                        </FormControl>
                        <FormDescription>
                          Irish VAT number format: IE1234567A
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dealershipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dealership Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEALERSHIP_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address</h3>
                  
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Unit 4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City/Town *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dublin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="county"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select county" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {IRISH_COUNTIES.map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eircode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eircode</FormLabel>
                          <FormControl>
                            <Input placeholder="D01 AB12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@company.ie" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+353 1 234 5678" {...field} />
                          </FormControl>
                          <FormDescription>
                            Include country code (+353)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="brandsSold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brands Sold</FormLabel>
                        <FormControl>
                          <Input placeholder="Ford, Toyota, BMW (comma separated)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockVolumeMonthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Monthly Stock Volume</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your dealership and why you want to join TradeStock..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="howDidYouHear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us?</FormLabel>
                        <FormControl>
                          <Input placeholder="Referral, Google, Trade magazine, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms */}
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the{' '}
                          <a href="/terms" className="text-primary hover:underline" target="_blank">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-primary hover:underline" target="_blank">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
