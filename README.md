# Farid Mahmoudi Portfolio

Personal portfolio website for Farid Mahmoudi, built with Astro, React, Tailwind CSS, and TypeScript.

The site presents my background in Big Data and Cloud Computing, professional experience, education, selected work, motivation letter, and contact form.

## Live Project

Repository: [MAHMOUDIFARID/portfoliowebsite](https://github.com/MAHMOUDIFARID/portfoliowebsite)

## Tech Stack

- [Astro](https://astro.build/) for the static site architecture
- [React](https://react.dev/) for interactive sections
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TypeScript](https://www.typescriptlang.org/) for type checking
- [Phosphor Icons](https://phosphoricons.com/) for interface icons

## Main Sections

- Hero introduction
- About
- Professional experience
- Education
- Process
- Selected project: Maroc Des Merveilles
- Motivation letter
- Contact form

## Project Structure

```text
.
|-- public/              Static assets, images, logos, fonts, favicon
|-- src/
|   |-- components/      Astro and React components
|   |-- layouts/         Shared page layout
|   |-- pages/           Astro routes
|   `-- styles/          Global styles and Tailwind setup
|-- astro.config.mjs
|-- package.json
|-- package-lock.json
`-- tsconfig.json
```

## Requirements

Node.js `>=22.12.0`

## Getting Started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

By default, Astro serves the site at:

```text
http://localhost:4321
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro` | Run Astro CLI commands |

## Quality Checks

Run Astro diagnostics:

```sh
npx astro check
```

Build the production site:

```sh
npm run build
```

## Deployment

This is a static Astro site. The production output is generated in `dist/`.

The repository intentionally does not commit:

- `node_modules/`
- `dist/`
- `.astro/`
- local editor settings
- local design references

## Contact

Email: [faridmahmoudicontact@gmail.com](mailto:faridmahmoudicontact@gmail.com)

GitHub: [MAHMOUDIFARID](https://github.com/MAHMOUDIFARID)
