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