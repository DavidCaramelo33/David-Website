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
    case "file": return `<label>${lbl}</label><div class="img-field" data-img="${f.name}" data-doc="1">
        <a href="${esc(v)}" target="_blank" class="btn ghost sm" style="text-decoration:none" ${v ? "" : "hidden"}>View current file ↗</a>
        <input type="hidden" name="${f.name}" value="${esc(v)}">
        <input type="file" accept="${f.accept || ".pdf"}">
        <button type="button" class="btn ghost sm" data-clear ${v ? "" : "hidden"}>Remove file</button></div>`;
    default: return `<label>${lbl}<input type="${f.type || "text"}" name="${f.name}" value="${esc(v)}" ${f.required ? "required" : ""}></label>`;
  }
}
function wireImages(root, folder) {
  root.querySelectorAll("[data-img]").forEach(box => {
    const doc = !!box.dataset.doc;
    const img = box.querySelector(doc ? "a" : "img"), hid = box.querySelector("input[type=hidden]"), file = box.querySelector("input[type=file]"), clr = box.querySelector("[data-clear]");
    file.addEventListener("change", async () => {
      if (!file.files[0]) return;
      if (file.files[0].size > 8 * 1024 * 1024) { toast("File is too large (max 8 MB)", true); return; }
      toast("Uploading…");
      const url = await upload(file.files[0], folder);
      if (url) { hid.value = url; if (doc) img.href = url; else img.src = url; img.hidden = false; clr.hidden = false; toast(doc ? "File uploaded. Click Save to publish it" : "Image uploaded"); }
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
  interests: {
    title: "Personal life", folder: "interests",
    sub: r => (r.description || "").slice(0, 80),
    fields: [
      { name: "title", label: "Interest or hobby", hint: "e.g. Travelling, Football, Cooking, Photography", required: true },
      { name: "description", label: "A few words about it", type: "textarea" },
      { name: "image_url", label: "Picture", hint: "optional · without a picture, a matching icon is shown", type: "image" },
      { name: "visible", label: "Visible on the website", type: "bool" }
    ]
  },
  portfolio: {
    title: "Portfolio", folder: "portfolio",
    sub: r => [r.category, r.link ? "has link" : ""].filter(Boolean).join(" · "),
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "category", label: "Category", hint: "e.g. Website, Brochure, Social media, Video, Email campaign · used for the filter buttons" },
      { name: "image_url", label: "Picture", type: "image" },
      { name: "description", label: "Short description", hint: "optional, shown in the pop-up", type: "textarea" },
      { name: "link", label: "Link", hint: "optional: website, video, PDF…", type: "url" },
      { name: "visible", label: "Visible on the website", type: "bool" }
    ]
  },
  projects: {
    title: "Projects", folder: "projects",
    sub: r => [r.tag, r.featured ? "Featured" : ""].filter(Boolean).join(" · "),
    fields: [
      { name: "title", label: "Project name", required: true },
      { name: "tag", label: "Small label", hint: "e.g. Real Estate · 2025" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "link", label: "Link", hint: "website or video, opens from the project pop-up", type: "url" },
      { name: "image_url", label: "Picture", hint: "e.g. a screenshot of the website or a still from the video", type: "image" },
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
      { name: "logo_url", label: "Company logo", type: "image" },
      { name: "link", label: "Company website", hint: "optional, e.g. https://…", type: "url" },
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
      { name: "logo_url", label: "Logo", type: "image" },
      { name: "link", label: "Website", hint: "optional", type: "url" },
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
  { name: "photo_url", label: "Your photo", hint: "leave empty to use the default photo", type: "image" },
  { name: "highlights", label: "Highlights under your name", hint: "one per line, keep them short", type: "textarea", lines: true },
  { name: "cv_url", label: "Your CV (PDF)", hint: "adds a “Download CV” button on the website", type: "file", accept: ".pdf,application/pdf" },
  { name: "about_image", label: "About — picture", hint: "shown next to your About text · leave empty to use the Lisbon view", type: "image" },
  { name: "about_title", label: "About — title" },
  { name: "about", label: "About — text", hint: "empty line between paragraphs", type: "textarea", big: true },
  { name: "facts", label: "Key numbers", hint: "one per line: number | label", type: "textarea", pairs: true },
  { name: "expertise", label: "Expertise", hint: "one per line", type: "textarea", lines: true },
  { name: "tools", label: "Tools", hint: "one per line", type: "textarea", lines: true },
  { name: "languages", label: "Languages", hint: "one per line: language | level", type: "textarea", pairs: true },
  { name: "services", label: "Services — “What I can do for you”", hint: "one per line: title | short description · leave empty to hide the section", type: "textarea", pairs: true },
  { name: "personal_title", label: "Personal section — title", hint: "e.g. Beyond work" },
  { name: "personal_text", label: "Personal section — intro", hint: "a few lines about you as a person · empty line between paragraphs", type: "textarea" },
  { name: "results", label: "Results in numbers", hint: "one per line: number | what it means, e.g. 108 | Properties marketed · leave empty to hide the section", type: "textarea", pairs: true }
];

const CONTACT_FIELDS = [
  { section: "Contact details shown on the website", note: "Leave a field empty to hide it." },
  { name: "email", label: "Personal email", type: "email" },
  { name: "business_email", label: "Business email", hint: "e.g. your Lusitania Investments address", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "location", label: "Location", hint: "e.g. Angers, France" },
  { name: "work_note", label: "Work preference", hint: "shown next to your status, e.g. Remote or relocation within France" },
  { name: "linkedin", label: "LinkedIn link", type: "url" },
  { name: "booking_url", label: "Book a call link", hint: "e.g. your Calendly or Google Calendar booking page · adds a “Book a call” button", type: "url" },
  { name: "website", label: "Other website link", type: "url" },
  { section: "Texts in the contact section" },
  { name: "contact_title", label: "Title" },
  { name: "contact_text", label: "Intro text", type: "textarea" },
  { name: "hire_text", label: "Text when a visitor picks “Hire me”", type: "textarea" },
  { name: "freelance_text", label: "Text when a visitor picks “Freelance project”", type: "textarea" }
];

/* Reads the profile; returns stored data merged over defaults */
async function loadProfile() {
  const r = await sb.from("profile").select("data").eq("id", 1).maybeSingle();
  if (fail(r, "Could not load")) return null;
  return { ...FALLBACK.profile, ...(r.data?.data || {}) };
}
/* Saves some profile fields without touching the others */
async function saveProfile(changes) {
  const fresh = await loadProfile(); if (!fresh) return false;
  const res = await sb.from("profile").upsert({ id: 1, data: { ...fresh, ...changes }, updated_at: new Date().toISOString() });
  return !fail(res, "Save failed");
}

/* One form for any group of profile fields, drawn into `box` */
async function profileForm(box, fields, savedMsg) {
  const d = await loadProfile(); if (!d) return;
  const show = f => f.pairs ? (d[f.name] || []).map(x => x.join(" | ")).join("\n") : f.lines ? (d[f.name] || []).join("\n") : d[f.name];
  box.innerHTML = `<form class="form" id="pf">${fields.map(f => f.section
      ? `<div class="form-section"><h2>${esc(f.section)}</h2>${f.note ? `<p class="muted small">${esc(f.note)}</p>` : ""}</div>`
      : fieldHtml(f, show(f))).join("")}
    <div class="form-actions"><button class="btn" type="submit">Save changes</button></div></form>`;
  const form = box.querySelector("#pf");
  form.querySelectorAll("textarea[name=expertise],textarea[name=tools],textarea[name=services],textarea[name=results]").forEach(t => t.style.minHeight = "170px");
  wireImages(form, "profile");
  form.onsubmit = async e => {
    e.preventDefault();
    const out = {};
    fields.filter(f => f.name).forEach(f => {
      const v = form.elements[f.name].value;
      const lines = v.split("\n").map(s => s.trim()).filter(Boolean);
      out[f.name] = f.pairs ? lines.map(l => l.split("|").map(s => s.trim()).slice(0, 2)) : f.lines ? lines : v.trim();
    });
    if (await saveProfile(out)) toast(savedMsg);
  };
}
function showProfile() {
  VT.textContent = "Profile & About"; VA.innerHTML = ""; V.onclick = null;
  V.innerHTML = `<div class="card" id="pbox"></div>`;
  profileForm(document.getElementById("pbox"), PROFILE_FIELDS, "Profile saved");
}

/* ---------- Contact Central: availability + inbox + details ---------- */
const AVAIL = [
  { key: "both", title: "Open to work & freelance", text: "Visitors can offer you a job or send a freelance project.", dot: "green" },
  { key: "job", title: "Open to work", text: "Visitors can contact you about a job. No freelance.", dot: "green" },
  { key: "freelance", title: "Freelance only", text: "Visitors can send freelance projects. No job offers.", dot: "blue" },
  { key: "none", title: "Not open to work", text: "No offers. Visitors can still send you a general message.", dot: "grey" }
];
const availOf = p => p.availability || (p.open_to_hire === false ? (p.freelance ? "freelance" : "none") : (p.freelance === false ? "job" : "both"));

const KIND = {
  job: { label: "Job offer", cls: "job", bell: "New job offer from" },
  freelance: { label: "Freelance", cls: "free", bell: "New freelance request from" },
  general: { label: "General", cls: "", bell: "New message from" }
};
const kindOf = m => KIND[m.kind] || KIND.general;
let msgFilter = "all";

async function showContactCentral() {
  VT.textContent = "Contact Central"; VA.innerHTML = ""; V.onclick = null;
  V.innerHTML = `
    <div class="cc">
      <section class="card"><div class="card-head"><h2>Your availability</h2><span class="muted small">Shown on your website instantly</span></div><div id="cc-avail" class="avail"></div></section>
      <section class="card"><div class="card-head"><h2>Inbox</h2><span class="muted small" id="cc-count"></span></div><div id="cc-inbox"><p class="muted small">Loading…</p></div></section>
      <details class="card cc-details"><summary><h2>Contact details &amp; texts</h2><span class="muted small">Email, phone, LinkedIn, contact section texts</span></summary><div id="cc-form"></div></details>
    </div>`;
  renderAvailability();
  renderInbox();
  profileForm(document.getElementById("cc-form"), CONTACT_FIELDS, "Contact details saved");
}

async function renderAvailability() {
  const box = document.getElementById("cc-avail"); if (!box) return;
  const p = await loadProfile(); if (!p) return;
  const cur = availOf(p);
  box.innerHTML = AVAIL.map(a => `<button class="avail-opt ${a.key === cur ? "on" : ""}" data-avail="${a.key}">
      <span class="adot ${a.dot}"></span><b>${a.title}</b><span>${a.text}</span>${a.key === cur ? `<i>Current</i>` : ""}</button>`).join("");
  box.onclick = async e => {
    const b = e.target.closest("[data-avail]"); if (!b || b.classList.contains("on")) return;
    const k = b.dataset.avail;
    const ok = await saveProfile({ availability: k, open_to_hire: k === "both" || k === "job", freelance: k === "both" || k === "freelance" });
    if (ok) { toast("Website updated: " + AVAIL.find(a => a.key === k).title); renderAvailability(); }
  };
}

async function renderInbox() {
  const box = document.getElementById("cc-inbox"); if (!box) return;
  const r = await sb.from("messages").select("*").order("created_at", { ascending: false });
  if (fail(r, "Could not load")) return;
  const all = r.data, unread = all.filter(m => !m.is_read).length;
  document.getElementById("cc-count").textContent = all.length ? `${all.length} message${all.length > 1 ? "s" : ""}${unread ? ` · ${unread} unread` : ""}` : "";
  if (!all.length) { box.innerHTML = `<div class="empty">No messages yet. When someone uses the contact form on your website, it will appear here.</div>`; box.onclick = null; return; }
  const n = k => all.filter(m => (m.kind || "general") === k).length;
  const rows = msgFilter === "all" ? all : all.filter(m => (m.kind || "general") === msgFilter);
  const chip = (k, label, count) => `<button class="chip ${msgFilter === k ? "on" : ""}" data-filter="${k}">${label} <span>${count}</span></button>`;
  box.innerHTML = `<div class="chips">${chip("all", "All", all.length)}${chip("job", "Job offers", n("job"))}${chip("freelance", "Freelance", n("freelance"))}${chip("general", "General", n("general"))}</div>
    <div class="list">${rows.length ? rows.map((m, i) => `
    <div class="msg ${m.is_read ? "" : "unread"}">
      <div class="head"><div><span class="pill kind ${kindOf(m).cls}">${kindOf(m).label}</span> <b>${esc(m.name)}</b> <span class="muted">· ${esc(m.email)}</span></div><span class="muted">${new Date(m.created_at).toLocaleString("en-GB")}</span></div>
      <p>${esc(m.message)}</p>
      <div class="acts">
        <a class="btn sm" style="text-decoration:none" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(m.kind === "freelance" ? "Re: your freelance project" : m.kind === "job" ? "Re: your job opportunity" : "Re: your message")}">Reply by email</a>
        <button class="btn ghost sm" data-read="${i}">${m.is_read ? "Mark unread" : "Mark read"}</button>
        <button class="btn danger sm" data-del="${i}">Delete</button>
      </div></div>`).join("") : `<div class="empty">No messages in this category.</div>`}</div>`;
  box.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.filter) { msgFilter = b.dataset.filter; return renderInbox(); }
    if (b.dataset.read) { const m = rows[b.dataset.read]; await sb.from("messages").update({ is_read: !m.is_read }).eq("id", m.id); renderInbox(); refreshBadge(); }
    if (b.dataset.del) {
      const m = rows[b.dataset.del];
      if (!confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
      if (!fail(await sb.from("messages").delete().eq("id", m.id), "Delete failed")) { renderInbox(); refreshBadge(); }
    }
  };
}
async function refreshBadge() {
  const r = await sb.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false);
  const b = document.getElementById("unread-badge");
  b.hidden = !r.count; b.textContent = r.count || "";
  refreshBell();
  return r.count || 0;
}

/* ---------- notification bell ---------- */
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const ago = d => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " h ago";
  return Math.floor(s / 86400) + " d ago";
};
let bellLastCount = null;

async function refreshBell() {
  // first time on this device: start counting visits from now
  if (!lsGet("dc_visits_seen")) lsSet("dc_visits_seen", new Date().toISOString());
  const seen = lsGet("dc_visits_seen");
  const [msgs, visits] = await Promise.all([
    sb.from("messages").select("*").eq("is_read", false).order("created_at", { ascending: false }).limit(10),
    sb.from("page_views").select("visitor,created_at").gt("created_at", seen).order("created_at", { ascending: false }).limit(5000)
  ]);
  const items = [];
  (msgs.data || []).forEach(m => items.push({ kind: "msg", when: m.created_at, title: `${kindOf(m).bell} ${m.name}`, text: m.message, go: "contact" }));
  const v = visits.data || [];
  if (v.length) {
    const people = new Set(v.map(x => x.visitor)).size;
    items.push({ kind: "visit", when: v[0].created_at, title: `${v.length} new page view${v.length > 1 ? "s" : ""}`, text: `from ${people} visitor${people > 1 ? "s" : ""} since you last checked`, go: "dashboard", visits: true });
  }
  items.sort((a, b) => new Date(b.when) - new Date(a.when));

  const count = (msgs.data || []).length + (v.length ? 1 : 0);
  const badge = document.getElementById("bell-count");
  badge.hidden = !count; badge.textContent = count > 9 ? "9+" : count;
  document.title = (count ? `(${count}) ` : "") + "Admin — David Caramelo";
  if (bellLastCount !== null && count > bellLastCount) {
    const bell = document.getElementById("bell");
    bell.classList.remove("ring"); void bell.offsetWidth; bell.classList.add("ring");
  }
  bellLastCount = count;

  document.getElementById("notif-list").innerHTML = items.length
    ? items.map((n, i) => `<button class="notif-item" data-i="${i}">
        <span class="notif-icon ${n.kind}">${n.kind === "msg" ? "✉" : "↗"}</span>
        <span class="txt"><b>${esc(n.title)}</b><p>${esc(n.text)}</p><div class="when">${ago(n.when)}</div></span></button>`).join("")
    : `<div class="notif-empty">You're all caught up ✓</div>`;
  document.getElementById("notif-list").onclick = e => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    const n = items[b.dataset.i];
    if (n.visits) lsSet("dc_visits_seen", new Date().toISOString());
    closeNotif(); go(n.go); refreshBell();
  };
}

function closeNotif() { document.getElementById("notif").hidden = true; document.getElementById("bell").classList.remove("open"); }
document.getElementById("bell").onclick = e => {
  e.stopPropagation();
  const p = document.getElementById("notif");
  p.hidden = !p.hidden;
  document.getElementById("bell").classList.toggle("open", !p.hidden);
};
document.getElementById("notif").onclick = e => e.stopPropagation();
document.addEventListener("click", closeNotif);
document.getElementById("notif-clear").onclick = async () => {
  lsSet("dc_visits_seen", new Date().toISOString());
  await sb.from("messages").update({ is_read: true }).eq("is_read", false);
  closeNotif(); await refreshBadge();
  if (document.querySelector('aside [data-view="contact"].on') || document.querySelector('aside [data-view="dashboard"].on')) go(document.querySelector("aside [data-view].on").dataset.view);
  toast("All caught up");
};

/* ---------- dashboard ---------- */
async function showDashboard() {
  VT.textContent = ""; VA.innerHTML = ""; V.onclick = null;
  V.innerHTML = `<p class="muted" style="text-align:center;padding:60px 0">Loading…</p>`;
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [views, unread, posts, latest, prof] = await Promise.all([
    sb.from("page_views").select("path,referrer,visitor,created_at").gte("created_at", since).order("created_at").limit(10000),
    refreshBadge(),
    sb.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
    sb.from("messages").select("*").order("created_at", { ascending: false }).limit(3),
    sb.from("profile").select("data->>name").eq("id", 1).maybeSingle()
  ]);
  if (fail(views, "Could not load visits")) return;
  const v = views.data, weekAgo = Date.now() - 7 * 864e5;
  const days = [...Array(30)].map((_, i) => { const d = new Date(Date.now() - (29 - i) * 864e5); return d.toISOString().slice(0, 10); });
  const perDay = Object.fromEntries(days.map(d => [d, 0]));
  v.forEach(x => { const d = x.created_at.slice(0, 10); if (d in perDay) perDay[d]++; });
  const max = Math.max(1, ...Object.values(perDay));
  const count = (arr, fn) => Object.entries(arr.reduce((m, x) => { const k = fn(x); if (k) m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const pageName = p => { if (!p || p === "/" || /index\.html$/.test(p)) return "Home"; if (/blog/.test(p)) return "Blog"; const m = p.match(/slug=([^&]+)/); return m ? "Article: " + decodeURIComponent(m[1]) : p; };
  const ref = r => {
    try {
      if (!r) return "Direct / unknown";
      const h = new URL(r).hostname.replace(/^www\./, "");
      return h === location.hostname || h.endsWith("netlify.app") ? "Your own website" : h;
    } catch { return "Direct / unknown"; }
  };
  const pages = count(v, x => pageName(x.path)), refs = count(v, x => ref(x.referrer));
  const rows = list => {
    if (!list.length) return `<p class="muted small">No data yet</p>`;
    const top = list[0][1];
    return list.map(([k, n]) => `<div class="r"><div class="r-top"><span>${esc(k)}</span><b>${n}</b></div><div class="r-bar"><i style="width:${(n / top) * 100}%"></i></div></div>`).join("");
  };
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = ((prof.data && prof.data.name) || "David").split(" ")[0];
  const week = v.filter(x => new Date(x.created_at) > weekAgo).length;
  const short = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const msgs = (latest.data || []);
  V.innerHTML = `
    <div class="dash">
      <div class="hello">
        <div class="date">${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
        <h1>${hello}, ${esc(first)}</h1>
        <p>Here's how your website is doing.</p>
        <div class="quick">
          <button class="btn" data-go="posts" data-new="1">+ New article</button>
          <button class="btn ghost" data-go="projects" data-new="1">+ Add project</button>
          <button class="btn ghost" data-go="profile">Edit profile</button>
          <a class="btn ghost" href="index.html" target="_blank">View website ↗</a>
        </div>
      </div>
      <div class="stats">
        <div class="card stat"><span class="dot c1"></span><b>${week}</b><span>Views this week</span></div>
        <div class="card stat"><span class="dot c2"></span><b>${v.length}</b><span>Views · 30 days</span></div>
        <div class="card stat"><span class="dot c3"></span><b>${new Set(v.map(x => x.visitor)).size}</b><span>Unique visitors</span></div>
        <div class="card stat clickable" data-go="contact"><span class="dot c4"></span><b>${unread}</b><span>Unread messages</span></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Visits</h2><span class="muted small">Last 30 days</span></div>
        <div class="chart">${days.map(d => `<div style="height:${Math.max(2, (perDay[d] / max) * 100)}%" class="${perDay[d] ? "" : "zero"}" data-tip="${short(d)}: ${perDay[d]}"></div>`).join("")}</div>
        <div class="chart-axis"><span>${short(days[0])}</span><span>${short(days[14])}</span><span>Today</span></div>
      </div>
      <div class="grid3">
        <div class="card"><div class="card-head"><h2>Most viewed</h2></div><div class="rows">${rows(pages)}</div></div>
        <div class="card"><div class="card-head"><h2>Traffic sources</h2></div><div class="rows">${rows(refs)}</div></div>
        <div class="card"><div class="card-head"><h2>Latest messages</h2><button class="link" data-go="contact">See all</button></div>
          ${msgs.length ? msgs.map(m => `<div class="mini-msg ${m.is_read ? "" : "new"}"><div class="r-top"><span><span class="pill kind ${kindOf(m).cls}">${kindOf(m).label}</span> <b>${esc(m.name)}</b></span><span class="muted small">${short(m.created_at)}</span></div><p>${esc(m.message.slice(0, 90))}${m.message.length > 90 ? "…" : ""}</p></div>`).join("") : `<p class="muted small">No messages yet</p>`}
        </div>
      </div>
      <p class="foot-note">${posts.count || 0} published article${posts.count === 1 ? "" : "s"} · Your own visits while signed in are not counted</p>
    </div>`;
  V.onclick = e => {
    const b = e.target.closest("[data-go]"); if (!b) return;
    if (!b.dataset.new) return go(b.dataset.go);
    document.querySelectorAll("aside [data-view]").forEach(x => x.classList.toggle("on", x.dataset.view === b.dataset.go));
    b.dataset.go === "posts" ? editPost(null) : editItem("projects", null);
  };
}

/* ---------- Translations (French) ---------- */
async function showTranslations() {
  VT.textContent = "Translations (FR)"; VA.innerHTML = ""; V.onclick = null;
  V.innerHTML = `<p class="muted" style="text-align:center;padding:40px 0">Loading…</p>`;
  const [p, ex, pr, ed, pf, it] = await Promise.all([
    loadProfile(),
    sb.from("experience").select("*").order("sort"),
    sb.from("projects").select("*").order("sort"),
    sb.from("education").select("*").order("sort"),
    sb.from("portfolio").select("*").order("sort"),
    sb.from("interests").select("*").order("sort")
  ]);
  if (!p) return;
  const saved = p.fr || {};
  const groups = [];
  const seen = new Set();
  const add = (group, text) => {
    const s = String(text || "").trim();
    if (!s || seen.has(s) || /^[\d\s·—–+.,%-]+$/.test(s) || /^https?:/.test(s)) return;
    seen.add(s);
    let g = groups.find(x => x.name === group); if (!g) groups.push(g = { name: group, items: [] });
    g.items.push(s);
  };
  ["headline", "pitch", "about_title", "work_note"].forEach(k => add("Profile & About", p[k]));
  String(p.about || "").split(/\n{2,}/).forEach(t => add("Profile & About", t));
  (p.facts || []).forEach(([, l]) => add("Profile & About", l));
  (p.highlights || []).forEach(h => add("Profile & About", h));
  (p.services || []).forEach(([t, d]) => { add("Services", t); add("Services", d); });
  (p.results || []).forEach(([, l]) => add("Results", l));
  (p.expertise || []).forEach(x => add("Skills", x));
  (p.languages || []).forEach(([l, lv]) => { add("Skills", l); add("Skills", lv); });
  (ex.data || []).forEach(j => { add("Experience", j.title); add("Experience", j.place); add("Experience", j.description); });
  (pr.data || []).forEach(x => { add("Projects", x.title); add("Projects", x.tag); add("Projects", x.description); });
  (pf.data || []).forEach(x => { add("Portfolio", x.title); add("Portfolio", x.category); add("Portfolio", x.description); });
  (ed.data || []).forEach(e => { add("Education", e.title); add("Education", e.description); });
  add("Personal life", p.personal_title);
  String(p.personal_text || "").split(/\n{2,}/).forEach(t => add("Personal life", t));
  ((it && it.data) || []).forEach(x => { add("Personal life", x.title); add("Personal life", x.description); });
  ["contact_title", "contact_text", "hire_text", "freelance_text"].forEach(k => add("Contact", p[k]));

  const all = groups.flatMap(g => g.items);
  const val = s => saved[s] ?? FR_CONTENT[s] ?? "";
  const missing = all.filter(s => !val(s)).length;
  V.innerHTML = `
    <div class="card tr-intro"><b>French version of your website.</b> Each text you wrote in English is on the left, its French version on the right. Visitors who pick <b>FR</b> (or whose browser is in French) see the French text. If a French box is empty, that text shows in English.
      ${missing ? `<div class="tr-missing">${missing} text${missing > 1 ? "s" : ""} still need a French version</div>` : `<div class="tr-ok">Everything is translated ✓</div>`}</div>
    <form id="trf" class="form">
      ${groups.map(g => `<div class="card"><h2 style="margin-bottom:14px">${esc(g.name)}</h2>
        ${g.items.map(s => `<div class="tr-row ${val(s) ? "" : "todo"}"><div class="tr-en">${esc(s)}</div>
          <textarea data-src="${esc(s)}" rows="${Math.min(6, Math.max(1, Math.ceil(s.length / 70)))}" placeholder="French version…">${esc(val(s))}</textarea></div>`).join("")}
      </div>`).join("")}
      <div class="form-actions"><button class="btn" type="submit">Save translations</button></div>
    </form>`;
  document.getElementById("trf").onsubmit = async e => {
    e.preventDefault();
    const fr = {};
    e.target.querySelectorAll("textarea[data-src]").forEach(t => { const v = t.value.trim(); if (v) fr[t.dataset.src] = v; });
    if (await saveProfile({ fr })) { toast("Translations saved"); showTranslations(); }
  };
}

/* ---------- navigation & auth ---------- */
const VIEWS = { interests: () => showList("interests"), portfolio: () => showList("portfolio"), translations: showTranslations, dashboard: showDashboard, contact: showContactCentral, messages: showContactCentral, posts: showPosts, profile: showProfile, projects: () => showList("projects"), experience: () => showList("experience"), education: () => showList("education") };
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
  refreshBadge();
  if (!window.__bellTimer) window.__bellTimer = setInterval(refreshBadge, 60000); // check for new notifications every minute
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
