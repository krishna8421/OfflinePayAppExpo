import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Nav from "../components/DashBoard/Nav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import Transfer from "../components/DashBoard/Transfer";
import Logs from "../components/DashBoard/Logs";
import { Overlay } from "react-native-elements";
import { TouchableWithoutFeedback, Button } from "react-native";
import { useEffect } from "react";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import { Entypo } from "@expo/vector-icons";

type Props = {
  name: string;
};

export default function DashBoard({ name }: Props) {
  const [showTransferMenu, setShowTransferMenu] = useState<boolean>(false);
  const [showLogMenu, setShowLogMenu] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [isConnectedToNet, setIsConnectedToNet] = useState<boolean | null>(
    false
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
    const getLog = async () => {
      if (!isConnectedToNet) return;
      const sessionToken = await AsyncStorage.getItem("@jwt_token");
      const resLog = await axios.get(
        "https://offline-pay.vercel.app/api/data",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      const { logs, balance } = resLog.data;
      setBalance(balance);
      await AsyncStorage.setItem("@current_balance", JSON.stringify(balance));
      await AsyncStorage.setItem("@logs", JSON.stringify(logs));
    };
    getLog();
    setRefetch(false);
  }, [refetch]);

  const reFetch = () => {
    setRefetch(true);
  };

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
          <TouchableWithoutFeedback onPress={toggleLogOverlay}>
            <View style={styles.logs}>
              <Text style={styles.logText}>Logs</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <Overlay
          isVisible={showTransferMenu}
          onBackdropPress={toggleTransferOverlay}
        >
          <Transfer
            reFetch={() => {
              reFetch();
            }}
          />
        </Overlay>
        <Overlay
          isVisible={showLogMenu}
          onBackdropPress={toggleLogOverlay}
          overlayStyle={styles.overlayLogs}
        >
          <Logs />
          <Entypo
            name="circle-with-cross"
            size={50}
            color="black"
            style={styles.closeLogs}
            onPress={toggleLogOverlay}
          />
        </Overlay>
      </View>
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
  overlayLogs: {
    height: "70%",
    width: "90%",
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
