import React, { useContext, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import AuthContext from "../context/AuthContext";
import { request } from "../services/api";
import { styles } from "../constants/theme";
import Button from "../components/Button";
import Field from "../components/Field";
import Screen from "../components/Screen";

export default function AuthScreen() {
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
