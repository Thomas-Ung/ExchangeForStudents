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


#post types and data
"""
Books: book title, description, edition, course number, price
Clothing: type, description, color, size, price
Furniture: type, description, color, dimension, weight, price
Electronics: type, description, model, dimension, weight, price
Sports gear: type, description, weight, price
"""
#add seller, upload time,

class PostManager:
    post_elements = {
        "books" : ["category", "book title", "description", "edition", "course number", "price", "seller", "upload time"],
        "clothing" : ["category", "type", "description", "color", "size", "price", "seller", "upload time"],
        "furniture": ["category", "type", "description", "color", "dimension", "weight", "price", "seller", "upload time"],
        "electronics": ["category", "type", "description", "model", "dimension", "weight", "price", "seller", "upload time"],
        "sports gear": ["category", "type", "description", "weight", "price", "seller", "upload time"]
    }

    def __init__(self):
        self.posts = db.collection('Posts')

    #function to add a post by adding a dict containing all the post info 
    #returns false if format is invalid
    def add_post(self, contents: dict):
        type = contents.get("category")
        
        #checks if the inputted dict has a category 
        if type == None:
            return False
        
        #compares the dict keys to the keys required for the type of post category
        keys = list(contents.keys())
        print(self.post_elements[type], keys)
        if self.post_elements[type] == keys:
            
            post = self.posts.document()
            post.set(contents)
            return True

        #returns false if the dict is formatted incorrectly
        return False

    def get_keys(self, category : str):
        keys = self.post_elements.get(category)
        return keys
    
    def get_categories(self):
        return self.post_elements.keys()

    def get_posts_stream(self):
        docs = db.collection(self.posts).stream()
    
#code to test account manager


post_manager = PostManager()
"""
content = {
    "category" : "books",
    "book title" : "Coding for Dummies",
    "description" : "Hello World",
    "edition" : "1",
    "course number" : "CS 101",
    "price" : "10.00"
}
print(post_manager.add_post(content))
"""

#get_keys() works
print(post_manager.get_keys("books"))
print(post_manager.get_keys("clothing"))
print(post_manager.get_keys("electronics"))
print(post_manager.get_keys("furniture"))
print(post_manager.get_keys("sports gear"))
print(post_manager.get_keys("doesn't exist"))

#code to test account manager
"""
account_manager = AccountManager()
print(account_manager.add_account("TestAccount", "123Password"))
print(account_manager.get_account("TestAccount"))
print(account_manager.login("NotARealAccount", "123Password"))
print(account_manager.login("TestAccount", "WrongPassword"))
print(account_manager.login("TestAccount", "123Password"))
"""