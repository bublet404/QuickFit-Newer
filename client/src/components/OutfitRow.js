import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../constants/theme";

export default function OutfitRow({ outfit, onPress, right }) {
  return <Pressable onPress={onPress} style={styles.listCard}>
    <View style={styles.outfitThumb}><Text style={{ fontSize: 22 }}>✳</Text></View>
    <View style={styles.rowInfo}><Text style={styles.rowTitle}>{outfit.name}</Text><Text style={styles.rowSub}>{outfit.category} · {outfit.itemIds?.length || 0} pieces</Text><Text style={styles.tagLine}>Worn {outfit.wearHistory?.length || 0} times</Text></View>
    {right || <Text style={styles.chevron}>›</Text>}
  </Pressable>;
}
