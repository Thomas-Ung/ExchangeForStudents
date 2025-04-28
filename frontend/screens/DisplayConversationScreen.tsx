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
import { doc, collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

const DisplayConversationScreen = () => {
  const { id } = useLocalSearchParams(); // Get conversation ID from the route params
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (typeof id !== 'string') {
          console.error('Invalid conversation ID');
          return;
        }

        const messagesRef = collection(db, 'conversations', id, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp'));
        const messagesSnap = await getDocs(messagesQuery);

        const fetchedMessages = messagesSnap.docs.map((doc) => doc.data() as Message);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

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
        sender: user.displayName || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toISOString(),
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: user.displayName || 'Anonymous',
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.senderText}>{item.sender}</Text>
      <Text style={styles.contentText}>{item.content}</Text>
      <Text style={styles.timestampText}>{new Date(item.timestamp).toLocaleString()}</Text>
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
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
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
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DisplayConversationScreen;