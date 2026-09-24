MASTER BUILD PROMPT — R.ONE GAMING ZONE MANAGEMENT SYSTEM

PROJECT NAME:
R.ONE Gaming Zone

PROJECT TYPE:
Full-stack responsive web application / PWA for managing a physical gaming zone.

==================================================
1. PROJECT OBJECTIVE
==================================================

Build a complete prepaid gaming-zone management system for R.ONE.

R.ONE operates PS5 and PS4 gaming stations.

The business should NOT primarily operate using fixed 30-minute or 1-hour bookings.

Instead, customers purchase prepaid virtual gaming currency called:

R.ONE XP

Customers maintain an XP wallet.

When a gaming session starts, XP is consumed according to:

1. Console type
2. Number of players
3. Actual gaming duration

Customers should therefore be able to:

- Buy XP
- Keep unused XP for future visits
- Start gaming
- Play for any amount of time
- Stop whenever they want
- Be charged only for actual gaming time
- Use the same XP wallet across eligible PS4 and PS5 stations

The system must have ONLY TWO PRIMARY USER EXPERIENCES:

1. OWNER / STAFF DASHBOARD
2. CUSTOMER DASHBOARD

Do NOT create unnecessarily separate admin panels.

Staff accounts should operate inside the Owner Dashboard with role-based permissions.

==================================================
2. DESIGN / BRAND IDENTITY
==================================================

The entire application must have a premium gaming aesthetic.

PRIMARY THEME:

Black + Electric Blue

Suggested visual direction:

Background:
#05070A
#080B10
#0D1117

Primary Blue:
#007BFF or similar electric blue

Accent Blue:
#00A8FF

Text:
White / light grey

Success:
Subtle green

Warning:
Amber

Danger:
Red

DESIGN STYLE:

- Dark gaming interface
- Premium
- Futuristic
- Minimal
- Clean
- Modern
- Not childish
- Not overly neon
- Avoid excessive gradients
- High readability
- Smooth micro-interactions
- Soft blue glow around important active elements
- Rounded cards
- Subtle borders
- Gaming-inspired typography
- Clear numerical displays
- Responsive design

Use R.ONE branding prominently.

Desktop owner dashboard should feel like a gaming control center.

Customer dashboard should feel more like a gaming profile/wallet.

Do NOT clutter screens.

==================================================
3. USER TYPES
==================================================

USER TYPE 1:
OWNER

Full system access.

USER TYPE 2:
STAFF

Uses the same management dashboard but only sees/actions according to permissions assigned by owner.

USER TYPE 3:
CUSTOMER

Uses customer dashboard.

==================================================
4. AUTHENTICATION
==================================================

CUSTOMER LOGIN:

Primary authentication should use:

Mobile number + OTP

Support architecture for:

- OTP login
- Mobile verification
- Secure session persistence

Each customer receives a unique R.ONE ID.

Example:

RON-1024

OWNER/STAFF LOGIN:

Secure email/mobile + password authentication.

Support optional owner PIN verification for sensitive actions.

==================================================
5. CUSTOMER CREATION
==================================================

Owner/staff should be able to create a customer quickly from the counter.

Required:

Name
Mobile number

Optional:

Email
Date of birth

Automatically generate:

Customer ID
R.ONE ID
Created date
XP wallet
Account status

Example:

Name:
Rahul Sharma

Phone:
98XXXXXXXX

R.ONE ID:
RON-1024

XP:
0

Status:
Active

==================================================
6. R.ONE XP SYSTEM
==================================================

XP is R.ONE's prepaid gaming currency.

IMPORTANT:

Do not continuously write wallet deductions to the database every second.

Instead:

- Store session start timestamp
- Store applicable rate
- Calculate live XP consumption dynamically
- Commit deductions when:
  - Session pauses
  - Player count changes
  - Session ends
  - Other billing segment changes

This avoids unnecessary database writes and prevents billing errors.

Wallet balance must support decimal precision internally.

Example:

550.00 XP

Customer-facing interface may round/display clean values where appropriate.

==================================================
7. XP PACKS
==================================================

Default XP packages:

STARTER
₹100
100 XP

GAMER
₹250
260 XP
10 Bonus XP

PRO
₹500
550 XP
50 Bonus XP

ELITE
₹1,000
1,150 XP
150 Bonus XP

LEGEND
₹2,000
2,400 XP
400 Bonus XP

OPTIONAL HIGH-VALUE PACK:
₹3,000
3,700 XP
700 Bonus XP

Owner must be able to:

- Create XP pack
- Edit XP pack
- Disable pack
- Change price
- Change base XP
- Change bonus XP
- Mark pack as popular
- Change pack name

DO NOT hard-code these values permanently.

==================================================
8. XP TYPES
==================================================

Internally distinguish:

PURCHASED XP
BONUS XP

Example:

Purchased:
500 XP

Bonus:
50 XP

Wallet:
550 XP

This allows business reporting on promotional XP.

The owner should be able to configure consumption priority, with default:

BONUS XP FIRST
PURCHASED XP SECOND

==================================================
9. XP EXPIRY
==================================================

Default:

Purchased XP NEVER expires.

Bonus XP may optionally have:

- No expiry
OR
- Configurable expiry

Owner should be able to configure bonus XP expiry.

==================================================
10. DEFAULT GAMING RATES
==================================================

PS5:

1 Player:
200 XP/hour

2 Players:
350 XP/hour

3 Players:
500 XP/hour

4 Players:
650 XP/hour


PS4:

1 Player:
170 XP/hour

2 Players:
300 XP/hour

3 Players:
450 XP/hour

4 Players:
550 XP/hour


Owner must be able to modify ALL rates from Settings.

Never hard-code rates into session logic.

==================================================
11. PER-MINUTE BILLING
==================================================

Internally calculate:

PS5 1 Player:
200 / 60 XP per minute

PS4 1 Player:
170 / 60 XP per minute

etc.

For accurate billing, preferably calculate using elapsed seconds:

XP cost =
hourly XP rate × elapsed seconds / 3600

Maintain sufficient decimal precision internally.

Customer may stop at any time.

Example:

PS5
1 Player
200 XP/hour

Customer plays 37 minutes.

XP cost:

200 × 37 / 60

≈ 123.33 XP

Only actual play duration is charged.

==================================================
12. MULTIPLAYER LOGIC
==================================================

IMPORTANT:

Multiplayer pricing represents TOTAL SESSION COST.

Example:

PS5
3 Players
500 XP/hour TOTAL

DO NOT charge:

500 XP × 3 customers.

Instead:

The entire console session costs 500 XP/hour.

==================================================
13. DEFAULT MULTIPLAYER PAYMENT
==================================================

V1 default:

ONE CUSTOMER PAYS.

Example:

Rahul starts PS5 session.

Players:
3

Rate:
500 XP/hour

Rahul's wallet pays the complete session cost.

Other players do NOT need accounts.

This should be the easiest/default workflow.

==================================================
14. OPTIONAL SPLIT XP ARCHITECTURE
==================================================

Prepare system architecture for future:

SPLIT XP

When enabled:

Multiple registered customers can join one session.

Example:

4 players
PS5
650 XP/hour

1-hour session:

650 XP total

Equal split:

162.50 XP per customer.

However, keep this disabled by default in V1 unless owner enables it.

==================================================
15. PLAYER COUNT CHANGE DURING SESSION
==================================================

This is CRITICAL.

Staff must be able to change player count while a session is active.

Example:

PS5 session starts:

3 players
500 XP/hour

They play 30 minutes.

Cost:
250 XP

One player leaves.

Staff changes:

3 Players → 2 Players

System must:

1. Close the current billing segment.
2. Calculate XP for first segment.
3. Start new billing segment.
4. Change rate automatically to 350 XP/hour.
5. Continue session timer without losing session history.

Example:

Segment 1:
3 Players
30 minutes
250 XP

Segment 2:
2 Players
30 minutes
175 XP

Total:
425 XP

Store both segments.

==================================================
16. SESSION BILLING SEGMENTS
==================================================

Every session should support multiple billing segments.

Example:

SESSION RON-S-001

Segment 1:
Start 5:00 PM
End 5:30 PM
PS5
3 players
500 XP/hour
250 XP

Segment 2:
Start 5:30 PM
End 6:00 PM
PS5
2 players
350 XP/hour
175 XP

Total:
425 XP

This allows accurate audit history.

==================================================
17. LIVE STATION MANAGEMENT
==================================================

Every station should have a live status.

Statuses:

AVAILABLE
ACTIVE
PAUSED
RESERVED
MAINTENANCE
OFFLINE

Use visual indicators:

Available = Green
Active = Electric Blue/Red live indicator
Paused = Amber
Reserved = Blue
Maintenance = Red/Orange
Offline = Grey

==================================================
18. OWNER LIVE GAMING SCREEN
==================================================

This is one of the MOST IMPORTANT screens.

Display every station as a card.

Example:

PS5 #02

ACTIVE

Customer:
Rahul

Players:
3

Rate:
500 XP/hour

Duration:
00:32:14

Estimated XP Used:
268.44 XP

Wallet Remaining:
281.56 XP

Buttons:

VIEW
PAUSE
CHANGE PLAYERS
ADD XP
END SESSION

Update timer visually in real time.

==================================================
19. START SESSION WORKFLOW
==================================================

Owner/staff clicks:

+ START SESSION

STEP 1:
Select/search customer

Search using:

- Name
- Mobile
- R.ONE ID

Allow:

+ CREATE NEW CUSTOMER

STEP 2:
Select station

Only show stations that can accept sessions.

STEP 3:
Select number of players:

1
2
3
4

STEP 4:
Automatically display applicable XP rate.

Example:

PS5 #02
3 Players

500 XP/hour

STEP 5:
Check customer's XP balance.

STEP 6:
Show estimated available play time.

Example:

Balance:
300 XP

Rate:
500 XP/hour

Estimated available play:
36 minutes

STEP 7:
START SESSION

Station becomes ACTIVE.

==================================================
20. LOW XP HANDLING
==================================================

System must continuously calculate estimated remaining play time.

Example:

Balance:
50 XP

Rate:
500 XP/hour

Remaining:
approximately 6 minutes

Create configurable low-balance warning.

Examples:

5 minutes remaining
OR
50 XP remaining

Notify:

OWNER/STAFF DASHBOARD

and optionally

CUSTOMER DASHBOARD

Message:

"XP running low. Recharge to continue."

Provide:

ADD XP

button.

==================================================
21. ZERO XP HANDLING
==================================================

When customer's usable XP reaches zero:

Do NOT allow unlimited negative balance.

System should:

- Alert staff
- Mark session as XP exhausted
- Prevent additional billable time unless configured grace period exists
- Provide immediate recharge option

Owner may configure a small grace period if desired.

Default:
No negative XP.

==================================================
22. PAUSE SESSION
==================================================

Staff can press:

PAUSE

System must:

1. Close current billing segment.
2. Calculate consumed XP.
3. Stop billing.
4. Keep station status as PAUSED.
5. Keep session open.

Display:

PAUSED
No XP currently being consumed.

When staff presses:

RESUME

Create a new billing segment using current applicable rate.

==================================================
23. END SESSION
==================================================

When END SESSION is pressed:

System should:

1. Close current billing segment.
2. Calculate exact total elapsed billable time.
3. Calculate total XP.
4. Deduct XP from wallet.
5. Close session.
6. Mark station AVAILABLE.
7. Save complete session history.
8. Generate session summary.

Example:

SESSION COMPLETE

PS5 #02
3 Players

Total Gaming Time:
37m 22s

XP Used:
311.39 XP

Remaining XP:
238.61 XP

==================================================
24. XP RECHARGE
==================================================

Owner/staff can recharge customer wallet.

Workflow:

Search customer

Select XP package

Example:

PRO
₹500
550 XP

Select payment method:

CASH
UPI
CARD
OTHER

Confirm payment.

System adds:

Purchased XP
Bonus XP

Generate transaction.

==================================================
25. CUSTOM XP RECHARGE
==================================================

Owner may optionally add custom XP.

This should require elevated permission.

Example:

Customer pays ₹750.

Owner enters custom amount/XP according to business rules.

Record as CUSTOM RECHARGE.

==================================================
26. MANUAL XP ADJUSTMENT
==================================================

Owner can:

+ Add XP
- Remove XP

Every manual adjustment MUST require:

Amount
Reason
Owner/staff ID
Timestamp

Examples:

Customer compensation
Correction
Promotional bonus
Billing correction

Never silently change wallet balances.

==================================================
27. XP TRANSACTION LEDGER
==================================================

Maintain an immutable-style wallet ledger.

Transaction types:

PURCHASE
BONUS
SESSION_USAGE
MANUAL_ADD
MANUAL_DEDUCT
REFUND
REVERSAL
PROMOTION
EXPIRY

Each record should include:

Transaction ID
Customer ID
XP amount
Type
Before balance
After balance
Related session ID if applicable
Related payment ID if applicable
Timestamp
Staff/owner responsible

==================================================
28. CUSTOMER DASHBOARD
==================================================

Customer dashboard navigation:

HOME
PLAY
XP WALLET
ACTIVITY
PROFILE

Keep it extremely simple.

DO NOT overwhelm customers with financial analytics.

==================================================
29. CUSTOMER HOME
==================================================

Display:

R.ONE logo

Greeting:

Good Evening, Rahul

Large:

YOUR XP

550 XP

Button:

+ ADD XP

Then:

AVAILABLE STATIONS

PS5
2 Available

PS4
1 Available

Then optionally:

Offers
Announcements
Upcoming tournaments

==================================================
30. CUSTOMER PLAY PAGE
==================================================

Show live station availability.

Example:

PS5 #01
AVAILABLE

PS5 #02
IN USE

PS5 #03
AVAILABLE

PS4 #01
AVAILABLE

Allow customer to request an available station.

Customer selects:

Station
Number of players

System displays:

Applicable XP rate

Then:

REQUEST SESSION

Staff receives request.

Staff approves/starts session.

Do not allow customer to bypass staff controls unless owner enables self-service mode.

==================================================
31. CUSTOMER ACTIVE SESSION
==================================================

When customer has active session, show an ACTIVE SESSION card prominently throughout dashboard.

Display:

ACTIVE SESSION

PS5 #02

3 PLAYERS

PLAY TIME
00:32:14

XP BALANCE
319 XP

Optional:

Current rate
500 XP/hour

Buttons:

ADD XP

REQUEST END SESSION

For operational safety, customer request should notify staff rather than instantly terminate session unless owner enables self-service termination.

==================================================
32. CUSTOMER XP WALLET
==================================================

Display prominently:

R.ONE XP

550 XP
Available

ADD XP

Show recharge packs:

₹100 → 100 XP
₹250 → 260 XP
₹500 → 550 XP
₹1,000 → 1,150 XP
etc.

Clearly show bonus XP.

Example:

PRO

₹500

550 XP

+50 BONUS XP

==================================================
33. IMPORTANT CUSTOMER PSYCHOLOGY / UI RULE
==================================================

DO NOT create customer-facing features such as:

"₹4,850 spent this month"

"Lifetime spending ₹22,000"

"Today's expenditure ₹650"

"Average spending ₹300"

Do NOT create spending analytics in customer dashboard.

The customer should primarily see:

XP balance
Gaming activity
Active session
Recharge
Station availability
Profile
Rewards

Owner can see financial information.

==================================================
34. CUSTOMER ACTIVITY
==================================================

Show recent gaming sessions.

Example:

TODAY

PS5 #02
3 Players
32 minutes
Completed

YESTERDAY

PS4 #01
1 Player
45 minutes
Completed

Do not emphasize monetary expenditure.

Optionally show XP used inside detailed session view.

==================================================
35. CUSTOMER PROFILE
==================================================

Display:

Name
Mobile
R.ONE ID
Account creation date
Membership if applicable

Allow:

Edit basic profile
Logout

Do not allow customer to manually edit wallet information.

==================================================
36. OWNER DASHBOARD NAVIGATION
==================================================

Primary sidebar:

OVERVIEW

LIVE GAMING

XP & PAYMENTS

CUSTOMERS

STATIONS

BOOKINGS

REPORTS

OFFERS & MEMBERSHIPS

STAFF

SETTINGS

==================================================
37. OWNER OVERVIEW
==================================================

Top cards:

TODAY'S REVENUE

XP SOLD

XP CONSUMED

TOTAL SESSIONS

ACTIVE SESSIONS

AVAILABLE STATIONS

NEW CUSTOMERS

RETURNING CUSTOMERS

Below:

LIVE STATIONS

QUICK ACTIONS

+ START SESSION
+ ADD XP
+ NEW CUSTOMER
+ BOOKING

Then:

TODAY'S PERFORMANCE

PS5 usage
PS4 usage
Average session duration
Peak hours

==================================================
38. LIVE GAMING PAGE
==================================================

Filters:

ALL
PS5
PS4
AVAILABLE
ACTIVE
PAUSED
RESERVED
MAINTENANCE

Show responsive station cards.

Active station cards must update live.

Provide:

START
VIEW
PAUSE
RESUME
CHANGE PLAYERS
ADD XP
END SESSION

==================================================
39. CUSTOMERS PAGE
==================================================

Search/filter by:

Name
Mobile
R.ONE ID
Status
Membership

Customer table:

Customer
R.ONE ID
Mobile
XP Balance
Last Visit
Sessions
Status

Click customer to open full profile.

==================================================
40. OWNER CUSTOMER PROFILE
==================================================

Show:

Name
Phone
R.ONE ID
XP balance
Purchased XP
Bonus XP
Membership
Account status
Created date
Last visit

Owner-only analytics:

Total sessions
Total gaming time
Favourite console
Recent sessions
Recharge history
XP ledger

Actions:

ADD XP
ADJUST XP
START SESSION
CREATE BOOKING
ASSIGN MEMBERSHIP
BLOCK ACCOUNT
EDIT PROFILE
ADD INTERNAL NOTE

Internal notes must NEVER appear to customer.

==================================================
41. STATION MANAGEMENT
==================================================

Owner can:

Create station
Edit station
Disable station
Delete/archive station

Station properties:

Station ID
Display name
Console type
Status
Standard rate
Multiplayer rates
Controller count
Installed games
Notes

Example:

Station:
PS5-01

Display:
PS5 #01

Console:
PS5

Controllers:
4

Status:
AVAILABLE

==================================================
42. MAINTENANCE MODE
==================================================

Owner/staff can mark station:

MAINTENANCE

Require optional reason:

Controller issue
Console issue
Display issue
Cleaning
Other

Maintenance station cannot accept new sessions/bookings.

==================================================
43. GAME LIBRARY
==================================================

Owner can maintain game catalogue.

Game fields:

Title
Platform
Genre
Cover image
Multiplayer support
Maximum local players
Active/inactive

Associate games with stations.

Customer can optionally browse:

AVAILABLE GAMES

Do not make game selection mandatory to start a session.

==================================================
44. PAYMENT MANAGEMENT
==================================================

Record every payment.

Payment fields:

Payment ID
Customer
Amount
Payment method
XP purchased
Bonus XP
Timestamp
Staff member
Status

Payment statuses:

COMPLETED
PENDING
FAILED
REFUNDED
REVERSED

==================================================
45. DIGITAL RECEIPTS
==================================================

Generate digital receipt after recharge.

Receipt:

R.ONE

Customer Name
R.ONE ID
Recharge Amount
XP Added
Bonus XP
Payment Method
Transaction ID
Date/Time

Include:

"Thank you for gaming with R.ONE!"

Support print-friendly and shareable receipt view.

==================================================
46. REPORTING SYSTEM
==================================================

Reports must support:

TODAY
YESTERDAY
LAST 7 DAYS
LAST 30 DAYS
THIS MONTH
CUSTOM DATE RANGE

Reports:

Revenue
XP Sales
XP Consumption
Sessions
Console usage
Station usage
Customer activity
Payment methods
Bonus XP
Manual adjustments
Refunds

==================================================
47. REVENUE REPORT
==================================================

Display:

Total revenue

Cash revenue

UPI revenue

Card revenue

Other

Refunds

Net collected

Revenue trend chart

==================================================
48. XP REPORT
==================================================

Display:

XP purchased
Bonus XP issued
XP consumed
XP refunded
XP manually adjusted
Outstanding XP

==================================================
49. OUTSTANDING XP / LIABILITY
==================================================

Calculate total unused customer XP.

Example:

Total customer wallet balance:

38,450 XP

Show:

OUTSTANDING CUSTOMER XP

38,450 XP

Also distinguish:

Purchased XP outstanding
Bonus XP outstanding

==================================================
50. STATION PERFORMANCE
==================================================

For every station show:

Total sessions
Total billable gaming time
Utilization
XP consumed
Associated revenue estimate
Average session duration

Example:

PS5 #01

Sessions:
28

Gaming:
17.4 hours

XP Consumed:
3,480 XP

Utilization:
65%

==================================================
51. PS5 VS PS4 REPORT
==================================================

Show:

PS5 sessions
PS4 sessions

PS5 gaming hours
PS4 gaming hours

PS5 XP consumption
PS4 XP consumption

Multiplayer sessions

Single-player sessions

==================================================
52. PEAK HOURS
==================================================

Create visual chart showing busiest hours.

Example:

12 PM
1 PM
2 PM
...
11 PM

Calculate using active station minutes.

Allow:

Today
Week
Month

==================================================
53. BOOKINGS
==================================================

Architecture should support advance station booking.

Booking fields:

Booking ID
Customer
Station
Date
Start time
Expected duration
Players
Status
Notes

Statuses:

CONFIRMED
ARRIVED
CANCELLED
NO SHOW
COMPLETED

Owner can:

Create
Edit
Cancel
Reschedule
Mark arrived
Convert booking into session

==================================================
54. CUSTOMER BOOKINGS
==================================================

If bookings are enabled, customer can:

View available booking slots
Request booking
View upcoming bookings
Cancel according to configured policy

Staff/owner can approve if manual approval is enabled.

==================================================
55. MEMBERSHIP SYSTEM
==================================================

Build membership architecture even if disabled initially.

Owner can create membership plans.

Example:

SILVER
GOLD
PLATINUM

Configurable fields:

Name
Price
Duration
Bonus XP
Recharge bonus percentage
Gaming rate discount
Priority booking
Birthday reward
Tournament access
Other perks

Do not hard-code plan names.

==================================================
56. MEMBERSHIP ASSIGNMENT
==================================================

Owner can:

Assign membership
Renew
Upgrade
Downgrade
Cancel

Store:

Start date
Expiry date
Plan
Payment
Status

==================================================
57. LOYALTY LEVELS
==================================================

Prepare optional loyalty progression system.

IMPORTANT:

Do NOT confuse wallet XP with loyalty XP.

Use two separate concepts:

R.ONE XP
= Spendable gaming currency

R.ONE LEVEL / POINTS
= Non-spendable loyalty progression

Example:

Level 1
Level 2
Level 3
etc.

This system can be disabled initially.

==================================================
58. REWARDS
==================================================

Optional future rewards:

Bonus XP
Free gaming minutes
Tournament entry
Birthday reward
Referral reward
Member offers

Owner should be able to configure reward rules.

==================================================
59. OFFERS / PROMOTIONS
==================================================

Owner can create promotions.

Examples:

WELCOME BONUS

WEEKDAY BONUS

BIRTHDAY XP

REFER A FRIEND

Create:

Title
Description
Start date
End date
Eligibility
Bonus XP
Usage limits
Active/inactive

==================================================
60. STAFF MANAGEMENT
==================================================

Owner can create staff accounts.

Staff fields:

Name
Phone/email
Role
Status
Created date

Permission system should be granular.

Possible permissions:

Start session
End session
Pause session
Change player count
Create customer
Add XP
View customers
Create booking
Adjust XP
Refund payment
View revenue
View reports
Edit pricing
Manage stations
Manage memberships
Manage staff
Export data

==================================================
61. OWNER-ONLY ACTIONS
==================================================

By default restrict:

Changing gaming rates
Changing XP packages
Manual XP removal
Large XP adjustments
Refunds
Deleting/reversing transactions
Staff management
Permission management
Viewing complete financial reports
System settings

Support owner PIN confirmation for sensitive actions.

==================================================
62. AUDIT LOG
==================================================

Create audit history for important actions.

Record:

Who
What action
Affected entity
Before value
After value
Timestamp

Examples:

Staff changed player count.

Owner added 50 XP.

Staff paused session.

Owner changed PS5 rate.

Staff reversed transaction.

This is important for preventing misuse.

==================================================
63. SETTINGS — GAMING RATES
==================================================

Owner can edit:

PS5:
1-player rate
2-player rate
3-player rate
4-player rate

PS4:
1-player rate
2-player rate
3-player rate
4-player rate

Changes should apply to NEW billing segments.

Never retroactively alter completed session billing.

==================================================
64. SETTINGS — XP PACKS
==================================================

Owner can configure:

Pack name
Price
Purchased XP
Bonus XP
Popular badge
Active/inactive
Display order

==================================================
65. SETTINGS — BUSINESS
==================================================

Fields:

Business name
R.ONE logo
Address
Phone
Email
GST details if applicable
Receipt footer
Currency
Timezone

Default currency:
INR ₹

Default timezone:
Asia/Kolkata

==================================================
66. SETTINGS — BILLING
==================================================

Configure:

Billing precision
Minimum wallet requirement
Low XP threshold
Grace period
Purchased XP expiry
Bonus XP expiry
Consumption priority
Customer session controls
Split XP availability

==================================================
67. NOTIFICATION SYSTEM
==================================================

Owner/staff notifications:

LOW XP
XP EXHAUSTED
NEW SESSION REQUEST
NEW BOOKING
RECHARGE SUCCESSFUL
PAYMENT FAILED
STATION ISSUE
SESSION RUNNING UNUSUALLY LONG
MANUAL XP ADJUSTMENT
REFUND
UPCOMING BOOKING

Use notification center with unread count.

==================================================
68. SEARCH
==================================================

Global owner search.

Search:

Customer
Mobile
R.ONE ID
Transaction ID
Session ID
Station
Booking ID

Make counter operation extremely fast.

==================================================
69. EXPORT
==================================================

Owner should be able to export:

Customers
Transactions
Sessions
Revenue reports
XP reports
Station reports

Formats:

CSV
Excel where supported

Apply currently selected date filters to exports.

==================================================
70. DATA MODEL
==================================================

Create scalable relational database structure.

Suggested entities:

users
customers
staff
roles
permissions
wallets
wallet_transactions
xp_packages
stations
console_types
gaming_rates
sessions
session_segments
payments
bookings
games
station_games
memberships
customer_memberships
promotions
rewards
notifications
audit_logs
business_settings

==================================================
71. CUSTOMER ENTITY
==================================================

Suggested fields:

id
r_one_id
name
phone
email
date_of_birth
status
created_at
updated_at
last_visit_at

==================================================
72. WALLET ENTITY
==================================================

Suggested:

id
customer_id
purchased_xp
bonus_xp
total_available_xp
updated_at

Do not trust only a manually editable balance.

Wallet transaction ledger should remain source of truth/auditable.

==================================================
73. SESSION ENTITY
==================================================

Suggested:

id
session_number
customer_id
station_id
payer_customer_id
started_at
ended_at
status
total_billable_seconds
total_xp_used
payment_mode
created_by
ended_by

==================================================
74. SESSION SEGMENT ENTITY
==================================================

Suggested:

id
session_id
started_at
ended_at
player_count
hourly_xp_rate
billable_seconds
xp_consumed
created_at

This is critical for:

Pause/resume
Player count changes
Rate changes

==================================================
75. PAYMENT ENTITY
==================================================

Suggested:

id
payment_number
customer_id
amount
payment_method
status
xp_purchased
bonus_xp
created_by
created_at
refunded_at

==================================================
76. CONCURRENCY / DATA SAFETY
==================================================

Prevent:

Two active sessions on same station.

Same customer accidentally starting duplicate sessions.

Wallet race conditions.

Duplicate payment submissions.

Double XP deductions.

Double-clicking END SESSION.

Use database transactions where appropriate.

Session ending must be idempotent.

If END SESSION is clicked twice, XP must NOT be deducted twice.

==================================================
77. LIVE UPDATES
==================================================

Use real-time technology where appropriate:

WebSockets
Realtime database subscriptions
or equivalent.

Live updates should include:

Station status
Active session timer
Session requests
Wallet balance
Low XP alerts
Bookings

Do not continuously save timer values.

Timer should be derived from timestamps.

==================================================
78. OFFLINE / CONNECTION FAILURE SAFETY
==================================================

If internet temporarily drops during an active session:

Do NOT lose session timing.

Server/database timestamps remain source of truth.

When connection restores:

Recalculate elapsed time correctly.

Prevent accidental duplicate deductions.

==================================================
79. MOBILE RESPONSIVENESS
==================================================

Customer dashboard should be designed MOBILE-FIRST.

Owner dashboard should work best on:

Desktop
Laptop
Tablet

But still be usable on mobile.

Use bottom navigation for customer mobile UI.

Suggested:

HOME
PLAY
XP
ACTIVITY
PROFILE

Use sidebar navigation for owner desktop.

==================================================
80. CUSTOMER PRIVACY
==================================================

Customers can only access their own:

Wallet
Sessions
Profile
Bookings
Rewards

Never expose:

Other customer information
Owner revenue
Internal notes
Staff information
Internal business analytics

==================================================
81. SECURITY
==================================================

Implement:

Role-based authorization
Server-side validation
Secure authentication
Rate limiting
Input sanitization
Database constraints
Audit logs
Protected owner routes

Never rely only on frontend permission hiding.

Sensitive permissions must be checked server-side.

==================================================
82. UI COMPONENTS
==================================================

Create reusable components:

StationCard
SessionCard
XPBalanceCard
XPRechargeCard
CustomerCard
TransactionTable
PaymentModal
StartSessionModal
EndSessionModal
PlayerCountSelector
Timer
LowXPAlert
BookingCard
ReportCard
MetricCard
NotificationPanel
ConfirmationDialog

==================================================
83. OWNER QUICK ACTION BAR
==================================================

Always make common actions easily accessible:

+ START SESSION

+ ADD XP

+ NEW CUSTOMER

+ BOOKING

These actions should take minimal clicks.

==================================================
84. CONFIRMATION MODALS
==================================================

Require confirmation for important actions:

END SESSION

MANUAL XP DEDUCTION

REFUND

BLOCK CUSTOMER

CHANGE RATE

DELETE/ARCHIVE STATION

Example:

"End Rahul's session on PS5 #02?"

Current duration:
37m 22s

Estimated XP:
311.39 XP

[CANCEL]
[END SESSION]

==================================================
85. EMPTY STATES
==================================================

Design polished empty states.

Example:

NO ACTIVE SESSIONS

"All stations are currently available."

Do not show ugly empty tables.

==================================================
86. ERROR HANDLING
==================================================

Use understandable messages.

Example:

Instead of:

ERROR 500

Show:

"Unable to start session. Please try again."

For business conflicts:

"PS5 #02 already has an active session."

"Customer does not have enough XP to start this session."

==================================================
87. PERFORMANCE
==================================================

Dashboard should feel instant.

Optimize:

Database queries
Live session calculations
Customer search
Reports
Pagination
Caching where appropriate

Do not reload entire pages for simple actions.

==================================================
88. PWA
==================================================

Make the application installable as a Progressive Web App if supported.

This allows:

Owner to install R.ONE Dashboard on laptop/mobile.

Customer to add R.ONE to home screen.

==================================================
89. FUTURE PAYMENT GATEWAY
==================================================

Prepare architecture for online UPI/payment gateway.

Customer can eventually:

Open XP Wallet
Choose pack
Pay online
Payment webhook confirms transaction
XP automatically added

IMPORTANT:

Never add XP based only on frontend "payment successful" state.

Only credit XP after secure server-side payment verification/webhook.

==================================================
90. BUSINESS ANALYTICS
==================================================

Owner dashboard can calculate:

Revenue per day
Revenue per station
Gaming hours
Average session duration
Average XP consumption
Peak hours
New customers
Returning customers
Station utilization
PS4 vs PS5 usage
Single vs multiplayer
XP sold vs consumed
Outstanding XP

Do not expose these analytics to customer.

==================================================
91. CUSTOMER-FACING TERMINOLOGY
==================================================

Prefer:

R.ONE XP
XP Balance
Add XP
Play
Active Session
Gaming Time
Players
Station
Rewards

Avoid excessive financial language.

Do not constantly translate XP back into rupees on customer-facing screens.

==================================================
92. OWNER-FACING TERMINOLOGY
==================================================

Owner can see:

Revenue
Payments
XP sold
XP consumed
Bonus XP
Outstanding XP
Sessions
Utilization
Refunds
Adjustments

Owner needs full business transparency.

==================================================
93. VISUAL HOME — CUSTOMER
==================================================

Create premium black/blue customer home.

Top:

R.ONE logo

Greeting:
GOOD EVENING, RAHUL

Large glowing card:

YOUR XP

550 XP

[ ADD XP ]

Below:

PLAY NOW

PS5
2 AVAILABLE

PS4
1 AVAILABLE

Below:

ACTIVE SESSION if applicable

Below:

Offers / tournaments / announcements.

==================================================
94. VISUAL HOME — OWNER
==================================================

Create dark gaming command-center style dashboard.

Header:

R.ONE
OWNER DASHBOARD

Cards:

₹8,450
TODAY'S REVENUE

8,950
XP SOLD

37
SESSIONS

4
ACTIVE

Then:

LIVE STATIONS

PS5 #01
AVAILABLE

PS5 #02
ACTIVE
Rahul
3 Players
32m

PS5 #03
AVAILABLE

PS4 #01
ACTIVE
Aman
1 Player
18m

Then:

QUICK ACTIONS

START SESSION
ADD XP
NEW CUSTOMER
BOOKING

Then:

TODAY'S PERFORMANCE

==================================================
95. DO NOT BUILD THESE CUSTOMER FEATURES
==================================================

Do NOT show customer:

Monthly money spent
Daily money spent
Lifetime money spent
Spending charts
Expense tracker
Average spending
Revenue information
Business analytics

This requirement is intentional.

==================================================
96. V1 PRIORITY
==================================================

Build these first and make them fully functional:

Authentication

Customer creation

Customer search

XP wallets

XP packages

Recharge/payment recording

Station management

Gaming rates

Start session

Live timer

Player count selection

Multiplayer pricing

Change player count

Session segments

Pause/resume

End session

Accurate XP deduction

Low XP alerts

Customer dashboard

Owner overview

Live station dashboard

Transaction history

Customer history

Reports

Staff permissions

Audit log

Settings

==================================================
97. V2 FEATURES
==================================================

After V1 is stable:

Bookings
Memberships
Rewards
Loyalty levels
Promotions
Referral system
Tournament management
Online payment gateway
Split XP
Game catalogue
Advanced analytics

Architecture should support these now without making V1 unnecessarily complicated.

==================================================
98. TESTING REQUIREMENTS
==================================================

Before considering system complete, test:

1. PS5 single-player session.
2. PS4 single-player session.
3. PS5 2-player session.
4. PS5 3-player session.
5. PS5 4-player session.
6. PS4 multiplayer sessions.
7. Customer pauses and resumes.
8. Player count changes mid-session.
9. Customer recharges during session.
10. XP reaches low threshold.
11. XP reaches zero.
12. Staff tries to start occupied station.
13. Two staff members attempt same action.
14. END SESSION clicked twice.
15. Internet reconnect during session.
16. Manual XP adjustment.
17. Payment reversal/refund.
18. Rate changed while old session exists.
19. Customer login.
20. Owner login.
21. Staff permission restrictions.
22. Mobile responsiveness.
23. Customer cannot access admin routes.
24. Staff cannot perform owner-only action.
25. Reports match actual transaction/session data.

==================================================
99. SAMPLE TEST SCENARIO
==================================================

Customer:
Rahul

Starting XP:
1,000 XP

Station:
PS5 #02

Players:
3

Rate:
500 XP/hour

Start:
5:00 PM

At 5:30 PM:
One player leaves.

Segment 1:

30 minutes
3 players
500 XP/hour

Cost:
250 XP

New balance equivalent:
750 XP

5:30 PM:

Change player count to 2.

New rate:
350 XP/hour

End:
6:00 PM

Segment 2:

30 minutes
350 XP/hour

Cost:
175 XP

TOTAL:

Gaming:
60 minutes

XP Used:
425 XP

Final wallet:
575 XP

The final system MUST calculate this correctly.

==================================================
100. DEVELOPMENT PRINCIPLE
==================================================

Do not create static mockups pretending to be functional.

Every button must have real functionality.

Every metric must come from actual database data.

Every session timer must be based on timestamps.

Every wallet transaction must be recorded.

Every sensitive action must be permission-checked.

Every financial/XP adjustment must be auditable.

Do not use placeholder data in production.

Build reusable, maintainable architecture.

==================================================
101. FINAL USER EXPERIENCE
==================================================

R.ONE should feel like a modern gaming ecosystem rather than a traditional hourly cyber/gaming cafe.

CUSTOMER EXPERIENCE:

RECHARGE
↓
GET R.ONE XP
↓
CHOOSE PS4/PS5
↓
START GAMING
↓
PLAY FOR AS LONG AS DESIRED
↓
XP CALCULATED ACCORDING TO ACTUAL TIME
↓
STOP
↓
REMAINING XP STAYS IN WALLET
↓
RETURN LATER AND CONTINUE USING IT


OWNER EXPERIENCE:

OPEN DASHBOARD
↓
SEE ALL STATIONS
↓
SEE LIVE SESSIONS
↓
START/PAUSE/END SESSIONS
↓
MANAGE MULTIPLAYER
↓
SELL XP
↓
MANAGE CUSTOMERS
↓
TRACK PAYMENTS
↓
VIEW REPORTS
↓
CONTROL RATES, STAFF AND BUSINESS


The final product should be:

FAST
SIMPLE
PREMIUM
GAMING-FOCUSED
MOBILE-FRIENDLY
SECURE
SCALABLE
EASY FOR COUNTER STAFF
EASY FOR CUSTOMERS