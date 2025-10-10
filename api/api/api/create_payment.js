import MercadoPagoConfig, { Payment } from "mercadopago";

const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

    const {
      token,
      transaction_amount,
      installments,
      payment_method_id,
      description,
      payer
    } = req.body || {};

    if (!transaction_amount || !payer) {
      return res.status(400).json({ error: "transaction_amount e payer são obrigatórios" });
    }

    const payment = new Payment(mp);
    const resp = await payment.create({
      body: {
        transaction_amount: Number(transaction_amount),
        token: token || undefined,
        installments: installments || 1,
        payment_method_id: payment_method_id || undefined,
        description: description || "Compra - KitySexy",
        payer
      }
    });

    res.status(200).json({
      id: resp.id,
      status: resp.status,
      status_detail: resp.status_detail,
      live_mode: resp.live_mode
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Falha ao criar pagamento", message: e.message });
  }
}
export const config = { runtime: "nodejs20.x" };
