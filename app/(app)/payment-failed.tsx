import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number) {
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentFailedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount: string;
    description: string;
    reason: string;
  }>();

  const amount = parseFloat(params.amount ?? "0");
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTryAgain = () => {
    router.replace({
      pathname: "/(app)/card-waiting",
      params: { amount: params.amount, description: params.description },
    });
  };

  const handleCancel = () => {
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
      paddingHorizontal: 32,
    },
    iconWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.destructiveTint,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    failTitle: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      marginBottom: 8,
    },
    amountText: {
      fontSize: 40,
      fontFamily: "Inter_700Bold",
      color: colors.destructive,
      letterSpacing: -1,
      marginBottom: 24,
    },
    reasonCard: {
      width: "100%",
      backgroundColor: colors.destructiveTint,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(207,17,36,0.2)",
    },
    reasonLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.destructive,
      marginBottom: 4,
    },
    reasonText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
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
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name="close-circle"
              size={64}
              color={colors.destructive}
            />
          </View>
        </Animated.View>

        <Text style={styles.failTitle}>Payment Failed</Text>
        <Text style={styles.amountText}>{formatAmount(amount)}</Text>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonLabel}>REASON</Text>
          <Text style={styles.reasonText}>
            {params.reason || "Payment could not be processed. Please try again."}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={handleTryAgain}>
          <Text style={styles.primaryBtnText}>Try Again</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={handleCancel}>
          <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
}
