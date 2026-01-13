"use client";

import { Box, Button, IconButton, Typography } from "@mui/material";
import AddPhotoAlternateOutlined from "@mui/icons-material/AddPhotoAlternateOutlined";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseFullscreen, Delete } from "@mui/icons-material";
import classNames from "classnames";
import styles from "./FileUpload.module.scss";
import imageCompression, { Options } from "browser-image-compression";

type FileUploadProps = {
  setFile: (file: File | null) => void;
  setIsFileLoading: (isLoading: boolean) => void;
  imageUrl?: string;
  onDeleteFile?: () => void;
};
const MAX_SIZE_MB = 5;

// TODO: delete file from storage when new uploaded/event cancelled/past event
export function FileUpload({
  setFile,
  setIsFileLoading,
  imageUrl,
  onDeleteFile,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const controller = new AbortController();
  const controllerRef = useRef(controller);

  useEffect(() => {
    return () => controllerRef.current.abort();
  }, []);

  const handleFile = async (file: File) => {
    controllerRef.current.abort();
    if (!file.type.startsWith("image/")) return;
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      setError("big file");
      return;
    }
    const url = URL.createObjectURL(file);
    setError("");
    setPreview(url);
    const options: Options = {
      maxWidthOrHeight: 800,
      signal: controller.signal,
    };

    try {
      setIsFileLoading(true);
      const compressedFile = await imageCompression(file, options);
      setFile(compressedFile);
    } catch (e) {
      console.log(error);
      setError("Failed to compress image");
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPreview(null);
    setFile(null);
    setError("");
    if (file) handleFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    controllerRef.current.abort();
    setPreview(null);
    setFile(null);
    setError("");
    onDeleteFile && onDeleteFile();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Button
      component={Box}
      variant="text"
      color="inherit"
      className={classNames(styles.container, {
        [styles.dragging]: isDragging,
        [styles.error]: !!error,
      })}
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="Event cover preview"
            className={styles.previewImg}
          />
          <Box className={styles.closeIcon}>
            <IconButton onClick={handleRemoveImage} size="small">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
          <Box className={styles.helper}>
            <Typography variant="caption" color="text.secondary">
              Click or drag another image to replace
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <AddPhotoAlternateOutlined className={styles.uploadIcon} />
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign={"center"}
          >
            Drag & drop your event cover here, or click to upload
          </Typography>
          <Typography
            variant="caption"
            color={error ? "secondary" : "text.secondary"}
          >
            Max file size is {MAX_SIZE_MB}MB
          </Typography>
        </>
      )}
    </Button>
  );
}
