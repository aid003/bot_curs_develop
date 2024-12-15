import expressAsyncHandler from "express-async-handler";
import { bot_tg, prisma } from "../index.js";

export const validatePayment = expressAsyncHandler(async (req, res) => {
  const { label, unaccepted, operation_id, amount } = req.body;

  console.log(label, unaccepted, operation_id, amount);
});
