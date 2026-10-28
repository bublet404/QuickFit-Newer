import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../constants/theme";
import HomeScreen from "../screens/HomeScreen";
import WardrobeScreen from "../screens/WardrobeScreen";
import ItemEditorScreen from "../screens/ItemEditorScreen";
import OutfitsScreen from "../screens/OutfitsScreen";
import OutfitEditorScreen from "../screens/OutfitEditorScreen";
import OutfitDetailScreen from "../screens/OutfitDetailScreen";
import StatsScreen from "../screens/StatsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export function MainTabs() {
  return <Tab.Navigator screenOptions={{
    headerShown: false, tabBarActiveTintColor: COLORS.accent, tabBarInactiveTintColor: "#99918a",
    tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.line, height: 62, paddingTop: 7, paddingBottom: 7 },
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }
  }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>⌂</Text> }} />
    <Tab.Screen name="Wardrobe" component={WardrobeStack} options={{ tabBarLabel: "Wardrobe", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>♧</Text> }} />
    <Tab.Screen name="Outfits" component={OutfitsStack} options={{ tabBarLabel: "Outfits", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>✳</Text> }} />
    <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: "Stats", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>▥</Text> }} />
  </Tab.Navigator>;
}
function WardrobeStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
    <Stack.Screen name="WardrobeHome" component={WardrobeScreen} />
    <Stack.Screen name="ItemEditor" component={ItemEditorScreen} />
  </Stack.Navigator>;
}
function OutfitsStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
    <Stack.Screen name="OutfitsHome" component={OutfitsScreen} />
    <Stack.Screen name="OutfitEditor" component={OutfitEditorScreen} />
    <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
  </Stack.Navigator>;
}
