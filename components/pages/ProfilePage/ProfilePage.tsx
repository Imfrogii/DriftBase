import { Container, Grid } from "@mui/material";
import styles from "./ProfilePage.module.scss";
import { ProfileForm } from "@/components/forms/ProfileForm/ProfileForm";
import { CarsSection } from "@/components/common/CarsSection/CarsSection";
import { getCars } from "@/lib/api/cars";
import { User } from "@/lib/supabase/types";

type ProfilePageProps = {
  user: User;
};

export async function ProfilePage({ user }: ProfilePageProps) {
  const { cars } = await getCars(user.id);

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={6}>
          <ProfileForm user={user} />
        </Grid>

        {/* Cars Section */}
        <Grid item xs={12} md={6}>
          <CarsSection user={user} cars={cars || []} />
        </Grid>
      </Grid>

      {/* Car Dialog */}
    </Container>
  );
}
