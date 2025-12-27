import { View, Image } from "react-native";
import { BoundingBoxOverlay } from "./BoundingBoxOverlay";
import { BoundingBox } from "@/types/BoundingBox";

export const ImageWithBoundingBoxes = ({
  photoPath,
  boxes,
  imageSize,
}: {
  photoPath: string;
  boxes: BoundingBox[];
  imageSize: number;
}) => {
  return (
    <View
      style={{
        width: imageSize,
        height: imageSize,
        position: "relative",
      }}
    >
      <Image
        source={{ uri: photoPath }}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="cover"
      />
      <BoundingBoxOverlay
        detections={boxes}
        imageWidth={imageSize}
        imageHeight={imageSize}
        originalWidth={640}
        originalHeight={640}
      />
    </View>
  );
};
