import { View } from "react-native";
import { Grid3x3, Images, Circle } from "lucide-react-native";
import { CameraDevice } from "react-native-vision-camera";
import { Colors } from "@/constants/theme";

import { HStack } from "@/components/ui/hstack";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";
import { Button, ButtonIcon } from "@/components/ui/button";

type CameraControlsProps = {
  zoom: number;
  onZoomChange: (value: number) => void;
  device: CameraDevice;
  onToggleGrid: () => void;
  onTakePicture: () => void;
  onPickImage: () => void;
};

/**
 * Camera controls component with zoom slider and action buttons.
 * Renders at the bottom of the camera screen.
 */
export const CameraControls = ({
  zoom,
  onZoomChange,
  device,
  onToggleGrid,
  onTakePicture,
  onPickImage,
}: CameraControlsProps) => {
  const minZoom = device.minZoom ?? 1;
  const maxZoom = Math.min(device.maxZoom ?? 1, 10); // Cap at 10x
  const colorScheme = Colors.light;

  return (
    <View className="absolute bottom-0 w-full px-8 items-center h-40 justify-evenly bg-[rgba(0,0,0,0.3)]">
      {/* Zoom Slider */}
      <Slider
        defaultValue={zoom}
        minValue={minZoom}
        maxValue={maxZoom}
        value={zoom}
        onChange={onZoomChange}
        className="w-1/2"
      >
        <SliderTrack>
          <SliderFilledTrack style={{ backgroundColor: colorScheme.card }} />
        </SliderTrack>
        <SliderThumb style={{ backgroundColor: colorScheme.card }} />
      </Slider>

      {/* Action Buttons */}
      <HStack className="w-full px-12 justify-between items-center">
        <Button
          onPress={onToggleGrid}
          size="xl"
          className="rounded-full"
          style={{ backgroundColor: colorScheme.card }}
        >
          <ButtonIcon as={Grid3x3} color={colorScheme.text} />
        </Button>
        <Button onPress={onTakePicture} variant="link" size="xl" className="p-0">
          <ButtonIcon
            as={Circle}
            size="xl"
            className="w-20 h-20"
            color={colorScheme.card}
          />
        </Button>
        <Button
          onPress={onPickImage}
          size="xl"
          className="rounded-full"
          style={{ backgroundColor: colorScheme.card }}
        >
          <ButtonIcon as={Images} color={colorScheme.text} />
        </Button>
      </HStack>
    </View>
  );
};
