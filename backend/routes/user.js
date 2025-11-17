import { Router } from "express";
import { loginUser, logoutUser, myProfile, refreshCSRF, refreshToken, registerUser, verifyOtp, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/verify/:token").post(verifyUser);
router.route("/login").post(loginUser);
router.route("/verify").post(verifyOtp);
router.route("/me").get(isAuth, myProfile);
router.route("/refresh").post(refreshToken); 
router.route("/logout").post(isAuth, verifyCSRFToken, logoutUser);
router.route("/refresh-csrf").post(isAuth, refreshCSRF);

export default router;

