# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Android app, built with Capacitor, with its own icon and launch screen. GitHub Actions builds a debug APK
  on every push to `main`.
- Tones to interval question type: given a number of tones, name the interval. When two intervals share a
  size (A4 and d5), only one of them, picked at random, is offered as an answer.
- Degree to chord question type: given a key and a scale degree (tonic, supertonic, and so on), name the
  chord's root, quality, and optionally the quality of its 7th, all on one screen. Options for major or
  minor keys, harmonic or natural minor, triads or seventh chords, and which degrees to practice.
- Options for each question type, behind a gear button on its card:
  - Find the note and Name the interval: choose which intervals to practice.
  - Notes to tones and Interval to tones: choose the range (within an octave, up to a 13th, or within
    two octaves) and which interval numbers to use (all, odd only, or even only).
- Compound intervals (9ths to 14ths) for tone questions, with octave numbers on the notes.
- Four question types: find the note, name the interval, notes to tones, and interval to tones.
- Session options: question types, order (round robin, random, or custom odds), length (including
  unlimited), note names (letters, solfège, or both), and accidentals (sharps, flats, both, or random).
- Results screen with score, accuracy per question type, and missed questions.
- Settings are saved in the browser between visits.
- Light and dark themes, and a layout that works on phones.
- Unit tests for the theory and quiz logic.
- Initial repository structure, README, license, and contribution guidelines.

### Changed

- You can now untick every question type on the settings screen, which makes it easier to pick exactly
  the ones you want. Start stays disabled until at least one is ticked.

### Removed

- The octave is no longer asked about in any question type.
