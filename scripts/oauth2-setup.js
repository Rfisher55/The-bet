#!/usr/bin/env node
/* oauth2-setup.js — one-time OAuth 2.0 setup for @TheBetCFB
   Run via GitHub Actions workflow x-oauth2-setup.yml

   Step 1 (action=generate): prints auth URL + code verifier
   Step 2 (action=exchange): exchanges code for refresh token
*/
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');

const CLIENT_ID     = process.env.X_OAUTH2_CLIENT_ID;
const CLIENT_SECRET = process.env.X_OAUTH2_CLIENT_SECRET;
const CALLBACK      = 'https://localhost/';

async function main() {
  const action = process.argv[2];

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing X_OAUTH2_CLIENT_ID or X_OAUTH2_CLIENT_SECRET in secrets');
    process.exit(1);
  }

  const client = new TwitterApi({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });

  if (action === 'generate') {
    const { url, codeVerifier } = client.generateOAuth2AuthLink(CALLBACK, {
      scope: ['tweet.write', 'tweet.read', 'users.read', 'offline.access'],
    });

    console.log('\n════════════════════════════════════════');
    console.log('   STEP 1 — Visit this URL on your phone');
    console.log('════════════════════════════════════════\n');
    console.log(url);
    console.log('\n════════════════════════════════════════');
    console.log('   SAVE THIS — CODE VERIFIER (need for Step 2)');
    console.log('════════════════════════════════════════\n');
    console.log(codeVerifier);
    console.log('\n════════════════════════════════════════');
    console.log('   WHAT TO DO NEXT');
    console.log('════════════════════════════════════════');
    console.log('1. Visit the URL above on your phone');
    console.log('2. Tap "Authorize app" on X');
    console.log('3. X redirects to https://localhost/?code=XXXXXX');
    console.log('4. The page will fail — that is normal');
    console.log('5. Copy just the CODE part from the URL bar');
    console.log('   (everything after "code=" and before "&state")');
    console.log('6. Run this workflow again with action=exchange');
    console.log('   Paste the code into OAUTH2_CODE');
    console.log('   Paste the verifier above into OAUTH2_CODE_VERIFIER');

  } else if (action === 'exchange') {
    const code         = process.env.OAUTH2_CODE;
    const codeVerifier = process.env.OAUTH2_CODE_VERIFIER;

    if (!code || !codeVerifier) {
      console.error('❌ Missing OAUTH2_CODE or OAUTH2_CODE_VERIFIER inputs');
      process.exit(1);
    }

    console.log('Exchanging code for tokens...');

    const { accessToken, refreshToken } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: CALLBACK,
    });

    // Mask both tokens before any logging so they are redacted in GitHub Actions logs
    process.stdout.write('::add-mask::' + refreshToken + '\n');
    process.stdout.write('::add-mask::' + accessToken + '\n');

    console.log('\n════════════════════════════════════════');
    console.log('   ✅ SUCCESS — Add this to GitHub secrets');
    console.log('════════════════════════════════════════\n');
    console.log('Secret name:  X_OAUTH2_REFRESH_TOKEN');
    console.log('Secret value:', refreshToken);
    console.log('\n(Access token — valid 2 hrs, for testing only)');
    console.log(accessToken);

  } else {
    console.error('Usage: node oauth2-setup.js generate|exchange');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});
