import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number) {
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount: string;
    description: string;
    sessionId: string;
    reference: string;
    cardLast4: string;
    cardBrand: string;
    createdAt: string;
  }>();

  const amount = parseFloat(params.amount ?? "0");
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleViewReceipt = () => {
    router.replace({
      pathname: "/(app)/receipt",
      params: {
        amount: params.amount,
        description: params.description,
        sessionId: params.sessionId,
        reference: params.reference,
        cardLast4: params.cardLast4,
        cardBrand: params.cardBrand,
        status: "success",
        createdAt: params.createdAt,
      },
    });
  };

  const handleNewPayment = () => {
    router.replace("/(app)/dashboard");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
    },
    topArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: insets.top,
    },
    iconWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.successTint,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 32,
    },
    amountText: {
      fontSize: 44,
      fontFamily: "Inter_700Bold",
      color: colors.success,
      letterSpacing: -1,
      marginBottom: 4,
    },
    descText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    detailsCard: {
      width: "90%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 20,
      marginTop: 32,
      borderWidth: 1,
      borderColor: colors.border,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    detailLabel: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    detailValue: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      maxWidth: "60%",
      textAlign: "right",
    },
    actions: {
      width: "100%",
      paddingHorizontal: 24,
      paddingBottom: insets.bottom + 24,
      gap: 12,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    primaryBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    secondaryBtn: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: colors.radius,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    secondaryBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
    },
  });

  const createdAt = params.createdAt
    ? new Date(params.createdAt).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.iconWrapper}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
        </Animated.View>

        <Text style={styles.successTitle}>Payment Successful</Text>
        <Text style={styles.successSubtitle}>Transaction completed</Text>
        <Text style={styles.amountText}>{formatAmount(amount)}</Text>
        <Text style={styles.descText}>{params.description}</Text>

        <Animated.View style={[styles.detailsCard, { opacity: fadeAnim }]}>
          {params.reference ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {params.reference}
              </Text>
            </View>
          ) : null}
          {params.cardBrand && params.cardLast4 ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Card</Text>
              <Text style={styles.detailValue}>
                {params.cardBrand} ••••{params.cardLast4}
              </Text>
            </View>
          ) : null}
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{createdAt}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={handleViewReceipt}>
          <Text style={styles.primaryBtnText}>View Receipt</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={handleNewPayment}>
          <Text style={styles.secondaryBtnText}>New Payment</Text>
        </Pressable>
      </View>
    </View>
  );
}
