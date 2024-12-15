import TelegramBot from "node-telegram-bot-api";
import express from "express";
import morgan from "morgan";
import https from "https";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { createPaymentLink } from "./controllers/CreatePaymentLink.service.js";
import { validatePayment } from "./controllers/ValidatePayment.service.js";
import { registerUser } from "./controllers/RegisterUser.service.js";
import { createPaymentEntry } from "./controllers/CreatePaymentEntry.service.js";

dotenv.config();

export const bot_tg = new TelegramBot(process.env.API_KEY_BOT, {
  polling: {
    interval: 200,
  },
});
export const prisma = new PrismaClient();
export const app = express();
export let buttonPay = "";

async function main() {
  app.use(morgan("tiny"));
  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/success-payment/", validatePayment);

  bot_tg.on("polling_error", (err) => console.log(err.data.error.message));
  app.listen(
    process.env.PORT,
    console.log(
      `🚀 Server and TG-bot running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
    )
  );

  bot_tg.on("message", async (msg) => {
    if (msg.text === "/start") {
      await bot_tg.sendPhoto(msg.chat.id, "./public/main.jpg", {
        caption:
          '*Бирки, которые приносят деньги*\n\nЛюди всегда стремились к люксовой одежде, чтобы прибавить веса в чужих глазах\\.\n\nGucci, Versace, Stone Island, Balenciaga – бренды, о которых мечтают все\\.\n\nТак почему бы не заработать на этом\\?\n\nЯ уже порядка 3\\-х лет кручусь в сфере дропшипа и нашёл одну из самых прибыльных ниш — бирки\\.\n\nОкупаются в моменте и требуют минимум усилий\\.\n\nНесмотря на мифы о том, что рынок якобы "перенасыщен", спрос остаётся стабильно высоким\\.\n\nКто\\-то говорит, а кто\\-то действует\\. Правда\\?\\)\n\nПоэтому я создал курс по пошиву и продаже бирок и протестировал его на заряженных ребятах, которые уже зарабатывают от 60 000₽/мес, тратя всего 2\\-3 часа в день\\.\n\nЧто ты получишь на курсе:\n\n→ Пошаговый план по созданию и продаже бирок\\.\n→ Навык работы с макетами \\(дизайн, Matrix и QR\\-коды\\)\\.\n→ Секреты продаж: где искать клиентов и как избегать рисков\\.\n→ Реальный заработок от 50 000₽ уже в первый месяц\\.\n\n*Ты научишься не просто создавать бирки, а выстраивать бизнес, который будет приносить деньги стабильно ↓↓↓*',
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [{ text: "👉КУПИТЬ КУРС", callback_data: "generate_link" }],
            [
              {
                text: "КУПИТЬ ГОТОВЫЕ БИРКИ👈",
                url: "https://t.me/Guaraon",
              },
            ],
            [
              {
                text: "НАШЕ КОМЬЮНИТИ🤌",
                url: "https://t.me/+Nc7RpleUQDoxNTky",
              },
            ],
            [{ text: "СВЯЗЬ🤙", url: "https://t.me/denimerfi" }],
          ],
        },
      });
      await registerUser(msg);
    }
    if (msg.text === "/oferta") {
      await bot_tg.sendMessage(
        msg.chat.id,
        "https://telegra.ph/Dogovor-oferty-12-11"
      );
    }
    if (msg.text === "/statistics_for_analitics") {
      const register = await prisma.user.count();
      const chekCount = await prisma.payment.count();
      const success = await prisma.payment.findMany({
        where: { status: true },
      });
      await bot_tg.sendMessage(
        msg.chat.id,
        `СТАТИСТИКА\n\n\nЗарегистрировано: ${register}\nВыставлено чеков: ${chekCount}\nЧеков оплачено: ${
          success.length
        }\n\n\nКонверсия в сделку: ${parseFloat(
          (success.length / register) * 100
        ).toFixed(2)}%`
      );
    }
  });

  bot_tg.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "generate_link") {
      const message = await bot_tg.sendMessage(chatId, "Генерирую ссылку");
      try {
        const order_id = await createPaymentEntry(query.from.id);
        try {
          const link = await createPaymentLink(order_id);
          await bot_tg.answerCallbackQuery(query.id);
          await bot_tg.deleteMessage(chatId, message.message_id);
          buttonPay = await bot_tg.sendMessage(
            chatId,
            `Отдаю за скромную цену: ||*4990₽*||\n\n[ОПЛАТИТЬ 👈](${link})`,
            {
              parse_mode: "MarkdownV2",
              disable_web_page_preview: true,
            }
          );
        } catch (error) {
          await bot_tg.answerCallbackQuery(query.id);
          await bot_tg.deleteMessage(chatId, message.message_id);
          console.log(error);
          await bot_tg.sendMessage(
            query.message.chat.id,
            `Ошибка генерации ссылки для оплаты.\nПопробуй еще раз. Непомогло?\n\nТогда 👇\nНапиши текст ошибки сюда: @GMTUSDT`
          );
        }
      } catch (error) {
        await bot_tg.answerCallbackQuery(query.id);
        await bot_tg.deleteMessage(chatId, message.message_id);
        console.log(error);
        await bot_tg.sendMessage(
          query.message.chat.id,
          `Ошибка генерации сущности.\n\nНапиши текст ошибки сюда: @GMTUSDT`
        );
      }
    }
  });
}

await main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
