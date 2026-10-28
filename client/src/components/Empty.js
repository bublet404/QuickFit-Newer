import React from "react";
import { Text, View } from "react-native";
import { styles } from "../constants/theme";

export default function Empty({ text, detail }) { return <View style={styles.empty}><Text style={styles.emptyTitle}>{text}</Text><Text style={styles.emptyDetail}>{detail}</Text></View>; }
