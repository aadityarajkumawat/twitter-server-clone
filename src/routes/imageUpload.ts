import express from "express";
const router = express.Router();
import multer from "multer";
import cloudinary from "cloudinary";
import { Images } from "../entities/Images";

cloudinary.v2.config({
  cloud_name: "devhelp",
  api_key: "349325875226191",
  api_secret: "vFF7WZWOqo7G3Ohu45faGrUHNSE",
});

const storage = multer.diskStorage({
  filename: function (_, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const imageFilter = function (
  _: any,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void
) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    // @ts-ignore
    return cb(new Error("Only images are allowed!"), false);
  }
  // @ts-ignore
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
} as any);

router.post("/upload-profile", async (req, res) => {
  // @ts-ignore
  if (req.session.userId) {
    // @ts-ignore
    console.log(req.session.userId);
    res.json("auth");
  } else {
    console.log(req.headers.cookie);
    res.json(req.headers.cookie);
  }
});

module.exports = router;
