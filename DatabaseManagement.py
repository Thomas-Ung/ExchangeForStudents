import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
cred = credentials.Certificate("exchange-for-students-firebase-adminsdk-fbsvc-55c7e57c50.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

class AccountManager:
    def __init__(self):
        self.accounts = db.collection('Accounts')

    #function to add an account, returns false if account already exists otherwise returns true
    def add_account(self, username: str, password: str):
        account = self.accounts.document(username)
        if not account.get().exists:
            contents = {
                'username' : username,
                'password' : password
            }
            account.set(contents)
            return True
        return False
    
    #function to get the dictionary which corresponds to the inputted username
    def get_account(self, username: str):
        account = self.accounts.document(username)
        #returns None if there isn't an account with that username
        if not account.get().exists:
            return None
        return account.get().to_dict()
    
    def login(self, username: str, password: str):
        account = self.accounts.document(username)
        #returns None if there isn't an account with that username
        if not account.get().exists:
            return None
        account_data = self.get_account(username)
        #returns true if inputted password matches the password in the database 
        if password == account_data["password"]:
            return True
        #returns false if they do not match
        return False


account_manager = AccountManager()
print(account_manager.add_account("TestAccount", "123Password"))
print(account_manager.get_account("TestAccount"))
print(account_manager.login("NotARealAccount", "123Password"))
print(account_manager.login("TestAccount", "WrongPassword"))
print(account_manager.login("TestAccount", "123Password"))
