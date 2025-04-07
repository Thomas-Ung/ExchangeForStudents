from datetime import datetime

class Message:
    def __init__(self, sender: str, content: str, timestamp: str):
        self.sender = sender
        self.content = content
        self.timestamp = timestamp

    def __repr__(self):
        return f"Message from {self.sender} at {self.timestamp}: {self.content}"

class Conversation:
    def __init__(self, participants: list[str], product):
        self.participants = participants
        self.product = product
        self.messages: list[Message] = []

    def add_message(self, sender, content):
        if (self.participants.__contains__(sender)):
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            message = Message(sender, content, now)
            self.messages.append(message)
            return True
        else:
            return False

    def __repr__(self):
        output = ""
        for message in self.messages:
            output = f"{output} {message} \n"
        return f"<Conversation between {', '.join(self.participants)}> \n{output}"

class Messenger:
    def __init__(self):
        self.conversations: list[Conversation] = []

    def add_conversation(self, conversation: Conversation):
        self.conversations.append(conversation)

    def get_conversations(self):
        return self.conversations

    def __repr__(self):
        output = ""
        for conversation in self.conversations:
            output = f"{output} {conversation} \n"
        return f"<Messenger with {len(self.conversations)} conversations>, \n{output}"
    
messenger = Messenger()
convo = Conversation(["John", "Kim"], "Book")
messenger.add_conversation(convo)
convo.add_message("John", "Book please?")
convo.add_message("Kim", "FS $20")
convo.add_message("John", "Great")
convo = Conversation(["Bill", "Kate"], "Calculator")
messenger.add_conversation(convo)
convo.add_message("Bill", "Calc please?")
convo.add_message("Kate", "By calc do you mean calculator")
convo.add_message("Bill", "Yup")
print(messenger)