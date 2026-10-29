"""Exercise the real PHP HTTP adapter with mail() disabled. No email is sent."""

import argparse
import json
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--php", default="php")
    args = parser.parse_args()
    php = shutil.which(args.php)
    if not php:
        raise SystemExit("PHP was not found; use --php /path/to/php")
    with tempfile.TemporaryDirectory(prefix="portfolio-contact-http-") as temporary:
        root = Path(temporary)
        shutil.copyfile(Path(__file__).resolve().parents[1] / "public/api/contact.php", root / "contact.php")
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        log_file = (root / "server.log").open("wb")
        server = subprocess.Popen(
            [php, "-n", "-d", "disable_functions=mail", "-d", f"sys_temp_dir={root}",
             "-S", f"127.0.0.1:{port}", "-t", str(root)],
            stdout=subprocess.DEVNULL, stderr=log_file,
        )
        url = f"http://127.0.0.1:{port}/contact.php"

        def request(body=None, method="POST", origin="https://mahmoudi.ma", raw=None):
            data = raw if raw is not None else json.dumps(body, ensure_ascii=False).encode() if method == "POST" else None
            headers = {"Content-Type": "application/json", "Origin": origin}
            req = urllib.request.Request(url, data=data, method=method, headers=headers)
            try:
                response = urllib.request.urlopen(req, timeout=5)
            except urllib.error.HTTPError as error:
                response = error
            with response:
                assert response.headers.get("Content-Type", "").startswith("application/json")
                assert response.headers.get("Cache-Control") == "no-store"
                assert response.headers.get("X-Content-Type-Options") == "nosniff"
                assert response.headers.get("Access-Control-Allow-Origin") is None
                return response.status, json.loads(response.read()), response.headers

        checks = 0

        def check(condition, name):
            nonlocal checks
            assert condition, name
            checks += 1
            print(f"PASS: {name}")

        try:
            deadline = time.monotonic() + 10
            while True:
                try:
                    status, body, headers = request(method="GET")
                    break
                except urllib.error.URLError:
                    if time.monotonic() >= deadline or server.poll() is not None:
                        raise
                    time.sleep(0.05)
            check(status == 405 and headers.get("Allow") == "POST", "real endpoint returns 405 for GET")
            check(request(method="OPTIONS")[0] == 405, "cross-origin preflight is not enabled")
            valid = {"name": "Test Visitor", "email": "visitor@example.test", "subject": "Test", "message": "Local test only."}
            check(request(valid, origin="https://other.test")[0] == 403, "foreign origins return 403")
            check(request(raw=b"{broken")[0] == 400, "malformed JSON returns 400")
            check(request({**valid, "email": "invalid"})[0] == 400, "invalid email returns 400")
            check(request({**valid, "name": "Name\r\nBcc: other@example.test"})[0] == 400, "header injection returns 400")
            check(request(raw=b"x" * 24577)[0] == 413, "oversized bodies return 413")
            status, body, _ = request(valid)
            check(status == 503 and body["success"] is False, "disabled mail transport returns useful JSON, without sending")
            status, body, _ = request({**valid, "website": "spam.test"})
            check(status == 200 and body["success"] is True, "honeypot returns a success-shaped response without mail")
            statuses = []
            for _ in range(31):
                status, body, headers = request({})
                statuses.append(status)
            check(400 in statuses and statuses[-1] == 429 and body["success"] is False
                  and 1 <= int(headers["Retry-After"]) <= 900, "real file-backed quota returns 429 with Retry-After")
        finally:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait(timeout=5)
            log_file.close()
            logs = (root / "server.log").read_text(errors="replace")
            assert "Fatal error" not in logs and "Warning:" not in logs, logs
        print(f"{checks} HTTP checks passed. mail() was disabled throughout.")


if __name__ == "__main__":
    main()
