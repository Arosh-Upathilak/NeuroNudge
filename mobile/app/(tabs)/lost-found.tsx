/**
 * Lost-to-Found screen – locate essential items
 * or log newly misplaced objects.
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Platform, Animated, Keyboard, Dimensions, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

import { ScaledSheet, scale } from "react-native-size-matters";
import MemoryCard from "../../components/MemoryCard";
import ChatMessage, { type ChatMessageData } from "../../components/ChatMessage";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { getCurrentIdToken } from "../../services/firebase";
import { sendChatMessage } from "../../services/api";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as Location from "expo-location";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getIconForTitle = (title: string): keyof typeof Ionicons.glyphMap => {
  const t = title.toLowerCase();
  if (t.includes('key')) return 'key-outline';
  if (t.includes('wallet')) return 'wallet-outline';
  if (t.includes('glass')) return 'glasses-outline';
  if (t.includes('phone') || t.includes('mobile')) return 'phone-portrait-outline';
  if (t.includes('headset') || t.includes('pod') || t.includes('ear')) return 'headset-outline';
  if (t.includes('book')) return 'book-outline';
  return 'cube-outline';
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<"Memories" | "Chat">("Chat");
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([...MOCK_CHAT].reverse());
  const [memories, setMemories] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputBarHeight, setInputBarHeight] = useState(80);
  const chatListRef = useRef<FlatList>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const kbSpacerAnim = useRef(new Animated.Value(0)).current;
  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const originalInputRef = useRef("");
  const chatInputRef = useRef(chatInput);
  const isAtBottomRef = useRef(true);

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
      // 1. Capture values synchronously
      const currentText = chatInput.trim();
      const currentPhoto = capturedPhotoUri;

      // 2. Immediately update UI to show message and clear inputs
      const newUserMsg: ChatMessageData = {
        id: Date.now().toString(),
        type: "user",
        text: currentText,
        imageUri: currentPhoto || undefined,
      };
      // For inverted list, new messages go to the FRONT
      setChatMessages((prev) => [newUserMsg, ...prev]);
      setChatInput("");
      setCapturedPhotoUri(null);
      setIsProcessing(true);
      
      // Force scroll to visual bottom (offset 0) when USER sends a message
      setTimeout(() => chatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);

      // 3. Now perform heavy asynchronous work (GPS)
      const { status } = await Location.requestForegroundPermissionsAsync();
      let locationPayload = null;
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        locationPayload = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } else {
        Alert.alert(
          "Location Disabled",
          "Your memory is being saved without GPS coordinates because location access was denied."
        );
      }
      // 5. Call real backend API
      try {
        const response = await sendChatMessage({
          userText: currentText,
          latitude: locationPayload?.latitude,
          longitude: locationPayload?.longitude,
          imageUri: currentPhoto ?? undefined,
        });

        setIsProcessing(false);

        const aiReply = response.data.reply;
        const memories = response.data.memories;

        if (memories && memories.length > 0) {
          const widgetMessages: ChatMessageData[] = memories.map((m: any, i: number) => ({
            id: (Date.now() + i + 1).toString(),
            type: "widget" as const,
            title: m.title,
            location: m.description,
            imageUri: m.imageUrl || m.image?.imageUrl || undefined,
          }));

          const systemMsg: ChatMessageData = {
            id: (Date.now() + memories.length + 1).toString(),
            type: "system",
            text: aiReply,
          };

          setChatMessages((prev) => [...widgetMessages, systemMsg, ...prev]);
        } else {
          setChatMessages((prev) => [
            { id: (Date.now() + 1).toString(), type: "system", text: aiReply },
            ...prev,
          ]);
        }

        if (isAtBottomRef.current) {
          setTimeout(() => chatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
        }
        
        // Refetch memories to ensure the Memories tab is up to date
        loadMemories();
      } catch (error: any) {
        setIsProcessing(false);
        setChatMessages((prev) => [
          {
            id: (Date.now() + 1).toString(),
            type: "system",
            text: `Something went wrong: ${error.message ?? "Network error"}`,
          },
          ...prev,
        ]);
        if (isAtBottomRef.current) {
          setTimeout(() => chatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
        }
      }

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

  const loadMemories = async () => {
    try {
      const token = await getCurrentIdToken();
      const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${BASE_URL}/api/memories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data?.length > 0) {
        const mapped = data.data.map((m: any) => ({
          id: m.memoryId,
          title: m.title,
          location: m.description || "Unknown Location",
          dateStr: formatDate(m.createdAt),
          highlightDate: false,
          iconName: getIconForTitle(m.title),
          imageSource: m.image?.imageUrl ? { uri: m.image.imageUrl } : undefined,
        }));
        setMemories(mapped);
      }
    } catch (err) {
      console.log("Failed to load memories:", err);
    }
  };

  // --- INIT DATA ---
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const token = await getCurrentIdToken();
        const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        const response = await fetch(`${BASE_URL}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          const mapped: ChatMessageData[] = data.data.map((msg: any) => ({
            id: msg.messageId,
            type: msg.role === "user" ? "user" : "system",
            text: msg.content,
          }));
          setChatMessages(mapped);
        }
      } catch (err) {
        console.log("Failed to load chat history:", err);
      }
    };
    
    // Only load if it's currently empty, or always on mount
    loadChatHistory();
    loadMemories();
  }, []);

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
      const offset = Platform.OS === "ios" ? e.endCoordinates.height - 130 : e.endCoordinates.height - 110;
      const finalOffset = offset > 0 ? offset : 0;
      
      Animated.parallel([
        Animated.timing(keyboardOffset, {
          toValue: -finalOffset,
          duration: e.duration || 250,
          useNativeDriver: true,
        }),
        Animated.timing(kbSpacerAnim, {
          toValue: finalOffset,
          duration: e.duration || 250,
          useNativeDriver: false,
        })
      ]).start();
      
      // Smart scroll: Only scroll if user is at the visual bottom
      if (isAtBottomRef.current) {
        setTimeout(() => chatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 50);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.parallel([
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: true,
        }),
        Animated.timing(kbSpacerAnim, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: false,
        })
      ]).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset, kbSpacerAnim]);

  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;
    const lowerQuery = searchQuery.toLowerCase();
    return memories.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.location.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, memories]);

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
      <View style={{ flex: 1, position: 'relative', justifyContent: 'flex-end' }}>
        {/* Memories View (Absolute behind floating inputs) */}
        <View 
          style={{ 
            ...StyleSheet.absoluteFillObject, 
            opacity: activeTab === "Memories" ? 1 : 0 
          }} 
          pointerEvents={activeTab === "Memories" ? "auto" : "none"}
        >
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
              imageSource={item.imageSource}
            />
          )}
        />
        </View>

        {/* Chat View */}
        <View 
          style={{ 
            ...StyleSheet.absoluteFillObject, 
            opacity: activeTab === "Chat" ? 1 : 0 
          }} 
          pointerEvents={activeTab === "Chat" ? "box-none" : "none"}
        >
        <FlatList
            ref={chatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            inverted={true}
            contentContainerStyle={[styles.chatListContent, { paddingTop: inputBarHeight + scale(30), paddingBottom: scale(20) }]}
            onScroll={(e) => {
              const { contentOffset } = e.nativeEvent;
              // 50px tolerance for "at visual bottom" (offset 0 in inverted list)
              isAtBottomRef.current = contentOffset.y <= 50;
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => <ChatMessage message={item} />}
            ListHeaderComponent={
              <View>
                {isProcessing && (
                  <View style={styles.systemContainer}>
                    <View style={[styles.systemBubble, { backgroundColor: colors.card }]}>
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                      <Text style={[styles.systemText, { color: colors.textSecondary }]}>AI is thinking...</Text>
                    </View>
                  </View>
                )}
                <Animated.View style={{ height: kbSpacerAnim }} />
              </View>
            }
          />
        </View>

        {/* Floating Inputs (Standard flex layout at the bottom of the screen) */}
        {activeTab === "Memories" ? (
          <View style={styles.staticWrapper} pointerEvents="box-none">
            <Animated.View 
              style={[styles.animatedContainer, { transform: [{ translateY: keyboardOffset }] }]}
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
        ) : (
          <View style={styles.staticWrapper} pointerEvents="box-none">
            <Animated.View 
              style={[styles.animatedContainer, { transform: [{ translateY: keyboardOffset }] }]}
              pointerEvents="box-none"
              onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
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
                  multiline={false}
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
          </View>
        )}
      </View>
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
    paddingBottom: "80@vs", 
  },
  staticWrapper: {
    width: "100%",
    marginBottom: "20@vs",
  },
  animatedContainer: {
    width: "100%",
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
    paddingTop: "8@vs",
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
    marginRight: "8@s",
  },
  systemContainer: {
    alignItems: "flex-start",
    marginTop: "8@vs",
    marginBottom: "16@vs",
    paddingRight: "40@s",
  },
  systemBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "16@s",
    paddingVertical: "12@vs",
    borderRadius: "20@s",
    borderTopLeftRadius: "4@s",
  },
  systemText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
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
