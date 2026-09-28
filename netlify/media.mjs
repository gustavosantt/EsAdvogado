import { getStore } from "@netlify/blobs";

export default async () => {
  const { blobs } = await getStore("avaliacoes").list();
  const notas = blobs.map(b => Number(b.key.split("-")[0])).filter(n => n >= 1 && n <= 5);
  const total = notas.length;
  const media = total ? Math.round((notas.reduce((a, b) => a + b, 0) / total) * 10) / 10 : 0;

  return new Response(JSON.stringify({ media, total }), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=60" }
  });
};

export const config = { path: "/api/media" };
