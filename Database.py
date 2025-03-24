import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("exchange-for-students-firebase-adminsdk-fbsvc-55c7e57c50.json")
firebase_admin.initialize_app(cred)