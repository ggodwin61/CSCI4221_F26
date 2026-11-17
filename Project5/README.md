# Project 5 — Create your apps using AI

**Garret Godwin · CSCI 4221 · Group 1**

Campus Navigator is a React Native and Expo app for iPhone and Android. It lets users find rooms on Floor 1 of Albany State University's Billy C. Black Building and view them on an illustrated indoor map.

- [Five-section AI prompt](ai-prompt.md)
- [Prototype images](prototypes/)
- [Individual meeting notes and backlog](minutes.md)
- [Expo project](../mobile/) · [Native entry point](../mobile/index.js) · [Home and navigation](../mobile/App.jsx)

## Run the app locally

Open the repository folder in VS Code and use its integrated terminal. The mobile app uses Expo SDK 58 and requires a compatible Node.js LTS release, such as Node 22.13 or newer in the 22.x series. From the repository root:

```sh
cd mobile
npm ci
npm start
```

If the system's Node is still version 20, run the commands below from `mobile/`:

```sh
npm exec --yes --package=node@22 -- npm ci
npm exec --yes --package=node@22 -- npm start
```

Open the displayed QR code with the iPhone Camera or Expo Go on Android. Use Expo Go compatible with SDK 58 and the same Wi-Fi as the development computer. If Expo requests sign-in on iPhone, sign in with the same Expo account on the phone and in Expo CLI. The app bundles the BCB directory and illustration, so it runs independently of the Express server.

## Demonstrate the home screen

1. Tap **Billy C. Black Building** on Home. The building details open. Tap **Floor 1** to open the room list.
2. Return to Home and tap **Settings** in the bottom navigation. Tap **App appearance** to switch between light and dark.
3. From Home, search for **BCB 119** or **142**, then tap the result to highlight it. Tap **Save room** and choose **Saved** to reopen it from your saved list.

Garret confirmed the app opened on an iPhone through Expo Go. Metro exported the iOS and Android bundles successfully. Android hardware testing is pending.

## Group repository setup

The instructor's Group 1 repository was cloned on November 17, 2026. The checkout used to review the team materials was at commit `03fe93938b78b1cc9a6d371743aeaa3db26e27d7`. [Group 1 repository](https://github.com/CSCI4221ASU/Fall26_G1/tree/03fe93938b78b1cc9a6d371743aeaa3db26e27d7)

```sh
git clone https://github.com/CSCI4221ASU/Fall26_G1.git
```

The course requires each student to watch the first nine assigned React Native tutorial videos. Viewing is a student activity and is pending confirmation here.

Submit the [personal repository link](https://github.com/ggodwin61/CSCI4221_F26) in GeorgiaView.
