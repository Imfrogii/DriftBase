"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Menu as MenuIcon, AccountCircle, Language } from "@mui/icons-material";
import styles from "./Navbar.module.scss";
import { useAuth } from "@/lib/hooks/useAuth";

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { dbUser, signOut } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangClose = () => {
    setLangAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const changeLanguage = (locale: string) => {
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPath);
    handleLangClose();
  };

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.events"), path: "/events" },
    ...(dbUser
      ? [
          { label: t("nav.create"), path: `/${locale}/events/create` },
          { label: t("nav.profile"), path: `/${locale}/profile` },
        ]
      : []),
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        DriftBase
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} onClick={() => handleNavigation(item.path)}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {!dbUser && (
          <>
            <ListItem
              onClick={() => handleNavigation(`/${locale}/auth/signin`)}
            >
              <ListItemText primary={t("nav.signin")} />
            </ListItem>
            <ListItem
              onClick={() => handleNavigation(`/${locale}/auth/signup`)}
            >
              <ListItemText primary={t("nav.signup")} />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" className={styles.navbar}>
        <Container maxWidth="xl">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: isMobile ? 1 : 0, mr: 4, cursor: "pointer" }}
              onClick={() => handleNavigation("/")}
            >
              DriftBase
            </Typography>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", gap: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="large"
                aria-label="change language"
                aria-controls="language-menu"
                aria-haspopup="true"
                onClick={handleLangMenu}
                color="inherit"
              >
                <Language />
              </IconButton>

              {dbUser ? (
                <>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        handleNavigation(`/${locale}/profile`);
                      }}
                    >
                      {t("nav.profile")}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        signOut();
                        handleClose();
                      }}
                    >
                      {t("nav.signout")}
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                !isMobile && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation(`/${locale}/auth/signin`)}
                    >
                      {t("nav.signin")}
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation(`/${locale}/auth/signup`)}
                    >
                      {t("nav.signup")}
                    </Button>
                  </>
                )
              )}
            </Box>

            <Menu
              id="language-menu"
              anchorEl={langAnchorEl}
              open={Boolean(langAnchorEl)}
              onClose={handleLangClose}
            >
              <MenuItem onClick={() => changeLanguage("pl")}>Polski</MenuItem>
              <MenuItem onClick={() => changeLanguage("en")}>English</MenuItem>
              <MenuItem onClick={() => changeLanguage("ru")}>Русский</MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
