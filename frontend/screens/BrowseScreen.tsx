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

const COMMON_FILTERS = ["quality", "price"]; // Common filters available on all screens

const BrowseScreen = ({ category }: { category?: string }) => {
  const [products, setProducts] = useState<
    {
      price: any;
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
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const router = useRouter();

  const extractFilterValues = (products: any[]) => {
    // Get the appropriate filters based on current view
    const filtersToExtract = getFiltersForCurrentView().filter(
      (f) => f !== "price"
    );
    const filterValues: { [key: string]: string[] } = {};

    // Initialize each filter with an empty array
    filtersToExtract.forEach((filter) => {
      filterValues[filter] = [];
    });

    // Extract unique values for each filter from products
    products.forEach((product) => {
      filtersToExtract.forEach((filter) => {
        // IMPROVED: Case-insensitive property lookup
        const propertyNames = Object.keys(product);

        // Find the actual property name that matches our filter (case-insensitive)
        const actualPropertyName = propertyNames.find(
          (prop) => prop.toLowerCase() === filter.toLowerCase()
        );

        if (
          actualPropertyName &&
          product[actualPropertyName] !== undefined &&
          product[actualPropertyName] !== null
        ) {
          const value = String(product[actualPropertyName]); // Convert to string
          if (value && !filterValues[filter].includes(value)) {
            filterValues[filter].push(value);
          }
        }
      });
    });

    console.log("Extracted filter values:", filterValues); // Add this debug log

    // Sort quality values in a meaningful order
    if (filterValues["quality"]) {
      const qualityOrder = { Great: 0, Good: 1, Fair: 2, Bad: 3 };
      filterValues["quality"].sort((a, b) => {
        return (
          (qualityOrder[a as keyof typeof qualityOrder] || 999) -
          (qualityOrder[b as keyof typeof qualityOrder] || 999)
        );
      });
    }

    return filterValues;
  };

  const getFiltersForCurrentView = () => {
    if (
      category &&
      CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS]
    ) {
      // Get category-specific filters
      const categoryFilters =
        CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS];

      // Combine with common filters but remove duplicates
      const combinedFilters = [...categoryFilters];

      // Only add common filters if they don't already exist in category filters
      COMMON_FILTERS.forEach((commonFilter) => {
        if (!combinedFilters.includes(commonFilter)) {
          combinedFilters.push(commonFilter);
        }
      });

      return combinedFilters;
    }
    // Just show common filters on main screen
    return COMMON_FILTERS;
  };

  // Fetch products from the database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log(`Fetching products for category: ${category || "all"}`);

      // Get posts from PostManager
      let fetchedProducts = await PostManager.fetchPostsByCategory(category);
      console.log(`Fetched ${fetchedProducts.length} products`);

      // Debug raw database response
      console.log("DEBUG - Raw database response:");
      fetchedProducts.forEach((product) => {
        // Force dump the entire product object to see what's happening
        console.log(`${product.id}:`, JSON.stringify(product));
      });

      // Log ALL products and their statuses before filtering
      console.log("----- PRODUCTS BEFORE FILTERING -----");
      fetchedProducts.forEach((product) => {
        console.log(
          `Product ID: ${product.id} | Status: "${product.status}" | Seller: "${product.seller}" | Current user: "${currentUser?.displayName}"`
        );
      });

      // Filter out sold products and products by the current user
      const availableProducts = fetchedProducts.filter((product) => {
        // Check if status includes "sold" - case insensitive
        const statusLower = String(product.status || "").toLowerCase();
        const isSold = statusLower.includes("sold");

        // Check if this product belongs to current user
        const isCurrentUserProduct =
          product.seller === currentUser?.displayName;

        // Log the decision for each product
        console.log(
          `FILTER CHECK - ID: ${product.id} | Status: "${
            product.status
          }" | isSold: ${isSold} | isCurrentUserProduct: ${isCurrentUserProduct} | DECISION: ${
            !isSold && !isCurrentUserProduct ? "KEEP" : "FILTER OUT"
          }`
        );

        // Include only if NOT sold AND NOT by current user
        return !isSold && !isCurrentUserProduct;
      });

      console.log(
        `After filtering: ${availableProducts.length} available products`
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
    await fetchProducts(); // Use the same fetchProducts with the enhanced logging
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
          // Special handling for price filter
          if (key === "price") {
            const priceRange = JSON.parse(value);
            const productPrice = product.price;

            if (priceRange.min !== null && productPrice < priceRange.min) {
              return false;
            }
            if (priceRange.max !== null && productPrice > priceRange.max) {
              return false;
            }
            continue; // Skip the regular comparison for price
          }

          // Regular filter handling for other fields
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

        {/* Filters section */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={styles.filterToggleButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Text>
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.filtersPanel}>
              {getFiltersForCurrentView().map((filter) => {
                // Special handling for price filter
                if (filter === "price") {
                  return (
                    <View key={filter} style={styles.filterGroup}>
                      <Text style={styles.filterLabel}>Price Range:</Text>
                      <View style={styles.priceRangeContainer}>
                        <TextInput
                          style={styles.priceInput}
                          placeholder="Min $"
                          value={minPrice}
                          onChangeText={setMinPrice}
                          keyboardType="numeric"
                        />
                        <Text style={styles.priceRangeSeparator}>to</Text>
                        <TextInput
                          style={styles.priceInput}
                          placeholder="Max $"
                          value={maxPrice}
                          onChangeText={setMaxPrice}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          style={styles.applyPriceButton}
                          onPress={() => {
                            const min = minPrice ? parseFloat(minPrice) : null;
                            const max = maxPrice ? parseFloat(maxPrice) : null;

                            // Update active filters for price
                            setActiveFilters((prev) => {
                              const newFilters = { ...prev };
                              if (min === null && max === null) {
                                delete newFilters.price;
                              } else {
                                newFilters.price = JSON.stringify({ min, max });
                              }
                              return newFilters;
                            });
                          }}
                        >
                          <Text style={styles.applyPriceButtonText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                      {activeFilters.price && (
                        <View style={styles.activePriceFilter}>
                          <Text style={styles.activePriceFilterText}>
                            {(() => {
                              const range = JSON.parse(activeFilters.price);
                              if (range.min !== null && range.max !== null) {
                                return `$${range.min} - $${range.max}`;
                              } else if (range.min !== null) {
                                return `$${range.min} or more`;
                              } else if (range.max !== null) {
                                return `Up to $${range.max}`;
                              }
                              return "";
                            })()}
                          </Text>
                          <TouchableOpacity
                            style={styles.removePriceFilterButton}
                            onPress={() => {
                              setActiveFilters((prev) => {
                                const newFilters = { ...prev };
                                delete newFilters.price;
                                return newFilters;
                              });
                              setMinPrice("");
                              setMaxPrice("");
                            }}
                          >
                            <Text style={styles.removePriceFilterText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                }

                // Regular filter rendering for non-price filters
                return (
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

                      {availableFilters[filter]?.length > 0 ? (
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
                );
              })}

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => setActiveFilters({})}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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
  container: { flex: 1, backgroundColor: "#f5f8fa" }, // soft off-white/gray-blue background
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d0d7de",
    backgroundColor: "#003366", // deep navy header
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#ffffff", // white text in header
  },
  userInfo: {
    marginTop: 8,
    fontSize: 14,
    color: "#ffffff", // white text in header
    textAlign: "center",
  },
  searchBarContainer: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderColor: "#d0d7de",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "100%",
  },
  refreshButton: {
    marginTop: 12,
    backgroundColor: "#003366", // deep navy
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    marginTop: 12,
  },
  filterToggleButton: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d0d7de",
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#003366",
  },
  filtersPanel: {
    marginTop: 10,
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d0d7de",
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#003366",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d0d7de",
  },
  filterOptionActive: {
    backgroundColor: "#003366",
    borderColor: "#002244",
  },
  filterOptionText: {
    fontSize: 13,
    color: "#003366",
  },
  clearFiltersButton: {
    backgroundColor: "#e0e6ed",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  clearFiltersText: {
    color: "#003366",
    fontWeight: "500",
  },
  noFilterValuesText: {
    fontSize: 13,
    color: "#888888",
    fontStyle: "italic",
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d7de",
    borderRadius: 4,
    padding: 8,
    width: 80,
    fontSize: 14,
  },
  priceRangeSeparator: {
    marginHorizontal: 8,
    color: "#666666",
  },
  applyPriceButton: {
    backgroundColor: "#003366",
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  applyPriceButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  activePriceFilter: {
    backgroundColor: "#dce6f1",
    borderRadius: 4,
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activePriceFilterText: {
    color: "#003366",
    fontSize: 14,
  },
  removePriceFilterButton: {
    padding: 4,
  },
  removePriceFilterText: {
    color: "#003366",
    fontSize: 14,
  },
  grid: {
    paddingHorizontal: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#d0d7de",
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
    color: "#003366",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f8fa",
  },
  debugButton: {
    marginTop: 8,
    backgroundColor: "#6c757d",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    alignSelf: "center",
  },
  debugButtonText: {
    color: "#ffffff",
    fontSize: 12,
  },
});

export default BrowseScreen;
