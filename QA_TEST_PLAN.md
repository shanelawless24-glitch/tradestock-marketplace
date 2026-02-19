# TradeStock Marketplace - QA Test Plan

## Overview

This document outlines the comprehensive testing strategy for TradeStock Marketplace, including acceptance criteria, test cases, and test accounts.

---

## Test Environment

### URLs
- **Production**: https://tradestock.ie
- **Staging**: https://staging.tradestock.ie
- **Local**: http://localhost:3000

### Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@tradestock.ie | TestPass123! | Full platform access |
| Approved Dealer | dealer@dublinmotors.ie | TestPass123! | Active subscription |
| Pending Dealer | pending@corkcars.ie | TestPass123! | Application pending |
| Rejected Dealer | rejected@baddealer.ie | TestPass123! | Application rejected |
| No Subscription | unsub@waterfordauto.ie | TestPass123! | Approved, no subscription |

---

## Test Categories

### 1. Authentication & Authorization

#### TC-AUTH-001: User Login
**Precondition**: User has valid credentials

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /login | Login form displayed |
| 2 | Enter valid email and password | User logged in |
| 3 | Verify redirect | Redirected to appropriate dashboard |

**Acceptance Criteria**:
- [ ] Valid credentials log user in
- [ ] Invalid credentials show error
- [ ] User redirected based on role
- [ ] Session persisted across page reloads

#### TC-AUTH-002: Route Protection
**Precondition**: User not logged in

| Route | Expected Behavior |
|-------|-------------------|
| /dashboard | Redirect to /login |
| /admin/dashboard | Redirect to /login |
| /browse | Redirect to /login |
| /login | Allow access |
| / | Allow access |

#### TC-AUTH-003: Role-Based Access

| Role | Can Access | Cannot Access |
|------|------------|---------------|
| Admin | /admin/*, all dealer routes | - |
| Approved + Subscribed | All dealer routes, marketplace | /admin/* |
| Approved (no sub) | /dashboard, /listings, /profile, /billing | /browse, /messages, /offers |
| Pending | /pending-approval only | All other routes |
| Rejected | /application-rejected only | All other routes |

---

### 2. Dealer Application Flow

#### TC-APP-001: Submit Application

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /apply | Application form displayed |
| 2 | Fill all required fields | Validation passes |
| 3 | Submit form | Success message shown |
| 4 | Check database | Application created with status 'pending' |
| 5 | Check email | Confirmation email received |

**Acceptance Criteria**:
- [ ] Form validates all required fields
- [ ] VAT number format validated (IE1234567A)
- [ ] Eircode format validated
- [ ] Phone number format validated (+353...)
- [ ] Duplicate email prevented
- [ ] Success confirmation shown

#### TC-APP-002: Admin Approves Application

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Admin logs in | Admin dashboard shown |
| 2 | Navigate to /admin/applications | Pending applications list |
| 3 | Click on application | Application details shown |
| 4 | Click "Approve" | Dealer record created |
| 5 | Check email | Approval email sent to applicant |

**Acceptance Criteria**:
- [ ] Application status updated to 'approved'
- [ ] Dealer record created
- [ ] Dealer profile created
- [ ] Approval email sent
- [ ] Applicant can now sign up

#### TC-APP-003: Admin Rejects Application

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Admin views application | Details shown |
| 2 | Click "Reject" with reason | Application rejected |
| 3 | Check email | Rejection email sent with reason |

---

### 3. Listing Management

#### TC-LIST-001: Create Listing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /listings/create | Create listing form |
| 2 | Fill vehicle details | All fields validate |
| 3 | Upload photos | Photos uploaded successfully |
| 4 | Submit listing | Listing created with status 'pending' |
| 5 | Check database | Listing and details saved |

**Acceptance Criteria**:
- [ ] All vehicle fields validated
- [ ] Irish terminology used (Saloon, not Sedan)
- [ ] Photos uploaded to Supabase Storage
- [ ] Reference number auto-generated
- [ ] Listing status set to 'pending'

#### TC-LIST-002: Admin Approves Listing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Admin navigates to /admin/listings | Moderation queue shown |
| 2 | Views pending listing | Listing details shown |
| 3 | Clicks "Approve" | Listing status updated to 'approved' |
| 4 | Dealer receives notification | Notification created |

#### TC-LIST-003: Search and Filter Listings

| Filter | Test Case |
|--------|-----------|
| Make | Filter by "Toyota" returns only Toyota |
| Price Range | €10k-€20k returns listings in range |
| Mileage | <50k km returns low mileage vehicles |
| County | "Dublin" returns Dublin listings |
| Fuel Type | "Electric" returns only EVs |
| Year | 2020+ returns recent vehicles |

---

### 4. Subscription & Payments

#### TC-SUB-001: Subscribe to Basic Plan

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Dealer navigates to /billing | Pricing plans shown |
| 2 | Clicks "Subscribe" on Basic | Stripe Checkout opens |
| 3 | Enters payment details | Payment processed |
| 4 | Returns to success page | Subscription active |
| 5 | Check database | Subscription record created |

**Acceptance Criteria**:
- [ ] Stripe Checkout session created
- [ ] Payment processed successfully
- [ ] Webhook received and processed
- [ ] Subscription status updated to 'active'
- [ ] Dealer can access marketplace

#### TC-SUB-002: Cancel Subscription

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Dealer opens billing portal | Stripe Portal opens |
| 2 | Clicks "Cancel Subscription" | Cancellation scheduled |
| 3 | Check database | cancel_at_period_end = true |
| 4 | After period end | Subscription status = 'cancelled' |

#### TC-SUB-003: Failed Payment

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Payment fails | Invoice payment failed webhook |
| 2 | Check database | Subscription status = 'past_due' |
| 3 | Dealer notified | Email notification sent |
| 4 | Dealer retries payment | Payment succeeds |
| 5 | Check database | Subscription status = 'active' |

---

### 5. Messaging System

#### TC-MSG-001: Send Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Dealer A views listing from Dealer B | Listing details shown |
| 2 | Clicks "Contact Dealer" | Message form opens |
| 3 | Types message and sends | Message sent |
| 4 | Dealer B receives notification | Notification created |
| 5 | Dealer B views inbox | Message thread visible |

**Acceptance Criteria**:
- [ ] Message thread created
- [ ] Message saved to database
- [ ] Recipient notified
- [ ] Messages only between dealers
- [ ] Cannot message self

#### TC-MSG-002: Reply to Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Dealer B opens thread | Previous messages shown |
| 2 | Types reply and sends | Reply saved |
| 3 | Dealer A receives notification | Notification created |

---

### 6. Offer System

#### TC-OFFER-001: Make Offer

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Dealer A views listing | Listing details shown |
| 2 | Clicks "Make Offer" | Offer form opens |
| 3 | Enters amount and message | Offer submitted |
| 4 | Dealer B notified | Notification created |
| 5 | Offer appears in offers page | Offer visible |

**Acceptance Criteria**:
- [ ] Offer amount validated (positive number)
- [ ] Offer linked to listing
- [ ] Seller notified
- [ ] Offer status = 'pending'

#### TC-OFFER-002: Accept Offer

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Dealer B views offer | Offer details shown |
| 2 | Clicks "Accept" | Offer status = 'accepted' |
| 3 | Listing marked as sold | Listing status = 'sold' |
| 4 | Dealer A notified | Notification created |

#### TC-OFFER-003: Counter Offer

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Dealer B views offer | Offer details shown |
| 2 | Clicks "Counter" and enters amount | Counter offer created |
| 3 | Offer status = 'countered' | Status updated |
| 4 | Dealer A notified | Notification created |

---

### 7. Launch Date Gating

#### TC-LAUNCH-001: Pre-Launch Access

**Precondition**: Current date < March 6, 2026

| Feature | Expected Access |
|---------|-----------------|
| Login | Allowed |
| Profile Setup | Allowed |
| Create Listings | Allowed |
| View Own Listings | Allowed |
| Browse Marketplace | Denied → Launch Countdown |
| View Dealers | Denied → Launch Countdown |
| Messages | Denied → Launch Countdown |
| Offers | Denied → Launch Countdown |

#### TC-LAUNCH-002: Post-Launch Access

**Precondition**: Current date >= March 6, 2026

| Feature | Expected Access |
|---------|-----------------|
| All dealer features | Allowed |
| Browse Marketplace | Allowed (with subscription) |
| Messages | Allowed (with subscription) |
| Offers | Allowed (with subscription) |

---

### 8. Mobile Responsiveness

| Page | Mobile Test |
|------|-------------|
| Home | Layout adapts, menu collapses |
| Login | Form usable on small screen |
| Dashboard | Cards stack vertically |
| Listings | Grid becomes single column |
| Create Listing | Form fields stack |
| Messages | Thread view usable |

---

### 9. Performance Testing

| Metric | Target | Test Method |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| API Response Time | < 500ms | Manual |
| Page Load Time | < 2s | Lighthouse |
| Database Query Time | < 100ms | Supabase Logs |

---

### 10. Security Testing

| Test | Expected Result |
|------|-----------------|
| SQL Injection | Input sanitized, no injection possible |
| XSS | Output escaped, scripts not executed |
| CSRF | Tokens validated on state-changing requests |
| IDOR | Users can only access own data |
| Brute Force | Rate limiting enforced |
| File Upload | Only images allowed, size limited |

---

## Test Data

### Sample Vehicles

```javascript
const testVehicles = [
  {
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    mileageKm: 45000,
    priceEur: 22500,
    fuelType: 'petrol',
    transmission: 'manual',
    bodyType: 'hatchback',
    county: 'Dublin',
  },
  {
    make: 'BMW',
    model: '3 Series',
    year: 2019,
    mileageKm: 60000,
    priceEur: 32000,
    fuelType: 'diesel',
    transmission: 'automatic',
    bodyType: 'saloon',
    county: 'Cork',
  },
];
```

### Sample Dealers

```javascript
const testDealers = [
  {
    companyName: 'Dublin Motors Ltd',
    county: 'Dublin',
    vatNumber: 'IE1234567A',
  },
  {
    companyName: 'Cork Car Centre',
    county: 'Cork',
    vatNumber: 'IE7654321B',
  },
];
```

---

## Regression Test Suite

Run these tests before each release:

1. **Authentication Flow**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials
   - [ ] Password reset flow
   - [ ] Session persistence

2. **Application Flow**
   - [ ] Submit application
   - [ ] Approve application
   - [ ] Reject application

3. **Listing Flow**
   - [ ] Create listing
   - [ ] Edit listing
   - [ ] Approve listing
   - [ ] Search listings

4. **Subscription Flow**
   - [ ] Subscribe to plan
   - [ ] Cancel subscription
   - [ ] Failed payment handling

5. **Marketplace Flow**
   - [ ] Browse vehicles
   - [ ] Send message
   - [ ] Make offer
   - [ ] Accept offer

6. **Admin Flow**
   - [ ] View dashboard
   - [ ] Manage applications
   - [ ] Moderate listings
   - [ ] View reports

---

## Bug Report Template

```
**Bug ID**: BUG-XXX
**Title**: Brief description
**Severity**: Critical/High/Medium/Low
**Environment**: Production/Staging/Local
**Browser**: Chrome/Firefox/Safari/Edge

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: What should happen
**Actual Result**: What actually happens

**Screenshots**: Attach if applicable
**Console Errors**: Paste any errors
```

---

## Sign-Off Checklist

Before production release:

- [ ] All critical tests pass
- [ ] No open critical/high bugs
- [ ] Performance targets met
- [ ] Security scan passed
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed
- [ ] Stripe webhooks verified
- [ ] Email notifications tested
- [ ] Backup/restore tested

---

## Test Schedule

| Phase | Duration | Activities |
|-------|----------|------------|
| Unit Testing | Ongoing | Developer-led |
| Integration Testing | 2 days | API and database |
| System Testing | 3 days | End-to-end flows |
| UAT | 2 days | Stakeholder testing |
| Performance Testing | 1 day | Load testing |
| Security Testing | 1 day | Penetration testing |

---

*Document Version: 1.0*
*Last Updated: 2024*
