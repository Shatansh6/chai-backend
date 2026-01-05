import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookieParser';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
app.use(json({limit:'16kb'}))
app.use(urlencoded({extended:true,limit:'16kb'}));
app.use(cookieParser());
export {app};