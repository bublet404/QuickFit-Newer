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

export default function HomeScreen({ navigation }) {
  const { token, user, signOut } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [error, setError] = useState("");
  async function load() {
    try {
      const [s, i, o] = await Promise.all([
        request("/stats", token), request("/items", token), request("/outfits", token)
      ]);
      setStats(s); setItems(i); setOutfits(o); setError("");
    } catch (e) { setError(e.message); }
  }
  useFocusEffect(React.useCallback(() => { load(); }, [token]));
  return <Screen><ScrollView showsVerticalScrollIndicator={false}>
    <View style={styles.homeHeader}>
      <View><Text style={styles.eyebrow}>YOUR PERSONAL WARDROBE</Text><Text style={styles.h1}>Hey, {user?.name?.split(" ")[0] || "there"}.</Text></View>
      <Pressable onPress={() => Alert.alert("QuickFit", "Prototype v1", [{ text: "Log out", style: "destructive", onPress: signOut }, { text: "Cancel", style: "cancel" }])} style={styles.avatar}><Text style={styles.avatarText}>{(user?.name || "Q")[0].toUpperCase()}</Text></Pressable>
    </View>
    <Text style={styles.bodyCopy}>Make something good out of what you own.</Text>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
    <View style={styles.statsRow}>
      <Stat value={stats?.itemCount ?? "—"} label="Clothing items" />
      <Stat value={stats?.outfitCount ?? "—"} label="Outfits saved" />
      <Stat value={stats?.outfitsWorn ?? "—"} label="Wears logged" />
    </View>
    <View style={styles.sectionHeading}><Text style={styles.h2}>Quick actions</Text></View>
    <View style={styles.actionRow}>
      <Pressable style={styles.actionCard} onPress={() => navigation.navigate("Wardrobe", { screen: "ItemEditor" })}><Text style={styles.actionIcon}>＋</Text><Text style={styles.actionTitle}>Add clothing</Text><Text style={styles.actionSub}>Grow your wardrobe</Text></Pressable>
      <Pressable style={styles.actionCard} onPress={() => navigation.navigate("Outfits", { screen: "OutfitEditor" })}><Text style={styles.actionIcon}>✳</Text><Text style={styles.actionTitle}>Build an outfit</Text><Text style={styles.actionSub}>Mix your pieces</Text></Pressable>
    </View>
    <View style={styles.sectionHeading}><Text style={styles.h2}>Recently added</Text><Text style={styles.linkText} onPress={() => navigation.navigate("Wardrobe")}>View all</Text></View>
    {items.slice(0, 3).length ? items.slice(0, 3).map(item => <ItemRow key={item._id} item={item} onPress={() => navigation.navigate("Wardrobe", { screen: "ItemEditor", params: { item } })} />) : <Empty text="Your wardrobe is waiting." detail="Add your first clothing item to get started." />}
    <View style={styles.sectionHeading}><Text style={styles.h2}>Your outfits</Text><Text style={styles.linkText} onPress={() => navigation.navigate("Outfits")}>View all</Text></View>
    {outfits.slice(0, 2).length ? outfits.slice(0, 2).map(o => <OutfitRow key={o._id} outfit={o} />) : <Empty text="No outfits saved yet." detail="Create an outfit from the pieces you own." />}
    <View style={{ height: 28 }} />
  </ScrollView></Screen>;
}
function Stat({ value, label }) { return <View style={styles.statCard}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function Empty({ text, detail }) { return <View style={styles.empty}><Text style={styles.emptyTitle}>{text}</Text><Text style={styles.emptyDetail}>{detail}</Text></View>; }
