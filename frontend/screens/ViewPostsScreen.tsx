import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { sharedStyles, gradientColors } from './theme';

type Post = {
  id: string;
  description?: string;
  photo?: string;
  [key: string]: any; // fallback for any other fields like category, price, etc.
};

const ViewPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'You must be logged in to view your posts.');
        return;
      }

      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Error', 'User document does not exist.');
        return;
      }

      const postIds = userSnap.data()?.posts || [];
      if (postIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'Posts'), where('__name__', 'in', postIds));
      const querySnapshot = await getDocs(q);

      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      setPosts(fetchedPosts);

      const initialStatuses: { [key: string]: string } = {};
      fetchedPosts.forEach((post) => {
        initialStatuses[post.id] = post.status || 'available';
      });
      setStatuses(initialStatuses);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const updateStatus = async (postId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'Posts', postId), { status: newStatus });
      setStatuses((prev) => ({ ...prev, [postId]: newStatus }));
      Alert.alert('Success', `Status updated to "${newStatus}"`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={sharedStyles.card}>
      <Image
        source={{ uri: item.photo }}
        style={{ width: '100%', height: 150, borderRadius: 8 }}
      />
      <Text style={sharedStyles.caption}>{item.description || 'Untitled Post'}</Text>
      <Text>Current Status: {statuses[item.id]}</Text>
      <Picker
        selectedValue={statuses[item.id]}
        onValueChange={(value) => updateStatus(item.id, value)}
        style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 8 }}
      >
        <Picker.Item label="Available" value="available" />
        <Picker.Item label="On Hold" value="on hold" />
      </Picker>
      <TouchableOpacity
        style={[sharedStyles.button, { marginTop: 10 }]}
        onPress={() => router.push(`/hidden/ViewQueue?postId=${item.id}`)}
      >
        <Text style={sharedStyles.buttonText}>View Interested Buyers</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={sharedStyles.title}>My Posts</Text>
        <TouchableOpacity style={sharedStyles.button} onPress={fetchUserPosts}>
          <Text style={sharedStyles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        {loading ? (
          <Text>Loading your posts...</Text>
        ) : posts.length === 0 ? (
          <Text>You have not uploaded any posts yet.</Text>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default ViewPosts;
