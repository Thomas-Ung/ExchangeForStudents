import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface Conversation {
  id: string;
  participants: string[];
  product: string;
}

const ChatScreen = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          Alert.alert('Error', 'You must be logged in to view your conversations.');
          return;
        }

        const userRef = doc(db, 'Accounts', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert('Error', 'User document does not exist.');
          return;
        }

        const userData = userSnap.data();
        const conversationIds: string[] = userData?.conversations || [];

        const fetchedConversations = await Promise.all(
          conversationIds.map(async (id) => {
            try {
              const convoRef = doc(db, 'conversations', id);
              const convoSnap = await getDoc(convoRef);

              if (convoSnap.exists()) {
                const convoData = convoSnap.data();
                return { id: convoSnap.id, ...convoData } as Conversation;
              }
              return null;
            } catch (error) {
              console.error(`Error fetching conversation with ID ${id}:`, error);
              return null;
            }
          })
        );

        setConversations(fetchedConversations.filter(Boolean) as Conversation[]);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        Alert.alert('Error', 'Failed to fetch conversations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() =>
        router.push({
          pathname: '/hidden/displayConversation',
          params: { id: item.id },
        })
      }
    >
      <Text style={styles.productText}>Product: {item.product}</Text>
      <Text style={styles.participantsText}>
        Participants: {item.participants.join(', ')}
      </Text>
    </TouchableOpacity>
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
      <Text style={styles.header}>My Conversations</Text>
      {conversations.length === 0 ? (
        <Text>No conversations found.</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 40,
  },
  conversationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  productText: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;