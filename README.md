# FeelsMoodMan

This is a Next.js prototype to measure the emotions in Twitch streams as part of the 2024 COIN seminar at the University of Cologne.

## Development

Create a local environment `.env.local` in the root folder and specify the credentials of the Twitch account to be used as a chatbot.

```
TWITCH_BOT_USERNAME=<your_bot_username>
TWITCH_OAUTH_TOKEN=auth:<your_oauth_token>
NEXT_PUBLIC_TWITCH_CLIENT_ID=<your_twitch_client_id>
NEXT_PUBLIC_TWITCH_CLIENT_SECRET=<your_twitch_client_secret>
PROD_BASE_PATH=/twitch-emotion-analysis
```

Run `npm run dev` to start a local server. Open [http://localhost:3000](http://localhost:3000?channel=) with your browser and specify the Twitch channel you want to observe in the URL parameter.

The application will automatically reload if you change any of the source files.

## Production
Run `npm run build` to compile the project. The artifacts will be stored in the dist directory. A hosted instance is available under [https://feelsmoodman.chat](https://feelsmoodman.chat?channel=).

## Further Help

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
