# Tasbeeh

[![Build APK](https://github.com/MhamzaM/tasbeeh/actions/workflows/build.yml/badge.svg)](https://github.com/MhamzaM/tasbeeh/actions/workflows/build.yml)

**A dhikr counter with no ads.** Part of [FreeApps by Hamza](https://mhamzam.github.io).

Many tasbeeh apps show ads, sometimes inappropriate ones, in the middle of dhikr, or make you watch a video before you can reset. This one never will.

## Features
- Tap anywhere on the screen to count, or use the **volume buttons** (up counts, down undoes) without looking at the phone.
- A ring of beads fills as you count, like a real tasbeeh.
- **Tasbeeh-e-Fatima**: 33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar, moving on automatically.
- Common adhkar with Arabic text and meaning, plus your own with any target.
- A gentle vibration on each count and a stronger one at the target.
- Dim mode for counting at night, keep-screen-on, undo, and hold-to-reset so nothing resets by accident.
- History: today's count, the last 7 days and your streak.
- English and Urdu (with Urdu numerals).

## Privacy
No internet permission. Counts and history are stored only on the phone. The only permission is vibration.

## Tech
The counter is plain HTML/CSS/JavaScript in `app/src/main/assets/app/`. A single Java activity shows it and adds volume-button counting, vibration, keep-screen-on and dimming. No libraries.

## Build
Open in Android Studio and press Run, or `./gradlew assembleDebug`. Pushing a tag like `v1.0` publishes a release with `Tasbeeh.apk`.
