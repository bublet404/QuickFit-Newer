import React from "react";
import { Text, TextInput, View } from "react-native";
import { styles } from "../constants/theme";

export default function Field({ label, value, onChangeText, placeholder, multiline = false, secureTextEntry = false, keyboardType }) {
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder || label}
      placeholderTextColor="#9b958e" multiline={multiline} secureTextEntry={secureTextEntry}
      keyboardType={keyboardType} style={[styles.input, multiline && styles.multiline]}
      autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
    />
  </View>;
}
