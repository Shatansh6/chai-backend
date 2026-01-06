import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-Parser';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
app.use(json({limit:'16kb'}))
app.use(urlencoded({extended:true,limit:'16kb'}));
app.use(cookieParser());

import userRouter from './routes/user.route.js'
app.use('/api/v1/users',userRouter);

export {app};