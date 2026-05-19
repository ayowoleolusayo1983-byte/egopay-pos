import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { TransactionRecord } from "@/src/sdk/types";

function formatAmount(amount: number) {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DbTransaction = {
  id: string;
  session_id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  reference: string;
  created_at: string;
};

function mapTransaction(t: DbTransaction): TransactionRecord {
  return {
    id: t.id,
    sessionId: t.session_id,
    amount: t.amount,
    currency: t.currency,
    description: t.description,
    status: t.status as TransactionRecord["status"],
    reference: t.reference,
    createdAt: t.created_at,
  };
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  const loadTransactions = useCallback(async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return;

    const mapped = (data as DbTransaction[]).map(mapTransaction);
    setTransactions(mapped);

    const todayTx = mapped.filter(
      (t) =>
        new Date(t.createdAt) >= startOfDay && t.status === "success"
    );
    setTodayTotal(todayTx.reduce((sum, t) => sum + t.amount, 0));
    setTodayCount(todayTx.length);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "success":
        return colors.success;
      case "failed":
        return colors.destructive;
      case "cancelled":
        return colors.mutedForeground;
      default:
        return colors.warning;
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + 16,
      paddingBottom: 24,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    merchantLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.7)",
    },
    merchantName: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    signOutBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      justifyContent: "center",
      alignItems: "center",
    },
    summaryCard: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 20,
    },
    summaryLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.7)",
      marginBottom: 4,
    },
    summaryAmount: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    summaryCount: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
    },
    newPaymentBtn: {
      margin: 20,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    newPaymentText: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
    },
    seeAll: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    txItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginBottom: 8,
      borderRadius: colors.radius,
      padding: 16,
    },
    txIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primaryTint,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    txInfo: { flex: 1 },
    txDesc: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      marginBottom: 2,
    },
    txDate: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    txRight: { alignItems: "flex-end" },
    txAmount: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      marginBottom: 4,
    },
    txStatus: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      textTransform: "capitalize",
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 12,
    },
  });

  const email = user?.email ?? "Merchant";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.merchantLabel}>Merchant</Text>
            <Text style={styles.merchantName} numberOfLines={1}>
              {email}
            </Text>
          </View>
          <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today's Sales</Text>
          <Text style={styles.summaryAmount}>{formatAmount(todayTotal)}</Text>
          <Text style={styles.summaryCount}>
            {todayCount} transaction{todayCount !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.newPaymentBtn}
        onPress={() => router.push("/(app)/payment")}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
        <Text style={styles.newPaymentText}>New Payment</Text>
      </Pressable>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push("/(app)/history")}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={40}
              color={colors.mutedForeground}
            />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.txItem}
            onPress={() =>
              router.push({
                pathname: "/(app)/receipt",
                params: {
                  transactionId: item.id,
                  sessionId: item.sessionId,
                  amount: String(item.amount),
                  description: item.description,
                  reference: item.reference,
                  status: item.status,
                  createdAt: item.createdAt,
                },
              })
            }
          >
            <View style={styles.txIcon}>
              <Ionicons
                name="card-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc} numberOfLines={1}>
                {item.description || "Payment"}
              </Text>
              <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>{formatAmount(item.amount)}</Text>
              <Text
                style={[
                  styles.txStatus,
                  { color: statusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}
