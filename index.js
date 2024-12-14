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

async function main() {
  app.use(morgan("tiny"));
  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/success-payment/", validatePayment);

  const str = "https://yoomoney.ru";
  let data = {
    client_id:
      "233D1492C9861952B9DF8725C952117637A7DBA83BAFE78D2C3810AB0AD33953",
    response_type: "code",
    redirect_uri: "http://194.87.31.29:5447/api/success-payment/",
    scope: "money-source('wallet','card')",
  };
  const response = await fetch(str, {
    method: "POST",
    headers: {
      // Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": "191",
    },
    body: new URLSearchParams(data),
  }).then(async (res) => await res.json());
  console.log(response);

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
          "Привет\\! 👋\nЗдесь мы научим тебя создавать стильные бирки:\n✔️ *Печатать бирки для вещей и товаров*\\.\n✔️ *Настроить процесс* для заработка\\.\n✔️ *Прокачать свои вещи или бизнес без затрат*\\.\n\nУзнаешь:\n1️⃣ Как создать дизайн\\.\n2️⃣ Какие материалы и оборудование выбрать\\.\n3️⃣ Как печатать быстро и качественно\\.\n4️⃣ Как сделать из этого прибыльное дело\\.\n\nНачни свой путь к успеху уже сейчас\\!",
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "ЗАДАТЬ ВОПРОС",
                url: "https://t.me/EvgeniAromow",
              },
            ],
            [{ text: "КАНАЛ", url: "https://t.me/targetdysh" }],
            [{ text: "КУПИТЬ", callback_data: "generate_link" }],
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
    // if (msg.text === "/ppt") {
    //   const order_id = "73814993814";
    //   try {
    //     const pay = await prisma.payment.update({
    //       where: { order_id: order_id },
    //       data: { status: true },
    //       select: {
    //         author: true,
    //       },
    //     });
    //     await bot_tg.sendDocument(pay.author.tgId, "./public/материалы.txt");
    //   } catch (error) {
    //     console.log(error);
    //     throw new Error(`${order_id} не обновлен. Ошибка пополнения.`);
    //   }
    // }
  });

  bot_tg.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "generate_link") {
      const message = await bot_tg.sendMessage(chatId, "Генерирую ссылку");
      try {
        const order_id = await createPaymentEntry(query.from.id);
        const link = await createPaymentLink(order_id);
        // const link = "link";
        await bot_tg.answerCallbackQuery(query.id);
        await bot_tg.deleteMessage(chatId, message.message_id);
        await bot_tg.sendMessage(chatId, `[ОПЛАТИТЬ 👈](${link})`, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        });
      } catch (error) {
        await bot_tg.answerCallbackQuery(query.id);
        await bot_tg.deleteMessage(chatId, message.message_id);
        await bot_tg.sendMessage(chatId, `[ОПЛАТИТЬ 👈](${link})`, {
          parse_mode: "Markdown",
        });
        await bot_tg.sendMessage(
          query.message.chat.id,
          `Ошибка генерации ссылки.\n\nНапиши сюда: @GMTUSDT`
        );
      }
    }
  });

  //   https
  //     .createServer(options, app)
  //     .listen(8443, console.log("https be started"));
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
