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

export default function OutfitsScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [outfits, setOutfits] = useState([]);
  const [refresh, setRefresh] = useState(0);
  async function load() { try { setOutfits(await request("/outfits", token)); } catch (e) { Alert.alert("Error", e.message); } }
  useFocusEffect(React.useCallback(() => { load(); }, [token, refresh]));
  return <Screen><View style={styles.screenHeader}><View><Text style={styles.eyebrow}>PUT YOUR PIECES TOGETHER</Text><Text style={styles.h1}>Outfits</Text></View><Pressable style={styles.addCircle} onPress={() => navigation.navigate("OutfitEditor", { onSaved: () => setRefresh(x => x + 1) })}><Text style={styles.addCircleText}>＋</Text></Pressable></View>
    <FlatList data={outfits} keyExtractor={o => o._id} renderItem={({ item }) => <OutfitRow outfit={item} onPress={() => navigation.navigate("OutfitDetail", { outfit: item, onChanged: () => setRefresh(x => x + 1) })} />} contentContainerStyle={{ paddingBottom: 24 }} ListEmptyComponent={<Empty text="Your outfit book is empty." detail="Save a look by combining clothing items you already own." />} />
  </Screen>;
}
