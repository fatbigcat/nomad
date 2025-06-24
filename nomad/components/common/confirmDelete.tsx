import React from "react";
import { Alert } from "react-native";

export type ConfirmDeleteOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

/**
 * Shows a confirmation alert for destructive delete actions.
 * Usage: confirmDelete(() => { ... })
 */
export function confirmDelete(
  onConfirm: () => void,
  options?: ConfirmDeleteOptions
) {
  Alert.alert(
    options?.title || "Delete?",
    options?.message ||
      "Are you sure you want to delete this? This action cannot be undone.",
    [
      { text: options?.cancelText || "Cancel", style: "cancel" },
      {
        text: options?.confirmText || "Delete",
        style: "destructive",
        onPress: onConfirm,
      },
    ]
  );
}
