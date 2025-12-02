import { db, timestamp } from 'config.js'; 
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

function getReferralId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref")?.toLowerCase() || "unknown";
}

function hasAlreadyReferred(userId) {
  const key = `referral_${userId}`;
  return localStorage.getItem(key) !== null;
}

function markReferral(userId) {
  const key = `referral_${userId}`;
  localStorage.setItem(key, "true");
}

async function logReferral() {
  const userId = getReferralId();

  if (hasAlreadyReferred(userId)) {
    console.log("Referral already logged from this device.");
    return;
  }

  const today = new Date();
  const dateStr = today.toISOString(); 

  const referralRef = doc(db, "referrals", userId);

  try {
    const docSnap = await getDoc(referralRef);

    if (docSnap.exists()) {
      await updateDoc(referralRef, {
        total: increment(1),
        history: arrayUnion(dateStr)
      });
    } else {
      await setDoc(referralRef, {
        total: 1,
        history: [dateStr],
        createdAt: timestamp()
      });
    }

    markReferral(userId);
    console.log(`Referral logged for ${userId}`);
    
    try {
  const response = await fetch("https://{firestore}.cloudfunctions.net/checkReferralLeaderboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  console.log("Triggered leaderboard check", response);
} catch (err) {
  console.error("Error triggering leaderboard check:", err);
}

console.log("Triggered leaderboard check");
  } catch (error) {
    console.error("Error logging referral:", error);
  }
}


logReferral();
