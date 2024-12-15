import expressAsyncHandler from "express-async-handler";
import { bot_tg, buttonPay, prisma } from "../index.js";

export const validatePayment = expressAsyncHandler(async (req, res) => {
  // const { label, unaccepted, operation_id, amount } = req.body;
  const { label, unaccepted, operation_id } = req.body;

  console.log(label, unaccepted, operation_id);

  if (unaccepted === true) {
    const obj = await prisma.payment.findUnique({
      where: {
        order_id: label,
      },
      select: {
        tgId: true,
      },
    });

    await bot_tg.sendMessage(
      obj.tgId,
      `Ваш платеж был заморожен. Деньги не были зачислены на счет.\nОбычно это решается в течении часа.\nНомер операции: ${operation_id}\n\n\nЕсли нет, напишите текст ошибки сюда: @GMTUSDT`
    );
  } else {
    try {
      const obj = await prisma.payment.update({
        where: {
          order_id: label,
        },
        data: {
          status: true,
        },
        select: {
          tgId: true,
        },
      });

      await bot_tg.sendDocument(obj.tgId, "../public/материалы.txt");
    } catch (error) {
      console.log(error);
      const obj = await prisma.payment.findUnique({
        where: {
          order_id: label,
        },
        select: {
          tgId: true,
        },
      });
      await bot_tg.sendMessage(
        obj.tgId,
        `Вы успешно оплатили заказ. Но по техническим причинам не получили материалы.\nКод платежа: ${operation_id}\n\n\nНапишите код платежа сюда: @GMTUSDT`
      );
    }
  }
});
