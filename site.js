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
    email: "", phone: "", location: "Angers, France", work_note: "Remote or relocation within France"
  },
  experience: [
    { title: "Founder", org: "Lusitania Investments", place: "Angers, France", period: "2024 — Present", description: "Founded and built a real estate investment company connecting international investors with property opportunities in Portugal. I lead business development and the full marketing strategy: brand, website content, SEO, email marketing and social media." },
    { title: "Marketing Intern", org: "Weenat", place: "Nantes, France", period: "2025 — 2026", description: "Contributed to digital marketing campaigns through content creation, social media management and market analysis, helping increase brand visibility and engagement." },
    { title: "Freelance Marketing Manager", org: "", place: "Remote", period: "2019 — Present", description: "Creating targeted social media content for clients to increase visibility and engage potential customers." },
    { title: "Sales Assistant", org: "Fitness Up", place: "Oeiras, Portugal", period: "2021 — 2022", description: "Delivered high-quality customer service with personalised advice and tailored membership plans, and promoted the gym's services." }
  ],
  projects: [
    { title: "Lusitania Investments", tag: "Real Estate · Founder", featured: true, link: "https://lusitaniainvestments.fr/", description: "A real estate company helping international (especially French) investors buy property in Portugal. I built its marketing from the ground up: positioning, SEO and content strategy, email campaigns, property listings and social media." },
    { title: "Geldloket Communication Strategy", tag: "Strategy · 2022–2023", description: "A marketing and communication strategy for a financial consulting firm for young adults, with social media content, influencer collaborations, workshops and partnerships." },
    { title: "City of Emmen Promo Film", tag: "Video · 2022", description: "A promotional video for the city of Emmen, taken from brainstorming and storyboard through filming landmarks and interviews with locals." },
    { title: "Helios Student Association", tag: "Campus · Marketing Manager", description: "Designed and ran targeted communication strategies to raise awareness for the association at NHL Stenden University." }
  ],
  education: [
    { kind: "education", title: "BBA International Business", period: "2023 — Present", description: "NHL Stenden University of Applied Sciences, Emmen (NL). Specialisation in Marketing & Sales, plus Finance, Operations & Supply Chain, and Organisational Behaviour." },
    { kind: "education", title: "Business Diploma", period: "2017 — 2020", description: "São João do Estoril Vocational High School, Portugal. Specialisation in Marketing, Advertising & Public Relations." },
    { kind: "certification", title: "The Fundamentals of Digital Marketing", period: "2023" },
    { kind: "certification", title: "Google Analytics", period: "2022" },
    { kind: "certification", title: "English C2 — IELTS Academic", period: "2020" },
    { kind: "certification", title: "X-Honours Programme, NHL Stenden", period: "2022", description: "Leadership development and cross-cultural business." }
  ],
  posts: []
};

/* ---------- helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = u => /^(https?:\/\/|mailto:|\/|\.\/|images\/|[a-z0-9-]+\.html)/i.test(u || "") ? u : "#";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
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
    const [p, ex, pr, ed, po] = await Promise.all([
      d.from("profile").select("data").eq("id", 1).maybeSingle(),
      d.from("experience").select("*").eq("visible", true).order("sort"),
      d.from("projects").select("*").eq("visible", true).order("sort"),
      d.from("education").select("*").eq("visible", true).order("sort"),
      d.from("posts").select("slug,title,excerpt,cover_url,tag,published_at").eq("published", true).order("published_at", { ascending: false }).limit(3)
    ]);
    if (p.error || ex.error) throw p.error || ex.error;
    const content = {
      profile: { ...FALLBACK.profile, ...(p.data?.data || {}) },
      experience: ex.data, projects: pr.data || [], education: ed.data || [], posts: po.data || []
    };
    cacheSet("content", content);
    return content;
  } catch (e) {
    console.warn("Using saved content:", e);
    return cacheGet("content") || FALLBACK;
  }
}

/* ---------- availability ---------- */
const AVAIL_LABEL = { both: "Open to work & freelance", job: "Open to work", freelance: "Available for freelance", none: "Not currently available" };
const siteAvail = p => AVAIL_LABEL[p.availability] ? p.availability : (p.open_to_hire === false ? (p.freelance ? "freelance" : "none") : (p.freelance === false ? "job" : "both"));

/* ---------- home page ---------- */
function renderHome(c) {
  const p = c.profile;
  document.title = `${p.name} — ${p.headline}`;
  const [first, ...rest] = p.name.split(" ");
  $("#hero-eyebrow").textContent = p.headline;
  $("#hero-name").innerHTML = `${esc(first)}<br><em>${esc(rest.join(" "))}</em>`;
  $("#hero-pitch").textContent = p.pitch;
  const av = siteAvail(p);
  $("#hero-status").textContent = [AVAIL_LABEL[av], p.location, av === "none" ? "" : p.work_note].filter(Boolean).join(" · ");
  $(".status i").className = av === "none" ? "off" : av === "freelance" ? "free" : "";
  $("#portrait").innerHTML = `<img src="${esc(safeUrl(p.photo_url || "images/david.jpg"))}" alt="${esc(p.name)}">`;
  $("#hero-highlights").innerHTML = (p.highlights || []).map(h => `<li>${esc(h)}</li>`).join("");
  const cv = $("#btn-cv");
  cv.hidden = !p.cv_url; if (p.cv_url) cv.href = safeUrl(p.cv_url);

  const services = p.services || [];
  $("#services").hidden = !services.length;
  $("#service-list").innerHTML = services.map(([t, d], i) => `
    <div class="service reveal"><span class="service-num">${String(i + 1).padStart(2, "0")}</span><h3>${esc(t)}</h3><p>${esc(d || "")}</p></div>`).join("");

  $("#about-title").textContent = p.about_title;
  $("#about-text").innerHTML = String(p.about || "").split(/\n{2,}/).map(t => `<p>${esc(t)}</p>`).join("") +
    `<div class="facts">${(p.facts || []).map(([n, l]) => `<div class="fact"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join("")}</div>`;

  $("#timeline").innerHTML = c.experience.map(j => `
    <div class="job reveal"><div class="when">${esc(j.period)}</div><div>
      <h3>${esc(j.title)}</h3>
      <div class="where">${esc([j.org, j.place].filter(Boolean).join(" · "))}</div>
      <p>${esc(j.description)}</p></div></div>`).join("");

  $("#project-list").innerHTML = c.projects.map(pr => pr.featured ? `
    <article class="project featured reveal"><div>
      <div class="tag">${esc(pr.tag)}</div><h3>${esc(pr.title)}</h3><p>${esc(pr.description)}</p>
      ${pr.link ? `<a class="more" href="${esc(safeUrl(pr.link))}" target="_blank" rel="noopener">Visit the website</a>` : ""}
    </div><div class="featured-visual">${pr.image_url ? `<img src="${esc(safeUrl(pr.image_url))}" alt="${esc(pr.title)}">` : "Property marketing, from strategy to listing."}</div></article>` : `
    <article class="project reveal">
      ${pr.image_url ? `<img class="project-img" src="${esc(safeUrl(pr.image_url))}" alt="${esc(pr.title)}">` : ""}
      <div class="tag">${esc(pr.tag)}</div><h3>${esc(pr.title)}</h3><p>${esc(pr.description)}</p>
      ${pr.link ? `<a class="more" href="${esc(safeUrl(pr.link))}" target="_blank" rel="noopener">View project</a>` : ""}
    </article>`).join("");

  const list = a => `<ul>${(a || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  $("#skills-expertise").innerHTML = list(p.expertise);
  $("#skills-tools").innerHTML = list(p.tools);
  $("#skills-languages").innerHTML = (p.languages || []).map(([l, lv]) => `<div class="lang">${esc(l)} <em>${esc(lv)}</em></div>`).join("");

  const eduItem = e => `<div class="edu-item"><div class="when">${esc(e.period)}</div><h3>${esc(e.title)}</h3>${e.description ? `<p>${esc(e.description)}</p>` : ""}</div>`;
  $("#edu-left").innerHTML = c.education.filter(e => e.kind === "education").map(eduItem).join("");
  $("#edu-right").innerHTML = c.education.filter(e => e.kind !== "education").map(eduItem).join("");

  const blog = $("#home-blog");
  if (c.posts && c.posts.length) {
    blog.hidden = false;
    $("#home-posts").innerHTML = c.posts.map(postCard).join("");
  } else blog.hidden = true;

  $("#contact-title").textContent = p.contact_title;
  $("#contact-text").textContent = p.contact_text;
  const li = $("#btn-linkedin");
  li.hidden = !p.linkedin; li.href = safeUrl(p.linkedin);
  const web = $("#btn-website");
  web.hidden = !p.website; web.href = safeUrl(p.website);
  document.querySelectorAll(".js-name").forEach(el => el.textContent = p.name);
  document.querySelectorAll(".js-location").forEach(el => el.textContent = p.location || "");

  // Contact: "Hire me" / "Freelance project" choice, depending on what David is open to
  const kinds = { both: ["job", "freelance"], job: ["job"], freelance: ["freelance"], none: [] }[av];
  const reason = $("#reason"), form = $("#contact-form");
  reason.hidden = kinds.length < 2;
  reason.querySelectorAll(".reason-btn").forEach(b => b.hidden = !kinds.includes(b.dataset.kind));
  const pick = k => {
    form.elements.kind.value = k || "general";
    reason.querySelectorAll(".reason-btn").forEach(b => b.classList.toggle("on", b.dataset.kind === k));
    $("#reason-text").textContent = k === "job" ? p.hire_text : k === "freelance" ? p.freelance_text : "";
    form.elements.message.placeholder = k === "job" ? "Tell me about the role and your company" : k === "freelance" ? "Tell me about your project, budget and timeline" : "Your message";
  };
  reason.onclick = e => { const b = e.target.closest(".reason-btn"); if (b) pick(b.dataset.kind); };
  pick(kinds.includes(form.elements.kind.value) ? form.elements.kind.value : kinds[0]);

  const direct = [];
  if (p.email) direct.push(`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`);
  if (p.phone) direct.push(`<a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a>`);
  $("#direct").innerHTML = direct.join(`<span>·</span>`);
  observeReveal();
}

function postCard(p) {
  return `<a class="post-card reveal" href="post.html?slug=${encodeURIComponent(p.slug)}">
    <div class="cover">${p.cover_url ? `<img src="${esc(safeUrl(p.cover_url))}" alt="" loading="lazy">` : ""}</div>
    <div class="body"><div class="meta">${esc([p.tag, fmtDate(p.published_at)].filter(Boolean).join(" · "))}</div>
    <h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div></a>`;
}

/* ---------- blog pages ---------- */
async function renderBlogList() {
  const d = getDb(), box = $("#posts");
  let posts = cacheGet("posts") || [];
  if (d) {
    const r = await d.from("posts").select("slug,title,excerpt,cover_url,tag,published_at").eq("published", true).order("published_at", { ascending: false });
    if (!r.error) { posts = r.data; cacheSet("posts", posts); }
  }
  box.innerHTML = posts.length ? posts.map(postCard).join("") : `<p class="empty">No articles yet. Check back soon.</p>`;
  if (!posts.length) box.style.display = "block";
  observeReveal();
}

async function renderPost() {
  const slug = new URLSearchParams(location.search).get("slug");
  const d = getDb(), box = $("#article");
  let post = null;
  if (d && slug) {
    const r = await d.from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
    post = r.data;
  }
  if (!post) { box.innerHTML = `<h1>Article not found</h1><a class="back" href="blog.html">← All articles</a>`; return; }
  document.title = `${post.title} — David Caramelo`;
  const md = document.querySelector('meta[name="description"]'); if (md) md.content = post.excerpt || post.title;
  box.innerHTML = `<div class="meta">${esc([post.tag, fmtDate(post.published_at)].filter(Boolean).join(" · "))}</div>
    <h1>${esc(post.title)}</h1>
    ${post.cover_url ? `<img class="cover" src="${esc(safeUrl(post.cover_url))}" alt="">` : ""}
    <div class="prose">${markdown(post.body)}</div>
    <a class="back" href="blog.html">← All articles</a>`;
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

function setupContactForm() {
  const f = $("#contact-form"); if (!f) return;
  const note = $("#form-note");
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const d = getDb();
    if (!d) { note.textContent = "The contact form works once the site is online. Please use LinkedIn for now."; return; }
    const data = Object.fromEntries(new FormData(f));
    if (data.website) return; // spam trap
    note.textContent = "Sending…";
    const kind = ["job", "freelance"].includes(data.kind) ? data.kind : "general";
    const r = await d.from("messages").insert({ name: data.name.trim(), email: data.email.trim(), message: data.message.trim(), kind });
    if (r.error) { note.textContent = "Sorry, something went wrong. Please try LinkedIn instead."; return; }
    f.reset(); note.textContent = "Thank you, your message has been sent. I'll get back to you soon.";
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
  const header = document.querySelector("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20 || document.body.dataset.solid === "1");
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  $(".menu-btn")?.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  document.querySelectorAll(".nav ul a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
}

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (!page) return; // e.g. admin page: only uses the helpers above
  setupChrome();
  if (page === "home") { renderHome(FALLBACK); setupContactForm(); const c = await loadContent(); renderHome(c); }
  if (page === "blog") await renderBlogList();
  if (page === "post") await renderPost();
  observeReveal();
  trackVisit();
});
