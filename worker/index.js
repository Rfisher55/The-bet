/**
 * The Bet — Twitter/X Proxy Worker
 * Cloudflare Workers (free tier)
 * Twitter Bearer Token stays server-side, never exposed to browsers.
 */

const CORS_ORIGINS = [
  "https://rfisher55.github.io",
  "http://localhost",
  "http://127.0.0.1",
];

const QUERIES = {
  cfb_news:     '(college football OR CFB OR #CFB) -is:retweet lang:en',
  cfb_injuries: '(college football OR CFB) (injury OR injured OR questionable OR out OR limited OR DNP) -is:retweet lang:en',
  cfb_portal:   '(transfer portal OR NIL OR commit OR decommit OR #CFBTransfer) -is:retweet lang:en',
  cfb_coaching: '(college football) (fired OR hired OR "hot seat" OR buyout OR "head coach") -is:retweet lang:en',
  cfb_insider:  '(CFB OR college football) (spotted OR arrested OR suspended OR dismissed OR violation OR fight OR bar OR party OR incident) -is:retweet lang:en',
};

function corsHeaders(origin) {
  const allowed = CORS_ORIGINS.some(o => origin && origin.startsWith(o))
    ? origin
    : CORS_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "cfb_news";
    const query = QUERIES[endpoint] || QUERIES.cfb_news;
    const maxResults = Math.min(parseInt(searchParams.get("max") || "20", 10), 50);

    const twitterUrl = new URL("https://api.twitter.com/2/tweets/search/recent");
    twitterUrl.searchParams.set("query", query);
    twitterUrl.searchParams.set("max_results", String(maxResults));
    twitterUrl.searchParams.set("tweet.fields", "created_at,author_id,text,entities");
    twitterUrl.searchParams.set("expansions", "author_id");
    twitterUrl.searchParams.set("user.fields", "username,name,verified");

    try {
      const resp = await fetch(twitterUrl.toString(), {
        headers: { Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}` },
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return new Response(
          JSON.stringify({ error: "Twitter API error", status: resp.status, detail: errText }),
          { status: resp.status, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      const data = await resp.json();
      const usersMap = {};
      (data.includes?.users || []).forEach(u => { usersMap[u.id] = u; });

      const tweets = (data.data || []).map(t => ({
        id:         t.id,
        text:       t.text,
        created_at: t.created_at,
        author:     usersMap[t.author_id] || null,
      }));

      return new Response(
        JSON.stringify({ tweets, meta: data.meta }),
        { headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Worker error", detail: err.message }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }
  },
};
