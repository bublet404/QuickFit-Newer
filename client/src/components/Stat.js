import React from "react";
import { Text, View } from "react-native";
import { styles } from "../constants/theme";

export default function Stat({ value, label }) { return <View style={styles.statCard}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
