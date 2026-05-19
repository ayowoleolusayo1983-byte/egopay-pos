import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number) {
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Divider({ dashed = false }: { dashed?: boolean }) {
  if (dashed) {
    return (
      <View style={{ flexDirection: "row", marginVertical: 16 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 1,
              backgroundColor: i % 2 === 0 ? "#E3E8EF" : "transparent",
              marginHorizontal: 1,
            }}
          />
        ))}
      </View>
    );
  }
  return <View style={{ height: 1, backgroundColor: "#E3E8EF", marginVertical: 16 }} />;
}

type RowProps = { label: string; value: string; bold?: boolean };

function Row({ label, value, bold }: RowProps) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
      <Text style={{ fontSize: 13, color: "#697386", fontFamily: "Inter_400Regular" }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#1A1F36",
          fontFamily: bold ? "Inter_700Bold" : "Inter_500Medium",
          maxWidth: "60%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ReceiptScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    transactionId?: string;
    sessionId?: string;
    amount: string;
    description: string;
    reference?: string;
    cardLast4?: string;
    cardBrand?: string;
    status?: string;
    createdAt?: string;
  }>();

  const amount = parseFloat(params.amount ?? "0");

  const dateStr = params.createdAt
    ? new Date(params.createdAt).toLocaleString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : new Date().toLocaleString("en-NG");

  const handleShare = async () => {
    const text = [
      "=== EgoPay POS Receipt ===",
      `Amount: ${formatAmount(amount)}`,
      `Description: ${params.description}`,
      params.reference ? `Reference: ${params.reference}` : null,
      params.cardBrand && params.cardLast4
        ? `Card: ${params.cardBrand} ••••${params.cardLast4}`
        : null,
      `Status: ${(params.status ?? "success").toUpperCase()}`,
      `Date: ${dateStr}`,
      "=========================",
    ]
      .filter(Boolean)
      .join("\n");

    await Share.share({ message: text });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: insets.top + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
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
    shareBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primaryTint,
      justifyContent: "center",
      alignItems: "center",
    },
    scroll: { flex: 1 },
    receipt: {
      margin: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    receiptHeader: {
      backgroundColor: colors.primary,
      padding: 24,
      alignItems: "center",
    },
    receiptBrand: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      letterSpacing: -0.5,
    },
    receiptType: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginTop: 2,
    },
    receiptBody: {
      padding: 20,
    },
    statusBadge: {
      alignSelf: "center",
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 20,
    },
    statusText: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    amountSection: {
      alignItems: "center",
      marginBottom: 8,
    },
    amountLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    amountValue: {
      fontSize: 40,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      letterSpacing: -1,
    },
    newPaymentBtn: {
      margin: 20,
      marginTop: 0,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: insets.bottom + 24,
    },
    newPaymentText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
  });

  const status = params.status ?? "success";
  const isSuccess = status === "success";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Receipt</Text>
        <Pressable style={styles.shareBtn} onPress={handleShare}>
          <Ionicons
            name={Platform.OS === "ios" ? "share-outline" : "share-social-outline"}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.receipt}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptBrand}>EgoPay POS</Text>
            <Text style={styles.receiptType}>Payment Receipt</Text>
          </View>

          <View style={styles.receiptBody}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isSuccess
                    ? colors.successTint
                    : colors.destructiveTint,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isSuccess ? colors.success : colors.destructive },
                ]}
              >
                {status}
              </Text>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
            </View>

            <Divider dashed />

            <Row label="Description" value={params.description || "Payment"} />
            {params.reference ? (
              <Row label="Reference" value={params.reference} />
            ) : null}
            {params.sessionId ? (
              <Row label="Session ID" value={params.sessionId.slice(0, 16) + "..."} />
            ) : null}

            <Divider dashed />

            {params.cardBrand && params.cardLast4 ? (
              <Row
                label="Payment Method"
                value={`${params.cardBrand} ••••${params.cardLast4}`}
              />
            ) : (
              <Row label="Payment Method" value="Card Terminal" />
            )}
            <Row label="Currency" value="Nigerian Naira (NGN)" />
            <Row label="Date & Time" value={dateStr} bold />
          </View>
        </View>

        <Pressable
          style={styles.newPaymentBtn}
          onPress={() => router.replace("/(app)/dashboard")}
        >
          <Text style={styles.newPaymentText}>Back to Dashboard</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
