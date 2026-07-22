import { Tabs } from "expo-router";
import React from "react";
import { CustomTabBar } from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="mind" options={{ title: "Mind" }} />
      <Tabs.Screen name="body" options={{ title: "Body" }} />
      <Tabs.Screen name="soul" options={{ title: "Soul" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="coach" options={{ href: null }} />
    </Tabs>
  );
}
