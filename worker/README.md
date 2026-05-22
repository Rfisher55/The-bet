# The Bet — Twitter/X Proxy Worker

Cloudflare Worker that proxies Twitter API calls so the Bearer Token
stays server-side and never exposes in browser JavaScript.

## Deploy in 3 steps

### 1. Get a Twitter Bearer Token
- Go to developer.twitter.com
- Create a free app → Keys and Tokens → generate Bearer Token

### 2. Get Cloudflare credentials
- Sign up free at cloudflare.com
- Workers & Pages → your worker → Settings → Account ID (copy it)
- My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template

### 3. Add secrets to GitHub
In your GitHub repo: Settings → Secrets and variables → Actions → New secret

Add these 3 secrets:
- `CLOUDFLARE_API_TOKEN` — your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID
- `TWITTER_BEARER_TOKEN` — your Twitter Bearer Token

Then push any change to `worker/` and the GitHub Action deploys automatically.

## After deploy

Copy your Worker URL from Cloudflare (looks like `https://the-bet-proxy.YOUR-NAME.workers.dev`)
and paste it into `js/config.js`:

```js
window.TWITTER_PROXY_URL = "https://the-bet-proxy.YOUR-NAME.workers.dev";
```

That's it — Twitter intel starts flowing into the breaking news feed immediately.
