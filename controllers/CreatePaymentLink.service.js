import axios from "axios";
import { urlencoded } from "express";
import sha256 from "sha256";

export async function createPaymentLink(order_id) {
  const link = process.env.LINK_FOR_CREATE_FORM;

  let data = {
    receiver: process.env.WALLET_MERCHANT,
    "quickpay-form": "button",
    paymentType: process.env.TYPE_PAYMENT,
    sum: process.env.SUMM,
    label: order_id.toString(),
    successURL: process.env.SUCCESS_URL,
  };

  const response = await fetch(link, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  });

  if (response.status === 200 && response.statusText === "OK" && response.url) {
    return response.url;
  } else {
    throw new Error("Ошибка выставления счета");
  }
}
