import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Auth from "./screens/Auth";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode, { JwtPayload } from "jwt-decode";
import DashBoard from "./screens/DashBoard";
import NetInfo from "@react-native-community/netinfo";
import { Button } from "react-native-elements";
import * as Updates from "expo-updates";

export default function App() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [isConnectedToNet, setIsConnectedToNet] = useState<boolean | null>(
    true
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnectedToNet(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);

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

  if (!isLogin && !isConnectedToNet) {
    return (
      <SafeAreaProvider>
        <View style={styles.noNet}>
          <Text>No Internet Connection!!</Text>
          <Button
            onPress={async () => {
              Updates.reloadAsync();
            }}
            icon={{
              name: "refresh",
              type: "font-awesome",
              size: 30,
              color: "white",
            }}
            iconContainerStyle={{ marginRight: 6, marginVertical: 5 }}
            buttonStyle={{
              backgroundColor: "rgba(251, 113, 15, 0.8)",
              borderColor: "transparent",
              borderRadius: 30,
              padding: 5,
            }}
            containerStyle={{
              position: "absolute",
              bottom: 60,
              right: 40,
            }}
          />
        </View>
      </SafeAreaProvider>
    );
  }

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
  noNet: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noNetText: {
    fontSize: 25,
    color: "red",
  },
});
