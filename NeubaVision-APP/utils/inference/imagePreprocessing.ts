import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "jpeg-js";

export interface PreprocessedImage {
  tensor: Float32Array;
  width: number;
  height: number;
}

/**
 * Resizes an image to the specified dimensions
 */
export async function resizeImage(
  imageUri: string,
  targetSize: number
): Promise<string> {
  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: targetSize, height: targetSize } }],
    { format: ImageManipulator.SaveFormat.JPEG }
  );
  return resized.uri;
}

/**
 * Reads an image as base64
 */
export async function readImageAsBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/**
 * Decodes a JPEG image from base64
 */
export function decodeJPEG(base64: string): {
  data: Uint8Array;
  width: number;
  height: number;
} {
  const imageBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return decode(imageBuffer, { useTArray: true });
}

/**
 * Converts RGBA data to RGB tensor in CHW format (Channels-Height-Width)
 * Normalizes values to [0, 1]
 */
export function rgbaToTensorCHW(
  data: Uint8Array,
  width: number,
  height: number
): Float32Array {
  const inputSize = width * height;
  const tensor = new Float32Array(3 * inputSize);

  for (let i = 0; i < inputSize; i++) {
    const pixelIndex = i * 4; // RGBA
    tensor[i] = data[pixelIndex] / 255.0; // R channel
    tensor[inputSize + i] = data[pixelIndex + 1] / 255.0; // G channel
    tensor[2 * inputSize + i] = data[pixelIndex + 2] / 255.0; // B channel
  }

  return tensor;
}

/**
 * Preprocesses a complete image for YOLO inference
 */
export async function preprocessImageForYOLO(
  imageUri: string,
  targetSize: number = 640
): Promise<PreprocessedImage> {
  console.log("Preprocessing image:", imageUri);

  // 1. Resize
  const resizedUri = await resizeImage(imageUri, targetSize);

  // 2. Read as base64
  const base64 = await readImageAsBase64(resizedUri);

  // 3. Decode JPEG
  const { data, width, height } = decodeJPEG(base64);

  // 4. Convert to CHW tensor
  const tensor = rgbaToTensorCHW(data, width, height);

  console.log(`Preprocessed to tensor: [1, 3, ${width}, ${height}]`);
  console.log(`Tensor size: ${tensor.length}`);

  return { tensor, width, height };
}
