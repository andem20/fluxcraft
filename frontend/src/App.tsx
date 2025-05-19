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
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Success } from "./pages/Success";

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
            <Button color="inherit" component={Link} to="/about">
              About
            </Button>
            <Button color="inherit" component={Link} to="/contact">
              Contact
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ pt: 12 }} maxWidth={false}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}
