"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const Images_1 = require("../entities/Images");
cloudinary_1.default.v2.config({
    cloud_name: "devhelp",
    api_key: "349325875226191",
    api_secret: "vFF7WZWOqo7G3Ohu45faGrUHNSE",
});
const storage = multer_1.default.diskStorage({
    filename: function (_, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});
const imageFilter = function (_, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only images are allowed!"), false);
    }
    cb(null, true);
};
const upload = multer_1.default({
    storage,
    fileFilter: imageFilter,
});
router.post("/upload-profile", upload.single("profile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.userId) {
        yield cloudinary_1.default.v2.uploader.upload(req.file.path, { gravity: "center", crop: "fill" }, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                res.json(err);
            }
            else {
                const img = Images_1.Images.create({ url: result === null || result === void 0 ? void 0 : result.url });
                yield img.save();
                res.json(result);
            }
        }));
    }
    res.json("user is not authenticated");
}));
module.exports = router;
//# sourceMappingURL=imageUpload.js.map