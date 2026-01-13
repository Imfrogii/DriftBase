"use client";
import { FileUpload } from "@/components/common/FileUpload/FileUpload";
import { LocationPicker } from "@/components/common/LocationPicker/LocationPicker";
import { typeCheckboxes, levelCheckboxes } from "@/lib/helpers/filters";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Select,
  FormHelperText,
  FormControl,
  InputLabel,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import DatePicker from "react-datepicker";
import { Controller, useFormContext } from "react-hook-form";
import styles from "./EventForm.module.scss";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { EditEventFormData } from "@/components/pages/EditEventPage/EditEventPage";
import { Location } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/helpers/getImageUrl";

type EventFormProps = {
  onSubmit: (data: EditEventFormData) => Promise<void>;
  setIsFileLoading: Dispatch<SetStateAction<boolean>>;
  children: JSX.Element;
  initialLocation?: Location | null;
  isEditPage?: boolean;
  registeredDrivers?: number;
};

export function EventForm({
  onSubmit,
  setIsFileLoading,
  children,
  initialLocation,
  isEditPage,
  registeredDrivers,
}: EventFormProps) {
  const t = useTranslations();
  const isDisabled = isEditPage && !!registeredDrivers;

  const {
    getValues,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useFormContext<EditEventFormData>();

  const setFile = (file: File | null) => {
    setValue("image", file, {
      shouldValidate: true,
    });
    if (file) {
      setValue("isDeleteImg", undefined);
    }
  };

  const handleDeleteItem = () => {
    setValue("isDeleteImg", true);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form}
    >
      <FileUpload
        imageUrl={
          getValues().image_url ? getImageUrl(getValues().image_url) : undefined
        }
        setFile={setFile}
        setIsFileLoading={setIsFileLoading}
        onDeleteFile={handleDeleteItem}
      />
      <Box className={styles.formSection}>
        <TextField
          size="small"
          fullWidth
          label={t("create_event.form.title")}
          {...register("title")}
          error={!!errors.title}
          helperText={errors.title?.message}
          margin="dense"
          required
        />

        <TextField
          size="small"
          fullWidth
          label={t("create_event.form.description")}
          multiline
          minRows={3}
          {...register("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
          margin="dense"
          required
        />
        <Controller
          name="type"
          control={control}
          defaultValue={undefined}
          render={({ field: { onChange, value } }) => (
            <Tooltip
              title={
                isDisabled
                  ? "Нельзя изменить тип события после регистрации участников"
                  : ""
              }
            >
              <FormControl
                fullWidth
                margin="dense"
                size="small"
                disabled={isDisabled}
                required
              >
                <InputLabel id="type">{t("create_event.type")}</InputLabel>
                {/* TODO add native select for mobile */}
                <Select
                  id="type"
                  labelId="type"
                  label={t("create_event.type")}
                  error={!!errors.type}
                  onChange={onChange}
                  value={value}
                  // TODO add tooltip explaining why it's disabled
                >
                  {typeCheckboxes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.type?.message}</FormHelperText>
              </FormControl>
            </Tooltip>
          )}
        />
      </Box>

      <Box className={styles.formSection}>
        <Typography variant="h6" mb={"0.5rem"}>
          Location
        </Typography>
        <Controller
          name="location_id"
          control={control}
          defaultValue={undefined}
          render={({ field: { onChange } }) => (
            <Tooltip
              title={
                isDisabled
                  ? "Нельзя изменить локацию после регистрации участников"
                  : ""
              }
            >
              <span>
                <LocationPicker
                  onLocationSelect={onChange}
                  initialLocation={initialLocation}
                  error={errors.location_id?.message}
                  disabled={isDisabled}
                />
              </span>
            </Tooltip>
          )}
        />
      </Box>

      <Box className={styles.formSection}>
        <Typography variant="h6">When</Typography>
        <Box className={styles.row}>
          {/* TODO validations */}
          <Controller
            name="start_date"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <Tooltip
                title={
                  isDisabled
                    ? "Нельзя изменить дату после регистрации участников"
                    : ""
                }
              >
                <Box className={styles.datePickerWrapper} component="span">
                  <DatePicker
                    selected={value ? new Date(value) : null}
                    onChange={(date) => {
                      onChange(
                        date ? format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") : ""
                      );
                    }}
                    selectsStart
                    startDate={value ? new Date(value) : null}
                    endDate={
                      getValues().end_date
                        ? new Date(getValues().end_date)
                        : null
                    }
                    showTimeSelect
                    wrapperClassName={styles.datePickerWrapper}
                    popperClassName={styles.datePickerPopper}
                    timeFormat="HH:mm"
                    dateFormat="dd.MM.yyyy HH:mm"
                    calendarStartDay={1}
                    minDate={new Date()}
                    required
                    disabled={isDisabled}
                    customInput={
                      <TextField
                        fullWidth
                        size="small"
                        disabled={true}
                        label={t("create_event.form.startDate")}
                        className={styles.datePickerInput}
                        error={!!errors.start_date}
                        helperText={errors.start_date?.message}
                        margin="dense"
                      />
                    }
                  />
                </Box>
              </Tooltip>
            )}
          />
          <Controller
            name="end_date"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <Tooltip
                title={
                  isDisabled
                    ? "Нельзя изменить дату после регистрации участников"
                    : ""
                }
              >
                <Box className={styles.datePickerWrapper} component="span">
                  <DatePicker
                    selected={value ? new Date(value) : null}
                    onChange={(date) => {
                      onChange(
                        date ? format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") : ""
                      );
                    }}
                    selectsEnd
                    startDate={
                      getValues().start_date
                        ? new Date(getValues().start_date)
                        : null
                    }
                    minDate={
                      getValues().start_date
                        ? new Date(getValues().start_date)
                        : new Date()
                    }
                    endDate={value ? new Date(value) : null}
                    showTimeSelect
                    wrapperClassName={styles.datePickerWrapper}
                    popperClassName={styles.datePickerPopper}
                    timeFormat="HH:mm"
                    dateFormat="dd.MM.yyyy HH:mm"
                    calendarStartDay={1}
                    required
                    disabled={isDisabled}
                    customInput={
                      <Tooltip
                        title={
                          isDisabled
                            ? "Нельзя изменить дату после регистрации участников"
                            : ""
                        }
                      >
                        <TextField
                          fullWidth
                          size="small"
                          disabled={true}
                          label={t("create_event.form.endDate")}
                          className={styles.datePickerInput}
                          error={!!errors.end_date}
                          helperText={errors.end_date?.message}
                          margin="dense"
                          required
                        />
                      </Tooltip>
                    }
                  />
                </Box>
              </Tooltip>
            )}
          />
        </Box>
      </Box>

      <Box className={styles.formSection}>
        <Typography variant="h6">Участие</Typography>
        <Controller
          name="level"
          control={control}
          defaultValue={undefined}
          render={({ field: { onChange, value } }) => (
            <Tooltip
              title={
                isDisabled
                  ? "Нельзя изменить уровень после регистрации участников"
                  : ""
              }
            >
              <FormControl
                fullWidth
                margin="dense"
                size="small"
                disabled={isDisabled}
              >
                <InputLabel id="level">
                  {t("create_event.form.level")}
                </InputLabel>
                <Select
                  id="level"
                  labelId="level"
                  label={t("create_event.form.level")}
                  error={!!errors.level}
                  required
                  onChange={onChange}
                  value={value}
                >
                  {levelCheckboxes.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.level?.message}</FormHelperText>
              </FormControl>
            </Tooltip>
          )}
        />
        <Box className={styles.row}>
          <TextField
            size="small"
            fullWidth
            label={t("create_event.form.driversCount")}
            type="number"
            {...register("max_drivers")}
            error={!!errors.max_drivers}
            helperText={errors.max_drivers?.message}
            margin="dense"
            required
          />
          <Tooltip
            title={
              isDisabled
                ? "Нельзя изменить стоимость после регистрации участников"
                : ""
            }
          >
            <TextField
              size="small"
              fullWidth
              label={t("create_event.form.price")}
              type="number"
              {...register("price")}
              error={!!errors.price}
              helperText={errors.price?.message}
              disabled={isEditPage && !!registeredDrivers}
              InputProps={{
                inputProps: { min: 0, step: 5 },
              }}
              margin="dense"
              required
            />
          </Tooltip>
        </Box>
      </Box>
      {children}
    </Box>
  );
}
