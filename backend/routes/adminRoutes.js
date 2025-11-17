import { Router } from 'express';
import { authorizedAmin, isAuth } from '../middlewares/isAuth.js';
import { adminControlller } from '../controllers/adminController.js';

const router = Router();

router.route("/admin").get(isAuth, authorizedAmin, adminControlller);

export default router;