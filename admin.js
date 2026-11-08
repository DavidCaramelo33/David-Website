/* Admin panel logic. Uses helpers from site.js: getDb, esc, markdown, fmtDate, safeUrl */

const sb = getDb();
const V = document.getElementById("view");
const VT = document.getElementById("view-title");
const VA = document.getElementById("view-actions");

function toast(msg, err) {
  const t = document.createElement("div");
  t.className = "toast" + (err ? " err" : ""); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), err ? 5000 : 2500);
}
function fail(r, what) { if (r && r.error) { toast(`${what}: ${r.error.message}`, true); return true; } return false; }
const slugify = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

async function upload(file, folder) {
  const name = `${folder}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop().toLowerCase()}`;
  const r = await sb.storage.from("media").upload(name, file, { cacheControl: "31536000", upsert: false });
  if (fail(r, "Upload failed")) return null;
  return sb.storage.from("media").getPublicUrl(name).data.publicUrl;
}

/* ---------- field rendering ---------- */
function fieldHtml(f, val) {
  const v = val ?? "";
  const lbl = `${esc(f.label)}${f.hint ? ` <small>${esc(f.hint)}</small>` : ""}`;
  switch (f.type) {
    case "textarea": return `<label>${lbl}<textarea name="${f.name}" class="${f.big ? "big" : ""}">${esc(v)}</textarea></label>`;
    case "bool": return `<label class="check"><input type="checkbox" name="${f.name}" ${v ? "checked" : ""}> ${esc(f.label)}</label>`;
    case "select": return `<label>${lbl}<select name="${f.name}">${f.options.map(([k, t]) => `<option value="${k}" ${k === v ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
    case "image": return `<label>${lbl}</label><div class="img-field" data-img="${f.name}">
        <img src="${esc(v)}" ${v ? "" : "hidden"} alt="">
        <input type="hidden" name="${f.name}" value="${esc(v)}">
        <input type="file" accept="image/*">
        <button type="button" class="btn ghost sm" data-clear ${v ? "" : "hidden"}>Remove image</button></div>`;
    default: return `<label>${lbl}<input type="${f.type || "text"}" name="${f.name}" value="${esc(v)}" ${f.required ? "required" : ""}></label>`;
  }
}
function wireImages(root, folder) {
  root.querySelectorAll("[data-img]").forEach(box => {
    const img = box.querySelector("img"), hid = box.querySelector("input[type=hidden]"), file = box.querySelector("input[type=file]"), clr = box.querySelector("[data-clear]");
    file.addEventListener("change", async () => {
      if (!file.files[0]) return;
      if (file.files[0].size > 8 * 1024 * 1024) { toast("Image is too large (max 8 MB)", true); return; }
      toast("Uploading…");
      const url = await upload(file.files[0], folder);
      if (url) { hid.value = url; img.src = url; img.hidden = false; clr.hidden = false; toast("Image uploaded"); }
      file.value = "";
    });
    clr.addEventListener("click", () => { hid.value = ""; img.hidden = true; clr.hidden = true; });
  });
}
function readForm(form, fields) {
  const o = {};
  fields.forEach(f => {
    const el = form.elements[f.name];
    if (!el) return;
    if (f.type === "bool") o[f.name] = el.checked;
    else if (f.type === "number") o[f.name] = Number(el.value) || 0;
    else o[f.name] = el.value.trim() || null;
  });
  return o;
}

/* ---------- generic list editor (projects, experience, education) ---------- */
const LISTS = {
  projects: {
    title: "Projects", folder: "projects",
    sub: r => [r.tag, r.featured ? "Featured" : ""].filter(Boolean).join(" · "),
    fields: [
      { name: "title", label: "Project name", required: true },
      { name: "tag", label: "Small label", hint: "e.g. Real Estate · 2025" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "link", label: "Link", hint: "optional, e.g. https://…", type: "url" },
      { name: "image_url", label: "Image", type: "image" },
      { name: "featured", label: "Show as the big featured project", type: "bool" },
      { name: "visible", label: "Visible on the website", type: "bool" }
    ]
  },
  experience: {
    title: "Experience", folder: "experience",
    sub: r => [r.org, r.period].filter(Boolean).join(" · "),
    fields: [
      { name: "title", label: "Job title", required: true },
      { name: "org", label: "Company" },
      { name: "place", label: "Location" },
      { name: "period", label: "Dates", hint: "e.g. 2024 — Present" },
      { name: "description", label: "What you did", type: "textarea" },
      { name: "visible", label: "Visible on the website", type: "bool" }
    ]
  },
  education: {
    title: "Education", folder: "education",
    sub: r => [r.kind === "education" ? "Education" : "Certification", r.period].filter(Boolean).join(" · "),
    fields: [
      { name: "kind", label: "Type", type: "select", options: [["education", "Education"], ["certification", "Certification / programme"]] },
      { name: "title", label: "Title", required: true },
      { name: "period", label: "Dates" },
      { name: "description", label: "Details", type: "textarea" },
      { name: "visible", label: "Visible on the website", type: "bool" }
    ]
  }
};

async function showList(key) {
  const cfg = LISTS[key];
  VT.textContent = cfg.title;
  VA.innerHTML = `<button class="btn" id="add">+ Add new</button>`;
  document.getElementById("add").onclick = () => editItem(key, null);
  const r = await sb.from(key).select("*").order("sort");
  if (fail(r, "Could not load")) return;
  const rows = r.data;
  if (!rows.length) { V.innerHTML = `<div class="empty">Nothing here yet.</div>`; return; }
  V.innerHTML = `<div class="list">${rows.map((row, i) => `
    <div class="item">
      ${row.image_url ? `<img src="${esc(row.image_url)}" alt="">` : ""}
      <div class="info"><div class="t">${esc(row.title)}${row.visible ? "" : `<span class="pill">Hidden</span>`}</div><div class="s">${esc(cfg.sub(row))}</div></div>
      <div class="acts">
        <button class="btn ghost sm" data-up="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
        <button class="btn ghost sm" data-down="${i}" ${i === rows.length - 1 ? "disabled" : ""}>↓</button>
        <button class="btn ghost sm" data-edit="${i}">Edit</button>
        <button class="btn danger sm" data-del="${i}">Delete</button>
      </div></div>`).join("")}</div>`;
  V.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.edit) editItem(key, rows[b.dataset.edit]);
    if (b.dataset.del) {
      const row = rows[b.dataset.del];
      if (!confirm(`Delete "${row.title}"? This can't be undone.`)) return;
      if (!fail(await sb.from(key).delete().eq("id", row.id), "Delete failed")) { toast("Deleted"); showList(key); }
    }
    if (b.dataset.up || b.dataset.down) {
      const i = Number(b.dataset.up ?? b.dataset.down), j = b.dataset.up ? i - 1 : i + 1;
      [rows[i], rows[j]] = [rows[j], rows[i]];
      await Promise.all(rows.map((row, k) => sb.from(key).update({ sort: k + 1 }).eq("id", row.id)));
      showList(key);
    }
  };
}

function editItem(key, row) {
  const cfg = LISTS[key];
  const isNew = !row;
  row = row || { visible: true, kind: "education" };
  VT.textContent = isNew ? `New — ${cfg.title}` : `Edit — ${row.title}`;
  VA.innerHTML = "";
  V.onclick = null;
  V.innerHTML = `<form class="form card" id="f">${cfg.fields.map(f => fieldHtml(f, row[f.name])).join("")}
    <div class="form-actions"><button class="btn" type="submit">Save</button><button class="btn ghost" type="button" id="cancel">Cancel</button></div></form>`;
  const form = document.getElementById("f");
  wireImages(form, cfg.folder);
  document.getElementById("cancel").onclick = () => showList(key);
  form.onsubmit = async e => {
    e.preventDefault();
    const data = readForm(form, cfg.fields);
    let r;
    if (isNew) {
      const max = await sb.from(key).select("sort").order("sort", { ascending: false }).limit(1);
      data.sort = ((max.data && max.data[0] && max.data[0].sort) || 0) + 1;
      r = await sb.from(key).insert(data);
    } else r = await sb.from(key).update(data).eq("id", row.id);
    if (!fail(r, "Save failed")) { toast("Saved"); showList(key); }
  };
}

/* ---------- blog posts ---------- */
async function showPosts() {
  VT.textContent = "Blog posts";
  VA.innerHTML = `<button class="btn" id="add">+ New article</button>`;
  document.getElementById("add").onclick = () => editPost(null);
  const r = await sb.from("posts").select("id,slug,title,tag,cover_url,published,published_at,updated_at").order("created_at", { ascending: false });
  if (fail(r, "Could not load")) return;
  const rows = r.data;
  if (!rows.length) { V.innerHTML = `<div class="empty">No articles yet. Click “New article” to write your first one.</div>`; V.onclick = null; return; }
  V.innerHTML = `<div class="list">${rows.map((p, i) => `
    <div class="item">
      ${p.cover_url ? `<img src="${esc(p.cover_url)}" alt="">` : ""}
      <div class="info"><div class="t">${esc(p.title)} <span class="pill ${p.published ? "live" : ""}">${p.published ? "Published" : "Draft"}</span></div>
      <div class="s">${esc(p.published ? "Published " + fmtDate(p.published_at) : "Last edited " + fmtDate(p.updated_at))}</div></div>
      <div class="acts">
        ${p.published ? `<a class="btn ghost sm" href="post.html?slug=${encodeURIComponent(p.slug)}" target="_blank" style="text-decoration:none">View ↗</a>` : ""}
        <button class="btn ghost sm" data-edit="${i}">Edit</button>
        <button class="btn danger sm" data-del="${i}">Delete</button>
      </div></div>`).join("")}</div>`;
  V.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.edit) { const full = await sb.from("posts").select("*").eq("id", rows[b.dataset.edit].id).single(); if (!fail(full, "Load failed")) editPost(full.data); }
    if (b.dataset.del) {
      const p = rows[b.dataset.del];
      if (!confirm(`Delete the article "${p.title}"? This can't be undone.`)) return;
      if (!fail(await sb.from("posts").delete().eq("id", p.id), "Delete failed")) { toast("Deleted"); showPosts(); }
    }
  };
}

function editPost(p) {
  const isNew = !p;
  p = p || { published: false };
  VT.textContent = isNew ? "New article" : "Edit article";
  VA.innerHTML = ""; V.onclick = null;
  V.innerHTML = `<form class="form" id="f">
    <div class="card form">
      ${fieldHtml({ name: "title", label: "Title", required: true }, p.title)}
      <div class="row2">
        ${fieldHtml({ name: "tag", label: "Category", hint: "e.g. Case study, SEO, Real estate" }, p.tag)}
        ${fieldHtml({ name: "slug", label: "Web address", hint: "filled in automatically" }, p.slug)}
      </div>
      ${fieldHtml({ name: "excerpt", label: "Short summary", hint: "shown on the article cards and in Google", type: "textarea" }, p.excerpt)}
      ${fieldHtml({ name: "cover_url", label: "Cover image", type: "image" }, p.cover_url)}
    </div>
    <div class="card form">
      <div><div class="tabs"><button type="button" class="on" data-tab="write">Write</button><button type="button" data-tab="preview">Preview</button></div>
      <textarea name="body" class="big" placeholder="Write your article here…">${esc(p.body || "")}</textarea>
      <div class="preview" hidden></div></div>
      <div class="help">Formatting: leave an empty line between paragraphs · <code>## Heading</code> · <code>**bold**</code> · <code>*italic*</code> · <code>- list item</code> · <code>&gt; quote</code> · <code>[link text](https://…)</code> · <button type="button" class="btn ghost sm" id="ins-img">Insert image</button><input type="file" accept="image/*" id="ins-file" hidden></div>
      <label class="check"><input type="checkbox" name="published" ${p.published ? "checked" : ""}> Published (visible on the website)</label>
    </div>
    <div class="form-actions"><button class="btn" type="submit">Save</button><button class="btn ghost" type="button" id="cancel">Cancel</button></div>
  </form>`;
  const form = document.getElementById("f");
  wireImages(form, "blog");
  const title = form.elements.title, slug = form.elements.slug, body = form.elements.body, prev = form.querySelector(".preview");
  let slugTouched = !!p.slug;
  slug.addEventListener("input", () => slugTouched = true);
  title.addEventListener("input", () => { if (!slugTouched) slug.value = slugify(title.value); });
  form.querySelectorAll("[data-tab]").forEach(t => t.onclick = () => {
    form.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("on", x === t));
    const pv = t.dataset.tab === "preview";
    body.hidden = pv; prev.hidden = !pv;
    if (pv) prev.innerHTML = markdown(body.value) || `<p class="muted">Nothing to preview yet.</p>`;
  });
  const insFile = document.getElementById("ins-file");
  document.getElementById("ins-img").onclick = () => insFile.click();
  insFile.onchange = async () => {
    if (!insFile.files[0]) return;
    toast("Uploading…");
    const url = await upload(insFile.files[0], "blog");
    if (url) {
      const pos = body.selectionStart ?? body.value.length;
      body.value = body.value.slice(0, pos) + `\n\n![](${url})\n\n` + body.value.slice(pos);
      toast("Image added to the article");
    }
    insFile.value = "";
  };
  document.getElementById("cancel").onclick = showPosts;
  form.onsubmit = async e => {
    e.preventDefault();
    const published = form.elements.published.checked;
    const data = {
      title: title.value.trim(), slug: slugify(slug.value || title.value), tag: form.elements.tag.value.trim() || null,
      excerpt: form.elements.excerpt.value.trim() || null, cover_url: form.elements.cover_url.value || null,
      body: body.value, published, updated_at: new Date().toISOString(),
      published_at: published ? (p.published_at || new Date().toISOString()) : p.published_at || null
    };
    if (!data.slug) { toast("Please add a title", true); return; }
    const r = isNew ? await sb.from("posts").insert(data) : await sb.from("posts").update(data).eq("id", p.id);
    if (r.error && /duplicate|unique/i.test(r.error.message)) { toast("Another article already uses this web address. Change it slightly.", true); return; }
    if (!fail(r, "Save failed")) { toast(published ? "Saved and published" : "Saved as draft"); showPosts(); }
  };
}

/* ---------- profile ---------- */
const PROFILE_FIELDS = [
  { name: "name", label: "Your name" },
  { name: "headline", label: "Headline", hint: "small text above your name" },
  { name: "pitch", label: "One-line pitch", type: "textarea" },
  { name: "status", label: "Availability line", hint: "e.g. Open to work · Angers, France" },
  { name: "photo_url", label: "Your photo", type: "image" },
  { name: "about_title", label: "About — title" },
  { name: "about", label: "About — text", hint: "empty line between paragraphs", type: "textarea", big: true },
  { name: "facts", label: "Key numbers", hint: "one per line: number | label", type: "textarea", pairs: true },
  { name: "expertise", label: "Expertise", hint: "one per line", type: "textarea", lines: true },
  { name: "tools", label: "Tools", hint: "one per line", type: "textarea", lines: true },
  { name: "languages", label: "Languages", hint: "one per line: language | level", type: "textarea", pairs: true },
  { name: "linkedin", label: "LinkedIn link", type: "url" },
  { name: "website", label: "Other website link", type: "url" },
  { name: "contact_title", label: "Contact — title" },
  { name: "contact_text", label: "Contact — text", type: "textarea" }
];

async function showProfile() {
  VT.textContent = "Profile & About"; VA.innerHTML = ""; V.onclick = null;
  const r = await sb.from("profile").select("data").eq("id", 1).maybeSingle();
  if (fail(r, "Could not load")) return;
  const d = { ...FALLBACK.profile, ...(r.data?.data || {}) };
  const show = f => f.pairs ? (d[f.name] || []).map(x => x.join(" | ")).join("\n") : f.lines ? (d[f.name] || []).join("\n") : d[f.name];
  V.innerHTML = `<form class="form card" id="f">${PROFILE_FIELDS.map(f => fieldHtml(f, show(f))).join("")}
    <div class="form-actions"><button class="btn" type="submit">Save changes</button></div></form>`;
  const form = document.getElementById("f");
  form.querySelector("textarea[name=expertise]").style.minHeight = "170px";
  form.querySelector("textarea[name=tools]").style.minHeight = "170px";
  wireImages(form, "profile");
  form.onsubmit = async e => {
    e.preventDefault();
    const out = {};
    PROFILE_FIELDS.forEach(f => {
      const v = form.elements[f.name].value;
      const lines = v.split("\n").map(s => s.trim()).filter(Boolean);
      out[f.name] = f.pairs ? lines.map(l => l.split("|").map(s => s.trim()).slice(0, 2)) : f.lines ? lines : v.trim();
    });
    const res = await sb.from("profile").upsert({ id: 1, data: out, updated_at: new Date().toISOString() });
    if (!fail(res, "Save failed")) toast("Profile saved");
  };
}

/* ---------- messages ---------- */
async function showMessages() {
  VT.textContent = "Messages"; VA.innerHTML = "";
  const r = await sb.from("messages").select("*").order("created_at", { ascending: false });
  if (fail(r, "Could not load")) return;
  const rows = r.data;
  if (!rows.length) { V.innerHTML = `<div class="empty">No messages yet. When someone uses the contact form on your website, it will appear here.</div>`; V.onclick = null; return; }
  V.innerHTML = `<div class="list">${rows.map((m, i) => `
    <div class="msg ${m.is_read ? "" : "unread"}">
      <div class="head"><div><b>${esc(m.name)}</b> <span class="muted">· ${esc(m.email)}</span></div><span class="muted">${new Date(m.created_at).toLocaleString("en-GB")}</span></div>
      <p>${esc(m.message)}</p>
      <div class="acts">
        <a class="btn sm" style="text-decoration:none" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent("Re: your message")}">Reply by email</a>
        <button class="btn ghost sm" data-read="${i}">${m.is_read ? "Mark unread" : "Mark read"}</button>
        <button class="btn danger sm" data-del="${i}">Delete</button>
      </div></div>`).join("")}</div>`;
  V.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.read) { const m = rows[b.dataset.read]; await sb.from("messages").update({ is_read: !m.is_read }).eq("id", m.id); showMessages(); refreshBadge(); }
    if (b.dataset.del) {
      const m = rows[b.dataset.del];
      if (!confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
      if (!fail(await sb.from("messages").delete().eq("id", m.id), "Delete failed")) { showMessages(); refreshBadge(); }
    }
  };
}
async function refreshBadge() {
  const r = await sb.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false);
  const b = document.getElementById("unread-badge");
  b.hidden = !r.count; b.textContent = r.count || "";
  return r.count || 0;
}

/* ---------- dashboard ---------- */
async function showDashboard() {
  VT.textContent = "Dashboard"; VA.innerHTML = ""; V.onclick = null;
  V.innerHTML = `<p class="muted">Loading…</p>`;
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [views, unread, posts] = await Promise.all([
    sb.from("page_views").select("path,referrer,visitor,created_at").gte("created_at", since).order("created_at").limit(10000),
    refreshBadge(),
    sb.from("posts").select("id", { count: "exact", head: true }).eq("published", true)
  ]);
  if (fail(views, "Could not load visits")) return;
  const v = views.data, weekAgo = Date.now() - 7 * 864e5;
  const days = [...Array(30)].map((_, i) => { const d = new Date(Date.now() - (29 - i) * 864e5); return d.toISOString().slice(0, 10); });
  const perDay = Object.fromEntries(days.map(d => [d, 0]));
  v.forEach(x => { const d = x.created_at.slice(0, 10); if (d in perDay) perDay[d]++; });
  const max = Math.max(1, ...Object.values(perDay));
  const count = (arr, fn) => Object.entries(arr.reduce((m, x) => { const k = fn(x); if (k) m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const pageName = p => { if (!p || p === "/" || /index\.html$/.test(p)) return "Home"; if (/blog/.test(p)) return "Blog"; const m = p.match(/slug=([^&]+)/); return m ? "Article: " + decodeURIComponent(m[1]) : p; };
  const ref = r => { try { return r ? new URL(r).hostname.replace(/^www\./, "") : "Direct / unknown"; } catch { return "Direct / unknown"; } };
  const pages = count(v, x => pageName(x.path)), refs = count(v, x => ref(x.referrer));
  const rows = list => list.length ? list.map(([k, n]) => `<div class="r"><span>${esc(k)}</span><b>${n}</b></div>`).join("") : `<p class="muted">No data yet</p>`;
  V.innerHTML = `
    <div class="stats">
      <div class="card stat"><b>${v.filter(x => new Date(x.created_at) > weekAgo).length}</b><span>Page views · 7 days</span></div>
      <div class="card stat"><b>${v.length}</b><span>Page views · 30 days</span></div>
      <div class="card stat"><b>${new Set(v.map(x => x.visitor)).size}</b><span>Unique visitors · 30 days</span></div>
      <div class="card stat"><b>${unread}</b><span>Unread messages</span></div>
    </div>
    <div class="card"><h2>Visits, last 30 days</h2>
      <div class="chart">${days.map(d => `<div style="height:${(perDay[d] / max) * 100}%" data-tip="${new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${perDay[d]}"></div>`).join("")}</div>
      <div class="chart-axis"><span>${new Date(days[0]).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span><span>Today</span></div></div>
    <div class="grid2">
      <div class="card"><h2>Most viewed</h2><div class="rows" style="margin-top:10px">${rows(pages)}</div></div>
      <div class="card"><h2>Where visitors come from</h2><div class="rows" style="margin-top:10px">${rows(refs)}</div></div>
    </div>
    <p class="muted" style="margin-top:18px;font-size:.85rem">${posts.count || 0} published article(s). Your own visits while signed in are not counted.</p>`;
}

/* ---------- navigation & auth ---------- */
const VIEWS = { dashboard: showDashboard, messages: showMessages, posts: showPosts, profile: showProfile, projects: () => showList("projects"), experience: () => showList("experience"), education: () => showList("education") };
function go(view) {
  document.querySelectorAll("aside [data-view]").forEach(b => b.classList.toggle("on", b.dataset.view === view));
  document.body.classList.remove("nav-open");
  try { sessionStorage.setItem("dc_admin_view", view); } catch {}
  (VIEWS[view] || showDashboard)();
}
document.querySelectorAll("aside [data-view]").forEach(b => b.onclick = () => go(b.dataset.view));
document.getElementById("menu").onclick = () => document.body.classList.toggle("nav-open");

async function enter() {
  const r = await sb.rpc("is_admin");
  if (r.error || !r.data) {
    await sb.auth.signOut();
    document.getElementById("login-note").textContent = r.error
      ? "Admin check failed: " + r.error.message
      : "This account doesn't have admin access.";
    return showLogin();
  }
  try { localStorage.setItem("dc_is_admin", "1"); } catch {}
  document.getElementById("login").hidden = true;
  document.getElementById("app").hidden = false;
  let last = "dashboard"; try { last = sessionStorage.getItem("dc_admin_view") || last; } catch {}
  go(last);
}
function showLogin() { document.getElementById("app").hidden = true; document.getElementById("login").hidden = false; }

document.getElementById("login-form").onsubmit = async e => {
  e.preventDefault();
  const f = e.target, note = document.getElementById("login-note");
  note.textContent = "Signing in…";
  const r = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
  if (r.error) { console.log("[admin] sign-in error:", r.error.message); note.textContent = /invalid/i.test(r.error.message) ? "Wrong email or password." : "Sign-in failed: " + r.error.message; return; }
  note.textContent = ""; f.reset(); enter();
};
document.getElementById("logout").onclick = async () => { await sb.auth.signOut(); showLogin(); };

(async () => {
  if (!sb) { document.getElementById("setup-note").hidden = false; return; }
  const { data } = await sb.auth.getSession();
  data.session ? enter() : showLogin();
})();
