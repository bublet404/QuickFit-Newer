import React, { useContext, useEffect, useState } from "react";
import {
  Alert, FlatList, Image, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import AuthContext from "../context/AuthContext";
import { request } from "../services/api";
import { CATEGORIES, OUTFIT_CATEGORIES } from "../constants/categories";
import { COLORS, styles } from "../constants/theme";
import Button from "../components/Button";
import Field from "../components/Field";
import Chip from "../components/Chip";
import Screen from "../components/Screen";
import Stat from "../components/Stat";
import Empty from "../components/Empty";
import ItemRow from "../components/ItemRow";
import OutfitRow from "../components/OutfitRow";

export default function StatsScreen() {
  const { token, signOut, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useFocusEffect(React.useCallback(() => {
    Promise.all([request("/stats", token), request("/outfits", token), request("/items", token)])
      .then(([s, o, i]) => { setStats(s); setOutfits(o); setItems(i); setError(""); })
      .catch(e => setError(e.message));
  }, [token]));
  return <Screen><ScrollView><Text style={styles.eyebrow}>A LITTLE LOOK BACK</Text><Text style={styles.h1}>Your closet stats</Text><Text style={styles.bodyCopy}>A snapshot of what you own and what you wear.</Text>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
    <View style={styles.statsGrid}><Stat value={stats?.itemCount ?? "—"} label="Items in wardrobe" /><Stat value={stats?.outfitCount ?? "—"} label="Saved outfits" /><Stat value={stats?.outfitsWorn ?? "—"} label="Total wears" /><Stat value={items.length ? new Set(items.map(i => i.category)).size : "—"} label="Categories used" /></View>
    <View style={styles.sectionHeading}><Text style={styles.h2}>Wardrobe breakdown</Text></View>
    {stats?.categoryCounts?.length ? stats.categoryCounts.map(c => <View key={c._id} style={styles.breakdownRow}><Text style={styles.rowTitle}>{c._id}</Text><View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.max(5, c.count / Math.max(...stats.categoryCounts.map(x => x.count)) * 100)}%` }]} /></View><Text style={styles.muted}>{c.count}</Text></View>) : <Empty text="No wardrobe data yet." detail="Add clothing to see your categories here." />}
    <View style={styles.sectionHeading}><Text style={styles.h2}>Most-worn outfit</Text></View>
    {stats?.mostWorn && stats.mostWorn.count > 0 ? <View style={styles.featureCard}><Text style={styles.featureIcon}>✳</Text><Text style={styles.rowTitle}>{stats.mostWorn.name}</Text><Text style={styles.bodyCopy}>Worn {stats.mostWorn.count} times</Text></View> : <Empty text="No favorite outfit yet." detail="Log wear history to see your most-worn look." />}
    <View style={styles.sectionHeading}><Text style={styles.h2}>Account</Text></View><View style={styles.featureCard}><Text style={styles.rowTitle}>{user?.name}</Text><Text style={styles.rowSub}>{user?.email}</Text><Button title="Log out" secondary onPress={signOut} /></View>
  </ScrollView></Screen>;
}
