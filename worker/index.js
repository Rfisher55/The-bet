// The Bet — Twitter/X Proxy Worker (service worker format)
// Secrets are injected as globals by Cloudflare (TWITTER_BEARER_TOKEN)

var CORS_ORIGINS = [
  "https://rfisher55.github.io",
  "http://localhost",
  "http://127.0.0.1",
];

var QUERIES = {
  cfb_news:     "(college football OR CFB OR #CFB) -is:retweet lang:en",
  cfb_injuries: "(college football OR CFB) (injury OR injured OR questionable OR out OR limited) -is:retweet lang:en",
  cfb_portal:   "(transfer portal OR NIL OR commit OR decommit OR #CFBTransfer) -is:retweet lang:en",
  cfb_coaching: "(college football) (fired OR hired OR \"hot seat\" OR buyout OR \"head coach\") -is:retweet lang:en",
  cfb_insider:  "(CFB OR college football) (spotted OR arrested OR suspended OR dismissed OR violation OR fight OR bar OR party OR incident) -is:retweet lang:en",
};

function corsHeaders(origin) {
  var allowed = CORS_ORIGINS.some(function(o) { return origin && origin.startsWith(o); })
    ? origin : CORS_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

addEventListener("fetch", function(event) {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (typeof TWITTER_BEARER_TOKEN === "undefined") {
    return new Response(JSON.stringify({ error: "Worker misconfigured — secret not set" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  var origin = request.headers.get("Origin") || "";
  var headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: headers });
  }

  var url = new URL(request.url);
  var endpoint = url.searchParams.get("endpoint") || "cfb_news";
  var query = QUERIES[endpoint] || QUERIES.cfb_news;
  var maxResults = Math.min(parseInt(url.searchParams.get("max") || "20", 10), 50);

  var twitterUrl = "https://api.twitter.com/2/tweets/search/recent" +
    "?query=" + encodeURIComponent(query) +
    "&max_results=" + maxResults +
    "&tweet.fields=created_at,author_id,text" +
    "&expansions=author_id" +
    "&user.fields=username,name,verified";

  try {
    var resp = await fetch(twitterUrl, {
      headers: { "Authorization": "Bearer " + TWITTER_BEARER_TOKEN },
    });

    if (!resp.ok) {
      var errText = await resp.text();
      return new Response(
        JSON.stringify({ error: "Twitter API error", status: resp.status, detail: errText }),
        { status: resp.status, headers: Object.assign({}, headers, { "Content-Type": "application/json" }) }
      );
    }

    var data = await resp.json();
    var usersMap = {};
    ((data.includes && data.includes.users) || []).forEach(function(u) { usersMap[u.id] = u; });

    var tweets = (data.data || []).map(function(t) {
      return {
        id:         t.id,
        text:       t.text,
        created_at: t.created_at,
        author:     usersMap[t.author_id] || null,
      };
    });

    return new Response(
      JSON.stringify({ tweets: tweets, meta: data.meta }),
      { headers: Object.assign({}, headers, { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" }) }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Worker error", detail: err.message }),
      { status: 500, headers: Object.assign({}, headers, { "Content-Type": "application/json" }) }
    );
  }
}
