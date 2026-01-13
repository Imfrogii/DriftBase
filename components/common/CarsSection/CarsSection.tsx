"use client";
import { Add, Edit, Delete } from "@mui/icons-material";
import {
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import styles from "./CarsSection.module.scss";
import { useDeleteCar } from "@/lib/queries/cars";
import { Car } from "@/lib/supabase/types";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  CarFormData,
  CarModalForm,
} from "@/components/forms/CarModalForm/CarModalForm";
import { ConfirmationModal } from "../ConfirmationModal/ConfirmationModal";

type CarsSectionProps = {
  user: {
    id: string;
  };
  cars: Car[];
};

const initialCarFormData: Partial<CarFormData> = {
  name: "",
  model: "",
  level: null,
  power: null,
  description: "",
};

export function CarsSection({ user, cars }: CarsSectionProps) {
  const [carDialogOpen, setCarDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<string | null>(null);
  const deleteCarMutation = useDeleteCar(setDeletingCar);

  const handleClose = () => {
    setDeletingCar(null);
  };

  const carForm = useForm<CarFormData>({
    defaultValues: initialCarFormData,
  });

  const handleCloseCarDialog = () => {
    setCarDialogOpen(false);
    setEditingCar(null);
    carForm.reset(initialCarFormData);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    carForm.reset({
      name: car.name || "",
      model: car.model,
      level: car.level,
      power: car.power,
      description: car.description || "",
    });
    setCarDialogOpen(true);
  };

  const handleDeleteCarClick = (carId: string) => {
    setDeletingCar(carId);
  };

  const handleDeleteCar = () => {
    if (deletingCar) {
      deleteCarMutation.mutate(deletingCar);
    }
  };

  return (
    <Paper className={styles.section}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">My Cars</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCarDialogOpen(true)}
        >
          Add Car
        </Button>
      </Box>

      {cars && cars.length > 0 ? (
        <Box className={styles.carsList}>
          {cars.map((car) => (
            <Card key={car.id} className={styles.carCard}>
              <CardContent>
                <Typography variant="h6">{car.name || car.model}</Typography>
                <Typography color="text.secondary">
                  {car.name && `${car.model} · `} {car.level} · {car.power} HP
                </Typography>

                {car.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {car.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEditCar(car)}>
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteCarClick(car.id)}
                  color="secondary"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">
          No cars added yet. Add your first car to register for events!
        </Typography>
      )}
      <FormProvider {...carForm}>
        <CarModalForm
          isOpen={carDialogOpen}
          onClose={handleCloseCarDialog}
          user={user}
          editingCar={editingCar}
        />
      </FormProvider>
      <ConfirmationModal
        open={!!deletingCar}
        onClose={handleClose}
        onConfirm={handleDeleteCar}
        ariaLabelledBy={"delete-car"}
        title={`Are you sure you want to delete this car?`}
        description="This action cannot be undone."
        closeText="No, keep it"
        confirmText={`Yes, delete`}
      />
    </Paper>
  );
}
