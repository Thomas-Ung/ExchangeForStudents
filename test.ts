import * as admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: "exchange-for-students.firebasestorage.app",
});
const bucket = getStorage().bucket();
async function uploadFile(localPath: string, storagePath: string): Promise<string> {
  try {
    // Upload the file
    await bucket.upload(localPath, {
      destination: storagePath, // Example: "DemoPosts/TestImage.jpg"
      public: true, // Optional: Makes the file publicly accessible
      metadata: {
        contentType: "image/jpeg", // Adjust based on file type
      },
    });
    // Get the file reference
    const file = bucket.file(storagePath);
    // Generate a signed URL (valid until 2030)
    const [downloadUrl] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2030",
    });
    console.log("File uploaded successfully:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
// Example Usage
const localFile = fileURI; // Local file path
const storagePath = "PLACEHOLDERNAME"; // Firebase Storage destination
uploadFile(localFile, storagePath)
  .then((downloadUrl) => console.log("Download URL:", downloadUrl))
  .catch((err) => console.error(err));