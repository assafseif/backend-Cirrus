import "./config/MongoConfig.js";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import AuthRoutes from "./routes/AuthRoutes.js";
import TeacherRoutes from "./routes/TeacherRoutes.js";
import StudentRoutes from "./routes/StudentRoutes.js";
import { errorHandler } from "./utils/errorHandler.js";
const __dirname = path.resolve();
dotenv.config();

//INITIALIZATION
const app = express();

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(cors());
app.use(bodyParser.json());

//ROUTES

app.use("/api/auth", AuthRoutes);
app.use("/api/teachers", TeacherRoutes);
app.use("/api/students", StudentRoutes);

//ERROR HANDLERS
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
