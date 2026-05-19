import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

function formatDisplay(raw: string): string {
  const num = parseFloat(raw);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [raw, setRaw] = useState("");
  const [description, setDescription] = useState("");

  const handleKey = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === "⌫") {
      setRaw((v) => v.slice(0, -1));
      return;
    }
    if (key === "." && raw.includes(".")) return;
    if (raw.includes(".") && raw.split(".")[1]?.length >= 2) return;
    if (raw === "" && key === ".") {
      setRaw("0.");
      return;
    }
    setRaw((v) => v + key);
  };

  const amount = parseFloat(raw) || 0;
  const isValid = amount > 0;

  const handleProceed = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(app)/card-waiting",
      params: {
        amount: String(amount),
        description: description.trim() || "Payment",
      },
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: insets.top + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      marginRight: 12,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.muted,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
    },
    amountSection: {
      alignItems: "center",
      paddingVertical: 36,
      paddingHorizontal: 20,
    },
    currencyLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    amountDisplay: {
      fontSize: 48,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      letterSpacing: -1,
    },
    amountPlaceholder: {
      color: colors.mutedForeground,
    },
    descInput: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.text,
    },
    numpad: {
      flex: 1,
      paddingHorizontal: 16,
    },
    row: {
      flexDirection: "row",
      marginBottom: 10,
      gap: 10,
    },
    key: {
      flex: 1,
      height: 64,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    keyText: {
      fontSize: 22,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
    },
    keyDelete: {
      backgroundColor: colors.muted,
    },
    proceedBtn: {
      margin: 20,
      marginBottom: insets.bottom + 20,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 58,
      justifyContent: "center",
      alignItems: "center",
    },
    proceedBtnDisabled: {
      backgroundColor: colors.border,
    },
    proceedText: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    proceedTextDisabled: {
      color: colors.mutedForeground,
    },
  });

  const rows = [
    KEYS.slice(0, 3),
    KEYS.slice(3, 6),
    KEYS.slice(6, 9),
    KEYS.slice(9, 12),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Enter Amount</Text>
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.currencyLabel}>Amount (NGN)</Text>
        <Text
          style={[
            styles.amountDisplay,
            !raw && styles.amountPlaceholder,
          ]}
        >
          ₦{raw ? formatDisplay(raw) : "0.00"}
        </Text>
      </View>

      <TextInput
        style={styles.descInput}
        placeholder="Description (optional)"
        placeholderTextColor={colors.mutedForeground}
        value={description}
        onChangeText={setDescription}
        maxLength={60}
      />

      <View style={styles.numpad}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((key) => (
              <Pressable
                key={key}
                style={[styles.key, key === "⌫" && styles.keyDelete]}
                onPress={() => handleKey(key)}
              >
                {key === "⌫" ? (
                  <Ionicons
                    name="backspace-outline"
                    size={22}
                    color={colors.text}
                  />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.proceedBtn, !isValid && styles.proceedBtnDisabled]}
        onPress={handleProceed}
        disabled={!isValid}
      >
        <Text
          style={[
            styles.proceedText,
            !isValid && styles.proceedTextDisabled,
          ]}
        >
          {isValid ? `Charge ₦${formatDisplay(raw)}` : "Enter Amount"}
        </Text>
      </Pressable>
    </View>
  );
}
