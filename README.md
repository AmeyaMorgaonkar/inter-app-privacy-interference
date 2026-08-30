# Inter-App Privacy Interference

Visualizes how installed Android apps share tracker SDKs, revealing the
cross-app picture advertisers and data brokers can assemble about you.

Built with **Expo (React Native)**, a **Kotlin native module** for
PackageManager access, **Supabase** for backend, and the
**Exodus Privacy** tracker database.

## Project Structure

```
├── App.tsx                        # Entry point
├── app.config.ts                  # Dynamic Expo config (reads .env)
├── modules/
│   └── package-manager/           # Kotlin native module (PackageManager wrapper)
│       ├── expo-module.config.json
│       ├── src/PackageManagerModule.ts
│       └── android/src/main/java/…/PackageManagerModule.kt
├── src/
│   └── lib/
│       └── supabase.ts            # Supabase client
├── .env.example                   # Env template (committed)
└── .env                           # Real credentials (gitignored)
```

## Tech Stack

| Layer               | Choice                                      |
| ------------------- | ------------------------------------------- |
| Mobile app          | React Native (Expo, EAS Build, dev client)  |
| Native module       | Kotlin (Android PackageManager)             |
| Backend             | Supabase (Postgres, Edge Functions)         |
| External data       | Exodus Privacy API (server-side, scheduled) |
| Graph visualization | React Flow / D3.js                          |
