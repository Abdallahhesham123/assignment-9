import {Router} from 'express'
import * as authController from  './controller/auth.js'
const router = Router();
import { LoginSchema, resetPassword, signUpSchema } from "./ValidationUser.js";
// import { validation } from '../../utils/Validation.js';
import { validation } from '../../middleware/validation.js';
import { AuthUser } from '../../middleware/auth.js';
router.get("/" , authController.getAuthModule)


router.post("/register" ,validation(signUpSchema), authController.register)
router.post("/login" , validation(LoginSchema),authController.login)
router.post("/verify-email" , authController.verifyEmail)
router.put("/resetpassword" , AuthUser,validation(resetPassword),authController.resetpassword)

export default  router  