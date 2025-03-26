// screens/BrowseScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const products = [
  { id: '1', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/exchange-for-students.firebasestorage.app/o/DemoPosts%2FvB4AAAYjUat9oKvHbbMJQ59Jm5%2BiVWnSsjOHei5WtYWMcJ4tru7OWTzfeKDUrPJXyIRHVS4AADwsfQNA7e9X88sx7eipCbOmqxzXNqbn6qJmBDqu79hWOCY6edJzocd%2BOq3VYh8YAGDQExhjfY95uri5uedjQEh4R2tzF4mMhXLeRCRnLGygawQAgH7gKwAAAEAC0NMJACBRCAAAAIlCAAAASBQCAABAohAAAAAShQAAAJAoBAAAgEQhAAAAJAoBAAAgUQgAAACJ%2BguZlRrVeh91WQAAAABJRU5ErkJggg%3D%3D?alt=media&token=ba5e0e82-f22f-494b-bc84-236dd0cc687d' },
]

const BrowseScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
        <TouchableOpacity>
          <Image
            source={require('../assets/images/menu.png')}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>New arrivals</Text>

      {/* Grid */}
      <FlatList
        data={products}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          </View>
        )}
        contentContainerStyle={styles.grid}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  logo: { width: 120, height: 30, resizeMode: 'contain' },
  menuIcon: { width: 24, height: 24 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  grid: {
    paddingHorizontal: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default BrowseScreen;
