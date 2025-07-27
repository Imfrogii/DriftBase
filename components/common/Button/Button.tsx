import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from "@mui/material";
import styles from "./Button.module.scss";

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

export function Button({
  loading,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      className={`${styles.button} ${className || ""}`}
    >
      {loading ? "Loading..." : children}
    </MuiButton>
  );
}
