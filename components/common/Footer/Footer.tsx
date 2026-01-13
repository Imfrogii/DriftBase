import React from "react";
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  IconButton,
} from "@mui/material";
import { Instagram, YouTube } from "@mui/icons-material";
import s from "./Footer.module.scss";

const Footer: React.FC = () => {
  return (
    <Box component="footer" className={s.footer}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" className={s.footer__brand}>
              DriftBase
            </Typography>
            <Typography variant="body2" className={s.footer__description}>
              Motorsport events platform for drivers and fans.
            </Typography>
          </Grid>

          {/* Navigation */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" className={s.footer__title}>
              Events
            </Typography>
            <ul className={s.footer__list}>
              <li>
                <Link href="/events">All Events</Link>
              </li>
              <li>
                <Link href="/map">Map</Link>
              </li>
              <li>
                <Link href="/calendar">Calendar</Link>
              </li>
            </ul>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" className={s.footer__title}>
              Account
            </Typography>
            <ul className={s.footer__list}>
              <li>
                <Link href="/my-events">My Events</Link>
              </li>
              <li>
                <Link href="/my-registrations">My Registrations</Link>
              </li>
            </ul>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" className={s.footer__title}>
              About
            </Typography>
            <ul className={s.footer__list}>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </Grid>
        </Grid>

        {/* Socials */}
        <Box className={s.footer__socials}>
          <IconButton
            color="primary"
            href="https://instagram.com"
            target="_blank"
          >
            <Instagram />
          </IconButton>
          <IconButton
            color="primary"
            href="https://youtube.com"
            target="_blank"
          >
            <YouTube />
          </IconButton>
          {/* <IconButton color="primary" href="https://tiktok.com" target="_blank">
            <TikTok />
          </IconButton> */}
        </Box>

        {/* Bottom line */}
        <Box className={s.footer__bottom}>
          <Typography variant="body2" color="textSecondary">
            © {new Date().getFullYear()} DriftBase. Built for drivers.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
