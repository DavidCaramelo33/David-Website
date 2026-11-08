/* Languages for the website: English (default) and French.
   UI = fixed texts of the website (menus, buttons, headings).
   FR_CONTENT = French versions of the texts you edit in the admin panel (English text → French text).
   Translations you change in the admin (Translations page) override FR_CONTENT. */

const UI = {
  nav_about: { en: "About", fr: "À propos" },
  nav_services: { en: "Services", fr: "Services" },
  nav_experience: { en: "Experience", fr: "Parcours" },
  nav_projects: { en: "Projects", fr: "Projets" },
  nav_portfolio: { en: "Portfolio", fr: "Portfolio" },
  nav_skills: { en: "Skills", fr: "Compétences" },
  nav_blog: { en: "Blog", fr: "Blog" },
  nav_contact: { en: "Contact", fr: "Contact" },

  sec_about: { en: "About", fr: "À propos" },
  sec_services: { en: "Services", fr: "Services" },
  sec_experience: { en: "Experience", fr: "Parcours" },
  sec_results: { en: "Results", fr: "Résultats" },
  sec_projects: { en: "Projects", fr: "Projets" },
  sec_portfolio: { en: "Portfolio", fr: "Portfolio" },
  sec_skills: { en: "Skills", fr: "Compétences" },
  sec_education: { en: "Education", fr: "Formation" },
  sec_journal: { en: "Journal", fr: "Journal" },
  sec_personal: { en: "Personal", fr: "Personnel" },

  h_services: { en: "What I can do for you", fr: "Ce que je peux faire pour vous" },
  h_experience: { en: "Professional path", fr: "Parcours professionnel" },
  h_results: { en: "Results in numbers", fr: "Les résultats en chiffres" },
  h_projects: { en: "Selected work", fr: "Projets choisis" },
  h_portfolio: { en: "A look at my work", fr: "Un aperçu de mon travail" },
  h_skills: { en: "What I bring", fr: "Ce que j'apporte" },
  h_education: { en: "Education & certifications", fr: "Formation et certifications" },
  h_journal: { en: "Latest articles", fr: "Derniers articles" },
  h_expertise: { en: "Expertise", fr: "Expertise" },
  h_tools: { en: "Tools", fr: "Outils" },
  h_languages: { en: "Languages", fr: "Langues" },
  logos_title: { en: "Worked & studied with", fr: "Ils m'ont fait confiance" },

  btn_contact: { en: "Get in touch", fr: "Me contacter" },
  btn_projects: { en: "View projects", fr: "Voir les projets" },
  btn_cv: { en: "Download CV", fr: "Télécharger mon CV" },
  btn_book: { en: "Book a call", fr: "Réserver un appel" },
  btn_all_articles: { en: "All articles", fr: "Tous les articles" },
  btn_send: { en: "Send message", fr: "Envoyer le message" },
  back_top: { en: "Back to top", fr: "Retour en haut" },

  avail_both: { en: "Open to work & freelance", fr: "Disponible : poste et freelance" },
  avail_job: { en: "Open to work", fr: "Ouvert aux opportunités" },
  avail_freelance: { en: "Available for freelance", fr: "Disponible en freelance" },
  avail_none: { en: "Not currently available", fr: "Actuellement indisponible" },

  reason_hire: { en: "Hire me", fr: "Me recruter" },
  reason_hire_sub: { en: "For a role in your team", fr: "Pour un poste dans votre équipe" },
  reason_free: { en: "Freelance project", fr: "Projet freelance" },
  reason_free_sub: { en: "For a one-off or ongoing project", fr: "Pour une mission ponctuelle ou régulière" },
  ph_name: { en: "Your name", fr: "Votre nom" },
  ph_email: { en: "Your email", fr: "Votre e-mail" },
  ph_message: { en: "Your message", fr: "Votre message" },
  ph_job: { en: "Tell me about the role and your company", fr: "Parlez-moi du poste et de votre entreprise" },
  ph_free: { en: "Tell me about your project, budget and timeline", fr: "Parlez-moi de votre projet, de votre budget et de vos délais" },
  or_find: { en: "or find me on", fr: "ou retrouvez-moi sur" },
  form_sending: { en: "Sending…", fr: "Envoi en cours…" },
  form_ok: { en: "Thank you, your message has been sent. I'll get back to you soon.", fr: "Merci, votre message a bien été envoyé. Je vous réponds très vite." },
  form_err: { en: "Sorry, something went wrong. Please try LinkedIn instead.", fr: "Désolé, une erreur est survenue. Contactez-moi plutôt sur LinkedIn." },
  form_offline: { en: "The contact form works once the site is online. Please use LinkedIn for now.", fr: "Le formulaire fonctionne une fois le site en ligne. Utilisez LinkedIn en attendant." },

  proj_preview_site: { en: "Preview & visit the website", fr: "Aperçu et accès au site" },
  proj_preview_open: { en: "Preview & open", fr: "Aperçu et ouverture" },
  proj_details: { en: "View details", fr: "Voir les détails" },
  proj_visit: { en: "Visit the website", fr: "Visiter le site" },
  proj_watch: { en: "Watch the video", fr: "Voir la vidéo" },
  proj_open: { en: "Open", fr: "Ouvrir" },
  proj_soon: { en: "Link coming soon.", fr: "Lien bientôt disponible." },
  proj_featured_ph: { en: "Property marketing, from strategy to listing.", fr: "Le marketing immobilier, de la stratégie à l'annonce." },
  tool_visit: { en: "Visit the official website of", fr: "Site officiel de" },

  blog_eyebrow: { en: "Journal", fr: "Journal" },
  blog_title: { en: "Notes on <em>real estate</em> marketing", fr: "Notes sur le marketing <em>immobilier</em>" },
  blog_lead: { en: "Ideas, case studies and lessons from marketing property.", fr: "Idées, études de cas et leçons tirées du marketing immobilier." },
  blog_empty: { en: "No articles yet. Check back soon.", fr: "Aucun article pour le moment. Revenez bientôt." },
  blog_back: { en: "← All articles", fr: "← Tous les articles" },
  blog_404: { en: "Article not found", fr: "Article introuvable" },
  present: { en: "Present", fr: "Aujourd'hui" }
};

const FR_CONTENT = {
  // Profile
  "Real Estate Marketing": "Marketing immobilier",
  "I build the strategy that takes a property from listing to sale: positioning, content, SEO and campaigns that reach the right buyer.":
    "Je construis la stratégie qui mène un bien de l'annonce à la vente : positionnement, contenu, SEO et campagnes qui touchent le bon acheteur.",
  "Where marketing meets real estate": "Là où le marketing rencontre l'immobilier",
  "I'm a marketer who loves the craft of selling property: understanding a home, finding its story, and building the full strategy to put it in front of the right people.":
    "Je suis un marketeur passionné par l'art de vendre un bien : comprendre une maison, trouver son histoire et bâtir toute la stratégie pour la présenter aux bonnes personnes.",
  "I've spent more than six years in customer relations and digital marketing, and founded Lusitania Investments, a real estate company that connects international investors with opportunities in Portugal. That's where I work on the whole process, from market research and brand to SEO, email campaigns and listings.":
    "J'ai plus de six ans d'expérience en relation client et en marketing digital, et j'ai fondé Lusitania Investments, une société immobilière qui met en relation des investisseurs internationaux avec des opportunités au Portugal. J'y gère tout le processus : étude de marché, image de marque, SEO, campagnes e-mail et annonces.",
  "I'm studying International Business at NHL Stenden University with a specialisation in marketing. I work in Portuguese, English, Spanish and French, and I'm looking for my next role in real estate marketing or real estate development.":
    "J'étudie le commerce international à l'université NHL Stenden, avec une spécialisation en marketing. Je travaille en portugais, anglais, espagnol et français, et je recherche mon prochain poste dans le marketing immobilier ou la promotion immobilière.",
  "Years in marketing & client relations": "Années en marketing et relation client",
  "Working languages": "Langues de travail",
  "Founded Lusitania Investments": "Création de Lusitania Investments",
  "Founder · Lusitania Investments": "Fondateur · Lusitania Investments",
  "Real estate marketing": "Marketing immobilier",
  "Property marketing strategy": "Stratégie marketing immobilier",
  "Positioning, target buyer and launch plan for a property or development, from the first photo to the signed deal.":
    "Positionnement, acheteur cible et plan de lancement pour un bien ou un programme, de la première photo à la signature.",
  "SEO & content": "SEO et contenu",
  "Websites, listings and articles that rank on Google and turn searches into qualified enquiries.":
    "Sites, annonces et articles qui se positionnent sur Google et transforment les recherches en demandes qualifiées.",
  "Email marketing": "E-mail marketing",
  "Brevo and Mailchimp campaigns that keep buyers and investors warm until they're ready to act.":
    "Des campagnes Brevo et Mailchimp qui entretiennent l'intérêt des acheteurs et investisseurs jusqu'à leur décision.",
  "Visual content": "Contenu visuel",
  "Listing visuals, InDesign brochures and short-form video that make a property stand out.":
    "Visuels d'annonces, brochures InDesign et vidéos courtes qui font ressortir un bien.",
  "Real estate & property marketing": "Marketing immobilier",
  "Marketing strategy & campaigns": "Stratégie et campagnes marketing",
  "Content & multimedia creation": "Création de contenu et multimédia",
  "Data & market analysis": "Analyse de données et de marché",
  "Project coordination": "Coordination de projets",
  "Portuguese": "Portugais", "English": "Anglais", "Spanish": "Espagnol", "French": "Français", "Native": "Langue maternelle",
  "Let's market something remarkable": "Créons ensemble quelque chose de remarquable",
  "I'm open to roles in real estate marketing and development, remote or anywhere in France.":
    "Je suis ouvert aux postes en marketing et promotion immobilière, à distance ou partout en France.",
  "Looking for someone to join your team in real estate marketing or development? Tell me about the role.":
    "Vous cherchez quelqu'un pour rejoindre votre équipe en marketing ou promotion immobilière ? Parlez-moi du poste.",
  "Need help marketing a property, a project or your agency? Tell me what you have in mind and your timeline.":
    "Besoin d'aide pour commercialiser un bien, un programme ou votre agence ? Dites-moi ce que vous avez en tête et vos délais.",
  "Remote or relocation within France": "À distance ou mobilité partout en France",
  "Properties marketed for Lusitania Investments": "Biens commercialisés pour Lusitania Investments",
  "Countries connected: France & Portugal": "Pays reliés : France et Portugal",
  "Website views for Lusitania Investments": "Vues sur le site de Lusitania Investments",
  "Views across social media": "Vues sur les réseaux sociaux",

  // Experience
  "Founder": "Fondateur",
  "Marketing Intern": "Stagiaire marketing",
  "Freelance Marketing Manager": "Responsable marketing freelance",
  "Sales Assistant": "Conseiller commercial",
  "Remote": "À distance",
  "Founded and built a real estate investment company connecting international investors with property opportunities in Portugal. I lead business development and the full marketing strategy: brand, website content, SEO, email marketing and social media.":
    "Création et développement d'une société d'investissement immobilier qui met en relation des investisseurs internationaux avec des opportunités au Portugal. Je pilote le développement commercial et toute la stratégie marketing : marque, contenu du site, SEO, e-mail marketing et réseaux sociaux.",
  "Contributed to digital marketing campaigns through content creation, social media management and market analysis, helping increase brand visibility and engagement.":
    "Participation aux campagnes de marketing digital : création de contenu, gestion des réseaux sociaux et analyse de marché, pour renforcer la visibilité et l'engagement de la marque.",
  "Creating targeted social media content for clients to increase visibility and engage potential customers.":
    "Création de contenus ciblés pour les réseaux sociaux de mes clients afin d'accroître leur visibilité et d'engager leurs prospects.",
  "Delivered high-quality customer service with personalised advice and tailored membership plans, and promoted the gym's services.":
    "Service client de qualité avec des conseils personnalisés et des abonnements sur mesure, et promotion des services de la salle.",

  // Projects
  "Real Estate · Founder": "Immobilier · Fondateur",
  "Strategy · 2022–2023": "Stratégie · 2022–2023",
  "Video · 2022": "Vidéo · 2022",
  "Campus · Marketing Manager": "Campus · Responsable marketing",
  "Geldloket Communication Strategy": "Stratégie de communication Geldloket",
  "City of Emmen Promo Film": "Film promotionnel de la ville d'Emmen",
  "Helios Student Association": "Association étudiante Helios",
  "A real estate company helping international (especially French) investors buy property in Portugal. I built its marketing from the ground up: positioning, SEO and content strategy, email campaigns, property listings and social media.":
    "Une société immobilière qui aide les investisseurs internationaux (surtout français) à acheter au Portugal. J'ai construit tout son marketing : positionnement, stratégie SEO et contenu, campagnes e-mail, annonces immobilières et réseaux sociaux.",
  "A marketing and communication strategy for a financial consulting firm for young adults, with social media content, influencer collaborations, workshops and partnerships.":
    "Une stratégie marketing et de communication pour un cabinet de conseil financier destiné aux jeunes adultes : contenus pour les réseaux sociaux, collaborations avec des influenceurs, ateliers et partenariats.",
  "A promotional video for the city of Emmen, taken from brainstorming and storyboard through filming landmarks and interviews with locals.":
    "Une vidéo promotionnelle pour la ville d'Emmen, du brainstorming et du storyboard jusqu'au tournage des lieux emblématiques et aux interviews d'habitants.",
  "Designed and ran targeted communication strategies to raise awareness for the association at NHL Stenden University.":
    "Conception et mise en œuvre de stratégies de communication ciblées pour faire connaître l'association à l'université NHL Stenden.",
  "Website": "Site web",
  "Lusitania Investments website": "Site de Lusitania Investments",

  // Education
  "BBA International Business": "Bachelor en commerce international (BBA)",
  "Business Diploma": "Diplôme en commerce",
  "The Fundamentals of Digital Marketing": "Les fondamentaux du marketing digital",
  "English C2 — IELTS Academic": "Anglais C2 — IELTS Academic",
  "X-Honours Programme, NHL Stenden": "Programme X-Honours, NHL Stenden",
  "NHL Stenden University of Applied Sciences, Emmen (NL). Specialisation in Marketing & Sales, plus Finance, Operations & Supply Chain, and Organisational Behaviour.":
    "NHL Stenden University of Applied Sciences, Emmen (Pays-Bas). Spécialisation marketing et vente, ainsi que finance, opérations et supply chain, et comportement organisationnel.",
  "São João do Estoril Vocational High School, Portugal. Specialisation in Marketing, Advertising & Public Relations.":
    "Lycée professionnel de São João do Estoril, Portugal. Spécialisation marketing, publicité et relations publiques.",
  "Leadership development and cross-cultural business.": "Développement du leadership et commerce interculturel.",
  "Beyond work": "En dehors du travail",

  // Same in both languages (names, places, levels)
  "PT · EN · ES · FR": "PT · EN · ES · FR", "SEO": "SEO", "C2": "C2", "B1": "B1",
  "Angers, France": "Angers, France", "Nantes, France": "Nantes, France", "Oeiras, Portugal": "Oeiras, Portugal",
  "Lusitania Investments": "Lusitania Investments", "Google Analytics": "Google Analytics"
};

/* ---------- language helpers ---------- */
let LANG = (() => {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "fr") { localStorage.setItem("dc_lang", q); return q; }
    const saved = localStorage.getItem("dc_lang");
    if (saved === "en" || saved === "fr") return saved;
  } catch {}
  return /^fr/i.test(navigator.language || "") ? "fr" : "en";
})();
let FR_OVERRIDES = {};

const ui = key => (UI[key] && (UI[key][LANG] || UI[key].en)) || key;
function tr(text) {
  if (LANG !== "fr" || text == null || text === "") return text;
  const s = String(text);
  return FR_OVERRIDES[s] || FR_CONTENT[s] || s.replace(/\bPresent\b/, UI.present.fr);
}
function setLang(l) {
  LANG = l;
  try { localStorage.setItem("dc_lang", l); } catch {}
}
function applyStaticTexts(root = document) {
  document.documentElement.lang = LANG;
  root.querySelectorAll("[data-i18n]").forEach(el => el.textContent = ui(el.dataset.i18n));
  root.querySelectorAll("[data-i18n-html]").forEach(el => el.innerHTML = ui(el.dataset.i18nHtml));
  root.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = ui(el.dataset.i18nPh));
  root.querySelectorAll("[data-i18n-label]").forEach(el => el.setAttribute("aria-label", ui(el.dataset.i18nLabel)));
  root.querySelectorAll(".lang-switch [data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === LANG));
}
