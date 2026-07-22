import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useCycle } from "@/contexts/CycleContext";
import Colors from "@/constants/colors";

export default function Index() {
  const { isOnboarded, isLoading } = useCycle();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator color={Colors.hotPink} />
      </View>
    );
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
