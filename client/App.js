import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal,
  Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";

const API = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const AuthContext = createContext(null);
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories", "Dresses", "Other"];
const OUTFIT_CATEGORIES = ["Everyday", "Work", "Formal", "Sport", "Going out", "Other"];

async function request(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function Field({ label, value, onChangeText, placeholder, multiline = false, secureTextEntry = false, keyboardType }) {
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder || label}
      placeholderTextColor="#9b958e" multiline={multiline} secureTextEntry={secureTextEntry}
      keyboardType={keyboardType} style={[styles.input, multiline && styles.multiline]}
      autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
    />
  </View>;
}
function Button({ title, onPress, secondary = false, disabled = false }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary, disabled && { opacity: 0.5 }]}>
    <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
  </Pressable>;
}
function Chip({ label, selected, onPress }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>;
}
function Screen({ children }) {
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} /><View style={styles.screen}>{children}</View></SafeAreaView>;
}
const COLORS = { bg: "#f7f4ef", card: "#fffdf9", ink: "#282622", muted: "#77716a", accent: "#6554a4", line: "#e8e1d8", pale: "#eee9f8", danger: "#b43d3d" };

function AuthScreen() {
  const { signIn } = useContext(AuthContext);
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!email.trim() || !password) return Alert.alert("Missing information", "Enter your email and password.");
    if (register && (!name.trim() || password.length < 8)) return Alert.alert("Check your details", "Enter your name and a password of at least 8 characters.");
    setBusy(true);
    try {
      const result = await request(`/auth/${register ? "register" : "login"}`, null, {
        method: "POST", body: JSON.stringify({ name, email, password })
      });
      await signIn(result);
    } catch (e) { Alert.alert("Couldn't sign in", e.message); }
    finally { setBusy(false); }
  }
  return <Screen><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authWrap}>
    <View style={styles.logoMark}><Text style={styles.logoMarkText}>Q</Text></View>
    <Text style={styles.wordmark}>QuickFit</Text>
    <Text style={styles.subtitle}>Your wardrobe, your way.</Text>
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{register ? "Create your account" : "Welcome back"}</Text>
      {register && <Field label="Name" value={name} onChangeText={setName} />}
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {register && <Text style={styles.helper}>Use at least 8 characters.</Text>}
      <Button title={busy ? "Please wait..." : register ? "Create account" : "Log in"} onPress={submit} disabled={busy} />
      <Pressable onPress={() => setRegister(!register)} style={styles.switchAuth}>
        <Text style={styles.switchAuthText}>{register ? "Already have an account? Log in" : "New to QuickFit? Create an account"}</Text>
      </Pressable>
    </View>
  </KeyboardAvoidingView></Screen>;
}

function HomeScreen({ navigation }) {
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

function ItemRow({ item, onPress, right }) {
  return <Pressable onPress={onPress} style={styles.listCard}>
    {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder}><Text style={{ fontSize: 22 }}>♧</Text></View>}
    <View style={styles.rowInfo}><Text style={styles.rowTitle}>{item.name}</Text><Text style={styles.rowSub}>{item.category}{item.color ? ` · ${item.color}` : ""}</Text>{item.tags?.length ? <Text style={styles.tagLine}>{item.tags.join(" · ")}</Text> : null}</View>
    {right || <Text style={styles.chevron}>›</Text>}
  </Pressable>;
}
function OutfitRow({ outfit, onPress, right }) {
  return <Pressable onPress={onPress} style={styles.listCard}>
    <View style={styles.outfitThumb}><Text style={{ fontSize: 22 }}>✳</Text></View>
    <View style={styles.rowInfo}><Text style={styles.rowTitle}>{outfit.name}</Text><Text style={styles.rowSub}>{outfit.category} · {outfit.itemIds?.length || 0} pieces</Text><Text style={styles.tagLine}>Worn {outfit.wearHistory?.length || 0} times</Text></View>
    {right || <Text style={styles.chevron}>›</Text>}
  </Pressable>;
}

function WardrobeScreen({ navigation }) {
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

function ItemEditorScreen({ route, navigation }) {
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

function OutfitsScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [outfits, setOutfits] = useState([]);
  const [refresh, setRefresh] = useState(0);
  async function load() { try { setOutfits(await request("/outfits", token)); } catch (e) { Alert.alert("Error", e.message); } }
  useFocusEffect(React.useCallback(() => { load(); }, [token, refresh]));
  return <Screen><View style={styles.screenHeader}><View><Text style={styles.eyebrow}>PUT YOUR PIECES TOGETHER</Text><Text style={styles.h1}>Outfits</Text></View><Pressable style={styles.addCircle} onPress={() => navigation.navigate("OutfitEditor", { onSaved: () => setRefresh(x => x + 1) })}><Text style={styles.addCircleText}>＋</Text></Pressable></View>
    <FlatList data={outfits} keyExtractor={o => o._id} renderItem={({ item }) => <OutfitRow outfit={item} onPress={() => navigation.navigate("OutfitDetail", { outfit: item, onChanged: () => setRefresh(x => x + 1) })} />} contentContainerStyle={{ paddingBottom: 24 }} ListEmptyComponent={<Empty text="Your outfit book is empty." detail="Save a look by combining clothing items you already own." />} />
  </Screen>;
}

function OutfitEditorScreen({ route, navigation }) {
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

function OutfitDetailScreen({ route, navigation }) {
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

function StatsScreen() {
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

function MainTabs() {
  const { token } = useContext(AuthContext);
  return <Tab.Navigator screenOptions={{
    headerShown: false, tabBarActiveTintColor: COLORS.accent, tabBarInactiveTintColor: "#99918a",
    tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.line, height: 62, paddingTop: 7, paddingBottom: 7 },
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }
  }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>⌂</Text> }} />
    <Tab.Screen name="Wardrobe" component={WardrobeStack} options={{ tabBarLabel: "Wardrobe", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>♧</Text> }} />
    <Tab.Screen name="Outfits" component={OutfitsStack} options={{ tabBarLabel: "Outfits", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>✳</Text> }} />
    <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: "Stats", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>▥</Text> }} />
  </Tab.Navigator>;
}
function WardrobeStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
    <Stack.Screen name="WardrobeHome" component={WardrobeScreen} />
    <Stack.Screen name="ItemEditor" component={ItemEditorScreen} />
  </Stack.Navigator>;
}
function OutfitsStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
    <Stack.Screen name="OutfitsHome" component={OutfitsScreen} />
    <Stack.Screen name="OutfitEditor" component={OutfitEditorScreen} />
    <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
  </Stack.Navigator>;
}

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("quickfit_session");
        if (saved) { const session = JSON.parse(saved); setToken(session.token); setUser(session.user); }
      } catch (_e) { await AsyncStorage.removeItem("quickfit_session"); }
      finally { setLoading(false); }
    })();
  }, []);
  async function signIn(session) {
    await AsyncStorage.setItem("quickfit_session", JSON.stringify(session));
    setToken(session.token); setUser(session.user);
  }
  async function signOut() {
    await AsyncStorage.removeItem("quickfit_session");
    setToken(null); setUser(null);
  }
  if (loading) return <SafeAreaView style={styles.safe}><View style={styles.loading}><ActivityIndicator size="large" color={COLORS.accent} /><Text style={styles.muted}>Loading QuickFit...</Text></View></SafeAreaView>;
  return <AuthContext.Provider value={{ token, user, signIn, signOut }}>
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthScreen />}
    </NavigationContainer>
  </AuthContext.Provider>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 16, backgroundColor: COLORS.bg },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  authWrap: { flex: 1, justifyContent: "center", paddingBottom: 35 },
  logoMark: { width: 58, height: 58, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 12 },
  logoMarkText: { color: "#fff", fontWeight: "900", fontSize: 31 },
  wordmark: { textAlign: "center", color: COLORS.ink, fontSize: 35, fontWeight: "800", letterSpacing: -1.4 },
  subtitle: { textAlign: "center", color: COLORS.muted, fontSize: 14, marginTop: 5, marginBottom: 26 },
  panel: { backgroundColor: COLORS.card, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: COLORS.line },
  panelTitle: { fontSize: 22, color: COLORS.ink, fontWeight: "800", marginBottom: 16 },
  field: { marginBottom: 13 },
  fieldLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "700", marginBottom: 7, letterSpacing: 0.2 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, color: COLORS.ink, fontSize: 15 },
  multiline: { minHeight: 84, textAlignVertical: "top" },
  helper: { color: COLORS.muted, fontSize: 12, marginTop: -5, marginBottom: 12 },
  button: { backgroundColor: COLORS.accent, borderRadius: 13, paddingVertical: 14, alignItems: "center", marginTop: 8, marginBottom: 8 },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  buttonSecondary: { backgroundColor: COLORS.pale, borderWidth: 1, borderColor: "#ded5f0" },
  buttonSecondaryText: { color: COLORS.accent },
  switchAuth: { paddingVertical: 12, alignItems: "center" },
  switchAuthText: { color: COLORS.accent, fontWeight: "700", fontSize: 13 },
  homeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  screenHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  eyebrow: { color: COLORS.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.3, marginBottom: 7 },
  h1: { color: COLORS.ink, fontSize: 29, fontWeight: "800", letterSpacing: -0.7, marginBottom: 7 },
  h2: { color: COLORS.ink, fontSize: 18, fontWeight: "800" },
  subtitle2: { color: COLORS.muted },
  bodyCopy: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  avatar: { width: 43, height: 43, borderRadius: 15, backgroundColor: COLORS.pale, justifyContent: "center", alignItems: "center" },
  avatarText: { color: COLORS.accent, fontSize: 18, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 9, marginBottom: 24 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, minWidth: 90, paddingVertical: 17, paddingHorizontal: 12, backgroundColor: COLORS.card, borderColor: COLORS.line, borderWidth: 1, borderRadius: 16 },
  statValue: { color: COLORS.ink, fontSize: 25, fontWeight: "800", marginBottom: 5 },
  statLabel: { color: COLORS.muted, fontSize: 10, lineHeight: 14 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12 },
  linkText: { color: COLORS.accent, fontWeight: "700", fontSize: 12 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  actionCard: { flex: 1, backgroundColor: COLORS.pale, borderRadius: 17, padding: 15, minHeight: 125 },
  actionIcon: { color: COLORS.accent, fontSize: 25, marginBottom: 12 },
  actionTitle: { color: COLORS.ink, fontWeight: "800", fontSize: 14, marginBottom: 4 },
  actionSub: { color: COLORS.muted, fontSize: 11 },
  listCard: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 15, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line, marginBottom: 9, gap: 12 },
  thumb: { width: 57, height: 63, borderRadius: 10, backgroundColor: "#f0ece6" },
  thumbPlaceholder: { width: 57, height: 63, borderRadius: 10, backgroundColor: "#eee9f8", justifyContent: "center", alignItems: "center" },
  outfitThumb: { width: 57, height: 63, borderRadius: 10, backgroundColor: "#f1e9df", justifyContent: "center", alignItems: "center" },
  rowInfo: { flex: 1 },
  rowTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800", marginBottom: 4 },
  rowSub: { color: COLORS.muted, fontSize: 12 },
  tagLine: { color: COLORS.accent, fontSize: 10, marginTop: 5 },
  chevron: { color: "#aaa19a", fontSize: 25, paddingHorizontal: 5 },
  empty: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, borderStyle: "dashed", alignItems: "center", marginBottom: 12 },
  emptyTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  emptyDetail: { color: COLORS.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  addCircle: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.accent, justifyContent: "center", alignItems: "center" },
  addCircleText: { color: "#fff", fontSize: 26, lineHeight: 29 },
  chipScroller: { flexGrow: 0, marginBottom: 12, maxHeight: 43 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 16 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 8, marginRight: 6, marginBottom: 4 },
  chipSelected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  chipTextSelected: { color: "#fff" },
  photoBox: { height: 175, borderRadius: 17, backgroundColor: COLORS.pale, borderWidth: 1, borderColor: "#ded5f0", borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginBottom: 20, overflow: "hidden" },
  photoIcon: { fontSize: 30, color: COLORS.accent, marginBottom: 8 },
  photoTitle: { color: COLORS.ink, fontWeight: "800", fontSize: 14 },
  photoSub: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  muted: { color: COLORS.muted, fontSize: 12 },
  errorText: { color: COLORS.danger, marginBottom: 10 },
  checkCircle: { width: 25, height: 25, borderRadius: 9, borderWidth: 1, borderColor: COLORS.line, alignItems: "center", justifyContent: "center" },
  checkCircleOn: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkText: { color: "#fff", fontWeight: "900" },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  historyDot: { color: COLORS.accent, fontSize: 20 },
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 13 },
  barTrack: { flex: 1, height: 8, backgroundColor: "#e9e3dd", borderRadius: 10, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: COLORS.accent, borderRadius: 10 },
  featureCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line, borderRadius: 16, padding: 17, marginBottom: 15 },
  featureIcon: { color: COLORS.accent, fontSize: 25, marginBottom: 9 }
});
