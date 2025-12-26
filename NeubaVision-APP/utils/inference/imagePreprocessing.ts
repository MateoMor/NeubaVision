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
  imagePath: string,
  targetSize: number
): Promise<string> {
  const resized = await ImageManipulator.manipulateAsync(
    imagePath,
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
 * Converts RGBA data to RGB tensor in HWC format (Height-Width-Channels)
 * This matches TFLite's expected input format: (1, 640, 640, 3) = NHWC
 * Normalizes values to [0, 1]
 */
export function rgbaToTensorHWC(
  data: Uint8Array,
  width: number,
  height: number
): Float32Array {
  const inputSize = width * height;
  const tensor = new Float32Array(inputSize * 3); // 640*640*3

  for (let i = 0; i < inputSize; i++) {
    const pixelIndex = i * 4; // RGBA source
    const tensorIndex = i * 3; // RGB destination (HWC format)
    
    tensor[tensorIndex] = data[pixelIndex] / 255.0;     // R
    tensor[tensorIndex + 1] = data[pixelIndex + 1] / 255.0; // G
    tensor[tensorIndex + 2] = data[pixelIndex + 2] / 255.0; // B
  }

  return tensor;
}

/**
 * Preprocesses a complete image for YOLO inference
 */
export async function preprocessImageForYOLO(
  imagePath: string,
  targetSize: number = 640
): Promise<PreprocessedImage> {
  console.log("Preprocessing image:", imagePath);

  let deltatime = new Date().getTime();
  // 1. Resize
  const resizedUri = await resizeImage(imagePath, targetSize);
  deltatime = new Date().getTime() - deltatime;
  console.debug(`Resize time: ${deltatime} ms`);

  deltatime = new Date().getTime();
  // 2. Read as base64
  const base64 = await readImageAsBase64(resizedUri);
  deltatime = new Date().getTime() - deltatime;
  console.debug(`Read as base64 time: ${deltatime} ms`);
  console.log(base64.length);


  deltatime = new Date().getTime();
  // 3. Decode JPEG
  const { data, width, height } = decodeJPEG(base64);
  deltatime = new Date().getTime() - deltatime;
  console.debug(`Decode JPEG time: ${deltatime} ms`);

  deltatime = new Date().getTime();
  // 4. Convert to HWC tensor (matches TFLite's NHWC format)
  const tensor = rgbaToTensorHWC(data, width, height);
  deltatime = new Date().getTime() - deltatime;
  console.debug(`Convert to HWC tensor time: ${deltatime} ms`);

  console.log(`Preprocessed to tensor: [1, ${height}, ${width}, 3] (NHWC format)`);
  console.log(`Tensor size: ${tensor.length}`);

  return { tensor, width, height };
}
