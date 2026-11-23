import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import AuthContext from "../context/AuthContext";
import { request } from "../services/api";
import { OUTFIT_CATEGORIES } from "../constants/categories";
import { styles } from "../constants/theme";
import Button from "../components/Button";
import Field from "../components/Field";
import Chip from "../components/Chip";
import Screen from "../components/Screen";
import Empty from "../components/Empty";
import ItemRow from "../components/ItemRow";

export default function OutfitEditorScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const existing = route.params?.outfit;
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [name, setName] = useState(existing?.name || "");
  const [category, setCategory] = useState(existing?.category || "Everyday");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [selected, setSelected] = useState(
    (existing?.itemIds || []).map(item => typeof item === "string" ? item : item?._id).filter(Boolean)
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingItems(true);
    request("/items", token)
      .then(data => { if (active) setItems(Array.isArray(data) ? data : []); })
      .catch(error => Alert.alert("Couldn't load wardrobe", error.message))
      .finally(() => { if (active) setLoadingItems(false); });
    return () => { active = false; };
  }, [token]);

  function toggle(id) {
    setSelected(current => current.includes(id)
      ? current.filter(selectedId => selectedId !== id)
      : [...current, id]
    );
  }

  async function save() {
    if (!name.trim()) return Alert.alert("Name required", "Give your outfit a name.");
    if (!selected.length) return Alert.alert("Choose clothing", "Select at least one clothing item.");
    setBusy(true);
    try {
      await request(existing ? `/outfits/${existing._id}` : "/outfits", token, {
        method: existing ? "PUT" : "POST",
        body: JSON.stringify({ name: name.trim(), category, notes, itemIds: selected })
      });
      route.params?.onSaved?.();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Couldn't save outfit", error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
        <Text style={styles.eyebrow}>{existing ? "REFINE YOUR LOOK" : "MAKE A NEW LOOK"}</Text>
        <Text style={styles.h1}>{existing ? "Edit outfit" : "Build an outfit"}</Text>
        <Field label="Outfit name *" value={name} onChangeText={setName} placeholder="e.g. Weekend layers" />
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.chipWrap}>
          {OUTFIT_CATEGORIES.map(value => (
            <Chip key={value} label={value} selected={category === value} onPress={() => setCategory(value)} />
          ))}
        </View>
        <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="When or how you wear it" multiline />
        <View style={styles.sectionHeading}>
          <Text style={styles.h2}>Choose pieces</Text>
          <Text style={styles.muted}>{selected.length} selected</Text>
        </View>

        {loadingItems ? (
          <Text style={styles.muted}>Loading your wardrobe...</Text>
        ) : items.length ? (
          items.map(item => (
            <ItemRow
              key={item._id}
              item={item}
              onPress={() => toggle(item._id)}
              right={(
                <View style={[styles.checkCircle, selected.includes(item._id) && styles.checkCircleOn]}>
                  <Text style={styles.checkText}>{selected.includes(item._id) ? "✓" : ""}</Text>
                </View>
              )}
            />
          ))
        ) : (
          <Empty text="Your wardrobe is empty." detail="Add clothing before creating an outfit." />
        )}

        <Button title={busy ? "Saving..." : "Save outfit"} onPress={save} disabled={busy || loadingItems} />
      </ScrollView>
    </Screen>
  );
}