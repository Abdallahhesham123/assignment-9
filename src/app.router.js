import authRouter from './modules/auth/auth.router.js';
import userRouter from './modules/user/user.router.js'
import messageRouter from './modules/message/message.router.js';
import connectDB from '../DB/connection.js';
import { globalErrorHandler } from './utils/errorHandling.js';




const initApp = (app, express) => {

    app.use(express.json({}))

    app.get('/', (req, res) => res.send('Hello World!'))

    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/message', messageRouter)

    app.all("*" , (req,res)=>{
        return res.json({message:"404 Page Not Found"})
    })

    app.use(globalErrorHandler)
    // connection DB
    connectDB()

}


export default initApp