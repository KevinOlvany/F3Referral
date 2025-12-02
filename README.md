# F3 Susquehanna Valley Referral System

## Overview

This folder contains the referral tracking and competition system for F3 Susquehanna Valley. The system allows members to share referral links, tracks who brings in new visitors, and displays competitive leaderboards to encourage member engagement.

## 📁 Folder Contents

### Files

| File | Purpose |
|------|---------|
| `aboutf3.html` | Landing page for referred visitors with F3 introduction |
| `aboutf3.css` | Styles for the landing page |
| `comp.html` | Interactive competition leaderboard with stats and charts |
| `counter.js` | Referral tracking script that logs visits to Firebase |


## 🔗 How the Referral System Works

### 1. Member Shares Link
Members share personalized referral links with potential new members:
```
https://f3susquehannavalley.com/referral/aboutf3.html?ref=spielberg
```

The `?ref=` parameter identifies who made the referral.

### 2. Visitor Lands on Page
When someone clicks the link:
- `aboutf3.html` displays (introduction to F3)
- `counter.js` automatically runs
- Referral is logged to Firebase Firestore

### 3. Tracking System
`counter.js` handles:
- Extracting the referral ID from the URL
- Checking if this device already counted (prevents duplicates)
- Logging the referral with timestamp to Firebase
- Triggering the Slack bot to check for leaderboard changes

### 4. Leaderboard Display
`comp.html` shows:
- Current month's top referrers
- Yearly statistics
- All-time leaders
- Individual performance tracking with charts

## Features

### Landing Page (`aboutf3.html`)

**Content:**
- Welcome message and F3 mission
- 5 Core Principles explained
- Video introduction to F3
- Call-to-action to view workout schedule

**Tracking:**
- Automatically logs referral when page loads
- One referral per device (uses localStorage)
- Includes Google Analytics

### Referral Counter (`counter.js`)

**Key Functions:**

```javascript
getReferralId()      // Extracts ?ref= from URL
hasAlreadyReferred() // Checks localStorage to prevent duplicates
markReferral()       // Marks this device as having been counted
logReferral()        // Saves to Firebase and triggers Slack check
```

**Firebase Structure:**
```javascript
referrals/{userId} {
  total: 5,
  history: ["2025-12-01T...", "2025-11-15T...", ...],
  createdAt: Timestamp
}
```

**Duplicate Prevention:**
- Uses localStorage key: `referral_{userId}`
- Only counts once per browser/device
- Console logs if already counted

### Competition Leaderboard (`comp.html`)

**Sections:**

1. **Last Month's Winner Banner**
   - Displays previous month's champion
   - Shows their referral count

2. **Leaderboard Filters**
   - **Monthly**: View any specific month
   - **Yearly**: See top referrers for a year
   - **All-Time**: Overall statistics

3. **Top 3 Podium**
   - Gold, Silver, Bronze display
   - Shows referral counts

4. **Full Rankings Table**
   - All participants ranked
   - Sortable view

5. **Individual Performance Tracker**
   - Search for any member
   - View personal stats (total, this month, this year, average)
   - Interactive line chart showing trends
   - Filter by: Daily, Weekly, or Monthly view

**Technologies:**
- Firebase Firestore for data
- Chart.js for visualizations
- Responsive mobile-friendly design
- Grey gradient theme

## 🚀 Setup & Deployment

### Prerequisites
- Firebase project configured
- Firestore database enabled
- Firebase config is pulled from the existing config

### Installation

1. **Deploy Files**
   ```bash
   # Upload all files in this folder to your web server
   # Ensure relative paths to Assets folder work
   ```

2. **Configure Firebase**
   - Firestore rules should allow reads from `referrals` collection
   - Ensure config.js exports `db` and `timestamp`

3. **Test Referral Link**
   ```
   https://your-domain.com/referral/aboutf3.html?ref=TestUser
   ```
   - Check browser console for "Referral logged for testuser"
   - Verify in Firebase Console under `referrals/testuser`

4. **Set Up Slack Bot** (Optional)
   - Follow instructions in `SLACK_BOT_README.md`
   - Deploy Cloud Function
   - Configure webhook URL

## Data Structure

### Firestore Collections

#### `referrals/{userId}`
```json
{
  "total": 5,
  "history": [
    "2025-12-01T10:30:00.000Z",
    "2025-11-28T14:20:00.000Z",
    "2025-11-15T09:15:00.000Z"
  ],
  "createdAt": "Timestamp(2025-11-15...)"
}
```

#### `meta/referralStats` (for Slack bot)
```json
{
  "topReferrer": "JohnDoe",
  "updatedAt": "Timestamp(2025-12-02...)"
}
```

## Customization

### Change Landing Page Content
Edit `aboutf3.html`:
- Update mission statement
- Add/remove sections
- Modify CTA buttons
- Change video embed

### Adjust Styling
Edit `aboutf3.css`:
- Colors and fonts
- Layout and spacing
- Mobile responsive breakpoints

### Modify Leaderboard
Edit `comp.html`:
- Change gradient colors (currently grey theme)
- Adjust time periods tracked
- Add more stat cards
- Customize chart appearance

### Update Tracking Logic
Edit `counter.js`:
- Change duplicate prevention method
- Add additional data fields
- Modify trigger conditions
- Adjust error handling

## Design Features

### Mobile-Responsive
- Flexible layouts for all screen sizes
- Touch-friendly buttons
- Scrollable tables
- Optimized font sizes

### Visual Elements
- Grey to dark grey gradients
- Gold/Silver/Bronze podium colors
- Interactive charts with Chart.js
- Smooth animations and transitions

## 🔒 Security Considerations

### Client-Side Tracking
- localStorage can be cleared by users
- Determined users could create multiple referrals
- Consider server-side validation for critical applications

### Recommendations
1. **IP-based tracking** - Log IP addresses (requires backend)
2. **Time delays** - Only count 1 referral per user per day
3. **Firestore rules** - Limit write frequency
4. **Email verification** - Require email for new members

### Current Limitations
- One referral per browser/device
- Can be bypassed with incognito/different browsers
- Relies on client-side enforcement

## Troubleshooting

### Referrals Not Logging
1. Check browser console for errors
2. Verify Firebase config is loaded
3. Check Firestore rules allow writes
4. Ensure `?ref=` parameter is in URL

### Leaderboard Not Showing Data
1. Verify Firestore has `referrals` collection
2. Check browser console for Firebase errors
3. Ensure correct Firebase project ID
4. Check collection/document permissions

### Charts Not Rendering
1. Verify Chart.js CDN is loading
2. Check if user has referral history
3. Look for JavaScript errors in console
4. Ensure canvas element exists

### Slack Notifications Not Working
- See `SLACK_BOT_README.md` troubleshooting section
- Verify Cloud Function is deployed
- Check webhook URL is correct
- Review function logs

## Usage Statistics

Monitor performance with:

### Firebase Console
- Go to Firestore Database
- View `referrals` collection
- Check document counts and history arrays

### Google Analytics
- Pageviews on `aboutf3.html`
- Referral source tracking
- Conversion rates

### Leaderboard Page
- Use Individual Performance Tracker
- Check monthly/yearly trends
- Compare member engagement

## Maintenance

### Regular Tasks
- Review referral data monthly
- Clear test/spam referrals
- Update Slack webhook if needed
- Check for JavaScript errors
- Monitor Firebase quotas

### Quarterly Review
- Analyze top performers
- Adjust incentives/competition format
- Update landing page content
- Review security measures

## Competition Ideas

### Monthly Challenges
- Top referrer wins prize
- Team competitions
- First-to-X challenges
- Consistency bonuses

### Gamification
- Badges for milestones
- Referral streaks
- Tier system (Bronze/Silver/Gold members)
- Public recognition in Slack

## 📞 Integration Points

### Website Integration
```html
<!-- Add referral link generator to member profiles -->
<a href="/referral/aboutf3.html?ref=YourName">Share Your Link</a>
```

### Slack Integration
- Automatic notifications on leadership changes
- Weekly/monthly leaderboard posts
- Member achievement announcements

### Email Integration
- Include referral links in newsletters
- Automated welcome emails with tracking
- Monthly stats emails

## Future Enhancements

### Potential Features
- [ ] QR code generation for each member
- [ ] Multi-region support
- [ ] Referral source tracking (Facebook, Instagram, etc.)

## Related Documentation

- **Slack Bot Setup**: See `SLACK_BOT_README.md`
- **Firebase Documentation**: https://firebase.google.com/docs/firestore

## Contributing

To improve the referral system:
1. Test changes locally first
2. Update this README with new features
3. Document any new Firebase collections
4. Keep mobile responsiveness in mind
5. Maintain consistent styling

## Support

For issues or questions:
- Check console logs first
- Review Firebase Firestore rules
- Verify all file paths are correct
- Test with different browsers

---

**Last Updated**: December 2, 2025
**Version**: 2.0
**Maintainer**: F3 Susquehanna Valley
