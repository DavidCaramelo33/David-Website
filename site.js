/* Public site logic: loads content from Supabase, renders pages, counts visits, sends messages.
   If the database isn't reachable (offline / not set up yet), it shows the built-in content below. */

const FALLBACK = {
  profile: {
    name: "David Caramelo",
    headline: "Real Estate Marketing",
    pitch: "I build the strategy that takes a property from listing to sale: positioning, content, SEO and campaigns that reach the right buyer.",
    status: "Open to work · Angers, France · Remote or relocation within France",
    about_title: "Where marketing meets real estate",
    about: "I'm a marketer who loves the craft of selling property: understanding a home, finding its story, and building the full strategy to put it in front of the right people.\n\nI've spent more than six years in customer relations and digital marketing, and founded Lusitania Investments, a real estate company that connects international investors with opportunities in Portugal. That's where I work on the whole process, from market research and brand to SEO, email campaigns and listings.\n\nI'm studying International Business at NHL Stenden University with a specialisation in marketing. I work in Portuguese, English, Spanish and French, and I'm looking for my next role in real estate marketing or real estate development.",
    facts: [["6+", "Years in marketing & client relations"], ["4", "Working languages"], ["2024", "Founded Lusitania Investments"]],
    expertise: ["Real estate & property marketing", "Marketing strategy & campaigns", "SEO", "Email marketing", "Content & multimedia creation", "Data & market analysis", "Project coordination"],
    tools: ["Adobe InDesign & Adobe tools", "Brevo · Mailchimp", "Google Ads · Meta Ads", "Google Analytics", "Canva · Figma", "CapCut · DaVinci Resolve", "Microsoft Office"],
    languages: [["Portuguese", "Native"], ["English", "C2"], ["Spanish", "C2"], ["French", "B1"]],
    photo_url: "", linkedin: "", website: "https://lusitaniainvestments.fr/",
    contact_title: "Let's market something remarkable",
    contact_text: "I'm open to roles in real estate marketing and development, remote or anywhere in France.",
    availability: "both", open_to_hire: true, freelance: true,
    highlights: ["Founder · Lusitania Investments", "Real estate marketing", "PT · EN · ES · FR"],
    services: [
      ["Property marketing strategy", "Positioning, target buyer and launch plan for a property or development, from the first photo to the signed deal."],
      ["SEO & content", "Websites, listings and articles that rank on Google and turn searches into qualified enquiries."],
      ["Email marketing", "Brevo and Mailchimp campaigns that keep buyers and investors warm until they're ready to act."],
      ["Visual content", "Listing visuals, InDesign brochures and short-form video that make a property stand out."]
    ],
    cv_url: "",
    hire_text: "Looking for someone to join your team in real estate marketing or development? Tell me about the role.",
    freelance_text: "Need help marketing a property, a project or your agency? Tell me what you have in mind and your timeline.",
    email: "", business_email: "", phone: "", location: "Angers, France", work_note: "Remote or relocation within France",
    results: [["108", "Properties marketed for Lusitania Investments"], ["2", "Countries connected: France & Portugal"]],
    booking_url: ""
  },
  experience: [
    { title: "Founder", org: "Lusitania Investments", logo_url: "images/logos/lusitania.png", link: "https://lusitaniainvestments.fr/", place: "Angers, France", period: "2024 — Present", description: "Founded and built a real estate investment company connecting international investors with property opportunities in Portugal. I lead business development and the full marketing strategy: brand, website content, SEO, email marketing and social media." },
    { title: "Marketing Intern", org: "Weenat", logo_url: "images/logos/weenat.png", link: "https://weenat.com/", place: "Nantes, France", period: "2025 — 2026", description: "Contributed to digital marketing campaigns through content creation, social media management and market analysis, helping increase brand visibility and engagement." },
    { title: "Freelance Marketing Manager", org: "", place: "Remote", period: "2019 — Present", description: "Creating targeted social media content for clients to increase visibility and engage potential customers." },
    { title: "Sales Assistant", org: "Fitness Up", logo_url: "images/logos/fitnessup.png", link: "https://fitnessup.pt/", place: "Oeiras, Portugal", period: "2021 — 2022", description: "Delivered high-quality customer service with personalised advice and tailored membership plans, and promoted the gym's services." }
  ],
  projects: [
    { title: "Lusitania Investments", tag: "Real Estate · Founder", image_url: "images/projects/lusitania.jpg", featured: true, link: "https://lusitaniainvestments.fr/", description: "A real estate company helping international (especially French) investors buy property in Portugal. I built its marketing from the ground up: positioning, SEO and content strategy, email campaigns, property listings and social media." },
    { title: "Geldloket Communication Strategy", tag: "Strategy · 2022–2023", description: "A marketing and communication strategy for a financial consulting firm for young adults, with social media content, influencer collaborations, workshops and partnerships." },
    { title: "City of Emmen Promo Film", tag: "Video · 2022", description: "A promotional video for the city of Emmen, taken from brainstorming and storyboard through filming landmarks and interviews with locals." },
    { title: "Helios Student Association", tag: "Campus · Marketing Manager", description: "Designed and ran targeted communication strategies to raise awareness for the association at NHL Stenden University." }
  ],
  education: [
    { kind: "education", title: "BBA International Business", logo_url: "images/logos/nhlstenden.png", link: "https://www.nhlstenden.com/", period: "2023 — Present", description: "NHL Stenden University of Applied Sciences, Emmen (NL). Specialisation in Marketing & Sales, plus Finance, Operations & Supply Chain, and Organisational Behaviour." },
    { kind: "education", title: "Business Diploma", period: "2017 — 2020", description: "São João do Estoril Vocational High School, Portugal. Specialisation in Marketing, Advertising & Public Relations." },
    { kind: "certification", title: "The Fundamentals of Digital Marketing", logo_url: "images/logos/google.png", link: "https://skillshop.withgoogle.com/", period: "2023" },
    { kind: "certification", title: "Google Analytics", logo_url: "images/logos/analytics.png", link: "https://skillshop.withgoogle.com/", period: "2022" },
    { kind: "certification", title: "English C2 — IELTS Academic", logo_url: "images/logos/ielts.png", link: "https://ielts.org/", period: "2020" },
    { kind: "certification", title: "X-Honours Programme, NHL Stenden", logo_url: "images/logos/nhlstenden.png", link: "https://www.nhlstenden.com/", period: "2022", description: "Leadership development and cross-cultural business." }
  ],
  portfolio: [
    { title: "Lusitania Investments website", category: "Website", image_url: "images/projects/lusitania.jpg", link: "https://lusitaniainvestments.fr/", description: "" }
  ],
  posts: []
};

/* ---------- helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = u => /^(https?:\/\/|mailto:|\/|\.\/|images\/|[a-z0-9-]+\.html)/i.test(u || "") ? u : "#";
const fmtDate = d => d ? new Date(d).toLocaleDateString(typeof LANG !== "undefined" && LANG === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
const $ = s => document.querySelector(s);

/* Tiny Markdown: ## headings, **bold**, *italic*, [links](url), ![images](url), - lists, > quotes */
function markdown(src) {
  const inline = t => esc(t)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, a, u) => `<img src="${esc(safeUrl(u))}" alt="${a}">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => `<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${a}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return String(src || "").replace(/\r/g, "").split(/\n{2,}/).map(block => {
    const b = block.trim();
    if (!b) return "";
    if (b.startsWith("### ")) return `<h3>${inline(b.slice(4))}</h3>`;
    if (b.startsWith("## ")) return `<h2>${inline(b.slice(3))}</h2>`;
    if (b.startsWith("> ")) return `<blockquote>${inline(b.replace(/^> ?/gm, ""))}</blockquote>`;
    if (/^[-*] /.test(b)) return `<ul>${b.split("\n").map(l => `<li>${inline(l.replace(/^[-*] /, ""))}</li>`).join("")}</ul>`;
    return `<p>${inline(b).replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}

/* ---------- database ---------- */
let db = null;
function getDb() {
  if (db) return db;
  const c = window.SITE_CONFIG || {};
  if (!window.supabase || !/^https:\/\//.test(c.SUPABASE_URL || "")) return null;
  db = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_KEY);
  return db;
}

function cacheGet(k) { try { return JSON.parse(localStorage.getItem("dc_" + k)); } catch { return null; } }
function cacheSet(k, v) { try { localStorage.setItem("dc_" + k, JSON.stringify(v)); } catch {} }

async function loadContent() {
  const d = getDb();
  if (!d) return cacheGet("content") || FALLBACK;
  try {
    const [p, ex, pr, ed, po, pf] = await Promise.all([
      d.from("profile").select("data").eq("id", 1).maybeSingle(),
      d.from("experience").select("*").eq("visible", true).order("sort"),
      d.from("projects").select("*").eq("visible", true).order("sort"),
      d.from("education").select("*").eq("visible", true).order("sort"),
      d.from("posts").select("slug,title,excerpt,cover_url,tag,published_at").eq("published", true).order("published_at", { ascending: false }).limit(3),
      d.from("portfolio").select("*").eq("visible", true).order("sort")
    ]);
    if (p.error || ex.error) throw p.error || ex.error;
    const content = {
      profile: { ...FALLBACK.profile, ...(p.data?.data || {}) },
      experience: ex.data, projects: pr.data || [], education: ed.data || [], posts: po.data || [],
      portfolio: pf.error ? FALLBACK.portfolio : (pf.data || [])
    };
    cacheSet("content", content);
    return content;
  } catch (e) {
    console.warn("Using saved content:", e);
    return cacheGet("content") || FALLBACK;
  }
}

/* ---------- availability ---------- */
const AVAIL_KEYS = ["both", "job", "freelance", "none"];
const siteAvail = p => AVAIL_KEYS.includes(p.availability) ? p.availability : (p.open_to_hire === false ? (p.freelance ? "freelance" : "none") : (p.freelance === false ? "job" : "both"));

/* ---------- logos, icons, pop-up ---------- */
const TOOLS = {
  "indesign": { name: "Adobe InDesign", logo: "indesign", url: "https://www.adobe.com/products/indesign.html" },
  "adobe": { name: "Adobe", logo: "indesign", url: "https://www.adobe.com/" },
  "brevo": { name: "Brevo", logo: "brevo", url: "https://www.brevo.com/" },
  "mailchimp": { name: "Mailchimp", logo: "mailchimp", url: "https://mailchimp.com/" },
  "google ads": { name: "Google Ads", logo: "googleads", url: "https://ads.google.com/" },
  "meta": { name: "Meta Ads", logo: "meta", url: "https://www.facebook.com/business/ads" },
  "analytics": { name: "Google Analytics", logo: "analytics", url: "https://marketingplatform.google.com/about/analytics/" },
  "canva": { name: "Canva", logo: "canva", url: "https://www.canva.com/" },
  "figma": { name: "Figma", logo: "figma", url: "https://www.figma.com/" },
  "capcut": { name: "CapCut", logo: "capcut", url: "https://www.capcut.com/" },
  "davinci": { name: "DaVinci Resolve", logo: "davinci", url: "https://www.blackmagicdesign.com/products/davinciresolve" },
  "office": { name: "Microsoft Office", logo: "microsoft", url: "https://www.microsoft.com/microsoft-365" },
  "microsoft": { name: "Microsoft Office", logo: "microsoft", url: "https://www.microsoft.com/microsoft-365" }
};

const ICONS = {
  strategy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  seo: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/><path d="M8 11.5l2 2 3.5-4"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  visual: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  other: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>'
};
function serviceIcon(title) {
  const t = String(title).toLowerCase();
  const k = /strateg|property|launch|plan/.test(t) ? "strategy" : /visual|video|photo|design|brochure/.test(t) ? "visual" : /mail|newsletter|crm/.test(t) ? "email" : /seo|search|google|content/.test(t) ? "seo" : "other";
  return `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
}

function logoBox(url, name, link) {
  const inner = url ? `<img src="${esc(safeUrl(url))}" alt="${esc(name)} logo" loading="lazy">`
    : `<span>${esc(String(name || "?").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase())}</span>`;
  return link ? `<a class="logo-box" href="${esc(safeUrl(link))}" target="_blank" rel="noopener" title="${esc(name)}">${inner}</a>` : `<div class="logo-box">${inner}</div>`;
}

/* One pop-up for projects and portfolio items */
let POPUP_ITEMS = { project: [], portfolio: [] };
function openItem(kind, i) {
  const it = POPUP_ITEMS[kind][i]; if (!it) return;
  const dlg = $("#project-dialog");
  const isVideo = /youtu|vimeo|video|drive\.google/i.test(it.link || "");
  const title = tr(it.title), tag = tr(it.tag || it.category);
  dlg.querySelector(".dlg-body").innerHTML = `
    ${it.image_url
      ? (it.link ? `<a class="dlg-shot" href="${esc(safeUrl(it.link))}" target="_blank" rel="noopener"><img src="${esc(safeUrl(it.image_url))}" alt="${esc(title)}"><span>${ui("proj_open")} ↗</span></a>` : `<div class="dlg-shot"><img src="${esc(safeUrl(it.image_url))}" alt="${esc(title)}"></div>`)
      : ""}
    <div class="dlg-text">
      ${tag ? `<div class="tag">${esc(tag)}</div>` : ""}<h3>${esc(title)}</h3>${it.description ? `<p>${esc(tr(it.description))}</p>` : ""}
      ${it.link ? `<a class="btn solid" href="${esc(safeUrl(it.link))}" target="_blank" rel="noopener">${ui(isVideo ? "proj_watch" : "proj_visit")} ↗</a>` : (kind === "project" ? `<p class="muted-note">${ui("proj_soon")}</p>` : "")}
    </div>`;
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
}
function setupDialog() {
  const dlg = $("#project-dialog"); if (!dlg) return;
  const wire = (el, kind, attr) => {
    if (!el) return;
    el.addEventListener("click", e => { const c = e.target.closest(`[${attr}]`); if (c) openItem(kind, c.getAttribute(attr)); });
    el.addEventListener("keydown", e => { const c = e.target.closest(`[${attr}]`); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openItem(kind, c.getAttribute(attr)); } });
  };
  wire($("#project-list"), "project", "data-project");
  wire($("#pf-grid"), "portfolio", "data-pf");
  dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest(".dlg-close")) dlg.close(); });
}

/* Numbers that count up when they appear: "6+", "108", "2024" */
function countUp(el) {
  const m = String(el.dataset.count || "").match(/^(\D*)(\d+)(.*)$/);
  if (!m || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const [, pre, num, post] = m, target = +num;
  const start = target >= 1900 && target <= 2100 ? target - 20 : 0;
  const t0 = performance.now(), dur = 1400;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
    el.textContent = pre + Math.round(start + (target - start) * eased) + post;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function observeCounters() {
  const els = document.querySelectorAll("[data-count]:not(.counted)");
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("counted"); countUp(e.target); io.unobserve(e.target); } }), { threshold: .6 });
  els.forEach(el => io.observe(el));
}

/* "01 — About", "02 — Services"… numbered in order, skipping hidden sections */
function numberSections() {
  let n = 0;
  document.querySelectorAll("section.numbered").forEach(s => {
    if (s.hidden) return;
    n++;
    const el = s.querySelector(".sec-num");
    if (el) el.textContent = `${String(n).padStart(2, "0")} — ${ui(s.dataset.label)}`;
  });
}

/* ---------- home page ---------- */
let LAST_CONTENT = null;
function renderHome(c) {
  LAST_CONTENT = c;
  const p = c.profile;
  FR_OVERRIDES = p.fr || {};
  applyStaticTexts();
  document.title = `${p.name} — ${tr(p.headline)}`;
  const [first, ...rest] = p.name.split(" ");
  $("#hero-eyebrow").textContent = tr(p.headline);
  $("#hero-name").innerHTML = `${esc(first)}<br><em>${esc(rest.join(" "))}</em>`;
  $("#hero-pitch").textContent = tr(p.pitch);
  const av = siteAvail(p);
  $("#hero-status").textContent = [ui("avail_" + av), p.location, av === "none" ? "" : tr(p.work_note)].filter(Boolean).join(" · ");
  $(".status i").className = av === "none" ? "off" : av === "freelance" ? "free" : "";
  $("#portrait").innerHTML = `<img src="${esc(safeUrl(p.photo_url || "images/david.jpg"))}" alt="${esc(p.name)}">`;
  $("#hero-highlights").innerHTML = (p.highlights || []).map(h => `<li>${esc(tr(h))}</li>`).join("");
  const cv = $("#btn-cv");
  cv.hidden = !p.cv_url; if (p.cv_url) cv.href = safeUrl(p.cv_url);
  ["#btn-book", "#btn-book-2"].forEach(s => { const b = $(s); b.hidden = !p.booking_url; if (p.booking_url) b.href = safeUrl(p.booking_url); });

  // logo strip: every company / school logo from Experience and Education
  const seen = new Set();
  const logos = [...c.experience.map(j => ({ url: j.logo_url, name: j.org || j.title, link: j.link })), ...c.education.map(e => ({ url: e.logo_url, name: e.title, link: e.link }))]
    .filter(l => l.url && !seen.has(l.url) && seen.add(l.url));
  $("#logo-strip").hidden = logos.length < 3;
  $("#logo-row").innerHTML = logos.map(l => {
    const img = `<img src="${esc(safeUrl(l.url))}" alt="${esc(l.name)}" title="${esc(l.name)}" loading="lazy">`;
    return l.link ? `<a href="${esc(safeUrl(l.link))}" target="_blank" rel="noopener">${img}</a>` : `<span>${img}</span>`;
  }).join("");

  const services = p.services || [];
  $("#services").hidden = !services.length;
  $("#service-list").innerHTML = services.map(([t, d], i) => `
    <div class="service reveal"><div class="service-top"><span class="service-icon">${serviceIcon(t)}</span><span class="service-num">${String(i + 1).padStart(2, "0")}</span></div><h3>${esc(tr(t))}</h3><p>${esc(tr(d || ""))}</p></div>`).join("");

  $("#about-photo").innerHTML = `<img src="${esc(safeUrl(p.about_image || "images/david.jpg"))}" alt="${esc(p.name)}">`;
  $("#about-title").textContent = tr(p.about_title);
  $("#about-text").innerHTML = String(p.about || "").split(/\n{2,}/).map(t => `<p>${esc(tr(t.trim()))}</p>`).join("") +
    `<div class="facts">${(p.facts || []).map(([n, l]) => `<div class="fact"><b data-count="${esc(n)}">${esc(n)}</b><span>${esc(tr(l))}</span></div>`).join("")}</div>`;

  $("#timeline").innerHTML = c.experience.map(j => `
    <div class="job reveal"><div class="when">${esc(tr(j.period))}</div><div class="job-body">
      ${logoBox(j.logo_url, j.org || j.title, j.link)}
      <div><h3>${esc(tr(j.title))}</h3>
      <div class="where">${j.link && j.org ? `<a href="${esc(safeUrl(j.link))}" target="_blank" rel="noopener">${esc(j.org)}</a>${j.place ? " · " + esc(tr(j.place)) : ""}` : esc([j.org, tr(j.place)].filter(Boolean).join(" · "))}</div>
      <p>${esc(tr(j.description))}</p></div></div></div>`).join("");

  const results = p.results || [];
  $("#results").hidden = !results.length;
  $("#result-row").innerHTML = results.map(([n, l]) => `<div class="result reveal"><b data-count="${esc(n)}">${esc(n)}</b><span>${esc(tr(l))}</span></div>`).join("");

  POPUP_ITEMS.project = c.projects;
  $("#project-list").innerHTML = c.projects.map((pr, i) => pr.featured ? `
    <article class="project featured reveal" data-project="${i}" tabindex="0"><div>
      <div class="tag">${esc(tr(pr.tag))}</div><h3>${esc(tr(pr.title))}</h3><p>${esc(tr(pr.description))}</p>
      <span class="more">${ui(pr.link ? "proj_preview_site" : "proj_details")}</span>
    </div><div class="featured-visual">${pr.image_url ? `<img src="${esc(safeUrl(pr.image_url))}" alt="${esc(tr(pr.title))}" loading="lazy">` : ui("proj_featured_ph")}</div></article>` : `
    <article class="project reveal" data-project="${i}" tabindex="0">
      <div class="project-thumb">${pr.image_url ? `<img src="${esc(safeUrl(pr.image_url))}" alt="${esc(tr(pr.title))}" loading="lazy">` : `<span>${esc(tr(pr.title))}</span>`}</div>
      <div class="tag">${esc(tr(pr.tag))}</div><h3>${esc(tr(pr.title))}</h3><p>${esc(tr(pr.description))}</p>
      <span class="more">${ui(pr.link ? "proj_preview_open" : "proj_details")}</span>
    </article>`).join("");

  renderPortfolio(c.portfolio || []);

  const list = a => `<ul>${(a || []).map(x => `<li>${esc(tr(x))}</li>`).join("")}</ul>`;
  $("#skills-expertise").innerHTML = list(p.expertise);
  $("#skills-tools").innerHTML = `<div class="tools">${(p.tools || []).flatMap(t => String(t).split("·")).map(t => t.trim()).filter(Boolean).map(t => {
    const k = Object.keys(TOOLS).find(key => t.toLowerCase().includes(key));
    if (!k) return `<span class="tool"><span class="tool-logo blank">${esc(t[0])}</span>${esc(t)}</span>`;
    const tool = TOOLS[k];
    return `<a class="tool" href="${tool.url}" target="_blank" rel="noopener" title="${ui("tool_visit")} ${esc(tool.name)}"><img class="tool-logo" src="images/logos/${tool.logo}.png" alt="">${esc(tool.name)}<span class="arrow">↗</span></a>`;
  }).join("")}</div>`;
  $("#skills-languages").innerHTML = (p.languages || []).map(([l, lv]) => `<div class="lang">${esc(tr(l))} <em>${esc(tr(lv))}</em></div>`).join("");

  const eduItem = e => `<div class="edu-item">${logoBox(e.logo_url, e.title, e.link)}<div><div class="when">${esc(tr(e.period))}</div><h3>${esc(tr(e.title))}</h3>${e.description ? `<p>${esc(tr(e.description))}</p>` : ""}</div></div>`;
  $("#edu-left").innerHTML = c.education.filter(e => e.kind === "education").map(eduItem).join("");
  $("#edu-right").innerHTML = c.education.filter(e => e.kind !== "education").map(eduItem).join("");

  const blog = $("#home-blog");
  if (c.posts && c.posts.length) { blog.hidden = false; $("#home-posts").innerHTML = c.posts.map(postCard).join(""); }
  else blog.hidden = true;

  $("#contact-title").textContent = tr(p.contact_title);
  $("#contact-text").textContent = tr(p.contact_text);
  const li = $("#btn-linkedin"); li.hidden = !p.linkedin; li.href = safeUrl(p.linkedin);
  const web = $("#btn-website"); web.hidden = !p.website; web.href = safeUrl(p.website);
  document.querySelectorAll(".js-name").forEach(el => el.textContent = p.name);
  document.querySelectorAll(".js-location").forEach(el => el.textContent = p.location || "");

  // Contact: "Hire me" / "Freelance project" choice, depending on availability
  const kinds = { both: ["job", "freelance"], job: ["job"], freelance: ["freelance"], none: [] }[av];
  const reason = $("#reason"), form = $("#contact-form");
  reason.hidden = kinds.length < 2;
  reason.querySelectorAll(".reason-btn").forEach(b => b.hidden = !kinds.includes(b.dataset.kind));
  const pick = k => {
    form.elements.kind.value = k || "general";
    reason.querySelectorAll(".reason-btn").forEach(b => b.classList.toggle("on", b.dataset.kind === k));
    $("#reason-text").textContent = k === "job" ? tr(p.hire_text) : k === "freelance" ? tr(p.freelance_text) : "";
    form.elements.message.placeholder = ui(k === "job" ? "ph_job" : k === "freelance" ? "ph_free" : "ph_message");
  };
  reason.onclick = e => { const b = e.target.closest(".reason-btn"); if (b) pick(b.dataset.kind); };
  pick(kinds.includes(form.elements.kind.value) ? form.elements.kind.value : kinds[0]);

  const direct = [];
  if (p.email) direct.push(`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`);
  if (p.business_email) direct.push(`<a href="mailto:${esc(p.business_email)}">${esc(p.business_email)}</a>`);
  if (p.phone) direct.push(`<a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a>`);
  $("#direct").innerHTML = direct.join(`<span>·</span>`);

  numberSections();
  observeReveal();
  observeCounters();
}

/* Portfolio gallery with category filters */
let PF_FILTER = "all";
function renderPortfolio(items) {
  POPUP_ITEMS.portfolio = items;
  $("#portfolio").hidden = !items.length;
  $("#nav-portfolio").hidden = !items.length;
  const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
  if (PF_FILTER !== "all" && !cats.includes(PF_FILTER)) PF_FILTER = "all";
  $("#pf-filters").innerHTML = cats.length > 1
    ? [["all", LANG === "fr" ? "Tout" : "All"], ...cats.map(c => [c, tr(c)])].map(([k, l]) => `<button class="${PF_FILTER === k ? "on" : ""}" data-cat="${esc(k)}">${esc(l)}</button>`).join("")
    : "";
  $("#pf-filters").onclick = e => { const b = e.target.closest("[data-cat]"); if (b) { PF_FILTER = b.dataset.cat; renderPortfolio(items); } };
  $("#pf-grid").innerHTML = items.map((it, i) => (PF_FILTER === "all" || it.category === PF_FILTER) ? `
    <figure class="pf-item reveal in" data-pf="${i}" tabindex="0">
      ${it.image_url ? `<img src="${esc(safeUrl(it.image_url))}" alt="${esc(tr(it.title))}" loading="lazy">` : `<div class="pf-blank">${esc(tr(it.title))}</div>`}
      <figcaption>${it.category ? `<span>${esc(tr(it.category))}</span>` : ""}<b>${esc(tr(it.title))}</b></figcaption>
    </figure>` : "").join("");
}

function postCard(p) {
  return `<a class="post-card reveal" href="post.html?slug=${encodeURIComponent(p.slug)}">
    <div class="cover">${p.cover_url ? `<img src="${esc(safeUrl(p.cover_url))}" alt="" loading="lazy">` : ""}</div>
    <div class="body"><div class="meta">${esc([p.tag, fmtDate(p.published_at)].filter(Boolean).join(" · "))}</div>
    <h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div></a>`;
}

/* ---------- blog pages ---------- */
async function renderBlogList() {
  applyStaticTexts();
  const d = getDb(), box = $("#posts");
  let posts = cacheGet("posts") || [];
  if (d) {
    const r = await d.from("posts").select("slug,title,excerpt,cover_url,tag,published_at").eq("published", true).order("published_at", { ascending: false });
    if (!r.error) { posts = r.data; cacheSet("posts", posts); }
  }
  box.innerHTML = posts.length ? posts.map(postCard).join("") : `<p class="empty">${ui("blog_empty")}</p>`;
  box.style.display = posts.length ? "" : "block";
  observeReveal();
}

async function renderPost() {
  applyStaticTexts();
  const slug = new URLSearchParams(location.search).get("slug");
  const d = getDb(), box = $("#article");
  let post = null;
  if (d && slug) {
    const r = await d.from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
    post = r.data;
  }
  if (!post) { box.innerHTML = `<h1>${ui("blog_404")}</h1><a class="back" href="blog.html">${ui("blog_back")}</a>`; return; }
  document.title = `${post.title} — David Caramelo`;
  const md = document.querySelector('meta[name="description"]'); if (md) md.content = post.excerpt || post.title;
  box.innerHTML = `<div class="meta">${esc([post.tag, fmtDate(post.published_at)].filter(Boolean).join(" · "))}</div>
    <h1>${esc(post.title)}</h1>
    ${post.cover_url ? `<img class="cover" src="${esc(safeUrl(post.cover_url))}" alt="">` : ""}
    <div class="prose">${markdown(post.body)}</div>
    <a class="back" href="blog.html">${ui("blog_back")}</a>`;
}

/* ---------- visits & messages ---------- */
function trackVisit() {
  const d = getDb();
  if (!d || location.protocol === "file:" || /localhost|127\.0\.0\.1/.test(location.hostname)) return; // don't count your own previews
  if (localStorage.getItem("dc_is_admin")) return; // don't count the admin's own visits
  let v = localStorage.getItem("dc_visitor");
  if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); try { localStorage.setItem("dc_visitor", v); } catch {} }
  d.from("page_views").insert({ path: location.pathname + location.search, referrer: document.referrer.slice(0, 500), visitor: v }).then(() => {});
}

/* Sends David an email for every new contact message (via FormSubmit). The message is already saved in the admin inbox, so a failure here is harmless. */
function notifyByEmail(m) {
  const to = (window.SITE_CONFIG || {}).NOTIFY_EMAIL;
  if (!to) return;
  const label = { job: "job offer", freelance: "freelance request" }[m.kind] || "message";
  fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    referrerPolicy: "origin", // FormSubmit activation is per page address: always send the homepage address
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: `New ${label} from ${m.name} — your website`,
      _template: "table", _captcha: "false", _replyto: m.email,
      Type: label.charAt(0).toUpperCase() + label.slice(1), Name: m.name, Email: m.email, Message: m.message,
      Language: LANG === "fr" ? "French" : "English",
      "Open your inbox": location.origin + "/admin.html"
    })
  }).catch(() => {});
}

function setupContactForm() {
  const f = $("#contact-form"); if (!f) return;
  const note = $("#form-note");
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const d = getDb();
    if (!d) { note.textContent = ui("form_offline"); return; }
    const data = Object.fromEntries(new FormData(f));
    if (data.website) return; // spam trap
    note.textContent = ui("form_sending");
    const kind = ["job", "freelance"].includes(data.kind) ? data.kind : "general";
    const r = await d.from("messages").insert({ name: data.name.trim(), email: data.email.trim(), message: data.message.trim(), kind });
    if (r.error) { note.textContent = ui("form_err"); return; }
    notifyByEmail({ name: data.name.trim(), email: data.email.trim(), message: data.message.trim(), kind });
    f.reset(); f.elements.kind.value = kind; // keep the Hire me / Freelance choice
    note.textContent = ui("form_ok");
  });
}

/* ---------- shared page behaviour ---------- */
function observeReveal() {
  const els = document.querySelectorAll(".reveal:not(.in)");
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  els.forEach(el => io.observe(el));
}

function setupChrome() {
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
  const header = document.querySelector("header"), bar = $("#progress"), top = $("#to-top");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 20 || document.body.dataset.solid === "1");
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    if (top) top.classList.toggle("show", scrollY > 700);
  };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  top?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  $(".menu-btn")?.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  document.querySelectorAll(".nav ul a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  document.querySelectorAll(".lang-switch [data-lang]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.lang === LANG) return;
    setLang(b.dataset.lang);
    const page = document.body.dataset.page;
    if (page === "home" && LAST_CONTENT) renderHome(LAST_CONTENT);
    else if (page === "blog") renderBlogList();
    else if (page === "post") renderPost();
    else applyStaticTexts();
  }));
  applyStaticTexts();
}

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (!page) return; // e.g. admin page: only uses the helpers above
  setupChrome();
  if (page === "home") { renderHome(cacheGet("content") || FALLBACK); setupContactForm(); setupDialog(); const c = await loadContent(); renderHome(c); }
  if (page === "blog") await renderBlogList();
  if (page === "post") await renderPost();
  observeReveal();
  trackVisit();
});
