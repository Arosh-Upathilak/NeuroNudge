/**
 * Lost-to-Found screen – locate essential items
 * or log newly misplaced objects.
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Platform, Animated, Keyboard, Dimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScaledSheet, scale } from "react-native-size-matters";
import MemoryCard from "../../components/MemoryCard";
import ChatMessage, { type ChatMessageData } from "../../components/ChatMessage";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

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

const MOCK_CHAT: ChatMessageData[] = [
  { id: "1", type: "user", text: "Where did I put my wallet?" },
  { id: "2", type: "system", text: "I found a recent match for your wallet based on your scans." },
  { 
    id: "3", 
    type: "widget", 
    title: "Wallet", 
    location: "Inside the top drawer of the hallway console", 
    timeAgo: "Added 40 mins ago",
    imageUri: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800"
  }
];

export default function LostFoundScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<"Memories" | "Chat">("Chat");
  const [isListening, setIsListening] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const originalInputRef = useRef("");
  const chatInputRef = useRef(chatInput);

  useEffect(() => {
    chatInputRef.current = chatInput;
  }, [chatInput]);
  const micLoopAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isListening) {
      micLoopAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(micScaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(micScaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      micLoopAnimRef.current.start();
    } else {
      if (micLoopAnimRef.current) {
        micLoopAnimRef.current.stop();
      }
      micScaleAnim.stopAnimation();
      micScaleAnim.setValue(1);
    }

    return () => {
      if (micLoopAnimRef.current) {
        micLoopAnimRef.current.stop();
      }
      micScaleAnim.stopAnimation();
    };
  }, [isListening, micScaleAnim]);

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    originalInputRef.current = chatInputRef.current;
  });
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript || "";
    const orig = originalInputRef.current;
    setChatInput(orig + (orig && transcript ? " " : "") + transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech Error:", event.error, event.message);
    setIsListening(false);
  });

  const handleMicPress = async () => {
    if (chatInput.trim().length > 0 && !isListening) {
      // Send message logic would go here
      return;
    }
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Required", "Please allow microphone access to use voice dictation.");
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, continuous: false });
  };

  const handleCameraPress = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow camera access to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCapturedPhotoUri(result.assets[0].uri);
    }
  };

  // Calculate the exact initial width of a single toggle tab to prevent visual pop-in on first render
  const initialTabWidth = useMemo(() => {
    // Screen width - container padding (20*2) - toggleContainer margin (16) - toggleContainer inner padding (4*2)
    return (Dimensions.get("window").width - scale(40) - scale(16) - scale(8)) / 2;
  }, []);

  // Toggle slider animation
  const [tabWidth, setTabWidth] = useState(initialTabWidth);
  const slideAnim = useRef(new Animated.Value(1)).current; // Starts at 1 because initial state is "Chat"

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === "Memories" ? 0 : 1,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
  }, [activeTab, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

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
          {tabWidth > 0 && (
            <Animated.View 
              style={[
                styles.sliderPill, 
                { 
                  backgroundColor: colors.primary, 
                  width: tabWidth, 
                  transform: [{ translateX }] 
                }
              ]} 
            />
          )}
          <TouchableOpacity 
            style={styles.toggleButton}
            onLayout={(e) => setTabWidth(e.nativeEvent.layout.width)}
            onPress={() => setActiveTab("Memories")}
          >
            <Text style={[styles.toggleText, { color: activeTab === "Memories" ? colors.surface : colors.textSecondary }]}>Memories</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setActiveTab("Chat")}
          >
            <Text style={[styles.toggleText, { color: activeTab === "Chat" ? colors.surface : colors.textSecondary }]}>Chat</Text>
          </TouchableOpacity>
        </View>
        {activeTab === "Memories" && (
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("Chat")}
          >
            <Ionicons name="add" size={24} color={colors.surface} />
          </TouchableOpacity>
        )}
      </View>

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{activeTab === "Memories" ? "Memories" : "Chat"}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{activeTab === "Memories" ? "Sorted by Added Date" : "AI Assistant"}</Text>
      </View>

      {/* Content Area */}
      {activeTab === "Memories" ? (
        <>
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
        </>
      ) : (
        <>
          <FlatList
            data={MOCK_CHAT}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatListContent}
            renderItem={({ item }) => <ChatMessage message={item} />}
          />

          {/* Chat Input Area */}
          <Animated.View 
            style={[styles.chatInputWrapper, { transform: [{ translateY: keyboardOffset }], paddingBottom: Math.max(0, insets.bottom - 10) }]}
            pointerEvents="box-none"
          >
            {capturedPhotoUri && (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: capturedPhotoUri }} style={styles.photoPreviewImage} contentFit="cover" />
                <TouchableOpacity style={styles.photoCancelButton} onPress={() => setCapturedPhotoUri(null)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.chatInputRow}>
              <View style={[styles.chatInputContainer, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={handleCameraPress}>
                  <Ionicons name="camera-outline" size={24} color={colors.textSecondary} style={styles.chatCameraIcon} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder={isListening ? "Listening..." : "What are you looking for?"}
                  placeholderTextColor={colors.textSecondary}
                  value={chatInput}
                  onChangeText={setChatInput}
                />
              </View>
              <TouchableOpacity 
                style={[styles.chatMicButton, { backgroundColor: isListening ? "#ff4444" : colors.primary }]}
                onPress={handleMicPress}
              >
                <Animated.View style={{ transform: [{ scale: micScaleAnim }] }}>
                  <Ionicons 
                    name={chatInput.trim().length > 0 && !isListening ? "send" : "mic-outline"} 
                    size={chatInput.trim().length > 0 && !isListening ? 20 : 24} 
                    color={colors.surface} 
                    style={chatInput.trim().length > 0 && !isListening ? { marginLeft: 4 } : undefined}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
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
    position: "relative",
  },
  sliderPill: {
    position: "absolute",
    top: "4@s",
    bottom: "4@s",
    left: "4@s",
    borderRadius: "20@s",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: "10@vs",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20@s",
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
  chatListContent: {
    paddingBottom: "80@vs", // Space for the floating chat input
    paddingTop: "8@vs",
  },
  chatInputWrapper: {
    position: "absolute",
    bottom: "20@vs",
    left: "20@s",
    right: "20@s",
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  photoPreviewContainer: {
    alignSelf: "flex-start",
    marginBottom: "12@vs",
    borderRadius: "12@s",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoPreviewImage: {
    width: "80@s",
    height: "100@s",
    borderRadius: "12@s",
  },
  photoCancelButton: {
    position: "absolute",
    top: "4@s",
    right: "4@s",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: "12@s",
    padding: "4@s",
  },
  chatInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "16@s",
    paddingVertical: "12@vs",
    borderRadius: "24@s",
    marginRight: "12@s",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chatCameraIcon: {
    marginRight: "12@s",
  },
  chatMicButton: {
    width: "48@s",
    height: "48@s",
    borderRadius: "24@s",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
