import { Tabs } from "expo-router"

// Tab icons will use @expo/vector-icons or lucide-react-native
// when fully built out. Placeholder structure for now.
const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6C47FF",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#13131F",
          borderTopColor: "rgba(255,255,255,0.05)",
        },
        headerStyle: { backgroundColor: "#0F0F1A" },
        headerTintColor: "#fff",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen name="journal" options={{ title: "Journal" }} />
      <Tabs.Screen name="habits" options={{ title: "Habits" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
    </Tabs>
  )
}

export default TabLayout
