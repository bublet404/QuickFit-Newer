import React from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { COLORS, styles } from "../constants/theme";

export default function Screen({ children }) {
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} /><View style={styles.screen}>{children}</View></SafeAreaView>;
}
