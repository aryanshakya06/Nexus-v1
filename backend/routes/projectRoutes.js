import { Router } from "express";
import multer from 'multer';
import { createProject, deleteProject, getProjectAnalytics, getProjectById, getProjects } from "../controllers/projectController.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage: storage});

router.route("/project").get(getProjects);
router.route("/project").post(isAuth, createProject);
router.route("/project/:id").get(getProjectById);
router.route("/project/:id").delete(isAuth, deleteProject);
router.route("/analytics").get( getProjectAnalytics);


export default router;