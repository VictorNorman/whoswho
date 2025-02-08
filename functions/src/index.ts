/* eslint-disable max-len */
import * as admin from "firebase-admin";
import * as scheduler from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";
import { Timestamp } from "firebase-admin/firestore";

admin.initializeApp();

// 05:00 UTC = 00:00 EST
export const createDailyQuizAndSendNotifs =
  scheduler.onSchedule("every day 5:00", () => {
    logger.log("Creating daily quiz()");
    createDailyQuiz();
    sendNotifications();
  });

const createDailyQuiz = async () => {
  const db = admin.firestore();

  // Fetch all people from Sherman Street
  const peopleSnapshot = await db
    .collection("people")
    .where("belongsTo", "==", "Sherman Street")
    .get();

  // Convert snapshot to array of person references
  const peopleIds = peopleSnapshot.docs.map((doc) => doc.id);

  // Randomly select 10 people
  const shuffleAndSlice = (array: any, count: any) => array
    .map((item: any) => ({ item, sort: Math.random() }))
    .sort((a: any, b: any) => a.sort - b.sort)
    .map(({ item }: { item: string }) => item)
    .slice(0, count);

  const selectedPeople = shuffleAndSlice(peopleIds, 10);

  // Create new daily quiz document
  const quizData = {
    timestamp: Timestamp.now(),
    people: selectedPeople,
  };

  await db.collection("organization/Sherman Street/dailies").add(quizData);
};


const sendNotifications = async () => {
  const tokens: string[] = [];
  const db = admin.firestore();

  const nowDateMillis = Date.now();

  // Get all tokens and categorize them
  const tokenSnapshot = await db.collection("tokens").get();
  const { recentTokens, inactiveTokens } =
    categorizeTokens(tokenSnapshot, nowDateMillis);

  tokenSnapshot.docs.forEach((doc) => {
    tokens.push(doc.data().token);
  });

  const msg: MulticastMessage = {
    notification: {
      title: "Image Bearers",
      body: "A new quiz is available!",
    },
    webpush: {
      fcmOptions: {
        link: "https://imagebearers.web.app",
      },
      notification: {
        icon: "assets/icons/icon-96x96.png",
      },
    },
    tokens: [],
  };

  if (recentTokens.length > 0) {
    msg.tokens = recentTokens;
    await admin.messaging().sendEachForMulticast(msg);
    logger.log(`Sent notifications to ${recentTokens.length} recent users`);
  }

  if (inactiveTokens.length > 0) {
    // eslint-disable-next-line max-len, @typescript-eslint/no-non-null-assertion
    msg.notification!.body = "You haven't played ImageBearers for a month. Have you forgotten about it?";
    msg.tokens = inactiveTokens;
    await admin.messaging().sendEachForMulticast(msg);
    logger.log(`Sent notifications to ${inactiveTokens.length} inactive users`);
  }
};

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const RECENT_USER_DAYS = 3;
const INACTIVE_USER_DAYS = 30;

// eslint-disable-next-line max-len
const categorizeTokens = (snapshot: admin.firestore.QuerySnapshot<admin.firestore.DocumentData, admin.firestore.DocumentData>,
  currentTimeMillis: number) => {
  const recentTokens: string[] = [];
  const inactiveTokens: string[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const lastUsedMillis = data.lastTimeAppUsed.toDate().getTime();
    const daysSinceLastUse = (currentTimeMillis - lastUsedMillis) / MILLISECONDS_PER_DAY;

    if (daysSinceLastUse < RECENT_USER_DAYS) {
      recentTokens.push(doc.id);
    } else if (daysSinceLastUse > INACTIVE_USER_DAYS) {
      inactiveTokens.push(doc.id);
    }
  });

  return { recentTokens, inactiveTokens };
};
