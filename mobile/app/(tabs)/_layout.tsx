/**
 * Tabs layout – wires up the custom Header and TabBar components
 * and defines the three tab screens: Dashboard, Sanctuary, Lost-Found.
 *
 * Pages live inside the (tabs) route group folder:
 *   app/(tabs)/index.tsx       → Dashboard (default)
 *   app/(tabs)/sanctuary.tsx   → Sanctuary
 *   app/(tabs)/lost-found.tsx  → Lost-Found
 */

import React from "react";
import { Tabs } from "expo-router";
import Header from "../../components/Header";
import TabBar from "../../components/TabBar";


export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        header: () => <Header />,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="sanctuary"
        options={{
          title: "Sanctuary",
        }}
      />
      <Tabs.Screen
        name="lost-found"
        options={{
          title: "Lost-Found",
        }}
      />
    </Tabs>
  );
}
