export const en = {
  translation: {
    common: {
      ok: "OK",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      error: "Error",
      success: "Success",
      loading: "Loading...",
    },
    camera: {
      permission_text: "We need your permission to show the camera",
      grant_permission: "Grant Permission",
      device_not_found_title: "Camera Not Found",
      device_not_found_subtitle: "No camera device is available on this device",
    },
    inference: {
      processing_other: "Processing {{count}} images",
      processing_one: "Processing {{count}} image",
      queued: "Images in queue",
      image_label: "Image",
      status: {
        waiting: "Waiting",
        preparing: "Preparing...",
        analyzing: "Analyzing...",
        finishing: "Finishing...",
        ready: "Ready",
      },
    },
    model: {
      loading: "Loading AI...",
      ready: "AI Ready",
    },
    calculator: {
      title: "Cell Calculation",
      image_dimensions: "Image Dimensions mm³",
      num_images: "Number of images",
      total_cells: "Total cells",
      average_per_image: "Average / image",
      concentration: "Concentration",
      cells_per_ml: "cells / mL",
    },
    images: {
      analysis_title: "Analysis",
      detected: "Detected",
      total: "Total",
      manual_adjustment: "Manual Adj.",
      accepted: "Accepted",
      confirm: "Confirm",
      select_images_instruction: "Select images to calculate",
      no_images_instruction: "Take or select photos to analyze",
    },
    tabs: {
      camera: "Camera",
      images: "Images",
      settings: "Settings",
    },
    settings: {
      title: "Settings",
      model_settings: "Model Settings",
      appearance: "Appearance",
      advanced: "Advanced",
      measurement_params: "Measurement Parameters",
      language: "Language",
      theme: {
        label: "Theme",
        light: "Light",
        dark: "Dark",
        auto: "System",
      },
      sensitivity: {
        label: "Sensitivity",
        description: "Confidence threshold for detections. Higher = stricter",
      },
      iou: {
        label: "Duplicate Suppression (IOU)",
        description: "Threshold for removing duplicate detections",
      },
      dilution_factor: {
        label: "Dilution Factor",
      },
      chamber_depth: {
        label: "Chamber Depth (mm)",
      },
      chamber_width: {
        label: "Cell Width (mm)",
      },
      chamber_height: {
        label: "Cell Height (mm)",
      },
      clear_cache: {
        label: "Clear Image Cache",
        description: "Deletes all temporarily saved images",
        success: "Cache cleared successfully",
      },
      reset_defaults: {
        label: "Reset to Defaults",
        description: "Reverts to initial configuration",
        success: "Settings restored",
      },
    },
    languages: {
      es: "Spanish",
      en: "English",
      auto: "System",
    },
  },
};
