import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { styles } from "../constants/theme";

export default function ItemRow({ item, onPress, right }) {
  return <Pressable onPress={onPress} style={styles.listCard}>
    {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder}><Text style={{ fontSize: 22 }}>♧</Text></View>}
    <View style={styles.rowInfo}><Text style={styles.rowTitle}>{item.name}</Text><Text style={styles.rowSub}>{item.category}{item.color ? ` · ${item.color}` : ""}</Text>{item.tags?.length ? <Text style={styles.tagLine}>{item.tags.join(" · ")}</Text> : null}</View>
    {right || <Text style={styles.chevron}>›</Text>}
  </Pressable>;
}
