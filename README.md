# Farid Mahmoudi Portfolio

A clean personal portfolio for FARID MAHMOUDI, built to present my background, skills, projects, and contact information in one focused website.

## Overview

This portfolio highlights my work across data science, Big Data, cloud computing, and frontend development. It includes an introduction section, selected projects, skills, experience, education, a motivation page, a blog area, and a contact page.

## Tech Stack

- Astro
- React
- TypeScript
- Tailwind CSS
- Phosphor Icons

## Getting Started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Portfolio contact endpoint

`public/api/contact.php` requires PHP 7.4+ and working local mail delivery in
cPanel. It accepts JSON from the portfolio form and always sends to
`contact@mahmoudi.ma`. Server validation rejects malformed emails, invalid
types, oversized fields and header control characters. A hidden honeypot
discards automated submissions.

The endpoint permits 30 requests and 5 message attempts per IP per 15 minutes,
with at most 3 attempts for one email within that IP's window. Counters persist
across PHP workers using locked files under the server's private temporary
directory. The PHP user must be able to write there; unavailable storage returns
503 without sending mail. Limits trust `REMOTE_ADDR` only. If cPanel uses a
CDN/proxy, have the hosting provider configure the real client IP in the web
server rather than trusting arbitrary forwarding headers in PHP.

Run the transport-free validation and concurrency tests with PHP installed:

```sh
npm run test:contact
```

The optional HTTP checks need Python 3 and start an isolated local PHP server
with `mail()` disabled:

```sh
python tests/contact_http.py
```

Upload the updated `api/contact.php` from `dist` to `public_html/api/contact.php`
after building. Previewing through Astro alone does not execute PHP, and actual
mail receipt must be checked on cPanel after deployment.

## Morocco Sahara Trekking on mahmoudi.ma

`npm run build` also builds the project in `MOROCCO SAHARA TREKKING` and adds it
to `dist/marocsaharatrekking/`. Install that project's dependencies once first:

```sh
npm --prefix "MOROCCO SAHARA TREKKING" ci
npm run build
```

Upload the **contents** of `dist`, including hidden `.htaccess` files, into the
domain's `public_html` directory in cPanel. The portfolio stays at
`https://mahmoudi.ma/` and the trekking website opens at
`https://mahmoudi.ma/marocsaharatrekking/`, with its own pages, images and scripts.
`npm run preview` previews both websites after building; `npm run dev` serves
the portfolio source only. Use `npm run build:portfolio` to build the portfolio alone.

The cPanel ZIP version serves static pages and uses PHP 8.2+ for the contact
form (`api/send-mail.php`). Check the sender address and email deliverability
in cPanel, then verify actual receipt after uploading. WhatsApp is also available.
SMTP credentials and the Next.js API are never included in `dist`.
The original Next.js project retains its server email API for Node.js hosting.

The local development server usually runs at:

```text
http://localhost:4321
```

## Project Structure

```text
public/          Static assets, images, logos, fonts, and favicon
src/components/ Astro and React components
src/layouts/    Shared page layout
src/pages/      Website routes
src/styles/     Global styles
```

## Requirements

Node.js `>=22.12.0`

## Contact

- Email: [faridmahmoudicontact@gmail.com](mailto:faridmahmoudicontact@gmail.com)
- GitHub: [MAHMOUDIFARID](https://github.com/MAHMOUDIFARID)
