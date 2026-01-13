"use client";
import {
  Box,
  Slider,
  SliderThumb,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const AirbnbSlider = styled(Slider)(({ theme }) => ({
  color: "#1976d2",
  height: 3,
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 27,
    width: 27,
    backgroundColor: "#fff",
    border: "1px solid currentColor",
    "&:hover": {
      boxShadow: "0 0 0 8px #1976d229",
    },
    "& .airbnb-bar": {
      height: 9,
      width: 1,
      backgroundColor: "currentColor",
      marginLeft: 1,
      marginRight: 1,
    },
  },
  "& .MuiSlider-track": {
    height: 3,
  },
  "& .MuiSlider-rail": {
    color: "#d8d8d8",
    opacity: 1,
    height: 3,
    ...theme.applyStyles("dark", {
      color: "#bfbfbf",
      opacity: undefined,
    }),
  },
}));

interface AirbnbThumbComponentProps extends React.HTMLAttributes<unknown> {}

function AirbnbThumbComponent(props: AirbnbThumbComponentProps) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}

export default function CustomizedSlider({
  initialValues,
  updateFilter,
}: {
  initialValues?: [string, string];
  updateFilter?: (key: "priceMin" | "priceMax", value: string) => void;
}) {
  const max = 2000;
  const [value, setValue] = useState<string[]>(
    initialValues || [String(0), String(max)]
  );

  useEffect(() => {
    if (!initialValues?.length) return;
    setValue(initialValues);
  }, [initialValues]);

  const updateValues = (vals: string[]) => {
    updateFilter?.("priceMin", vals[0]);
    updateFilter?.("priceMax", vals[1]);
  };

  return (
    <Box>
      <AirbnbSlider
        slots={{ thumb: AirbnbThumbComponent }}
        getAriaLabel={(index) =>
          index === 0 ? "Minimum price" : "Maximum price"
        }
        value={[Number(value[0]) || 0, value[1] ? Number(value[1]) : max]}
        valueLabelDisplay="auto"
        max={max}
        step={25}
        onChange={(_, newValue) => {
          if (!Array.isArray(newValue)) return;
          setValue([String(newValue[0] ?? 0), String(newValue[1] ?? max)]);
        }}
        onChangeCommitted={(_, newValue) => {
          if (!Array.isArray(newValue)) return;
          updateValues([String(newValue[0] ?? 0), String(newValue[1] ?? max)]);
        }}
      />
      <Box display="flex" justifyContent="space-between" gap={3}>
        <TextField
          label="Min Price"
          variant="outlined"
          size="small"
          inputMode="numeric"
          inputProps={{
            min: 0,
            max: Number(value[1]) || max,
            inputMode: "numeric",
            pattern: "[0-9]*",
          }}
          value={value[0]}
          onChange={(e) => {
            const val = e.target.value;

            if (val === "" || /^\d+$/.test(val)) {
              setValue((prev) => [val, prev[1]]);
            }
          }}
          onBlur={() => {
            setValue((prev) => {
              const [from, to] = prev;
              const newValues = [
                from === ""
                  ? from
                  : Math.min(Number(from), Number(to) || max).toString(),
                to === "" ? to : Math.max(Number(from), Number(to)).toString(),
              ];
              updateValues(newValues);
              return newValues;
            });
          }}
        />
        <TextField
          label="Max Price"
          variant="outlined"
          inputMode="numeric"
          size="small"
          inputProps={{ min: 0 }}
          value={value[1]}
          onChange={(e) => {
            const val = e.target.value;

            if (val === "" || /^\d+$/.test(val)) {
              setValue((prev) => [prev[0], val]);
            }
          }}
          onBlur={() => {
            setValue((prev) => {
              const [from, to] = prev;

              const newValues = [
                from === ""
                  ? from
                  : Math.min(
                      Number(from),
                      to === "" ? max : Number(to)
                    ).toString(),
                to === "" ? to : Math.max(Number(from), Number(to)).toString(),
              ];
              updateValues(newValues);
              return newValues;
            });
          }}
        />
      </Box>
    </Box>
  );
}
