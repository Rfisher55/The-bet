/**
 * The Bet — Twitter/X Proxy Worker
 * Deployed on Cloudflare Workers (free tier)
 * Holds the Twitter Bearer Token server-side so it's never exposed to browsers.
 */

const TWITTER_API = "https://api.twitter.com/2";

// Queries used by the intel feed
const ENDPOINTS = {
  // General CFB breaking news
  cfb_news: {
    url: `${TWITTER_API}/tweets/search/recent`,
    params: {
      query: `(college football OR CFB) (injury OR fired OR transfer OR commit OR decommit OR "nil deal" OR suspended OR arrested OR "starting lineup") -is:retweet lang:en`,
      "tweet.fields": "created_at,author_id,text,entities",
      "user.fields": "name,username,verified",
      expansions: "author_id",
      max_results: "20",
    },
  },
  // Injury-specific feed
  cfb_injuries: {
    url: `${TWITTER_API}/tweets/search/recent`,
    params: {
      query: `(CFB OR college football) (injury OR injured OR questionable OR "day to day" OR "out for" OR "season ending" OR concussion OR "knee" OR "ankle") -is:retweet lang:en`,
      "tweet.fields": "created_at,author_id,text",
      "user.fields": "name,username,verified",
      expansions: "author_id",
      max_results: "20",
    },
  },
  // Transfer portal & NIL activity
  cfb_portal: {
    url: `${TWITTER_API}/tweets/search/recent`,
    params: {
      query: `(CFB OR college football) (transfer portal OR enters portal OR "nil deal" OR decommit OR flips OR commits) -is:retweet lang:en`,
      "tweet.fields": "created_at,author_id,text",
      "user.fields": "name,username,verified",
      expansions: "author_id",
      max_results: "20",
    },
  },
  // Coach-specific news
  cfb_coaching: {
    url: `${TWITTER_API}/tweets/search/recent`,
    params: {
      query: `(CFB OR college football) (coach fired OR coach hired OR "on the hot seat" OR "buyout" OR coordinator) -is:retweet lang:en`,
      "tweet.fields": "created_at,author_id,text",
      "user.fields": "name,username,verified",
      expansions: "author_id",
      max_results: "15",
    },
  },
};

export default {
  async fetch(request, env) {
    // CORS — allow your GitHub Pages domain + local dev
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = [
      "https://rfisher55.github.io",
      "http://localhost",
      "http://127.0.0.1",
    ];
    const corsOrigin = allowedOrigins.find(o => origin.startsWith(o)) || allowedOrigins[0];

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=180", // cache 3 min at Cloudflare edge
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const endpoint = url.searchParams.get("endpoint") || "cfb_news";

    if (!ENDPOINTS[endpoint]) {
      return new Response(
        JSON.stringify({ error: "Unknown endpoint. Valid: " + Object.keys(ENDPOINTS).join(", ") }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!env.TWITTER_BEARER_TOKEN) {
      return new Response(
        JSON.stringify({ error: "TWITTER_BEARER_TOKEN secret not configured in Worker" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { url: apiUrl, params } = ENDPOINTS[endpoint];
    const apiUrlWithParams = apiUrl + "?" + new URLSearchParams(params).toString();

    try {
      const resp = await fetch(apiUrlWithParams, {
        headers: {
          Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}`,
          "User-Agent": "TheBetCFB/1.0",
        },
      });

      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Twitter rate limited — try again in 15 minutes" }),
          { status: 429, headers: corsHeaders }
        );
      }

      if (!resp.ok) {
        const body = await resp.text();
        return new Response(
          JSON.stringify({ error: `Twitter API error ${resp.status}`, detail: body }),
          { status: resp.status, headers: corsHeaders }
        );
      }

      const data = await resp.json();

      // Flatten authors map for easy lookup by the frontend
      const authorMap = {};
      (data.includes?.users || []).forEach(u => {
        authorMap[u.id] = { name: u.name, username: u.username, verified: u.verified || false };
      });

      const tweets = (data.data || []).map(t => ({
        id: t.id,
        text: t.text,
        created_at: t.created_at,
        author: authorMap[t.author_id] || { name: "Unknown", username: "unknown" },
      }));

      return new Response(
        JSON.stringify({ tweets, meta: data.meta, endpoint, fetched_at: new Date().toISOString() }),
        { headers: corsHeaders }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Worker fetch failed", detail: err.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
