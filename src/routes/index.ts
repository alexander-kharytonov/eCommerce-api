import { Router } from "express";
import { categoryRouter } from "./categoryRoutes";
import { orderRouter } from "./orderRoutes";
import { productRouter } from "./productRoutes";
import { userRouter } from "./userRoutes";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/orders", orderRouter);
