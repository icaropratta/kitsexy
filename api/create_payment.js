// api/create_payment.js
import MercadoPagoConfig, { Payment } from "mercadopago";

// Configuração de CORS (libera apenas seu domínio Wix em produção)
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    // Instancia o Mercado Pago com seu Access Token (vem das variáveis de ambiente no Vercel)
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

    // Lê os dados enviados pelo frontend
    const {
      token,                 // token do cartão (quando for cartão)
      transaction_amount,    // valor da compra
      installments,          // número de parcelas
      payment_method_id,     // ex: 'master', 'visa'
      description,           // descrição do produto
      payer                  // dados do comprador (email, nome, cpf, endereço)
    } = req.body || {};

    if (!transaction_amount || !payer) {
      return res.status(400).json({ error: "transaction_amount e payer são obrigatórios" });
    }

    // Cria o pagamento
    const payment = new Payment(mp);
    const resp = await payment.create({
      body: {
        transaction_amount: Number(transaction_amount),
        token: token || undefined,              // usado em cartões
        installments: installments || 1,
        payment_method_id: payment_method_id || undefined,
        description: description || "Compra - KitySexy",
        payer
      }
    });

    // Resposta simplificada para o frontend
    return res.status(200).json({
      id: resp.id,
      status: resp.status,               // approved | rejected | in_process
      status_detail: resp.status_detail, // accredited | motivo rejeição
      live_mode: resp.live_mode
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Falha ao criar pagamento", message: e.message });
    
  }
}

// Força runtime Node 20 no Vercel
export const config = { runtime: "nodejs20.x" };
