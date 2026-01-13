import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "./LocationSearch.module.scss";
import { Typography } from "@mui/material";
import EventLocationSVG from "@/components/icons/EventLocationIcon";
import api from "@/lib/utils/request";

export interface MapboxLocation {
  id: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  place_formatted: string;
  full_address?: string;
  feature_type:
    | "country"
    | "region"
    | "postcode"
    | "district"
    | "place"
    | "locality"
    | "neighborhood"
    | "street"
    | "address"
    | "custom";
}

interface LocationSearchProps {
  onSelect?: (location: MapboxLocation | null) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<MapboxLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inputValue.length < 3) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const fetchLocations = async () => {
      try {
        const url = `/api/locations/search?search=${encodeURIComponent(
          inputValue
        )}&limit=10`;
        const { data } = await api.get(url, { signal: controller.signal });

        setOptions(data?.locations || []);
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          console.error("Mapbox Error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchLocations, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [inputValue]);

  return (
    <div className={styles.wrapper}>
      <Autocomplete
        options={options}
        filterOptions={(x) => x} // Disable built-in filtering
        size="small"
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.place_name
        }
        onChange={(_, value) => {
          value && onSelect?.(value);
        }}
        clearOnBlur={false}
        loading={loading}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <div className={styles.icon}>
              {option.feature_type === "custom" && <EventLocationSVG />}
            </div>
            <div>
              <Typography variant="body1">{option.place_name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {option.place_formatted}
              </Typography>
            </div>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Поиск локации"
            variant="outlined"
            onChange={(e) => setInputValue(e.target.value)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
};

export default LocationSearch;
