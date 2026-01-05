import {
  AppBar,
  Box,
  createTheme,
  CssBaseline,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, toggleDarkMode } from "./stores/Store";
import darkScrollbar from "@mui/material/darkScrollbar";
import { MenuDrawer, MenuDrawerItem } from "./components/MenuDrawer";
import { LineAxis, Description, Settings } from "@mui/icons-material";

export default function App() {
  const darkMode = useSelector((state: RootState) => state.darkMode.enabled);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showDfOverview, setDfOverview] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const dispatch = useDispatch();

  const menuItems: MenuDrawerItem[] = [
    {
      text: "Pipeline",
      icon: LineAxis,
      onClick: () => setDrawerOpen(true),
      isSelected: () => false,
    },
    {
      text: "Dataframes",
      icon: Description,
      onClick: () => {
        setDfOverview(!showDfOverview);
      },
      isSelected: () => showDfOverview,
    },
    {
      text: "Settings",
      icon: Settings,
      onClick: () => setShowSettingsModal(true),
      isSelected: () => false,
    },
  ];

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          background: {
            default: darkMode ? "#121212" : "#f0f0f0",
          },
          primary: {
            main: darkMode ? "#59bd95ff" : "#60dcabff",
            contrastText: "#032b27ff",
          },
          secondary: {
            main: darkMode ? "#2c595cff" : "#45878bff",
          },
        },
        typography: {
          fontFamily: "Roboto, Arial, sans-serif",
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: (themeParam) => ({
              body: themeParam.palette.mode === "dark" ? darkScrollbar() : null,
            }),
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Router basename={import.meta.env.BASE_URL}>
          <AppBar
            position="fixed"
            sx={{
              zIndex: theme.zIndex.drawer + 1,
              background: darkMode
                ? "linear-gradient(90deg, #0a2d2d 0%, #0f4040 40%, #196464 100%)"
                : "linear-gradient(90deg, #1b9393ff 0%,  #59bd95ff 70%, #6fdeb2ff 100%)",
              boxShadow: "none",
            }}
          >
            <Toolbar
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <WebStoriesIcon sx={{ color: "#ffffff" }} />
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  FluxCraft
                </Typography>
              </Stack>

              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 6,
                }}
              ></Box>

              <Box sx={{ position: "absolute", right: 16 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={() => dispatch(toggleDarkMode())}
                      color="default"
                    />
                  }
                  label="Dark Mode"
                  sx={{ color: "white" }}
                />
              </Box>
            </Toolbar>
          </AppBar>

          <MenuDrawer items={menuItems} />

          <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
            <Toolbar />
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    isDrawerOpen={isDrawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    showDfOverview={showDfOverview}
                    showSettingsModal={showSettingsModal}
                    setShowSettingsModal={setShowSettingsModal}
                  />
                }
              />
            </Routes>
          </Box>
        </Router>
      </Box>
    </ThemeProvider>
  );
}
