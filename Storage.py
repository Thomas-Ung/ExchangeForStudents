import firebase_admin
from firebase_admin import credentials, storage
from firebase_admin import firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate("exchange-for-students-firebase-adminsdk-fbsvc-55c7e57c50.json")
firebase_admin.initialize_app(cred, {"storageBucket": "exchange-for-students.firebasestorage.app"})

def upload_file(local_path: str, storage_path: str):
    """Uploads a file to Firebase Storage and returns the download URL."""
    bucket = storage.bucket()  # Get storage bucket
    blob = bucket.blob(storage_path)  # Create storage reference
    
    blob.upload_from_filename(local_path)  # Upload file
    blob.make_public()  # Make it publicly accessible

    print("File uploaded successfully:", blob.public_url)
    return blob.public_url  # Returns the file's public URL

# Example usage:
local_file = "C:/Users/thoma/Documents/ExchangeForStudents/frontend/assets/images/book.png"  # Your local file path
storage_path = "Books"  # Path in Firebase Storage

download_url = upload_file(local_file, storage_path)
print("Download URL:", download_url)

db = firestore.client()

data = {
    'description' : 'All of my books ever',
    'image url' : download_url,
    'title' : 'Engineering books',
    'price' : '$100'
}


doc_ref = db.collection('DemoPosts').document()
doc_ref.set(data)
