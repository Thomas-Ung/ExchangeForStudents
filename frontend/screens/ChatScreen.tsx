import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

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
      sender: 'buyer', // Assume the current user is the buyer for now
    };

    setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: { id: string; text: string; sender: string } }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'buyer' ? styles.buyerMessage : styles.sellerMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  buyerMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f7c4',
  },
  sellerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
  },
});

export default ChatScreen;