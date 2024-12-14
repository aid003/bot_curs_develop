import expressAsyncHandler from "express-async-handler";
import { bot_tg, prisma } from "../index.js";

export const validatePayment = expressAsyncHandler(async (req, res) => {
  const { order_id, amount, profit } = req.body;

  console.log(req.body);

  if (!order_id || !amount || profit) {
    throw new Error("Ошибка обработки успешного заказа");
  }

  try {
    const pay = await prisma.payment.update({
      where: { order_id: order_id },
      data: { status: true },
      select: {
        author: true,
      },
    });
    await bot_tg.sendDocument(pay.author.tgId, "../public/материалы.txt");
  } catch (error) {
    console.log(error);
    throw new Error(`${order_id} не обновлен. Ошибка пополнения.`);
  }
});
