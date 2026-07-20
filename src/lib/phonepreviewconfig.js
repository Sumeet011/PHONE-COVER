// phonePreviewConfig.js

import FRAME1 from "../../public/images/models/1/image1_boundary.png";
import CAMERA1 from "../../public/images/models/1/image2_components.png";

import FRAME2 from "../../public/images/models/2/image1_boundary.png";
import CAMERA2 from "../../public/images/models/2/image2_components.png";

export const PHONE_PREVIEW_CONFIG = {
  "iphone-16-pro": {
    frame: FRAME1,
    camera: CAMERA1,

    cameraClass:
      "absolute top-8 left-8 w-[140px] h-[160px] pointer-events-none rounded-[35px] overflow-hidden  " ,

    phoneClass:
    "absolute inset-0 w-full h-full object-cover rounded-[25px] pointer-events-none z-1"
  },

  "galaxy-s24": {
    frame: FRAME2,
    camera: CAMERA2,

    cameraClass:
    "absolute top-8 left-8 w-[160px] h-[160px] pointer-events-none rounded-[35px] overflow-hidden  " ,

        phoneClass:
        
    "absolute inset-0 w-full h-full object-cover rounded-[25px] pointer-events-none z-1"
  },
};