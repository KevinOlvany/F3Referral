# Referral Leaderboard Slack Bot

## Overview

This Firebase Cloud Function automatically monitors the monthly referral leaderboard and sends notifications to Slack when there's a change in leadership. It's designed to keep your team engaged and motivated by celebrating referral achievements in real-time.

## How It Works

### Core Functionality

1. **Data Collection**: Retrieves all referral records from the Firebase Firestore database
2. **Monthly Filtering**: Filters referrals to only count those from the current month and year
3. **Ranking Logic**: Sorts participants by:
   - Primary: Number of referrals (descending)
   - Tie-breaker: Earliest referral date (ascending)
4. **Leadership Detection**: Compares current month's leader with the stored previous leader
5. **Slack Notification**: Sends a message to Slack when leadership changes
6. **State Persistence**: Updates the stored leader in Firestore

### Tie-Breaking System

If two people have the same number of referrals, the person who got their referrals first wins. This encourages early action and rewards consistency.

## Technical Details

### Dependencies

```json
{
  "firebase-functions": "Cloud Functions runtime",
  "firebase-admin": "Firestore database access",
  "node-fetch": "HTTP requests to Slack"
}
```

### Firebase Collections

#### `referrals` Collection
- **Document ID**: Person's name
- **Fields**:
  - `history`: Array of date strings representing when each referral occurred
  
Example:
```javascript
{
  "John Doe": {
    "history": ["2025-12-01", "2025-12-05", "2025-11-20"]
  }
}
```

#### `meta/referralStats` Document
- **Purpose**: Stores the current month's leader to detect changes
- **Fields**:
  - `topReferrer`: Name of current leader
  - `updatedAt`: Timestamp of last update

### HTTP Endpoint

**URL**: `https://[firestore-project].cloudfunctions.net/checkReferralLeaderboard`

**Method**: GET or POST

**CORS**: Enabled for all origins

**Response**: 
- Success: "Leaderboard check complete."
- No referrals: "No referrals this month."
- Error: 500 status with error message

## Slack Integration

### Webhook Configuration

The function sends messages to Slack using an incoming webhook:

```
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/T017H9550RG/B09HH04S3PW/..."
```

### Message Format

When leadership changes, the Slack message includes:

```
🥇 *[Name]* just pulled into the lead with *[X] referrals* this month!

🏆 *Top 3 Referrers:*
1. *[Name]* – [X] referrals
2. *[Name]* – [X] referrals
3. *[Name]* – [X] referrals

Keep it up, everyone! 💪 Check the rest of the list- https://f3susquehannavalley.com/referral/comp.html
```

## Scheduling

To run this function automatically, set up a scheduled trigger:

### Option 1: Cloud Scheduler (Recommended)

Create a Cloud Scheduler job:
```bash
gcloud scheduler jobs create http check-referral-leaderboard \
  --schedule="0 */6 * * *" \
  --uri="https://[firestore-project].cloudfunctions.net/checkReferralLeaderboard" \
  --http-method=GET
```

This runs every 6 hours: 12am, 6am, 12pm, 6pm

### Option 2: External Cron Service

Use services like cron-job.org or EasyCron to ping the endpoint on your desired schedule.

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Firebase

```bash
firebase login
firebase init functions
```

### 3. Set Slack Webhook URL

**Option A**: Update directly in code (current method)
```javascript
const SLACK_WEBHOOK_URL = "your-webhook-url";
```

**Option B**: Use environment variables (recommended for security)
```bash
firebase functions:config:set slack.webhook="your-webhook-url"
```

Then update code:
```javascript
const SLACK_WEBHOOK_URL = functions.config().slack.webhook;
```

### 4. Deploy Function

```bash
firebase deploy --only functions
```

### 5. Test Manually

```bash
curl https://[firestore].cloudfunctions.net/checkReferralLeaderboard
```

## Monitoring & Logs

View function logs:
```bash
firebase functions:log
```

Or in Firebase Console:
- Functions → checkReferralLeaderboard → Logs

## Customization Options

### Change Check Frequency

Modify the Cloud Scheduler cron expression:
- Every hour: `"0 * * * *"`
- Every 30 minutes: `"*/30 * * * *"`
- Daily at 9am: `"0 9 * * *"`

### Modify Top N Display

Change line 62 to show more or fewer leaders:
```javascript
const top3 = referralCounts.slice(0, 5); // Shows top 5
```

### Custom Slack Message

Edit the message template starting at line 70:
```javascript
const message = `Your custom message here...`;
```

### Filter by Different Time Period

To track weekly instead of monthly, modify lines 25-26:
```javascript
// Get start of week
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - now.getDay());

// Filter in line 35-37
.filter(date => date >= startOfWeek)
```

## Troubleshooting

### No Slack Messages Sent

1. Check webhook URL is correct
2. Verify Slack app/webhook is still active
3. Check function logs for errors
4. Test webhook manually with curl

### Function Timeout

If processing many referrals, increase timeout:
```javascript
exports.checkReferralLeaderboard = functions
  .runWith({ timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
```

### CORS Issues

If calling from browser, ensure CORS headers are set (already configured in code)

## Security Considerations

1. **Webhook URL**: Keep it secret! Consider using environment variables
2. **Authentication**: Add authentication if endpoint will be public
3. **Rate Limiting**: Implement rate limiting for production use
4. **Firestore Rules**: Ensure proper read/write rules are configured

## Integration with Website

The function links to the leaderboard website:
```
https://f3susquehannavalley.com/referral/comp.html
```

This allows team members to click through from Slack to see:
- Full leaderboard
- Historical data
- Individual performance metrics
- Monthly/yearly/all-time stats

## Cost Estimates

### Firebase Functions
- First 2 million invocations/month: Free
- Additional: $0.40 per million

### Firestore
- 50K reads/day: Free
- Additional: $0.06 per 100K

**Estimated monthly cost** (checking every 6 hours): 
- ~120 invocations: **FREE**
- ~240 Firestore reads: **FREE**

## Script Breakdown

### Function Flow

```javascript
1. HTTP Request received
   ↓
2. Handle CORS preflight (OPTIONS)
   ↓
3. Get current month/year
   ↓
4. Fetch all referral documents from Firestore
   ↓
5. For each person:
   - Extract their referral history
   - Filter to current month only
   - Count referrals
   - Track earliest referral date
   ↓
6. Sort by:
   - Count (descending)
   - Earliest date (ascending)
   ↓
7. Get top 3 referrers
   ↓
8. Fetch previous leader from meta/referralStats
   ↓
9. Compare current leader vs previous
   ↓
10. If changed:
    - Format Slack message
    - Send to webhook
    - Update meta/referralStats
   ↓
11. Return success response
```

### Key Code Sections

**Date Filtering**:
```javascript
const monthlyDates = history
  .map(dateStr => new Date(dateStr))
  .filter(date => !isNaN(date) && 
                  date.getFullYear() === currentYear && 
                  date.getMonth() === currentMonth)
  .sort((a, b) => a - b);
```

**Ranking Logic**:
```javascript
referralCounts.sort((a, b) => {
  if (b.count !== a.count) {
    return b.count - a.count; // Sort by count
  }
  return a.firstReferralDate - b.firstReferralDate; // Tie-breaker
});
```

**Change Detection**:
```javascript
if (newLeader.name !== previousLeader) {
  // Send Slack notification
  // Update stored leader
}
```

## Support & Maintenance

- Update Slack webhook if it expires
- Monitor logs for errors
- Adjust scheduling as team needs change
- Keep dependencies updated with `npm update`
