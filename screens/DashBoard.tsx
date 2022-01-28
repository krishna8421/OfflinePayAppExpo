import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Nav from "../components/DashBoard/Nav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import Transfer from "../components/DashBoard/Transfer";
import Logs from "../components/DashBoard/Logs";
import { Overlay, Button } from "react-native-elements";
import { TouchableWithoutFeedback } from "react-native";
import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Entypo } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { reFetch } from "../utils/reFetch";
import * as Updates from "expo-updates";

type Props = {
  name: string;
};

export default function DashBoard({ name }: Props) {
  const [showTransferMenu, setShowTransferMenu] = useState<boolean>(false);
  const [showLogMenu, setShowLogMenu] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string>("null");
  const [isConnectedToNet, setIsConnectedToNet] = useState<boolean | null>(
    false
  );
  useEffect(() => {
    const getLocalToken = async () => {
      const token = await AsyncStorage.getItem("@jwt_token");
      if (!token) return;
      setToken(token);
    };
    getLocalToken();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnectedToNet(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  const toggleTransferOverlay = () => {
    setShowTransferMenu(!showTransferMenu);
  };

  const toggleLogOverlay = () => {
    setShowLogMenu(!showLogMenu);
  };

  (async () => {
    const balance = await AsyncStorage.getItem("@current_balance");
    if (!balance) {
      setBalance(0);
      return;
    }
    setBalance(parseInt(balance, 10));
  })();

  const getLogs = async () => {
    const log = await AsyncStorage.getItem("@logs");
    if (!log) return;
    const logArr = JSON.parse(log);
    setLogs(logArr);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.DashBoardView}>
        <Nav />
        <Text style={styles.welcomeTxt}>Welcome,</Text>
        <Text style={styles.nameTxt}>{name}</Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <View style={styles.currentBalance}>
          <Text style={styles.currentBalanceText}> Current Balance </Text>
          <Text style={styles.currentBalanceTextRs}>₹ {balance} </Text>
        </View>
      </View>
      <View style={{ alignItems: "center" }}>
        <View style={styles.transferAndLogs}>
          <TouchableWithoutFeedback onPress={toggleTransferOverlay}>
            <View style={styles.transfer}>
              <Text style={styles.transferText}>Transfer</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              toggleLogOverlay();
              getLogs();
            }}
          >
            <View style={styles.logs}>
              <Text style={styles.logText}>Logs</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <Overlay
          isVisible={showTransferMenu}
          onBackdropPress={toggleTransferOverlay}
          overlayStyle={styles.overlayLayoutTransfer}
        >
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps={"always"}
            style={{ flex: 1 }}
            contentContainerStyle={{ alignItems: "center" }}
            showsVerticalScrollIndicator={false}
          >
            <Transfer closeTransfer={toggleTransferOverlay} />
          </KeyboardAwareScrollView>
        </Overlay>
        <Overlay
          isVisible={showLogMenu}
          onBackdropPress={toggleLogOverlay}
          overlayStyle={styles.overlayLayoutLogs}
        >
          <Logs logs={logs} />
          <Entypo
            name="circle-with-cross"
            size={50}
            color="black"
            style={styles.closeLogs}
            onPress={toggleLogOverlay}
          />
        </Overlay>
      </View>
      <Button
        onPress={async () => {
          const newData = await reFetch(token);
          const { logs, balance } = newData;
          await AsyncStorage.setItem(
            "@current_balance",
            JSON.stringify(balance)
          );
          await AsyncStorage.setItem("@logs", JSON.stringify(logs));
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
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  DashBoardView: {
    width: "100%",
    marginTop: 10,
  },
  welcomeTxt: {
    fontSize: 30,
    fontWeight: "100",
    paddingHorizontal: 25,
    marginTop: 20,
  },
  nameTxt: {
    fontSize: 47,
    fontWeight: "300",
    paddingHorizontal: 25,
    marginTop: 10,
  },
  currentBalance: {
    width: "90%",
    marginTop: 40,
    backgroundColor: "rgba(0, 209, 111, 0.85)",
    paddingHorizontal: 40,
    paddingVertical: 35,
    borderRadius: 20,
  },
  currentBalanceText: {
    color: "white",
    fontSize: 30,
    fontWeight: "300",
    marginBottom: 10,
  },
  currentBalanceTextRs: {
    color: "white",
    fontSize: 30,
    marginLeft: 9,
  },
  transferAndLogs: {
    width: "90%",
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transfer: {
    width: "47%",
    backgroundColor: "#6E4CF6",
    height: 175,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logs: {
    width: "47%",
    backgroundColor: "#474554",
    height: 175,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  transferText: {
    color: "white",
    fontSize: 25,
    fontWeight: "500",
  },
  logText: {
    color: "white",
    fontSize: 25,
    fontWeight: "500",
  },
  overlayLayoutLogs: {
    height: "85%",
    width: "90%",
    borderRadius: 10,
  },
  overlayLayoutTransfer: {
    height: "70%",
    width: "90%",
    justifyContent: "center",
    position: "absolute",
    borderRadius: 10,
  },
  closeLogs: {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
  },
});
