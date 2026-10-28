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

export default function OutfitEditorScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const existing = route.params?.outfit;
  const [items, setItems] = useState([]);
  const [name, setName] = useState(existing?.name || "");
  const [category, setCategory] = useState(existing?.category || "Everyday");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [selected, setSelected] = useState((existing?.itemIds || []).map(i => typeof i === "string" ? i : i._id));
  const [busy, setBusy] = useState(false);
  useEffect(() => { request("/items", token).then(setItems).catch(e => Alert.alert("Couldn't load wardrobe", e.message)); }, [token]);
  function toggle(id) { setSelected(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]); }
  async function save() {
    if (!name.trim()) return Alert.alert("Name required", "Give your outfit a name.");
    if (!selected.length) return Alert.alert("Choose clothing", "Select at least one clothing item.");
    setBusy(true);
    try {
      await request(existing ? `/outfits/${existing._id}` : "/outfits", token, { method: existing ? "PUT" : "POST", body: JSON.stringify({ name: name.trim(), category, notes, itemIds: selected }) });
      route.params?.onSaved?.(); navigation.goBack();
    } catch (e) { Alert.alert("Couldn't save outfit", e.message); }
    finally { setBusy(false); }
  }
  return <Screen><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
    <Text style={styles.eyebrow}>{existing ? "REFINE YOUR LOOK" : "MAKE A NEW LOOK"}</Text><Text style={styles.h1}>{existing ? "Edit outfit" : "Build an outfit"}</Text>
    <Field label="Outfit name *" value={name} onChangeText={setName} placeholder="e.g. Weekend layers" />
    <Text style={styles.fieldLabel}>Category</Text><View style={styles.chipWrap}>{OUTFIT_CATEGORIES.map(c => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}</View>
    <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="When or how you wear it" multiline />
    <View style={styles.sectionHeading}><Text style={styles.h2}>Choose pieces</Text><Text style={styles.muted}>{selected.length} selected</Text></View>
    {items.map(item => <Pressable key={item._id} onPress={() => toggle(item._id)}><ItemRow item={item} right={<View style={[styles.checkCircle, selected.includes(item._id) && styles.checkCircleOn]}><Text style={styles.checkText}>{selected.includes(item._id) ? "✓" : ""}</Text></View>} /></Pressable>)}
    {!items.length && <Empty text="Your wardrobe is empty." detail="Add clothing before creating an outfit." />}
    <Button title={busy ? "Saving..." : "Save outfit"} onPress={save} disabled={busy} />
  </ScrollView></Screen>;
}
