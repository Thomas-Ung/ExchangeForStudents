class Message {
    sender: string;
    content: string;
    timestamp: string;
  
    constructor(sender: string, content: string, timestamp: string) {
      this.sender = sender;
      this.content = content;
      this.timestamp = timestamp;
    }
  
    // __repr__ equivalent
    toString(): string {
      return `Message from ${this.sender} at ${this.timestamp}: ${this.content}`;
    }
  }

class Conversation {    
    participants: string[];
    product: string;
    messages: Message[];

    constructor(participants: string[], product: string) {
        this.participants = participants;
        this.product = product;
        this.messages = [];
    }

    addMessage(sender: string, content: string): boolean {
        if (this.participants.includes(sender)) {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const message = new Message(sender, content, now);
        this.messages.push(message);
        return true;
        }
        return false;
    }
  
    // __repr__ equivalent
    toString(): string {
      let output = '';
      this.messages.forEach((message) => {
        output += `${message.toString()} \n`;
      });
      return `<Conversation between ${this.participants.join(', ')}>\n${output}`;
    }
}
  
class Messenger {
    conversations: Conversation[];

    constructor() {
        this.conversations = [];
    }

    addConversation(conversation: Conversation): void {
        this.conversations.push(conversation);
    }

    getConversations(): Conversation[] {
        return this.conversations;
    }

    // __repr__ equivalent
    toString(): string {
        let output = '';
        this.conversations.forEach((conversation) => {
        output += `${conversation.toString()} \n`;
        });
        return `<Messenger with ${this.conversations.length} conversations>,\n${output}`;
    }
}
  
// Test Example
const messenger = new Messenger();
const convo1 = new Conversation(["John", "Kim"], "Book");
messenger.addConversation(convo1);
convo1.addMessage("John", "Book please?");
convo1.addMessage("Kim", "FS $20");
convo1.addMessage("John", "Great");

const convo2 = new Conversation(["Bill", "Kate"], "Calculator");
messenger.addConversation(convo2);
convo2.addMessage("Bill", "Calc please?");
convo2.addMessage("Kate", "By calc do you mean calculator");
convo2.addMessage("Bill", "Yup");

console.log(messenger.toString());
  
