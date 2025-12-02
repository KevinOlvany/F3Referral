const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/";

exports.checkReferralLeaderboard = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    console.log("Function triggered via HTTP");

    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();

    const snapshot = await db.collection("referrals").get();
    console.log(`Retrieved ${snapshot.size} referral documents`);

    const referralCounts = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const history = data.history || [];

          const monthlyDates = history
      .map(dateStr => new Date(dateStr))
      .filter(date => !isNaN(date) && date.getFullYear() === currentYear && date.getMonth() === currentMonth)
      .sort((a, b) => a - b); 

    const count = monthlyDates.length;
    const firstReferralDate = monthlyDates[0] || new Date(8640000000000000); 

    referralCounts.push({ name: doc.id, count, firstReferralDate });

    });

    referralCounts.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count; 
      }
      return a.firstReferralDate - b.firstReferralDate; // tie-breaker: earliest referral
    });
    const top3 = referralCounts.slice(0, 3);
    const newLeader = top3[0];

    if (!newLeader) {
      console.log("No referrals this month. Skipping Slack message.");
      res.send("No referrals this month.");
      return;
    }

    console.log("Top 3:", top3);

    const statsRef = db.collection("meta").doc("referralStats");
    const statsSnap = await statsRef.get();
    const previousLeader = statsSnap.exists ? statsSnap.data().topReferrer : null;

    console.log(`Previous leader: ${previousLeader}`);
    console.log(`New leader: ${newLeader.name}`);

    if (newLeader.name !== previousLeader) {
      const message = `🥇 *${newLeader.name}* just pulled into the lead with *${newLeader.count} referrals* this month!\n\n🏆 *Top 3 Referrers:*\n` +
        top3.map((u, i) => `${i + 1}. *${u.name}* – ${u.count} referrals`).join("\n") +
        `\n\nKeep it up, everyone! 💪 Check the rest of the list- https://f3susquehannavalley.com/referral/comp.html`;

      console.log("Sending Slack message...");
      await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message })
      });

      console.log("Slack message sent!");

      await statsRef.set({ topReferrer: newLeader.name, updatedAt: admin.firestore.Timestamp.now() });
      console.log("Updated top referrer in Firestore.");
    }

    res.send("Leaderboard check complete.");
  } catch (error) {
    console.error("Error checking leaderboard:", error);
    res.status(500).send("Error checking leaderboard.");
  }
});
