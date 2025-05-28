# GeoTrivia

GeoTrivia is a WIP multiplayer trivia game that challenges your geopolitical knowledge with AI-powered questions.

## ✨ Features

- Multiplayer trivia gameplay, with a leaderboard
- AI-powered, up-to-date geopolitical questions
- Nix Flake & direnv for reproducible dev environments

---

## 🚀 Quickstart (Without Nix)

### 1. Clone the Repo

```sh
git clone https://github.com/darshanCommits/GeoTrivia.git
cd GeoTrivia
```

### 2. Install Dependencies

1. Make sure pnpm is installed.
`pnpm -v`

2. Download all the dependencies.
`pnpm i`

### 3. Start Development Server

`pnpm run dev`
> This will start both the backend(@port 3000) and frontend(@port 5173)

---

## ❄️ With Nix & direnv (Recommended)
Use this to get done everything automatically

### 1. Install Dependencies

- **Install [Nix](https://nixos.org/download.html) (with flakes enabled)**
> Ensures a reproducible environment for all contributors.

- **Install [direnv](https://direnv.net/)**
> Automatically loads the Nix environment when you `cd` into the project.

### 2. Clone the Repo

```sh
git clone https://github.com/darshanCommits/GeoTrivia.git
cd GeoTrivia
```

### 3. Enable direnv in your shell:

```sh
direnv allow
```

This will automatically set up the development environment using the provided flake.

### 3. Install node dependencies

```sh
pnpm install
```

### 4. Start development server

```sh
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤝 Contributing

PRs and issues welcome! This project is in early development.

## 📄 License

MIT
