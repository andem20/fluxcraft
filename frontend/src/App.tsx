import {
  AppBar,
  Button,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Toolbar,
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
        main: "#758e4f",
      },
      secondary: {
        main: "#33658a",
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
        <AppBar position="fixed" color="primary">
          <Toolbar sx={{ display: "flex", justifyContent: "center", gap: 6 }}>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
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
