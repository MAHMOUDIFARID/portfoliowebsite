import { useMemo, useState, useEffect } from 'react';
import { CloudArrowUp, Trash } from '@phosphor-icons/react';

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
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [token, setToken] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PublishState>('idle');
  const [message, setMessage] = useState('');

  // Load draft values on mount
  useEffect(() => {
    setToken(localStorage.getItem('admin_github_token') || '');
    setTitle(localStorage.getItem('admin_blog_draft_title') || '');
    setDescription(localStorage.getItem('admin_blog_draft_description') || '');
    setContent(localStorage.getItem('admin_blog_draft_content') || '');
  }, []);

  // Save changes to localStorage
  const handleTitleChange = (val: string) => {
    setTitle(val);
    localStorage.setItem('admin_blog_draft_title', val);
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    localStorage.setItem('admin_blog_draft_description', val);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    localStorage.setItem('admin_blog_draft_content', val);
  };

  const handleTokenChange = (val: string) => {
    setToken(val);
    localStorage.setItem('admin_github_token', val);
  };

  const finalSlug = useMemo(() => slugify(title), [title]);
  const markdown = useMemo(
    () => buildMarkdown({ title, description, pubDate: today, content }),
    [title, description, today, content],
  );

  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear your current draft?')) {
      handleTitleChange('');
      handleDescriptionChange('');
      handleContentChange('');
      setStatus('idle');
      setMessage('');
    }
  };

  async function publishPost() {
    setStatus('publishing');
    setMessage('');

    try {
      if (!token.trim()) {
        throw new Error('Please enter your GitHub token first.');
      }
      if (!title.trim() || !description.trim() || !content.trim()) {
        throw new Error('Title, description, and content are required.');
      }
      if (!finalSlug) {
        throw new Error('Title is invalid or cannot generate a slug.');
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
        throw new Error(error?.message || 'Could not verify the remote file.');
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `${sha ? 'Update' : 'Publish'} blog: ${title.trim()}`,
          content: encodeBase64(markdown),
          branch: BRANCH,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'GitHub API rejected publish request.');
      }

      setStatus('success');
      setMessage(`Successfully published ${finalSlug}.md! Your site will auto-update shortly.`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }

  return (
    <section className="bg-transparent py-24 md:py-32">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        
        {/* Left Column: Heading */}
        <div className="lg:col-span-4">
          <p className="text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase mb-3 select-none">
            Blog Admin
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-8 leading-[1.1]">
            Publish a Post
          </h1>
          <p className="text-lg text-white/50 font-medium leading-relaxed">
            Write markdown content and publish it directly to the repository to trigger an automatic site deployment.
          </p>
        </div>

        {/* Right Column: Form Card */}
        <div className="lg:col-span-8">
          <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-4xl border border-white/10 shadow-sm flex flex-col gap-6">
            
            {/* GitHub Token Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/70">GitHub Access Token</label>
              <input
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                type="password"
                placeholder="Paste your token here..."
                className="admin-input"
              />
            </div>

            {/* Post Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/70">Title</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. My First Experience with Astro"
                className="admin-input font-medium"
              />
              {finalSlug && (
                <span className="text-xs font-mono text-white/30 px-1 mt-1 truncate">
                  Filename: <span className="text-white/50">{finalSlug}.md</span>
                </span>
              )}
            </div>

            {/* Post Description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/70">Description</label>
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={2}
                placeholder="Write a brief summary subtitle..."
                className="admin-input resize-none"
              />
            </div>

            {/* Post Markdown Content */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/70">Markdown Content</label>
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={12}
                placeholder="Write markdown formatting here..."
                className="admin-input admin-content-input resize-y leading-relaxed text-sm"
              />
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5 items-center">
              <button
                onClick={publishPost}
                disabled={status === 'publishing'}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-white text-brand-black py-4 rounded-full text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-white/5 cursor-pointer disabled:opacity-55 disabled:hover:scale-100"
              >
                <CloudArrowUp size={18} />
                <span>{status === 'publishing' ? 'Publishing...' : 'Publish to GitHub'}</span>
              </button>

              {(title || description || content) && (
                <button
                  onClick={clearDraft}
                  className="w-full sm:w-auto px-6 py-4 rounded-full border border-white/5 bg-white/[0.01] hover:bg-red-500/10 hover:border-red-500/20 text-white/40 hover:text-red-400 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>

            {/* Response Alerts */}
            {message && (
              <div className={`mt-4 p-4 rounded-2xl border text-sm leading-relaxed ${
                status === 'success' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
              }`}>
                {message}
              </div>
            )}

          </div>
        </div>

      </div>
      </div>
    </section>
  );
}
