"use client"

import type React from "react"
import { useState } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Menu as MenuIcon, AccountCircle, DirectionsCar } from "@mui/icons-material"
import { useAuth } from "@/lib/hooks/useAuth"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "./Navbar.module.scss"

export function Navbar() {
  const t = useTranslations("navigation")
  const { user, dbUser, signOut } = useAuth()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    await signOut()
    handleClose()
    router.push("/")
  }

  const navigationItems = [
    { label: t("home"), href: "/" },
    { label: t("events"), href: "/events" },
    ...(user ? [{ label: t("createEvent"), href: "/events/create" }] : []),
    ...(dbUser?.role === "admin" ? [{ label: t("admin"), href: "/admin" }] : []),
  ]

  const renderMobileMenu = () => (
    <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
      <List sx={{ width: 250 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.href} component={Link} href={item.href} onClick={() => setMobileOpen(false)}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {!user && (
          <>
            <ListItem component={Link} href="/auth/signin" onClick={() => setMobileOpen(false)}>
              <ListItemText primary={t("signIn")} />
            </ListItem>
            <ListItem component={Link} href="/auth/signup" onClick={() => setMobileOpen(false)}>
              <ListItemText primary={t("signUp")} />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  )

  return (
    <>
      <AppBar position="sticky" className={styles.appBar}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Link href="/" className={styles.logo}>
            <DirectionsCar sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              DriftBase
            </Typography>
          </Link>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", ml: 4 }}>
              {navigationItems.map((item) => (
                <Button key={item.href} color="inherit" component={Link} href={item.href} sx={{ mx: 1 }}>
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          {user ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {dbUser?.avatar_url ? (
                  <Avatar src={dbUser.avatar_url} sx={{ width: 32, height: 32 }} />
                ) : (
                  <AccountCircle />
                )}
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
                <MenuItem component={Link} href="/profile" onClick={handleClose}>
                  {t("profile")}
                </MenuItem>
                <MenuItem onClick={handleSignOut}>{t("signOut")}</MenuItem>
              </Menu>
            </div>
          ) : (
            !isMobile && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button color="inherit" component={Link} href="/auth/signin">
                  Sign In
                </Button>
                <Button variant="outlined" color="inherit" component={Link} href="/auth/signup">
                  Sign Up
                </Button>
              </Box>
            )
          )}
        </Toolbar>
      </AppBar>
      {renderMobileMenu()}
    </>
  )
}
