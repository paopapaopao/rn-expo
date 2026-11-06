# rn-expo

An [Expo](https://expo.dev) app for Android, iOS, and web, created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm dev
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
- web browser

Start editing in `App.tsx`.

## Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `pnpm start`           | Start the dev server                         |
| `pnpm dev`             | Start the dev server                         |
| `pnpm dev:web`         | Start and open in a web browser              |
| `pnpm dev:android`     | Start and open on Android                    |
| `pnpm dev:ios`         | Start and open on iOS                        |
| `pnpm lint`            | Lint and check formatting (ESLint, Prettier) |
| `pnpm test`            | Run unit tests (Jest)                        |
| `pnpm test:e2e:web`    | Run web end-to-end tests (Playwright)        |
| `pnpm test:e2e:mobile` | Run mobile end-to-end tests (Maestro)        |
| `pnpm build:apk`       | Build an installable Android APK (EAS)       |

`pnpm test:e2e:mobile` needs the [Maestro CLI](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli) and the app installed on an emulator or simulator.

## Build an APK

```bash
pnpm build:apk
```

Builds an installable Android APK with [EAS Build](https://docs.expo.dev/build/introduction/).

## Learn more

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
