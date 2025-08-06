import { AuthForm } from "@/components/forms/AuthForm/AuthForm"
import { Container, Typography, Box } from "@mui/material"

export default function SignInPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Sign In to DriftBase
        </Typography>
        <AuthForm mode="signin" />
      </Box>
    </Container>
  )
}
