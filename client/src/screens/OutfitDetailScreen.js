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

export default function OutfitDetailScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const [outfit, setOutfit] = useState(route.params.outfit);
  const [busy, setBusy] = useState(false);
  async function reload() { try { setOutfit(await request(`/outfits/${outfit._id}`, token)); } catch (e) { Alert.alert("Error", e.message); } }
  async function worn() {
    setBusy(true);
    try { setOutfit(await request(`/outfits/${outfit._id}/wear`, token, { method: "POST", body: JSON.stringify({}) })); route.params?.onChanged?.(); }
    catch (e) { Alert.alert("Couldn't log wear", e.message); }
    finally { setBusy(false); }
  }
  function edit() { navigation.navigate("OutfitEditor", { outfit, onSaved: () => { reload(); route.params?.onChanged?.(); } }); }
  function remove() {
    Alert.alert("Delete outfit?", "This cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => {
      try { await request(`/outfits/${outfit._id}`, token, { method: "DELETE" }); route.params?.onChanged?.(); navigation.goBack(); }
      catch (e) { Alert.alert("Couldn't delete", e.message); }
    }}]);
  }
  return <Screen><ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
    <Text style={styles.eyebrow}>{outfit.category?.toUpperCase()}</Text><Text style={styles.h1}>{outfit.name}</Text><Text style={styles.bodyCopy}>{outfit.notes || "A look made from your own wardrobe."}</Text>
    <View style={styles.statsRow}><Stat value={outfit.itemIds?.length || 0} label="Pieces" /><Stat value={outfit.wearHistory?.length || 0} label="Times worn" /></View>
    <View style={styles.sectionHeading}><Text style={styles.h2}>Pieces in this outfit</Text></View>
    {outfit.itemIds?.map(item => <ItemRow key={item._id} item={item} />)}
    <Button title={busy ? "Logging..." : "✓  I wore this outfit"} onPress={worn} disabled={busy} />
    <Button title="Edit outfit" secondary onPress={edit} />
    <Button title="Delete outfit" secondary onPress={remove} />
    <View style={styles.sectionHeading}><Text style={styles.h2}>Wear history</Text></View>
    {outfit.wearHistory?.length ? [...outfit.wearHistory].reverse().map((h, i) => <View key={`${h._id || h.wornAt}-${i}`} style={styles.historyRow}><Text style={styles.historyDot}>•</Text><Text style={styles.rowSub}>{new Date(h.wornAt).toLocaleString()}</Text></View>) : <Empty text="No wears logged yet." detail="Tap “I wore this outfit” when you wear this look." />}
  </ScrollView></Screen>;
}
