import axios from "axios";
import sha256 from "sha256";

export async function createPaymentLink(order_id) {
  let data = {
    merchant_id: process.env.MERCHANT_ID,
    amount: process.env.PRICE,
    secret: process.env.PUBLIC_SECRET_1,
    desc: "Курс по созданию аутентичных бирок",
    currency: "RUB",
    method: "sbp",
    lang: "ru",
    order_id: order_id.toString(),
    sign: "",
  };

  data.sign = sha256(
    `${data.merchant_id}:${data.amount}:${data.currency}:${data.secret}:${data.order_id}`
  );

  const str = "https://aaio.so/merchant/get_pay_url";

  const response = await fetch(str, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  }).then(async (res) => await res.json());

  console.log(response);

  if (response.type === "fail" || [200, 400, 401].includes(response.code)) {
    throw new Error(response.message);
  }

  return response.url;
}
