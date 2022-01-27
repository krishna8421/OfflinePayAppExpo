import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Auth from "./screens/Auth";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode, { JwtPayload } from "jwt-decode";
import DashBoard from "./screens/DashBoard";

export default function App() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const sessionToken = await AsyncStorage.getItem("@jwt_token");
      if (sessionToken) {
        const decoded = jwtDecode<JwtPayload>(sessionToken);
        // @ts-ignore
        const { name, number } = decoded;
        if (number !== null || number !== "") {
          setName(name);
          setIsLogin(true);
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {}, [isLogin]);

  if (!isLogin) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Auth />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }
  return <DashBoard name={name} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: "#fff",
    alignItems: "center",
  },
});
