Krishna Hair Look - Telegram setup

1. index.html keeps the existing embedded photos/logo/QR and does NOT contain the Telegram bot token.
2. Deploy supabase/functions/telegram-booking/index.ts as a Supabase Edge Function.
3. Add these Supabase secrets:
   TELEGRAM_BOT_TOKEN = YOUR_NEW_BOT_TOKEN
   TELEGRAM_CHAT_ID = 8670536683
4. Put the deployed function URL into:
   const TELEGRAM_BOOKING_ENDPOINT = "";
   in index.html
5. Do not share the bot token in chat or put it in index.html.

IMPORTANT:
If the bot token was previously exposed, revoke/regenerate it in BotFather before using it.
