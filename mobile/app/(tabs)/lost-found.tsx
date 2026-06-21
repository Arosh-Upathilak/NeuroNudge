/**
 * Lost-to-Found screen – locate essential items
 * or log newly misplaced objects.
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Platform, Animated, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

import { ScaledSheet } from "react-native-size-matters";
import MemoryCard from "../../components/MemoryCard";

const MOCK_MEMORIES = [
  {
    id: "1",
    title: "Car Keys",
    location: "Entryway Bowl",
    dateStr: "Today, 8:00 AM",
    highlightDate: true,
    iconName: "key-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "2",
    title: "Wallet",
    location: "Living Room Coffee Table",
    dateStr: "Yesterday",
    highlightDate: false,
    iconName: "wallet-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "3",
    title: "Reading Glasses",
    location: "Nightstand",
    dateStr: "Oct 24",
    highlightDate: false,
    iconName: "glasses-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "4",
    title: "Noise-Canceling Pods",
    location: "Work Backpack",
    dateStr: "Oct 20",
    highlightDate: false,
    iconName: "headset-outline" as keyof typeof Ionicons.glyphMap,
  },
];

export default function LostFoundScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      // Dramatically increase the subtraction to account for the TabBar and Safe Areas.
      // This prevents the search bar from flying into the middle of the screen.
      const offset = Platform.OS === "ios" ? e.endCoordinates.height - 130 : e.endCoordinates.height - 110;
      Animated.timing(keyboardOffset, {
        toValue: -(offset > 0 ? offset : 0),
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_MEMORIES;
    const lowerQuery = searchQuery.toLowerCase();
    return MOCK_MEMORIES.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.location.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toggle Bar */}
      <View style={styles.toggleRow}>
        <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[styles.toggleButton, styles.toggleButtonActive, { backgroundColor: colors.primary }]}>
            <Text style={[styles.toggleText, { color: colors.surface }]}>Memories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>Chat</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Memories</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sorted by Added Date</Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredMemories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MemoryCard
            title={item.title}
            location={item.location}
            dateStr={item.dateStr}
            highlightDate={item.highlightDate}
            iconName={item.iconName}
          />
        )}
      />

      {/* Floating Search Bar */}
      <Animated.View 
        style={[styles.searchContainerWrapper, { transform: [{ translateY: keyboardOffset }] }]}
      >
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search stored Memories..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: "20@s",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "2@vs",
    marginBottom: "12@vs",
  },
  toggleContainer: {
    flex: 1,
    flexDirection: "row",
    borderRadius: "24@s",
    padding: "4@s",
    marginRight: "16@s",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: "10@vs",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20@s",
  },
  toggleButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },
  addButton: {
    width: "44@s",
    height: "44@s",
    borderRadius: "22@s",
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "16@vs",
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.medium,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.medium,
    marginBottom: "4@vs",
  },
  listContent: {
    paddingBottom: "80@vs", // Space for the floating search bar
  },
  searchContainerWrapper: {
    position: "absolute",
    bottom: "20@vs",
    left: "20@s",
    right: "20@s",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: "16@s",
    paddingVertical: "12@vs",
    borderRadius: "24@s",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: "8@s",
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    padding: 0, // Remove default padding on Android
  },
});
