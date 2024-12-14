import { prisma } from "../index.js";

export async function registerUser(msg) {
  if (!msg.from.id) {
    throw new Error("Ошибка получения tg_id");
  }

  try {
    await prisma.user.create({
      data: {
        tgId: msg.from.id.toString(),
        userName: msg.from.username ? msg.from.username : "no username",
        name: msg.from.first_name ? msg.from.first_name : "no name",
      },
    });
  } catch (error) {
    console.log(
      `Ошибка регистрации пользователя или пользователь существует: ${error}`
    );
  }
}
