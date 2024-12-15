import expressAsyncHandler from "express-async-handler";
import { bot_tg, prisma } from "../index.js";

export const validatePayment = expressAsyncHandler(async (req, res) => {
  // const { order_id, amount, profit } = req.body;

  console.log(req.body);
});
