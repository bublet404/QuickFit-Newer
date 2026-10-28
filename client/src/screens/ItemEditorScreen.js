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

export default function ItemEditorScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const existing = route.params?.item;
  const [name, setName] = useState(existing?.name || "");
  const [category, setCategory] = useState(existing?.category || "Tops");
  const [color, setColor] = useState(existing?.color || "");
  const [season, setSeason] = useState(existing?.season || "All season");
  const [tags, setTags] = useState((existing?.tags || []).join(", "));
  const [notes, setNotes] = useState(existing?.notes || "");
  const [imageUri, setImageUri] = useState(existing?.imageUri || "");
  const [busy, setBusy] = useState(false);
  async function chooseImage(camera) {
    try {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert("Permission needed", camera ? "Allow camera access to take a clothing photo." : "Allow photo access to choose an image.");
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.75 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.75 });
      if (!result.canceled && result.assets?.[0]?.uri) setImageUri(result.assets[0].uri);
    } catch (e) { Alert.alert("Image picker", e.message); }
  }
  async function save() {
    if (!name.trim()) return Alert.alert("Name required", "Give this clothing item a name.");
    setBusy(true);
    const body = { name: name.trim(), category, color, season, tags: tags.split(",").map(t => t.trim()).filter(Boolean), notes, imageUri };
    try {
      await request(existing ? `/items/${existing._id}` : "/items", token, { method: existing ? "PUT" : "POST", body: JSON.stringify(body) });
      route.params?.onSaved?.(); navigation.goBack();
    } catch (e) { Alert.alert("Couldn't save item", e.message); }
    finally { setBusy(false); }
  }
  function remove() {
    Alert.alert("Delete clothing item?", "This will also remove it from saved outfits.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await request(`/items/${existing._id}`, token, { method: "DELETE" }); route.params?.onSaved?.(); navigation.goBack(); }
        catch (e) { Alert.alert("Couldn't delete", e.message); }
      }}
    ]);
  }
  return <Screen><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
    <Text style={styles.eyebrow}>{existing ? "UPDATE YOUR WARDROBE" : "ADD A NEW PIECE"}</Text><Text style={styles.h1}>{existing ? "Edit item" : "New clothing item"}</Text>
    <Pressable style={styles.photoBox} onPress={() => Alert.alert("Add a photo", "Choose how to add a clothing photo.", [{ text: "Take photo", onPress: () => chooseImage(true) }, { text: "Photo library", onPress: () => chooseImage(false) }, { text: "Cancel", style: "cancel" }])}>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : <><Text style={styles.photoIcon}>＋</Text><Text style={styles.photoTitle}>Add a clothing photo</Text><Text style={styles.photoSub}>Take a picture or choose from library</Text></>}
    </Pressable>
    <Field label="Item name *" value={name} onChangeText={setName} placeholder="e.g. Vintage denim jacket" />
    <Text style={styles.fieldLabel}>Category</Text><View style={styles.chipWrap}>{CATEGORIES.map(c => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}</View>
    <Field label="Color" value={color} onChangeText={setColor} placeholder="e.g. Washed blue" />
    <Field label="Season" value={season} onChangeText={setSeason} placeholder="e.g. Spring / Summer" />
    <Field label="Tags (comma-separated)" value={tags} onChangeText={setTags} placeholder="e.g. casual, vintage, favorite" />
    <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Fit, brand, or anything else..." />
    <Button title={busy ? "Saving..." : "Save clothing item"} onPress={save} disabled={busy} />
    {existing && <Button title="Delete item" secondary onPress={remove} />}
  </ScrollView></Screen>;
}
