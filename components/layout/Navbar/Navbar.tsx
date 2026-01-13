"use client";

import type React from "react";
import { useState } from "react";
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
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Menu as MenuIcon, AccountCircle, Language } from "@mui/icons-material";
import styles from "./Navbar.module.scss";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { Session } from "@supabase/supabase-js";

export function Navbar({
  locale,
  initialSession,
}: {
  locale: string;
  initialSession: Session | null;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width:768px)");
  const router = useRouter();
  const { session, logout } = useSession(initialSession);

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

  const getChangeLanguageLink = (newLocale: string) => {
    return pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
  };

  const handleSignOut = async () => {
    try {
      handleClose();
      await logout();

      router.refresh();
    } catch (error) {
      console.error("Full logout error:", error);
    }
  };

  const navItems = [
    { label: t("nav.events"), path: `/${locale}/events` },
    ...(session
      ? [{ label: t("nav.create"), path: `/${locale}/events/create` }]
      : []),
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Link href={`/${locale}`}>
        <Typography variant="h6">DriftBase</Typography>
      </Link>
      <List>
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <ListItem>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
        {!session && (
          <>
            <Link href={`/${locale}/auth/signin`}>
              <ListItem>
                <ListItemText primary={t("nav.signin")} />
              </ListItem>
            </Link>
            <Link href={`/${locale}/auth/signup`}>
              <ListItem>
                <ListItemText primary={t("nav.signup")} />
              </ListItem>
            </Link>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" className={styles.navbar}>
        <Container maxWidth="lg">
          <Toolbar className={styles.toolbar}>
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

            <Link href={`/${locale}`}>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: isMobile ? 1 : 0, mr: 4, cursor: "pointer" }}
              >
                DriftBase
              </Typography>
            </Link>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", gap: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    href={item.path}
                    color="inherit"
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
                gap: 1,
              }}
            >
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

              {session ? (
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
                    <Link href={`/${locale}/profile`} onClick={handleClose}>
                      <MenuItem>{t("nav.profile")}</MenuItem>
                    </Link>
                    <Link href={`/${locale}/my-events`} onClick={handleClose}>
                      <MenuItem>{t("nav.organizer")}</MenuItem>
                    </Link>
                    <Link
                      href={`/${locale}/my-registrations`}
                      onClick={handleClose}
                    >
                      <MenuItem>{t("nav.registrations")}</MenuItem>
                    </Link>
                    <MenuItem component={"button"} onClick={handleSignOut}>
                      {t("nav.signout")}
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                !isMobile && (
                  <>
                    <Button
                      component={Link}
                      href={`/${locale}/auth/signin`}
                      color="inherit"
                    >
                      {t("nav.signin")}
                    </Button>
                    <Button
                      component={Link}
                      href={`/${locale}/auth/signup`}
                      color="inherit"
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
              <Link
                href={getChangeLanguageLink("pl")}
                onClick={handleLangClose}
              >
                <MenuItem>Polski</MenuItem>
              </Link>
              <Link
                href={getChangeLanguageLink("en")}
                onClick={handleLangClose}
              >
                <MenuItem>English</MenuItem>
              </Link>
              <Link
                href={getChangeLanguageLink("ru")}
                onClick={handleLangClose}
              >
                <MenuItem>Русский</MenuItem>
              </Link>
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
