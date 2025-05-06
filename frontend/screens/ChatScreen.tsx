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
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

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
  isSeller: boolean;
  lastMessageTimestamp: string | null;
  isSold: boolean; // Add this to track sold status
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
      const userPosts = userData?.posts || []; // Get the list of post IDs from the user's account
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
              const productRef = doc(db, 'Posts', convoData.product);
              const productSnap = await getDoc(productRef);

              let productDescription = 'Unknown Product';
              let isSold = false;
              if (productSnap.exists()) {
                productDescription = productSnap.data()?.description || 'Unknown Product';
                // Check if the product status indicates it's sold
                isSold = productSnap.data()?.status?.startsWith('Sold to: ') || false;
              } else {
                console.warn(`Post not found for ID: ${convoData.product}`);
              }

              // Determine if the current user is the seller
              const isSeller = userPosts.includes(convoData.product);

              // Fetch the most recent message timestamp
              const messagesRef = collection(db, 'conversations', id, 'messages');
              const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
              const messagesSnap = await getDocs(messagesQuery);

              let lastMessageTimestamp = null;
              if (!messagesSnap.empty) {
                lastMessageTimestamp = messagesSnap.docs[0].data()?.timestamp || null;
              }

              return {
                id: convoSnap.id,
                participants,
                product: productDescription,
                productId: convoData.product, // Store the product ID
                isSeller, // Include whether the current user is the seller
                lastMessageTimestamp, // Store the timestamp of the most recent message
                isSold, // Include the sold status
              } as TranslatedConversation;
            }
            return null;
          } catch (error) {
            console.error(`Error fetching conversation with ID ${id}:`, error);
            return null;
          }
        })
      );

      // Sort conversations by the most recent message timestamp
      const sortedConversations = fetchedConversations
        .filter(Boolean)
        .sort((a, b) => {
          const timestampA = a?.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
          const timestampB = b && b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
          return timestampB - timestampA; // Sort in descending order
        });

      setConversations(sortedConversations as TranslatedConversation[]);
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

      // Update local state to reflect the change immediately
      setConversations(prevConversations => 
        prevConversations.map(convo => 
          convo.productId === productId 
            ? {...convo, isSold: true} 
            : convo
        )
      );

      alert('Success: The post has been marked as sold to ' + buyerName + '.');
    } catch (error) {
      console.error('Error marking post as sold:', error);
      alert('Error: Failed to mark the post as sold. Please try again.');
    }
  };

  const renderConversation = ({ item }: { item: TranslatedConversation }) => {
    const otherParticipant =
      item.participants.find((name) => name !== auth.currentUser?.displayName) || item.participants[0];

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
          <Text style={styles.participantNameText}>{otherParticipant}</Text>
          <Text style={styles.productText}>Product: {item.product}</Text>
          {item.isSold && <Text style={styles.soldText}>Sold</Text>}
        </TouchableOpacity>

        {/* Show "Mark as Sold" button only if the current user is the seller and item isn't sold */}
        {item.isSeller && (
          <TouchableOpacity
            style={[
              styles.markSoldButton,
              item.isSold && styles.disabledButton
            ]}
            disabled={item.isSold}
            onPress={() => !item.isSold && handleMarkAsSold(item.productId, otherParticipant)}
          >
            <Text style={styles.buttonText}>
              {item.isSold ? 'Marked as Sold' : 'Mark as Sold'}
            </Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#f5f8fa', // soft off-white / gray-blue background
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003366', // deep navy header text
  },
  list: {
    paddingBottom: 40,
  },
  conversationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  conversationContent: {
    marginBottom: 10,
  },
  participantNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366', // deep navy name text
  },
  productText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  soldText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
  markSoldButton: {
    backgroundColor: '#003366', // deep navy button
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#003366', // deep navy refresh button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
  },
});

export default ChatScreen;
