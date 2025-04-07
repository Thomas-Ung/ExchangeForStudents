//run this file in terminal 
// 1st: cd backend
// 2nd: tsc messenger.ts
// 3rd: node messenger.js

import * as admin from 'firebase-admin';

const serviceAccount = require('C:/Users/thoma/Documents/ExchangeForStudents/exchange-for-students-firebase-adminsdk-fbsvc-55c7e57c50.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

class Message {
  constructor(
    public sender: string,
    public content: string,
    public timestamp: string
  ) {}
}

class Conversation {
  participants: string[];
  product: string;
  docId: string;

  constructor(participants: string[], product: string, docId: string) {
    this.participants = participants;
    this.product = product;
    this.docId = docId;
  }

  async addMessage(sender: string, content: string) {
    if (this.participants.includes(sender)) {
      const now = new Date().toISOString();
      const message = new Message(sender, content, now);

      const messageRef = db.collection('conversations')
                           .doc(this.docId)
                           .collection('messages');

      await messageRef.add({
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp,
      });

      console.log(`Message added to convo ${this.docId}: ${content}`);
      return true;
    }
    console.log("Sender not in participants");
    return false;
  }

  async printMessages() {
    const messagesSnapshot = await db.collection('conversations')
                                     .doc(this.docId)
                                     .collection('messages')
                                     .orderBy('timestamp')
                                     .get();

    console.log(`\nConversation about "${this.product}" between [${this.participants.join(', ')}]:`);
    messagesSnapshot.forEach(doc => {
      const { sender, content, timestamp } = doc.data();
      console.log(`- ${timestamp} | ${sender}: ${content}`);
    });
  }
}

class Messenger {
  conversations: Conversation[] = [];

  constructor() {}

  async loadFromDB() {
    const snapshot = await db.collection('conversations').get();
    this.conversations = []
    snapshot.forEach(doc => {
      const data = doc.data();
      const convo = new Conversation(data.participants, data.product, doc.id);
      this.conversations.push(convo);
    });
  }

  async printAllMessages() {
    for (const convo of this.conversations) {
      await convo.printMessages();
    }
  }

  async addConversation(participants: string[], product: string): Promise<Conversation> {
    const docRef = await db.collection('conversations').add({ participants, product });
    const convo = new Conversation(participants, product, docRef.id);
    this.conversations.push(convo);
    console.log(`Conversation added with ID: ${docRef.id}`);
    return convo;
  }
}

// ✅ Manual test code (not called automatically)
async function test() {
  const messenger = new Messenger();
  await messenger.loadFromDB();

  const convo1 = await messenger.addConversation(['John', 'Kim'], 'Book');
  await convo1.addMessage('John', 'Book please?');
  await convo1.addMessage('Kim', 'FS $20');
  await convo1.addMessage('John', 'Great');

  const convo2 = await messenger.addConversation(['Bill', 'Kate'], 'Calculator');
  await convo2.addMessage('Bill', 'Calc please?');
  await convo2.addMessage('Kate', 'By calc do you mean calculator');
  await convo2.addMessage('Bill', 'Yup');
}

async function test2() {
  const messenger = new Messenger();
  await messenger.loadFromDB();

  const convo3 = await messenger.addConversation(['Alice', 'Bob'], 'Headphones');
  await convo3.addMessage('Alice', 'Are the headphones still available?');
  await convo3.addMessage('Bob', 'Yes, they are in good condition!');
}

// ✅ Active logic (just loads existing data and prints it)
async function main() {
  const messenger = new Messenger();
  await messenger.loadFromDB();
  await messenger.printAllMessages();
  // await console.log("Post Test 2")
  // await test2()
  // await messenger.loadFromDB();
  // await messenger.printAllMessages();
}

main().catch(console.error);