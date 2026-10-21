<div align="center">

# DEADBEEF♯

**A music theory trainer for intervals, notes, and tones.**

`D – E – A – D – Bm – E – E – F#m`

[Features](#features) · [Getting started](#getting-started) · [Roadmap](#roadmap) · [The name](#the-name) · [Contributing](#contributing) · [License](#license)

</div>

---

> **Status: early development (v0.1).** The core trainer works. Expect rough edges while it grows.

## About

DEADBEEF♯ drills the fundamentals of music theory through quick questions. You're given notes, intervals,
and tone counts, and you answer by tapping buttons. There's no sheet music to read and no audio to listen to:
the focus is on knowing the theory cold.

It's meant for students preparing for theory exams, self-taught players filling in gaps, and anyone who wants
to spell intervals instantly instead of counting on their fingers.

## Features

### Question types

| Type | You're given | You answer | Example |
|---|---|---|---|
| **Find the note** | A root note and an interval | The note that interval above the root | Major 3rd above E → **G♯** |
| **Name the interval** | Two notes, lower one first | The interval between them | E → B♭ → **d5** |
| **Notes to tones** | Two notes, lower one first | How many tones apart they are | C → G → **3½ tones** |
| **Interval to tones** | An interval | How many tones it spans | Minor 3rd → **1½ tones** |

Spelling matters. A major 3rd above E is G♯, not A♭, and C → F♯ (A4) is a different interval from
C → G♭ (d5), even though both are 3 tones. Unisons and octaves are never asked; they're too easy.

### Options for each question type

Each question type has a gear button with its own options:

- **Find the note** and **Name the interval:** tick which intervals to practice, from m2 to M7.
  When naming intervals, only the ticked intervals appear as answers.
- **Notes to tones** and **Interval to tones:**
  - **Range:** within an octave, up to a 13th, or within two octaves. Past the octave, notes show
    octave numbers (C4 → E5) so the distance is unambiguous.
  - **Interval numbers:** all, odd only (3rds, 5ths, 7ths, 9ths…), or even only.

### Session options

- **Question types:** practice any combination of the four.
- **Order:** round robin, random with equal odds, or random with custom odds per type.
- **Length:** 5, 10, 20, or 50 questions, or keep going until you stop.
- **Note names:** letters (C D E), solfège (Do Re Mi), or a random mix.
- **Accidentals:** sharps only, flats only, both in the same question, or each question randomly all sharps
  or all flats.

Your settings are remembered between visits. At the end of a session you get your score, accuracy per
question type, and a list of the questions you missed with the correct answers.

## Getting started

You need [Node.js](https://nodejs.org/) 20 or later.

```bash
git clone https://github.com/klarinetos/deadbeef-sharp.git
cd deadbeef-sharp
npm install
npm run dev
```

Then open http://localhost:5173.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload |
| `npm test` | Runs the test suite once |
| `npm run test:watch` | Runs tests on every change |
| `npm run typecheck` | Checks types without building |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the production build locally |

Built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/),
[Vite](https://vite.dev/), and [Vitest](https://vitest.dev/).

## Project structure

```
deadbeef-sharp/
├── .github/            Issue and pull request templates
├── docs/               Design notes and documentation
├── public/             Static files served as-is (favicon)
├── src/
│   ├── theory/         Note spelling, intervals, and tone counts (no UI)
│   ├── quiz/           Question generation, question-type picker, settings
│   ├── components/     Settings, quiz, and results screens
│   ├── App.tsx         Screen flow
│   └── styles.css      Styles, with light and dark themes
└── tests/              Unit tests for the theory and quiz logic
```

## Roadmap

| Milestone | Scope | Status |
|---|---|---|
| **v0.1** | Four interval and tone question types, session options, results | Done |
| **v0.2** | Options per question type, compound intervals for tone questions | Done |
| **v0.3** | Descending intervals, E♯/B♯/F♭/C♭ and double accidentals | Planned |
| **v0.4** | Scale spelling and scale degrees | Planned |
| **v0.5** | Progress tracking across sessions | Planned |
| **v1.0** | Key signatures, chord spelling, first stable release | Planned |
| **Later** | Ear training for intervals and scales | Exploring |

See the [issue tracker](../../issues) for detailed tasks.

## The name

`0xDEADBEEF` is a classic hex "magic number" that programmers use to mark uninitialized or freed memory.
Read as chord symbols, its letters also form a real progression. Add one sharp and you get:

| Chord | D | E | A | D | Bm | E | E | **F#m** |
|---|---|---|---|---|---|---|---|---|
| A major | IV | V | I | IV | ii | V | V | **vi** |

It ends on a **deceptive cadence**: the E (V) sets up a resolution to A (I), but the progression
moves to F#m (vi) instead.

Without the sharp, plain DEADBEEF works too, as a darker progression in A minor:
`Dm E Am Dm B° E E F` (iv V i iv ii° V V VI).

## Contributing

Bug reports, ideas, and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

Copyright © 2026 Klarinetos Plokamias. All rights reserved.

The code is public so you can read it, run the app for personal use, and contribute through pull requests.
It may not be republished, redistributed, or sold, including on app stores. See [LICENSE](LICENSE) for the
full terms.
