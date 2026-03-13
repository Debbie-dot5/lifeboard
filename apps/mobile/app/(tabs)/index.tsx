import { View, Text, StyleSheet } from "react-native"
import { getTodayDayOfWeek } from "@lifeboard/lib"  // ← same util as web!

const DashboardScreen = () => {
  const today = getTodayDayOfWeek()

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good morning 👋</Text>
      <Text style={styles.sub}>
        Today is <Text style={styles.accent}>{today}</Text>
      </Text>
      <Text style={styles.placeholder}>
        Mobile app — coming after web MVP is shipped.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    padding: 24,
    paddingTop: 48,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 32,
    textTransform: "capitalize",
  },
  accent: {
    color: "#6C47FF",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  placeholder: {
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    marginTop: 80,
  },
})

export default DashboardScreen
