"""Exercise the real lftp upload rules against local files; no hosting credentials."""

from pathlib import Path
import shutil
import subprocess
import tempfile


def main():
    lftp = shutil.which('lftp')
    if not lftp:
        raise SystemExit('Install lftp to run deployment checks (also run in GitHub Actions).')
    script = Path(__file__).resolve().parents[1] / 'scripts' / 'deploy-cpanel.lftp'
    with tempfile.TemporaryDirectory(prefix='cpanel-deploy-test-') as temp:
        root = Path(temp)
        local = root / 'dist'
        remote = root / 'hosting' / 'public_html'
        uploads = {
            'index.html': 'new home',
            'about/index.html': 'new about',
            '_astro/site.js': 'new script',
            'api/contact.php': 'new endpoint',
            '.htaccess': 'new config',
            'optimized/photo with spaces.webp': 'new image',
        }
        preserved = {
            'marocsaharatrekking/index.html': 'existing trekking',
            '.well-known/verification.txt': 'existing verification',
            '_astro/old.js': 'cached page dependency',
            'uploads/existing.txt': 'existing upload',
        }
        for base, files in [(local, uploads), (remote, preserved)]:
            for name, content in files.items():
                target = base / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content)
        (remote / 'index.html').write_text('old home')
        # Even an accidentally included companion build must not overwrite hosting.
        for name in ('marocsaharatrekking/index.html', '.well-known/verification.txt'):
            target = local / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('must not upload')
        command = f'open "{(root / "hosting").as_uri()}"; source "{script.as_posix()}"; bye'
        subprocess.run([lftp, '--norc', '-c', command], cwd=root, check=True, timeout=30)
        for name, content in {**uploads, **preserved}.items():
            assert (remote / name).read_text() == content, name
        print('Deployment checks passed: updated pages/assets, hidden files, and preserved hosting content.')


if __name__ == '__main__':
    main()
