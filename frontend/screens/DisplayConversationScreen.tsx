import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db, auth } from '../firebaseConfig';
import { doc, collection, query, orderBy, getDocs, getDoc, addDoc } from 'firebase/firestore';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

interface TranslatedMessage {
  senderName: string;
  content: string;
  timestamp: string;
}

const DisplayConversationScreen = () => {
  const { id } = useLocalSearchParams(); // Get conversation ID from the route params
  const [messages, setMessages] = useState<TranslatedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  const fetchMessages = async () => {
    try {
      if (typeof id !== 'string') {
        console.error('Invalid conversation ID');
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        console.error('User not logged in');
        return;
      }

      const messagesRef = collection(db, 'conversations', id, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp'));
      const messagesSnap = await getDocs(messagesQuery);

      const fetchedMessages = await Promise.all(
        messagesSnap.docs.map(async (messageDoc) => {
          const messageData = messageDoc.data() as Message;

          // Fetch the sender's name from the Accounts collection
          const accountRef = doc(db, 'Accounts', messageData.sender);
          const accountSnap = await getDoc(accountRef);
          const senderName =
            messageData.sender === user.uid
              ? 'You'
              : accountSnap.exists()
              ? accountSnap.data()?.name || 'Unknown'
              : 'Unknown';

          return {
            senderName,
            content: messageData.content,
            timestamp: messageData.timestamp,
          };
        })
      );

      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to send a message.');
        return;
      }

      const messagesRef = collection(db, 'conversations', id as string, 'messages');
      await addDoc(messagesRef, {
        sender: user.uid,
        content: newMessage,
        timestamp: new Date().toISOString(),
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderName: 'You',
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: TranslatedMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderName === 'You' ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text
        style={[
          styles.senderText,
          item.senderName === 'You' ? styles.sentText : styles.receivedText,
        ]}
      >
        {item.senderName}
      </Text>
      <Text
        style={[
          styles.contentText,
          item.senderName === 'You' ? styles.sentText : styles.receivedText,
        ]}
      >
        {item.content}
      </Text>
      <Text style={styles.timestampText}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchMessages}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa', // soft off-white background
  },
  list: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 16,
    maxWidth: '75%',
  },
  senderText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#d0d7de',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 20,
    padding: 10,
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    backgroundColor: '#003366',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#003366',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sentMessage: {
    backgroundColor: '#003366',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#dce6f1',
    alignSelf: 'flex-start',
  },
  sentText: {
    color: '#ffffff',
  },
  receivedText: {
    color: '#003366',
  },
});

export default DisplayConversationScreen;