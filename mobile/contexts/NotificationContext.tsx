import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Ionicons } from "@expo/vector-icons";

export type NotificationFilter = "All" | "Unread" | "Sound" | "Items";

export interface NotificationItem {
  id: string;
  category: string;
  iconName: keyof typeof Ionicons.glyphMap;
  timeAgo: string;
  isUnread: boolean;
  message: string;
  section: "TODAY" | "EARLIER";
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: NotificationItem) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getFilteredNotifications: (filter: NotificationFilter) => NotificationItem[];
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    category: "Sound Sanctuary",
    iconName: "stats-chart",
    timeAgo: "2 min ago",
    isUnread: true,
    message: "Ambient noise level exceeded your comfort threshold. Rain sounds activated automatically.",
    section: "TODAY",
  },
  {
    id: "2",
    category: "Lost-to-Found",
    iconName: "archive",
    timeAgo: "15 min ago",
    isUnread: true,
    message: "New item Memory Created Successfully: 'Blue Headphones'.",
    section: "TODAY",
  },
  {
    id: "3",
    category: "Lost-to-Found",
    iconName: "archive",
    timeAgo: "3 hr ago",
    isUnread: false,
    message: "New item Memory Created Successfully: 'Gray Laptop Bag'.",
    section: "EARLIER",
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.isUnread).length,
    [notifications]
  );

  const addNotification = useCallback((notification: NotificationItem): void => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string): void => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isUnread: false } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback((): void => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isUnread: false }))
    );
  }, []);

  const getFilteredNotifications = useCallback(
    (filter: NotificationFilter): NotificationItem[] =>
      notifications.filter((notification) => {
        if (filter === "All") return true;
        if (filter === "Unread") return notification.isUnread;
        if (filter === "Sound") return notification.category === "Sound Sanctuary";
        if (filter === "Items") return notification.category === "Lost-to-Found";
        return true;
      }),
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      getFilteredNotifications,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      getFilteredNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }

  return context;
}
