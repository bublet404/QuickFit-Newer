import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../constants/theme";

export default function Button({ title, onPress, secondary = false, disabled = false }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary, disabled && { opacity: 0.5 }]}>
    <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
  </Pressable>;
}
