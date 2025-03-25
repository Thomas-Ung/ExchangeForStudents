from DatabaseManagement import PostManager
from DatabaseManagement import AccountManager

account_manager = AccountManager()
post_manager = PostManager()
active_user = None

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
    

login()
print("\nThe active user is", active_user)