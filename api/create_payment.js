import MercadoPagoConfig, { Payment } from "mercadopago";

// CORS (na produção, deixe apenas seu domínio Wix)
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
      token,                 // token do cartão (cartão)
      transaction_amount,    // número (ex.: 297.00)
      installments,          // número (ex.: 1)
      payment_method_id,     // 'master', 'visa' (opcional)
      description,           // texto
      payer                  // { email, first_name, last_name, identification, address }
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

    return res.status(200).json({
      id: resp.id,
      status: resp.status,               // approved | rejected | in_process
      status_detail: resp.status_detail, // accredited | motivo
      live_mode: resp.live_mode
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Falha ao criar pagamento", message: e.message });
  }
}

// força Node 20
export const config = { runtime: "nodejs20.x" };
