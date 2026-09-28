import { getStore } from "@netlify/blobs";

export default async (req) => {
  // Chave só do advogado (defina CHAVE_ADMIN no Netlify). Sem ela configurada, ninguém acessa.
  const chave = Netlify.env.get("CHAVE_ADMIN");
  const k = new URL(req.url).searchParams.get("k");
  if (!chave || k !== chave) return new Response("Acesso negado", { status: 403 });

  const store = getStore("avaliacoes");
  const { blobs } = await store.list();

  const linhas = await Promise.all(
    blobs.map(async (b) => [(await store.get(b.key)) || "", b.key.split("-")[0]])
  );
  linhas.sort((a, b) => a[0].localeCompare(b[0]));

  const csv = "data,nota\n" + linhas.map((l) => l.join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="avaliacoes.csv"',
      "cache-control": "no-store"
    }
  });
};

export const config = { path: "/api/exportar" };
