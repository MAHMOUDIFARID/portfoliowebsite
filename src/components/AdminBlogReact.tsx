import { useMemo, useState } from 'react';

const OWNER = 'MAHMOUDIFARID';
const REPO = 'portfoliowebsite';
const BRANCH = 'main';
const CONTENT_DIR = 'src/content/blog';

type PublishState = 'idle' | 'publishing' | 'success' | 'error';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function buildMarkdown({
  title,
  description,
  pubDate,
  content,
}: {
  title: string;
  description: string;
  pubDate: string;
  content: string;
}) {
  return `---\ntitle: ${JSON.stringify(title.trim())}\ndescription: ${JSON.stringify(description.trim())}\npubDate: ${pubDate}\n---\n\n${content.trim()}\n`;
}

export default function AdminBlogReact() {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<PublishState>('idle');
  const [message, setMessage] = useState('');

  const finalSlug = useMemo(() => slugify(title), [title]);
  const markdown = useMemo(
    () => buildMarkdown({ title, description, pubDate: today, content }),
    [title, description, today, content],
  );

  async function publishPost() {
    setStatus('publishing');
    setMessage('');

    try {
      if (!token.trim()) {
        throw new Error('Paste your GitHub token first.');
      }
      if (!title.trim() || !description.trim() || !content.trim()) {
        throw new Error('Title, description, and content are required.');
      }
      if (!finalSlug) {
        throw new Error('Add a slug or write a title that can generate one.');
      }

      const filePath = `${CONTENT_DIR}/${finalSlug}.md`;
      const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}`;
      const headers = {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      };

      const existingResponse = await fetch(`${url}?ref=${BRANCH}`, { headers });
      let sha: string | undefined;

      if (existingResponse.ok) {
        const existingFile = await existingResponse.json();
        sha = existingFile.sha;
      } else if (existingResponse.status !== 404) {
        const error = await existingResponse.json().catch(() => null);
        throw new Error(error?.message || 'Could not check the existing blog file.');
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `${sha ? 'Update' : 'Publish'} blog post: ${title.trim()}`,
          content: encodeBase64(markdown),
          branch: BRANCH,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'GitHub rejected the publish request.');
      }

      setStatus('success');
      setMessage(`Published ${filePath}. Your site will update after the deployment finishes.`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Blog Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Publish a blog post</h1>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-white/70">GitHub token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              type="password"
              placeholder="Fine-grained token with Contents read/write"
              className="admin-input"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-white/70">Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="admin-input" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-white/70">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="admin-input resize-none"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-white/70">Content</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={14}
              placeholder="Write Markdown here..."
              className="admin-input admin-content-input resize-y text-sm leading-relaxed"
            />
          </label>

          <button
            onClick={publishPost}
            disabled={status === 'publishing'}
            className="admin-publish-button"
          >
            {status === 'publishing' ? 'Publishing...' : 'Publish to GitHub'}
          </button>

          {message && (
            <p className={`rounded-2xl border px-4 py-3 text-sm ${status === 'success' ? 'border-white/20 text-white' : 'border-white/20 text-white/70'}`}>
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
