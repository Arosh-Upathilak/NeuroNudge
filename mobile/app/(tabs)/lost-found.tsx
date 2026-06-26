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
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { getMemories, getMessages, sendNlpChat, type ApiMemory } from "../../services/api";

const getMemoryIcon = (title: string): keyof typeof Ionicons.glyphMap => {
  const lower = title.toLowerCase();
  if (lower.includes("key")) return "key-outline";
  if (lower.includes("wallet") || lower.includes("card") || lower.includes("money")) return "wallet-outline";
  if (lower.includes("glass")) return "glasses-outline";
  if (lower.includes("phone") || lower.includes("mobile") || lower.includes("device")) return "phone-portrait-outline";
  if (lower.includes("headphone") || lower.includes("earbud") || lower.includes("pod")) return "headset-outline";
  if (lower.includes("bag") || lower.includes("backpack") || lower.includes("purse")) return "briefcase-outline";
  if (lower.includes("book") || lower.includes("notebook") || lower.includes("journal")) return "book-outline";
  return "archive-outline";
};

const formatMemoryDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (isYesterday) {
    return "Yesterday";
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `Added ${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Added ${diffHours} hr ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function LostFoundScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<"Memories" | "Chat">("Chat");
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [memories, setMemories] = useState<ApiMemory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
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

  const loadMemories = async () => {
    setIsLoadingMemories(true);
    try {
      const data = await getMemories();
      setMemories(data);
    } catch (err: any) {
      console.error("Error loading memories:", err);
    } finally {
      setIsLoadingMemories(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      const formatted: ChatMessageData[] = [];
      
      for (const msg of data) {
        if (msg.role === "user") {
          formatted.push({
            id: msg.messageId,
            type: "user",
            text: msg.content,
          });
        } else {
          let parsedAi = null;
          if (msg.aiContent) {
            try {
              parsedAi = JSON.parse(msg.aiContent);
            } catch {
              // Not JSON
            }
          }

          if (parsedAi && parsedAi.memories && parsedAi.memories.length > 0) {
            for (const mem of parsedAi.memories) {
              formatted.push({
                id: `${msg.messageId}_widget_${mem.memoryId || Math.random().toString()}`,
                type: "widget",
                title: mem.title,
                location: mem.description || undefined,
                imageUri: mem.imageUrl || undefined,
                timeAgo: formatTimeAgo(mem.createdat || mem.createdAt || msg.createdAt),
              });
            }
            formatted.push({
              id: msg.messageId,
              type: "system",
              text: parsedAi.reply || msg.content,
            });
          } else {
            formatted.push({
              id: msg.messageId,
              type: "system",
              text: msg.content,
            });
          }
        }
      }
      setChatMessages(formatted);
    } catch (err: any) {
      console.error("Error loading messages:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMemories();
      loadMessages();
    }, [])
  );

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
      let latitude: number | undefined = undefined;
      let longitude: number | undefined = undefined;
      
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      } else {
        Alert.alert(
          "Location Disabled",
          "Your memory is being saved without GPS coordinates because location access was denied."
        );
      }

      // 4. Send request to backend
      try {
        const aiResponse = await sendNlpChat(currentText, latitude, longitude, currentPhoto || undefined);
        
        const newSystemMsg: ChatMessageData = {
          id: `${Date.now()}_system`,
          type: "system",
          text: aiResponse.reply,
        };

        const newWidgets: ChatMessageData[] = [];
        if (aiResponse.memories && aiResponse.memories.length > 0) {
          for (const mem of aiResponse.memories) {
            newWidgets.push({
              id: `${Date.now()}_widget_${mem.memoryId || Math.random().toString()}`,
              type: "widget",
              title: mem.title,
              location: mem.description || undefined,
              imageUri: mem.imageUrl || undefined,
              timeAgo: formatTimeAgo(mem.createdat || mem.createdAt || new Date().toISOString()),
            });
          }
        }

        setChatMessages((prev) => [...newWidgets, newSystemMsg, ...prev]);

        // Refresh memories in background
        await loadMemories();
      } catch (error: any) {
        console.error("Failed to send message to backend:", error);
        setChatMessages((prev) => [
          {
            id: `${Date.now()}_error`,
            type: "system",
            text: `Error: ${error.message || "Failed to process chat message."}`
          },
          ...prev
        ]);
      } finally {
        setIsProcessing(false);
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
      mediaTypes: ["images"],
      quality: 0.5,
      allowsEditing: true,
      aspect: [4, 3],
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
        (m.description && m.description.toLowerCase().includes(lowerQuery))
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
        {isLoadingMemories && memories.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredMemories}
            keyExtractor={(item) => item.memoryId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <MemoryCard
                title={item.title}
                location={item.description || "No description provided"}
                dateStr={formatMemoryDate(item.createdAt)}
                highlightDate={false}
                imageSource={item.image?.imageUrl ? { uri: item.image.imageUrl } : undefined}
                iconName={item.image?.imageUrl ? undefined : getMemoryIcon(item.title)}
              />
            )}
          />
        )}
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
