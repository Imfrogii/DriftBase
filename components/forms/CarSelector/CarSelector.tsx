"use client";
import { Car } from "@/lib/supabase/types";
import {
  Container,
  Alert,
  Button,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import styles from "./CarSelector.module.scss";
import { DirectionsCar } from "@mui/icons-material";
import { register } from "module";
import { Controller, useFormContext } from "react-hook-form";
import { useLocale } from "next-intl";

export default function CarSelector({ cars }: { cars: Car[] }) {
  const locale = useLocale();
  const {
    control,
    formState: { errors },
  } = useFormContext<{ car_id: string }>();

  return (
    <Controller
      name="car_id"
      control={control}
      rules={{ required: "Please select a car" }}
      render={({ field }) => (
        <FormControl fullWidth size="small">
          <InputLabel>Select Your Car</InputLabel>
          <Select
            {...field}
            error={!!errors.car_id}
            label="Select Your Car"
            classes={{
              select: styles.select,
            }}
          >
            {cars.map((car) => (
              <MenuItem key={car.id} value={car.id}>
                <Box className={styles.carOption}>
                  <DirectionsCar />
                  <Box>
                    <Typography>{car.name || car.model}</Typography>

                    <Typography variant="caption" color="text.secondary">
                      {car.name && `${car.model}  · `}
                      {car.level} · {car.power} HP
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.car_id && (
            <Typography color="error" variant="caption">
              {errors.car_id.message}
            </Typography>
          )}
        </FormControl>
      )}
    />
  );
}
