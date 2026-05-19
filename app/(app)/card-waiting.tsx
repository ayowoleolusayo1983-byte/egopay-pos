import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { getEgoPayPOS } from "@/src/sdk/EgoPayPOS";

const TIMEOUT_SECONDS = 120;

function formatAmount(n: number) {
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CardWaitingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    amount: string;
    description: string;
  }>();

  const amount = parseFloat(params.amount ?? "0");
  const description = params.description ?? "Payment";

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0 && !cancelledRef.current) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    initiateAndPoll();
  }, []);

  const saveTransaction = async (
    sid: string,
    status: string,
    reference: string
  ) => {
    if (!user) return;
    await supabase.from("transactions").insert({
      user_id: user.id,
      session_id: sid,
      amount,
      currency: "NGN",
      description,
      status,
      reference,
    });
  };

  const initiateAndPoll = async () => {
    try {
      const pos = getEgoPayPOS();
      const session = await pos.initiatePayment({
        amount,
        currency: "NGN",
        description,
      });
      setSessionId(session.sessionId);

      const result = await pos.waitForPayment(
        session.sessionId,
        undefined,
        2000,
        TIMEOUT_SECONDS * 1000
      );

      if (cancelledRef.current) return;

      await saveTransaction(session.sessionId, result.status, session.reference);

      Haptics.notificationAsync(
        result.status === "success"
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );

      if (result.status === "success") {
        router.replace({
          pathname: "/(app)/payment-success",
          params: {
            amount: String(amount),
            description,
            sessionId: session.sessionId,
            reference: session.reference,
            cardLast4: result.cardLast4 ?? "",
            cardBrand: result.cardBrand ?? "",
            createdAt: session.createdAt,
          },
        });
      } else {
        router.replace({
          pathname: "/(app)/payment-failed",
          params: {
            amount: String(amount),
            description,
            reason: result.failureReason ?? "Payment could not be processed.",
          },
        });
      }
    } catch (err: unknown) {
      if (cancelledRef.current) return;
      const msg =
        err instanceof Error ? err.message : "An error occurred.";
      router.replace({
        pathname: "/(app)/payment-failed",
        params: { amount: String(amount), description, reason: msg },
      });
    }
  };

  const handleTimeout = () => {
    if (sessionId) {
      getEgoPayPOS().cancelPayment(sessionId).catch(() => {});
    }
    router.replace({
      pathname: "/(app)/payment-failed",
      params: {
        amount: String(amount),
        description,
        reason: "Payment timed out. No card detected.",
      },
    });
  };

  const handleCancel = () => {
    Alert.alert("Cancel Payment", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          cancelledRef.current = true;
          setCancelled(true);
          if (sessionId) {
            await getEgoPayPOS().cancelPayment(sessionId).catch(() => {});
          }
          router.back();
        },
      },
    ]);
  };

  const progress = secondsLeft / TIMEOUT_SECONDS;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      textAlign: "center",
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    pulseRing: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.primaryTint,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
    },
    innerCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    instruction: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    subInstruction: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 32,
    },
    amountBadge: {
      backgroundColor: colors.primaryTint,
      borderRadius: colors.radius,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginBottom: 32,
    },
    amountText: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    timerBar: {
      width: "100%",
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 8,
    },
    timerFill: {
      height: "100%",
      backgroundColor: progress > 0.3 ? colors.primary : colors.warning,
      borderRadius: 2,
    },
    timerText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
    },
    cancelBtn: {
      margin: 24,
      marginBottom: insets.bottom + 24,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: colors.radius,
      height: 54,
      justifyContent: "center",
      alignItems: "center",
    },
    cancelText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Waiting for Payment</Text>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.innerCircle}>
            <Ionicons name="card" size={44} color="#FFFFFF" />
          </View>
        </Animated.View>

        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>{formatAmount(amount)}</Text>
        </View>

        <Text style={styles.instruction}>Tap, Swipe or Insert Card</Text>
        <Text style={styles.subInstruction}>
          Present the card to the terminal to complete payment
        </Text>

        <View style={styles.timerBar}>
          <View style={[styles.timerFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.timerText}>
          {secondsLeft}s remaining
        </Text>
      </Animated.View>

      <Pressable style={styles.cancelBtn} onPress={handleCancel}>
        <Text style={styles.cancelText}>Cancel Payment</Text>
      </Pressable>
    </View>
  );
}
