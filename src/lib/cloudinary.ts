import { CLOUDINARY_CLOUD_NAME } from "@/constants";
import { Cloudinary } from "@cloudinary/url-gen";
import { dpr, format, quality } from "@cloudinary/url-gen/actions/delivery";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { text } from "@cloudinary/url-gen/qualifiers/source";
import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";
import { Position } from "@cloudinary/url-gen/qualifiers";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";

// Cloudinary instance.
const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

export const bannerPhoto = (imageCldPubId: string, name: string) => {
  return (
    cld
      .image(imageCldPubId)
      .resize(fill())
      // Optimize for web
      .delivery(format("auto"))
      .delivery(quality("auto"))
      .delivery(dpr("auto"))
      // Text overlay with name
      .overlay(
        source(
          text(name, new TextStyle("roboto", 42).fontWeight("bold")).textColor(
            "white",
          ),
        ).position(new Position().gravity(compass("west")).offsetX(0.02)),
      )
  );
};
