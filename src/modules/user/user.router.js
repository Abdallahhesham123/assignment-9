import {Router} from 'express'
import * as userController from  './controller/user.js'
import { AuthUser } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import {  updateSchema ,headersSchema } from "./crudValidationuser.js";
const router = Router();


router.get("/" ,  AuthUser,userController.getUserModule)
router.get("/getProfile" ,  AuthUser,userController.getProfile)

//update with diffrent methode
router.put("/findByIdAndUpdate" ,validation(updateSchema), AuthUser,userController.findByIdAndUpdate)
//delete with diffrent methode
router.delete("/findOneAndDelete" , validation(headersSchema),AuthUser, userController.findOneAndDelete)
//soft-delete
router.put("/softDelete" , AuthUser,userController.softDelete)
router.put("/restoretodatabase" , AuthUser,userController.restoretodatabase)







export default  router