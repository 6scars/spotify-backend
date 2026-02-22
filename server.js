import express from 'express';
import cors from 'cors';
import router from './routes/router.js';
import env from 'dotenv';
import morgan from 'morgan'
import {errorHandler} from './middleware/errorHandler.js'
env.config();


const app = express();
const PORT = process.env.PORT || 3005;
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use("/api", router);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/api/respondTest", (req,res)=>{
  return res.status(201).json({message: "i live"})
})


//It is used for checking state of backend
app.use("/api/health",(req,res)=>{
  console.log(`health check`);
  return res.status(200).send("ok")
})


app.use(errorHandler);