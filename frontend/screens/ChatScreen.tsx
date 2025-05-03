import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface Conversation {
  id: string;
  participants: string[];
  product: string;
}

interface TranslatedConversation {
  id: string;
  participants: string[];
  product: string;
  productId: string;
}

const ChatScreen = () => {
  const [conversations, setConversations] = useState<TranslatedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchConversations = async () => {
    try {
      setLoading(true); // Show loading indicator while fetching data
      const user = auth.currentUser;

      if (!user) {
        alert('Error: You must be logged in to view your conversations.');
        return;
      }

      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert('Error: User document does not exist.');
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
              const convoData = convoSnap.data() as Conversation;

              // Translate participants to names
              const participants = await Promise.all(
                convoData.participants.map(async (participantId) => {
                  const accountRef = doc(db, 'Accounts', participantId);
                  const accountSnap = await getDoc(accountRef);
                  return accountSnap.exists() ? accountSnap.data()?.name || 'Unknown' : 'Unknown';
                })
              );

              // Fetch product description
              const productDescription = await Promise.all(
                [convoData.product].map(async (productId) => {
                  const productRef = doc(db, 'Posts', productId);
                  const productSnap = await getDoc(productRef);
                  if (productSnap.exists()) {
                    return productSnap.data()?.description || 'Unknown Product';
                  } else {
                    console.warn(`Post not found for ID: ${productId}`);
                    return 'Unknown Product';
                  }
                })
              ).then((descriptions) => descriptions[0]); // Extract the single description

              return {
                id: convoSnap.id,
                participants,
                product: productDescription,
                productId: convoData.product, // Store the product ID
              } as TranslatedConversation;
            }
            return null;
          } catch (error) {
            console.error(`Error fetching conversation with ID ${id}:`, error);
            return null;
          }
        })
      );

      setConversations(fetchedConversations.filter(Boolean) as TranslatedConversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      alert('Error: Failed to fetch conversations. Please try again later.');
    } finally {
      setLoading(false); // Stop loading in all cases
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleMarkAsSold = async (productId: string, buyerName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Error: You must be logged in to mark a post as sold.');
        return;
      }

      // Update the post status
      const postRef = doc(db, 'Posts', productId);
      await updateDoc(postRef, {
        status: `Sold to: ${buyerName}`,
      });

      alert('Success: The post has been marked as sold to ' + buyerName + '.');
    } catch (error) {
      console.error('Error marking post as sold:', error);
      alert('Error: Failed to mark the post as sold. Please try again.');
    }
  };

  const renderConversation = ({ item }: { item: TranslatedConversation }) => {
    // Determine the other participant (not the current user)
    const currentUser = auth.currentUser?.displayName || 'Unknown';
    const otherParticipant = item.participants.find(name => name !== currentUser) || item.participants[0];

    return (
      <View style={styles.conversationCard}>
        <TouchableOpacity
          style={styles.conversationContent}
          onPress={() =>
            router.push({
              pathname: '/hidden/displayConversation',
              params: { id: item.id },
            })
          }
        >
          {/* Display the other participant's name as the bold text */}
          <Text style={styles.participantNameText}>{otherParticipant}</Text>
          {/* Display the product description as the smaller text */}
          <Text style={styles.productText}>Product: {item.product}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.markSoldButton}
          onPress={() => handleMarkAsSold(item.productId, otherParticipant)}
        >
          <Text style={styles.buttonText}>Mark as Sold</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
      <TouchableOpacity style={styles.refreshButton} onPress={fetchConversations}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
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
  conversationContent: {
    marginBottom: 10,
  },
  participantNameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  markSoldButton: {
    backgroundColor: '#FF9800', // Orange color for the button
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;