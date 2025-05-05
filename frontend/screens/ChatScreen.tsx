import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sharedStyles, gradientColors } from './theme';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! Is this item still available?', sender: 'buyer' },
    { id: '2', text: 'Yes, it is available!', sender: 'seller' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const newMessageObject = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'buyer',
    };

    setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: { id: string; text: string; sender: string } }) => (
    <View
      style={[
        sharedStyles.messageContainer,
        item.sender === 'buyer' ? sharedStyles.buyerMessage : sharedStyles.sellerMessage,
      ]}
    >
      <Text style={sharedStyles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10 }}
        />
        <View style={sharedStyles.inputRow}>
          <TextInput
            style={sharedStyles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity style={sharedStyles.sendButton} onPress={sendMessage}>
            <Text style={sharedStyles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ChatScreen;
