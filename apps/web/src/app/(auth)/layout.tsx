const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080812" }}>
      {children}
    </div>
  )
}

export default AuthLayout
