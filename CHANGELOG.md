# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-11-14

First release.

### Added

- Six question types:
  - **Find the note:** given a root note and an interval, find the other note.
  - **Name the interval:** given two notes, name the interval between them.
  - **Notes to tones:** given two notes, count how many tones apart they are.
  - **Interval to tones:** given an interval, say how many tones it spans.
  - **Tones to interval:** given a number of tones, name the interval. When two intervals share a size
    (A4 and d5), only one of them, picked at random, is offered as an answer.
  - **Degree to chord:** given a key and a scale degree, name the chord's root, quality, and optionally the
    quality of its 7th, all on one screen.
- Options for each question type, behind a gear button on its card:
  - Find the note and Name the interval: choose which intervals to practice.
  - Tone questions: choose the range (within an octave, up to a 13th, or within two octaves) and which
    interval numbers to use (all, odd only, or even only). Past the octave, notes show octave numbers.
  - Degree to chord: major or minor keys, harmonic or natural minor, triads or seventh chords, and which
    degrees to practice.
- Session options: question types, order (round robin, random, or custom odds), length (including
  unlimited), note names (letters, solfège, or both), and accidentals (sharps, flats, both, or random).
- Results screen with score, accuracy per question type, and missed questions.
- Settings are saved between visits.
- Light and dark themes, and a layout that works on phones.
- Android app, built with Capacitor, with its own icon and launch screen. Pushing a version tag publishes a
  GitHub Release with the APK attached.
- Unit tests for the theory and quiz logic.

[Unreleased]: https://github.com/klarinetos/deadbeef-sharp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/klarinetos/deadbeef-sharp/releases/tag/v0.1.0
