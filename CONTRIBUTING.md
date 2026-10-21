# Contributing to DEADBEEF♯

Thanks for your interest in improving DEADBEEF♯.

## Reporting bugs

Open an issue using the **Bug report** template. Please include:

- What you expected to happen and what actually happened
- Steps to reproduce the problem
- Your platform (OS, browser or device) and the app version

## Suggesting features

Open an issue using the **Feature request** template. Describe the problem you want solved before
proposing a solution. Music-theory corrections are especially welcome.

## Pull requests

1. Fork the repository and create a branch from `main`, named
   `feat/short-description`, `fix/short-description`, or `docs/short-description`.
2. Keep each pull request focused on one change.
3. Add or update tests when you change behavior.
4. Update the documentation and `CHANGELOG.md` if your change affects users.
5. Open the pull request and fill in the template.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add scale degree questions
fix: correct enharmonic spelling of augmented fourth
docs: add example questions to README
```

## Music theory conventions

- Interval names use quality-and-number abbreviations: `P` perfect, `M` major, `m` minor,
  `A` augmented, `d` diminished. Examples: `m3`, `P5`, `A4`, `d5`.
- Spelling matters. `A4` and `d5` are different intervals even though both span 6 semitones,
  so the tritone is never written as `TT`.
- Notes are written with `♯` and `♭` in the user interface, and with `#` and `b` in code and file names.
