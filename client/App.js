import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import AuthContext from "./src/context/AuthContext";
import AuthScreen from "./src/screens/AuthScreen";
import { MainTabs } from "./src/navigation/MainTabs";
import { COLORS, styles } from "./src/constants/theme";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("quickfit_session");
        if (saved) {
          const session = JSON.parse(saved);
          setToken(session.token);
          setUser(session.user);
        }
      } catch (_e) {
        await AsyncStorage.removeItem("quickfit_session");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(session) {
    await AsyncStorage.setItem("quickfit_session", JSON.stringify(session));
    setToken(session.token);
    setUser(session.user);
  }

  async function signOut() {
    await AsyncStorage.removeItem("quickfit_session");
    setToken(null);
    setUser(null);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.muted}>Loading QuickFit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut }}>
      <NavigationContainer>
        {true ? <MainTabs /> : <AuthScreen />}
// if true no login, if token login required
      </NavigationContainer>
    </AuthContext.Provider>
  );
}