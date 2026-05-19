import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/src/lib/supabase";
import { TransactionRecord } from "@/src/sdk/types";

type FilterPeriod = "today" | "week" | "month" | "all";

const FILTERS: { label: string; value: FilterPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "All", value: "all" },
];

function startOf(period: FilterPeriod): Date | null {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === "month") {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null;
}

function formatAmount(n: number) {
  return `₦${n.toLocaleString("en-NG", {
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

type DbRow = {
  id: string;
  session_id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  reference: string;
  created_at: string;
};

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<FilterPeriod>("today");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSuccess, setTotalSuccess] = useState(0);

  const load = useCallback(async () => {
    let query = supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    const start = startOf(filter);
    if (start) {
      query = query.gte("created_at", start.toISOString());
    }

    const { data } = await query;
    if (!data) return;

    const mapped: TransactionRecord[] = (data as DbRow[]).map((t) => ({
      id: t.id,
      sessionId: t.session_id,
      amount: t.amount,
      currency: t.currency,
      description: t.description,
      status: t.status as TransactionRecord["status"],
      reference: t.reference,
      createdAt: t.created_at,
    }));

    setTransactions(mapped);
    setTotalSuccess(
      mapped
        .filter((t) => t.status === "success")
        .reduce((s, t) => s + t.amount, 0)
    );
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "success": return colors.success;
      case "failed": return colors.destructive;
      case "cancelled": return colors.mutedForeground;
      default: return colors.warning;
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "success": return "checkmark-circle";
      case "failed": return "close-circle";
      case "cancelled": return "remove-circle";
      default: return "time";
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      paddingTop: insets.top + 12,
      paddingHorizontal: 20,
      paddingBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.muted,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
      paddingBottom: 12,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    filterLabelActive: {
      color: "#FFFFFF",
    },
    summaryBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.primaryTint,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryLeft: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.primary,
    },
    summaryRight: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    txItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 10,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    txIconWrap: {
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
      marginBottom: 3,
    },
    txStatus: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      textTransform: "capitalize",
    },
    empty: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              style={[
                styles.filterChip,
                filter === f.value && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  filter === f.value && styles.filterLabelActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryLeft}>
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.summaryRight}>{formatAmount(totalSuccess)}</Text>
      </View>

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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={colors.mutedForeground}
            />
            <Text style={styles.emptyText}>No transactions found</Text>
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
            <View style={styles.txIconWrap}>
              <Ionicons
                name={statusIcon(item.status) as keyof typeof Ionicons.glyphMap}
                size={32}
                color={statusColor(item.status)}
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
                style={[styles.txStatus, { color: statusColor(item.status) }]}
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
