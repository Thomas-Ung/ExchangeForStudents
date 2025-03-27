import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin SDK
const serviceAccount = require("exchange-for-students-firebase-adminsdk-fbsvc-55c7e57c50.json"); // Update with your file path
/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "exchange-for-students.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();


async function uploadImageAndStoreData(localFilePath: string) {
  try {
    const fileName = path.basename(localFilePath); // Get the file name
    const storagePath = `DemoImages/${fileName}`; // Set path in Firebase Storage

    // Upload the image
    await bucket.upload(localFilePath, {
      destination: storagePath,
      metadata: {
        contentType: "image/png", // Change if the file type is different
      },
    });

    console.log("Image uploaded successfully!");

    // Get the public URL
    const file = bucket.file(storagePath);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2030", // Set expiry date for URL
    });

    console.log("Image URL:", url);

    // Firestore document format
    const postData = {
      title: "Books",
      description: "Books from my engineering class",
      price: "$50.00",
      image_url: url,
    };

    // Add the data to Firestore
    await db.collection("DemoPosts").add(postData);
    console.log("Post added to Firestore successfully!");

  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the function with a local image path
uploadImageAndStoreData("./TestImage.png"); // Change to your actual image path
*/
