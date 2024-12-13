import { prisma } from "../index.js";

function getRandomNumber(min, max) {
  if (typeof min !== "number" || typeof max !== "number") {
    throw new Error("Оба аргумента должны быть числами");
  }
  if (min > max) {
    throw new Error("Минимальное значение не может быть больше максимального");
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function createPaymentEntry(tgId) {
  if (!tgId) {
    throw new Error("Нет tg id");
  }

  const data = await prisma.payment.create({
    data: {
      tgId: tgId.toString(),
      order_id: (
        Math.round(tgId * 10.14356) + getRandomNumber(1, 10000)
      ).toString(),
    },
  });

  return data.order_id;
}
