<div align="center">

# Farid Mahmoudi

### AI research. Practical software. Thoughtful interfaces.

First-year PhD student in Artificial Intelligence<br>
Master's in Big Data & Cloud Computing

**[Explore the portfolio](https://mahmoudi.ma)** · **[About me](https://mahmoudi.ma/about/)** · **[Get in touch](https://mahmoudi.ma/contact/)**

![Astro](https://img.shields.io/badge/Astro-6-BC52EE?style=flat-square&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8)

</div>

---

## The project

The source behind **[mahmoudi.ma](https://mahmoudi.ma)**: my personal portfolio for AI projects, web applications, and workflow automation. It brings selected work, professional experience, education, writing, and ways to get in touch into one place.

The implementation combines statically generated Astro pages with React components for interactive features. A PHP contact endpoint supports deployment on Apache/cPanel without a Node.js server in production.

## What you can explore

| Area | What's inside |
| :--- | :--- |
| [Selected work](https://mahmoudi.ma/#work) | Project context, technology stacks, and links to live sites or source code |
| [About](https://mahmoudi.ma/about/) | My background, current studies, and CV access |
| [Services](https://mahmoudi.ma/services/) | Web development, AI solutions, and workflow automation |
| [Playground](https://mahmoudi.ma/playground/) | Interactive tools and experiments |
| [Blog](https://mahmoudi.ma/blog/) | Technical writing and project notes |
| [Contact](https://mahmoudi.ma/contact/) | A contact form backed by server-side validation and rate limiting |

The interface includes light and dark themes, responsive navigation, and reduced-motion support.

## Engineering decisions

- **Static pages, selective interactivity.** Astro handles page generation; React powers interactive features where needed. The portfolio can be hosted as static assets alongside PHP.
- **An explicit image pipeline.** Sharp generates responsive WebP variants before development and production builds. A shared manifest provides image dimensions and `srcset` values for Astro and React components.
- **Validation at the server boundary.** The contact endpoint validates input, rejects email header control characters, limits request and field sizes, and uses a honeypot plus persistent rate limits.
- **Mail-independent verification.** Contact tests exercise validation, rate limits, concurrent access, and HTTP behavior without sending real messages.
- **Content-aware CV access.** The About page offers a download when `public/resume.pdf` exists and an email request otherwise. The legacy `/motivation/` route remains an alias for About.

## Run locally

**Requirements:** Node.js `>=22.12.0` and npm. PHP is only needed to run the contact endpoint or its tests; Python 3 is needed for the HTTP test suite.

```sh
git clone https://github.com/MAHMOUDIFARID/portfoliowebsite.git
cd portfoliowebsite
npm ci
npm run dev
```

Open the local URL printed by Astro, usually `http://localhost:4321`.

To build and preview the **portfolio on its own**:

```sh
npm run build:portfolio
npm run preview
```

Astro's development and preview servers do not execute PHP. Test actual contact-form delivery on PHP-enabled hosting.

## Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Generate optimized images and start the portfolio development server |
| `npm run build:portfolio` | Generate images and build the portfolio into `dist/` |
| `npm run preview` | Preview the existing production build |
| `npm run optimize:images` | Regenerate responsive WebP assets and their manifest |
| `npm run test:contact` | Run PHP validation and concurrency tests |
| `python tests/contact_http.py` | Run HTTP checks against an isolated local PHP server |
| `npm run build` | Build the portfolio and the optional trekking companion project |
| `npm run build:trekking` | Build and copy only the companion site into `dist/marocsaharatrekking/` |

## Repository map

```text
.
├── public/
│   ├── api/contact.php          # Portfolio contact endpoint
│   ├── optimized/               # Generated WebP variants; ignored by Git
│   └── ...                      # Original images, logos, fonts, and .htaccess
├── src/
│   ├── components/              # Astro and React UI components
│   ├── data/image-manifest.json # Generated image metadata
│   ├── layouts/                 # Shared document layout and theme setup
│   ├── lib/images.ts            # Image manifest lookup
│   ├── pages/                   # File-based routes
│   └── styles/                  # Global styles and theme tokens
├── scripts/
│   ├── optimize-images.mjs      # Responsive image generation
│   └── build-trekking.mjs       # Optional companion build integration
├── tests/
│   ├── contact.php              # Validation and concurrency checks
│   └── contact_http.py          # HTTP endpoint checks
└── astro.config.mjs
```

## Content workflow

**Pages and components:** edit routes under `src/pages/` and their UI in `src/components/`. Shared presentation lives in `src/layouts/` and `src/styles/`.

**Images:** keep original assets in `public/`, register optimized assets in `scripts/optimize-images.mjs`, then run `npm run optimize:images`. Commit the updated manifest with source changes; generated files under `public/optimized/` are rebuilt locally.

**CV:** place the current PDF at `public/resume.pdf` and rebuild to enable the download link.

## Automatic deployment

`.github/workflows/deploy-cpanel.yml` checks and builds the standalone portfolio on every push to `main`. Once FTP secrets are configured, it uploads `dist/` to the FTP account's existing `public_html/` directory using explicit FTPS on port 21. You can also start it from **Actions → Deploy portfolio to cPanel → Run workflow** on `main`.

In **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret | Value |
| :--- | :--- |
| `FTP_SERVER` | `giant.naja7host.com` (hostname only; verified FTPS certificate) |
| `FTP_USERNAME` | `mahmoudi` |
| `FTP_PASSWORD` | The password for that FTP account |

The supplied alias `ftp.mahmoudi.ma` resolves to the same server, but its FTPS certificate is issued for `giant.naja7host.com`; use the verified hostname above.

Until all three secrets are present, the workflow runs tests and the build, then skips the upload with a warning. A successful build with that warning does **not** mean the live site was updated. Adding secrets does not itself trigger deployment; run the workflow manually or push another commit.

The workflow checks the PHP contact endpoint and exercises the upload rules against local fixtures before building. FTPS verifies the server certificate and encrypts both credentials and transfers. If certificate verification fails, obtain the correct FTP hostname from the hosting provider instead of disabling verification.

Assets upload before HTML, with temporary files used during transfer. Deployments run one at a time. Remote-only files, old hashed assets, `marocsaharatrekking/`, and `.well-known/` are preserved. This is not an atomic whole-site release: a failed upload can leave a partial update, and removing a source file does not delete its deployed copy. Re-run a failed deployment; review obsolete hosted files separately when removing a page or endpoint.

The destination assumes the main FTP account starts in `/home/mahmoudi`, with the website in `public_html`. If you switch to an FTP account rooted directly in the website directory, update `cd public_html` in `scripts/deploy-cpanel.lftp` accordingly.

## Deploy to cPanel

1. Run `npm run build:portfolio` for the main site, or the combined build described below when the companion project is available.
2. Back up the current hosting files, then upload the **contents** of `dist/` to `public_html/`, including hidden `.htaccess` files.
3. Merge/overwrite the generated files. Preserve separately deployed directories such as `marocsaharatrekking/` when updating only the portfolio.
4. Verify page navigation, assets, and contact-form delivery on the deployed domain.

The portfolio contact endpoint requires **PHP 7.4+**, working local `mail()` delivery, and a writable private temporary directory. Its recipient is `contact@mahmoudi.ma`. Deployment ZIPs and generated build output stay outside Git tracking.

<details>
<summary><strong>Contact endpoint: operational details and tests</strong></summary>

The endpoint accepts JSON and applies these limits per 15-minute window:

| Scope | Limit |
| :--- | ---: |
| Requests per IP | 30 |
| Message attempts per IP | 5 |
| Message attempts for one email within that IP | 3 |

Counters persist across PHP workers using locked files in the server's private temporary directory. If storage is unavailable, the endpoint returns `503` without sending mail.

Limits use `REMOTE_ADDR`. When a CDN or reverse proxy is involved, configure the real client IP at the web-server level instead of trusting arbitrary forwarding headers in PHP.

With PHP on your `PATH`, run:

```sh
npm run test:contact
python tests/contact_http.py
```

For a PHP executable elsewhere:

```sh
python tests/contact_http.py --php /path/to/php
```

The HTTP suite launches an isolated local PHP server with `mail()` disabled. These tests do not verify production mail delivery; confirm receipt after deployment.

</details>

<details>
<summary><strong>Optional companion: Morocco Sahara Trekking</strong></summary>

The combined build publishes a separate travel website at `/marocsaharatrekking/`, alongside the portfolio.

It requires the full companion source in `MOROCCO SAHARA TREKKING/`, including `scripts/build-cpanel.cjs` and `scripts/check-cpanel.cjs`. This repository currently records that directory as a Git link without a `.gitmodules` mapping, so a fresh clone does not automatically provide its source. The standalone portfolio build does not require it.

Once the companion source is available locally:

```sh
npm --prefix "MOROCCO SAHARA TREKKING" ci
npm run build
```

The integration sets `CPANEL_BASE_PATH=/marocsaharatrekking`, runs the companion's cPanel build and checks, and copies the export into `dist/marocsaharatrekking/`.

Upload the combined `dist/` contents to `public_html/`. The companion's cPanel contact endpoint uses **PHP 8.2+**; verify its sender configuration and actual email receipt separately. Its original Next.js server email API is not used by the static cPanel deployment.

</details>

---

**Let's connect.** Explore my work at [mahmoudi.ma](https://mahmoudi.ma), browse my [GitHub projects](https://github.com/MAHMOUDIFARID), or email [contact@mahmoudi.ma](mailto:contact@mahmoudi.ma).
