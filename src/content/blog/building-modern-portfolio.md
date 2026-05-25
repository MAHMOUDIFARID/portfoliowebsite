---
title: "Building a Modern Portfolio with Astro 6"
description: "Exploring the latest features in Astro 6 and how they help creative developers build faster, more interactive websites."
pubDate: 2026-05-18
tags: ["Astro", "Web Dev", "Performance"]
image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop"
---

Welcome to my first blog post! In this article, I'll walk you through the process of building this portfolio using **Astro 6**, **Tailwind CSS**, and **React**.

## Why Astro?

Astro has become my go-to framework for content-heavy websites because of its unique "islands" architecture. It allows me to ship zero JavaScript by default, which is perfect for a portfolio or blog.

```javascript
// Example of a simple Astro component
---
const { title } = Astro.props;
---
<h1>{title}</h1>
```

## The New Content Loader

In Astro 6, the way we handle content has evolved. We now use the `glob` loader in `src/content.config.ts`, which is more flexible and performant.

Stay tuned for more updates as I continue to explore the world of Creative Development!
