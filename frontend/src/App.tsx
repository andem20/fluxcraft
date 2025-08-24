import {
  AppBar,
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";

export default function App() {
  const theme = createTheme({
    palette: {
      background: {
        default: "#f0f0f0",
      },
      primary: {
        main: "#1b9393ff",
      },
      secondary: {
        main: "#745ae5ff",
      },
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar
          position="fixed"
          sx={{
            background:
              "linear-gradient(90deg, #1b9393ff 0%,  #59bd95ff 70%, #6fdeb2ff 100%)",
            boxShadow: "none",
          }}
        >
          <Toolbar
            sx={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              FluxCraft
            </Typography>

            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 6,
              }}
            >
              <Button
                sx={{ color: "white", fontWeight: "bold" }}
                component={Link}
                to="/"
              >
                Home
              </Button>
              <Button
                sx={{ color: "white", fontWeight: "bold" }}
                component={Link}
                to="/about"
              >
                About
              </Button>
              <Button
                sx={{ color: "white", fontWeight: "bold" }}
                component={Link}
                to="/contact"
              >
                Contact
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container sx={{ pt: 12 }} maxWidth={false}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}
