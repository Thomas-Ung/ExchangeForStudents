import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { sharedStyles, gradientColors } from './theme';

const ProfileScreen = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserName(user.displayName || 'Anonymous');
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'Accounts', user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBio(userData?.bio || '');
      }
    });

    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <Text style={sharedStyles.title}>My Profile</Text>
        {userName && <Text style={{ marginBottom: 16 }}>{userName}</Text>}

        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={{ width: 120, height: 120, borderRadius: 60 }} />
          ) : (
            <View style={sharedStyles.imagePlaceholder}>
              <Text style={{ color: '#888' }}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Write a short bio..."
          value={bio}
          onChangeText={setBio}
          style={[sharedStyles.input, { height: 100, textAlignVertical: 'top', marginTop: 16 }]}
          multiline
        />

        <TouchableOpacity
          style={sharedStyles.button}
          onPress={() => router.push('/hidden/ViewPosts')}
        >
          <Text style={sharedStyles.buttonText}>View My Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={sharedStyles.button}
          onPress={() => router.push('/hidden/InterestsPosts')}
        >
          <Text style={sharedStyles.buttonText}>View Posts I'm Interested In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[sharedStyles.button, { backgroundColor: '#FF5252' }]} onPress={handleLogout}>
          <Text style={sharedStyles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;
