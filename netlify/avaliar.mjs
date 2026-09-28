import { getStore } from "@netlify/blobs";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ erro: "Método não permitido" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ erro: "Requisição inválida" }, 400); }

  // Chave secreta que vai no link enviado ao cliente (defina CHAVE_AVALIACAO no Netlify)
  const chave = Netlify.env.get("CHAVE_AVALIACAO");
  if (chave && body.k !== chave) return json({ erro: "Link inválido" }, 403);

  // Campo isca: robôs costumam preenchê-lo, pessoas não
  if (body.site) return json({ ok: true });

  const nota = Number(body.nota);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) return json({ erro: "Nota inválida" }, 400);

  // A nota vai no nome da chave ("4-uuid"), assim a média é calculada sem ler cada registro
  await getStore("avaliacoes").set(`${nota}-${crypto.randomUUID()}`, new Date().toISOString());
  return json({ ok: true });
};

export const config = { path: "/api/avaliar" };
