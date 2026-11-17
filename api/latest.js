const REPO = "TsuyoStudio/ts-downloads";
const API_URL = "https://api.github.com/repos/" + REPO + "/releases/latest";
const RELEASES_URL = "https://github.com/" + REPO + "/releases";
const ALLOWED_FILE = /\.(exe|msi|zip)$/i;

function reply(res, code, data) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(data));
}

function rank(name) {
  const lower = name.toLowerCase();
  let score = lower.endsWith(".exe") ? 30 : lower.endsWith(".msi") ? 20 : 10;
  if (/ts[-_ .]?hub|ts[-_ .]?setup|installer|setup/.test(lower)) score += 15;
  if (/source|debug|symbols|portable-src|pdb/.test(lower)) score -= 50;
  return score;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return reply(res, 405, { status: "error", message: "Método não permitido." });
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    let response;
    try {
      response = await fetch(API_URL, {
        headers: {
          "Accept": "application/vnd.github+json",
          "User-Agent": "ts-hub-official-site",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }
    if (response.status === 404) {
      return reply(res, 200, {
        status: "pending",
        message: "O primeiro instalador está em preparação.",
        releasesUrl: RELEASES_URL
      });
    }
    if (!response.ok) throw new Error("Falha ao consultar lançamentos");

    const release = await response.json();
    const files = (Array.isArray(release.assets) ? release.assets : [])
      .filter(a => a && a.state === "uploaded" && ALLOWED_FILE.test(a.name || ""))
      .filter(a => {
        try {
          const url = new URL(a.browser_download_url);
          return url.protocol === "https:" && url.hostname === "github.com"
            && url.pathname.startsWith("/" + REPO + "/releases/download/");
        } catch { return false; }
      })
      .sort((a, b) => rank(b.name) - rank(a.name));

    if (!files.length) {
      return reply(res, 200, {
        status: "pending",
        version: String(release.tag_name || "").slice(0, 40),
        message: "A versão foi publicada, mas ainda não contém instalador.",
        releasesUrl: RELEASES_URL
      });
    }
    const asset = files[0];
    return reply(res, 200, {
      status: "available",
      version: String(release.tag_name || release.name || "").slice(0, 40),
      date: release.published_at || release.created_at || null,
      fileName: String(asset.name || "").slice(0, 200),
      fileSize: Number(asset.size) || 0,
      downloadUrl: asset.browser_download_url,
      releaseNotes: String(release.body || "").slice(0, 5000),
      releasesUrl: release.html_url && release.html_url.startsWith(RELEASES_URL)
        ? release.html_url : RELEASES_URL
    });
  } catch (err) {
    return reply(res, 503, {
      status: "error",
      message: "Não foi possível consultar a versão neste momento.",
      releasesUrl: RELEASES_URL
    });
  }
};