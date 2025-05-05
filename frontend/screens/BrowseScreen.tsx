import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { PostManager } from "../domain/managers/PostManager";

const CATEGORY_FILTERS = {
  Book: ["title", "courseNumber", "quality"],
  Clothing: ["size", "color", "quality"],
  Furniture: ["color", "dimensions", "weight", "quality"],
  Electronic: ["model", "dimensions", "weight", "quality"],
  SportsGear: ["type", "weight", "quality"],
};

const BrowseScreen = ({ category }: { category?: string }) => {
  const [products, setProducts] = useState<
    {
      id: string;
      photo?: string;
      description?: string;
      category?: string;
      status?: string;
      seller?: string;
    }[]
  >([]);
  const [filteredProducts, setFilteredProducts] = useState<typeof products>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const [availableFilters, setAvailableFilters] = useState<{
    [key: string]: string[];
  }>({});
  const router = useRouter();

  const extractFilterValues = (products: any[]) => {
    if (
      !category ||
      !CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS]
    ) {
      return {};
    }

    console.log(`Extracting filters for category: ${category}`);
    console.log(`Number of products: ${products.length}`);

    const filters = CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS];
    const filterValues: { [key: string]: string[] } = {};

    // Initialize each filter with an empty array
    filters.forEach((filter) => {
      filterValues[filter] = [];
    });

    // Extract unique values for each filter from products
    products.forEach((product) => {
      if (product) {
        filters.forEach((filter) => {
          // The field might be directly on the product object
          const value = product[filter];

          if (value !== undefined && value !== null && value !== "") {
            const valueStr = String(value);
            if (!filterValues[filter].includes(valueStr)) {
              filterValues[filter].push(valueStr);
              console.log(
                `Added value "${valueStr}" for filter "${filter}" from product ${product.id}`
              );
            }
          }
        });
      }
    });

    return filterValues;
  };

  // Fetch products from the database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log(`Fetching products for category: ${category || "all"}`);

      // Get posts from PostManager
      let fetchedProducts = await PostManager.fetchPostsByCategory(category);
      console.log(`Fetched ${fetchedProducts.length} products`);

      // Optional: Log a sample product to debug
      if (fetchedProducts.length > 0) {
        console.log("Sample product data:", fetchedProducts[0]);
      }

      // Filter out sold products and products by the current user
      const availableProducts = fetchedProducts.filter(
        (product) =>
          !product.status?.toLowerCase().includes("sold to") &&
          product.seller !== currentUser?.displayName
      );

      setProducts(availableProducts);
      setFilteredProducts(availableProducts);

      // Extract filter values
      const filters = extractFilterValues(availableProducts);
      console.log("Extracted filter values:", filters);
      setAvailableFilters(filters);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // Set up the current user and fetch products after the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated user:", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Anonymous",
        });
        setCurrentUser(user);
      } else {
        console.log("No user is currently authenticated.");
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch products only after currentUser is set
  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser, category]);

  // Filter products based on the search query and active filters
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    let filtered = products;

    // Apply search query
    if (query) {
      filtered = filtered.filter((product) =>
        product.description?.toLowerCase().includes(query)
      );
    }

    // Apply category-specific filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter((product) => {
        for (const [key, value] of Object.entries(activeFilters)) {
          // Check each active filter
          const productValue = product[key as keyof typeof product];
          if (
            !productValue ||
            String(productValue).toLowerCase() !== value.toLowerCase()
          ) {
            return false;
          }
        }
        return true;
      });
    }

    console.log(`Applied filters: Found ${filtered.length} matching products`);
    setFilteredProducts(filtered);
  }, [searchQuery, products, activeFilters]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {category ? `${category} Products` : "All Products"}
        </Text>
        {currentUser && (
          <Text style={styles.userInfo}>
            Logged in as:{" "}
            {currentUser.displayName || currentUser.email || "Anonymous"}
          </Text>
        )}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add the filters UI here */}
        {category && (
          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={styles.filterToggleButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Text style={styles.filterToggleText}>
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Text>
            </TouchableOpacity>

            {showFilters &&
              CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS] && (
                <View style={styles.filtersPanel}>
                  {CATEGORY_FILTERS[
                    category as keyof typeof CATEGORY_FILTERS
                  ].map((filter) => (
                    <View key={filter} style={styles.filterGroup}>
                      <Text style={styles.filterLabel}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}:
                      </Text>
                      <View style={styles.filterOptions}>
                        <TouchableOpacity
                          style={[
                            styles.filterOption,
                            !activeFilters[filter] && styles.filterOptionActive,
                          ]}
                          onPress={() => {
                            setActiveFilters((prev) => {
                              const newFilters = { ...prev };
                              delete newFilters[filter];
                              return newFilters;
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              !activeFilters[filter] && { color: "#fff" },
                            ]}
                          >
                            All
                          </Text>
                        </TouchableOpacity>

                        {availableFilters[filter] &&
                        availableFilters[filter].length > 0 ? (
                          availableFilters[filter].map((value) => (
                            <TouchableOpacity
                              key={value}
                              style={[
                                styles.filterOption,
                                activeFilters[filter] === value &&
                                  styles.filterOptionActive,
                              ]}
                              onPress={() => {
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  [filter]: value,
                                }));
                              }}
                            >
                              <Text
                                style={[
                                  styles.filterOptionText,
                                  activeFilters[filter] === value && {
                                    color: "#fff",
                                  },
                                ]}
                              >
                                {value}
                              </Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <Text style={styles.noFilterValuesText}>
                            No options available
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={() => setActiveFilters({})}
                  >
                    <Text style={styles.clearFiltersText}>
                      Clear All Filters
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchProducts}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              router.push({
                pathname: "/hidden/display",
                params: { id: item.id },
              });
              console.log("Navigating to DisplayScreen with ID:", item.id);
            }}
          >
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.image} />
            ) : (
              <Text>No Image</Text>
            )}
            <Text style={styles.caption}>
              {item.description || "No Description"}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  userInfo: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  searchBarContainer: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "100%",
  },
  refreshButton: {
    marginTop: 12,
    backgroundColor: "#007bff", // Blue color
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    marginTop: 12,
  },
  filterToggleButton: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#444",
  },
  filtersPanel: {
    marginTop: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterOptionActive: {
    backgroundColor: "#007bff",
    borderColor: "#0056b3",
  },
  filterOptionText: {
    fontSize: 13,
    color: "#444",
  },
  clearFiltersButton: {
    backgroundColor: "#f2f2f2",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  clearFiltersText: {
    color: "#666",
    fontWeight: "500",
  },
  noFilterValuesText: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
  grid: {
    paddingHorizontal: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  caption: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BrowseScreen;
