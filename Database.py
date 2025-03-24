import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
cred = credentials.Certificate("exchange-for-students-firebase-adminsdk-fbsvc-55c7e57c50.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

data = {
    'task' : 'Wash the dishes',
    'status' : 'TODO'
}

#How I added the data initially, commented out because it only needs to happen once
#doc_ref = db.collection('testCollection').document()
#doc_ref.set(data)

#accessing the document in the test collection by the document ID
doc_ref = db.collection('testCollection').document("cX752viEC8RiBqQBqWd4")

#printing the id and content
print('Document ID:', doc_ref.id)
print('Document Contents:', doc_ref.id)