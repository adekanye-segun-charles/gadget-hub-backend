# Gadget Hub backend

This folder contains the Express API, Prisma schema, migrations, and backend tests.
For complete local setup and production configuration, see the project [README](../README.md).

From this folder:

```powershell
npm install
npm run db:generate
npm run db:migrate:deploy
npm test
npm start
```

Set environment values in `.env` before starting the API. Do not commit `.env`.

## Paystack checkout

The API needs `PAYSTACK_SECRET_KEY` set to the secret key from the Paystack dashboard:

- Use an `sk_test_...` key for test payments or an `sk_live_...` key for live payments.
- A `pk_...` public key is not valid for backend payment initialization. `PAYSTACK_PUBLIC_KEY` does not replace `PAYSTACK_SECRET_KEY`.
- For the deployed API, add `PAYSTACK_SECRET_KEY` in the Render backend service's **Environment** settings, then save and redeploy/restart the service. Local `.env` values are not deployed when code is pushed.

Never commit or share the secret key. If a key was exposed, revoke it and create a replacement in Paystack.