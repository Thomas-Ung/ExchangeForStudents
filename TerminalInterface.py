from DatabaseManagement import PostManager
from DatabaseManagement import AccountManager
from datetime import datetime


account_manager = AccountManager()
post_manager = PostManager()
active_user = "TestAccount"

def login():
    global active_user
    while(True):
        response = input("\nDo you have an account? (Y/N)")
        if response == "y" or response == "Y":
            while(True):
                print("\nLogin")
                username = input("Username: ")
                password = input("Password: ")
                if(account_manager.login(username, password)):
                    active_user = username
                    print("Login Successful")
                    break
                else:
                    print("Invalid login, try again")
            break
        elif response == "n" or response == "N":
            while(True):
                print("\nCreate an account")
                username = input("Username: ")
                password = input("Password: ") 
                if account_manager.add_account(username, password) == True:
                    print("Account Created, Please Login")
                    break
                else:
                    print("Account Invalid, try a different username")
        else:
            print("Invalid input, try again")

def core_loop():  
    while(True):
        response = input("\nWhat would you like to do? \nBrowse: Enter \"B\" \nPost: Enter \"P\" \nExit: Enter \"X\" \n")
        if response == "B" or response == "b":
            browse()
        elif response == "P" or response == "p":
            post()
        elif response == "X" or response == "x":
            print("Thank You! Goodbye")
            break
        else:
            print("Invalid input, try again")

#doesnt work
def browse():
    posts = post_manager.get_posts_stream()
    titles = []
    for post in posts:
        post = post.to_dict()
        if post["category"] == "books":
            title = post["book title"]
        else:
            title = post["type"]
        


    print(len(list(posts)))
    
def post():
    categories = list(post_manager.get_categories())
    while(True):
        print("Choose a category of item you would like to post:", categories)
        response = input()
        print()
        if response in categories:
            break
        print("Invalid input, try again")
    contents = {}
    for category in post_manager.get_keys(response):
        if(category == "category"):
            contents[category] = response
        elif category == "seller":
            contents[category] = active_user
        elif category == "upload time":
            now = datetime.now()  
            date_time_str = now.strftime("%Y-%m-%d %H:%M:%S") 
            contents[category] = date_time_str
        else:
            print("Enter the", category)
            contents[category] = input()
    post_manager.add_post(contents)
    print("Added your post to the database:", contents)



#login()
core_loop()
print("\nThe active user is", active_user)