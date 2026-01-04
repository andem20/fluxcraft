import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Drawer from "@mui/material/Drawer";
import { Toolbar, Tooltip, Typography } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

const drawerWidth = 80;

export interface MenuDrawerProps {
  items: MenuDrawerItem[];
}

export interface MenuDrawerItem {
  text: string;
  icon: SvgIconComponent;
  onClick: () => void;
  isSelected: () => boolean;
}

export function MenuDrawer({ items }: MenuDrawerProps) {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
        },
      }}
    >
      <Toolbar />
      <List>
        {items.map((item) => {
          const Icon = item.icon;
          const selected = item.isSelected();

          return (
            <Tooltip key={item.text} title={item.text} placement="right">
              <ListItem disablePadding>
                <ListItemButton
                  selected={selected}
                  onClick={item.onClick}
                  sx={(theme) => ({
                    position: "relative",
                    height: 64,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,

                    // ---- Hover ----
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? theme.palette.grey[300]
                          : theme.palette.grey[800],
                    },

                    // ---- Selected ----
                    "&.Mui-selected": {
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? theme.palette.grey[100]
                          : theme.palette.grey[900],

                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? theme.palette.grey[200]
                            : theme.palette.grey[800],
                      },
                    },

                    "&.Mui-selected::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 2,
                      backgroundColor: theme.palette.primary.main,
                    },

                    "& svg": {
                      color: selected
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                      transform: "scale(1.3)",
                    },
                  })}
                >
                  <Icon />
                  <Typography
                    variant="caption"
                    sx={(theme) => ({
                      color: selected
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                      fontWeight: selected ? 600 : 400,
                    })}
                  >
                    {item.text}
                  </Typography>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Drawer>
  );
}
