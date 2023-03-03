import {Router} from 'express'
import * as MessageController from  './controller/message.js'
import { validation } from '../../middleware/validation.js';
import { messageSchema} from "./message.validation.js";
import { AuthUser } from '../../middleware/auth.js';
const router = Router();


router.get("/getALLMessages" ,AuthUser, MessageController.getALLMessages)//allmessages
router.get("/getMessageprivate/:id" ,MessageController.getMessageprivate)


router.post("/add-message/:receiverId" ,validation(messageSchema),  AuthUser,MessageController.sendMessage)
export default  router