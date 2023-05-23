import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {MulticastMessage} from "firebase-admin/lib/messaging/messaging-api";


admin.initializeApp();
export const createDailyQuiz = functions.pubsub.schedule("every day 01:00")
    .onRun(async () => {
      const db = admin.firestore();
      const people = await db.collection("people")
          .where("belongsTo", "==", "Sherman Street").get();
      const peopleIds: { doc: string }[] = [];
      people.forEach((q) => peopleIds.push({
        doc: q.id,
      }));
      const quizPeople = peopleIds
          .map((x) => ({x, r: Math.random()}))
          .sort((a, b) => a.r - b.r)
          .map((a) => a.x)
          .slice(0, 10);

      db.collection("organization/Sherman Street/dailies").doc().create({
        timestamp: admin.firestore.Timestamp.now(),
        people: quizPeople,
      });

      // generate reminder message to users
      // if the token has been updated within 3 days, send the message.
      const nowDateMillis = (new Date()).getTime();
      // functions.logger.info("nowDateMillis is", nowDateMillis);
      const tokens: string[] = [];
      (await db.collection("tokens").get()).docs
          .forEach((doc) => {
            const appUsedTime: admin.firestore.Timestamp =
              doc.data()["lastTimeAppUsed"];
            const appUsedDateMillis = appUsedTime.toDate().getTime();
            // eslint-disable-next-line max-len
            // functions.logger.info(`for token ${doc.id}, timestamp is ${appUsedDateMillis}`);
            if (nowDateMillis - appUsedDateMillis < 1000 * 3600 * 24 * 3) {
              tokens.push(doc.id);
              functions.logger.info(`add ${doc.id} to tokens list`);
            }
          });
      const msgs: MulticastMessage = {
        notification: {
          title: "ImageBearers",
          body: "A new daily quiz is now available",
        },
        webpush: {
          fcmOptions: {
            link: "https://imagebearers.web.app",
          },
          notification: {
            icon: "assets/icons/icon-96x96.png",
          },
        },
        tokens: tokens,
      };

      // functions.logger.info("calling sendMulticast");
      admin.messaging().sendMulticast(msgs);
    });
