"use client";
import { levelCheckboxes } from "@/lib/helpers/filters";
import { useCreateCar, useUpdateCar } from "@/lib/queries/cars";
import { Car, CarLevel } from "@/lib/supabase/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

type CarModalFormProps = {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
  } | null;
  editingCar: Car | null;
};

export type CarFormData = {
  name: string;
  model: string;
  level: CarLevel | null;
  power: number | null;
  description: string;
};

export function CarModalForm({
  isOpen,
  onClose,
  user,
  editingCar,
}: CarModalFormProps) {
  const t = useTranslations();
  const createCarMutation = useCreateCar(onClose);
  const updateCarMutation = useUpdateCar(onClose);
  const carForm = useFormContext<CarFormData>();

  const onCarSubmit = (data: CarFormData) => {
    if (!user) return;

    if (editingCar) {
      updateCarMutation.mutate({
        id: editingCar.id,
        ...data,
      });
      // setMessage({ type: "success", text: "Car updated successfully!" });
    } else {
      createCarMutation.mutate(data);
      // setMessage({ type: "success", text: "Car added successfully!" });
    }
  };
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingCar ? "Edit Car" : "Add New Car"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={carForm.handleSubmit(onCarSubmit)}>
          <TextField
            fullWidth
            label="Car Name"
            {...carForm.register("name")}
            error={!!carForm.formState.errors.name}
            helperText={carForm.formState.errors.name?.message}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Model"
            {...carForm.register("model", { required: "Model is required" })}
            required
            error={!!carForm.formState.errors.model}
            helperText={carForm.formState.errors.model?.message}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Power (HP)"
            type="string"
            inputMode="numeric"
            {...carForm.register("power", {
              required: "Power is required",
              valueAsNumber: true,
            })}
            defaultValue={""}
            required
            margin="normal"
          />
          <Controller
            name="level"
            control={carForm.control}
            defaultValue={undefined}
            render={({ field: { onChange, value } }) => (
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="level">{t("car_form.level")}</InputLabel>
                <Select
                  id="level"
                  labelId="level"
                  label={t("car_form.level")}
                  error={!!carForm.formState.errors.level}
                  onChange={onChange}
                  value={value}
                >
                  {levelCheckboxes.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {carForm.formState.errors.level?.message}
                </FormHelperText>
              </FormControl>
            )}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            {...carForm.register("description")}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={carForm.handleSubmit(onCarSubmit)}
          variant="contained"
          disabled={carForm.formState.isSubmitting}
        >
          {editingCar ? "Update" : "Add"} Car
        </Button>
      </DialogActions>
    </Dialog>
  );
}
