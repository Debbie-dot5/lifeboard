import { Redirect } from "expo-router"

// Root redirects to dashboard or auth based on session
// Middleware handles this — see app/_layout.tsx
const Index = () => <Redirect href="/(tabs)" />

export default Index
