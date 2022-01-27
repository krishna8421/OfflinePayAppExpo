import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode, { JwtPayload } from "jwt-decode";
import axios from "axios";
import * as Yup from "yup";
import { View, Text } from "react-native";

interface Props {
  reFetch: () => void;
}

export default function Transfer({ reFetch }: Props) {
  const [error, setError] = useState({
    status: false,
    message: "",
  });

  type TransferData = {
    num: number;
    amount: number;
  };

  const transferMoney = async (data: TransferData) => {
    const sessionToken = await AsyncStorage.getItem("@jwt_token");
    if (!sessionToken) {
      throw new Error("No session token");
    }
    const decoded = jwtDecode<JwtPayload>(sessionToken);

    // @ts-ignore
    const { num } = decoded;

    const { num: num_to, amount } = data;
    const res = await axios.post(
      "https://offline-pay.vercel.app/api/transfer",
      {
        num_from: num,
        num_to,
        amount,
      },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );
    if (res.data.status === "error") {
      setError({
        status: true,
        message: res.data.error,
      });
    }

    if (res.data.status === "success") {
      setError({
        status: false,
        message: "",
      });
    }
    reFetch();
  };

  const transferSchema = Yup.object().shape({
    num: Yup.string()
      .matches(/([5-9]{1})[0-9]{9}/, "Must be a Number")
      .required("Required"),
    amount: Yup.string()
      .min(0, "Amount cannot be less than 0")
      .matches(/^[+]?([.]\d+|\d+([.]\d+)?)$/, "Out of Range")
      .required("Required"),
  });
  return (
    <View>
      <Text> Hoala </Text>
    </View>
  );
}
