import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#008751" />
      </View>
    );
  }

  return session ? (
    <Redirect href="/(app)/dashboard" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
