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

export default function WardrobeScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  async function load() { try { setItems(await request("/items", token)); } catch (e) { Alert.alert("Error", e.message); } }
  useFocusEffect(React.useCallback(() => { load(); }, [token, refresh]));
  const filtered = items.filter(i => (category === "All" || i.category === category) && `${i.name} ${i.color} ${(i.tags || []).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  return <Screen><View style={styles.screenHeader}><View><Text style={styles.eyebrow}>EVERY PIECE, IN ONE PLACE</Text><Text style={styles.h1}>My wardrobe</Text></View><Pressable style={styles.addCircle} onPress={() => navigation.navigate("ItemEditor", { onSaved: () => setRefresh(x => x + 1) })}><Text style={styles.addCircleText}>＋</Text></Pressable></View>
    <Field label="" value={search} onChangeText={setSearch} placeholder="Search clothing or tags..." />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroller}>{["All", ...CATEGORIES].map(c => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}</ScrollView>
    <FlatList data={filtered} keyExtractor={i => i._id} renderItem={({ item }) => <ItemRow item={item} onPress={() => navigation.navigate("ItemEditor", { item, onSaved: () => setRefresh(x => x + 1) })} />} contentContainerStyle={{ paddingBottom: 24 }} ListEmptyComponent={<Empty text="Nothing here yet." detail="Add a clothing item or try another category." />} />
  </Screen>;
}
