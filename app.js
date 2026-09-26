/* ============================================================
   Resume Builder — vanilla JS. No dependencies, no fetches,
   works from file:// . State autosaves to localStorage.
   ============================================================ */
"use strict";

var LS_KEY = "atsResumeBuilder.v1";

/* ~40+ strong action verbs for the ATS bullet check */
var ACTION_VERBS = [
  "achieved", "accelerated", "architected", "automated", "built", "collaborated",
  "created", "delivered", "designed", "developed", "drove", "engineered",
  "enhanced", "established", "executed", "expanded", "founded", "generated",
  "grew", "headed", "implemented", "improved", "increased", "initiated",
  "introduced", "launched", "led", "managed", "mentored", "migrated",
  "negotiated", "optimized", "orchestrated", "pioneered", "presented",
  "reduced", "refactored", "resolved", "scaled", "shipped", "spearheaded",
  "streamlined", "strengthened", "transformed"
];

/* stopwords removed before JD keyword extraction */
var STOPWORDS = {};
("a,about,above,after,again,against,all,also,am,an,and,any,are,as,at,be,because,been,before,being,below,between,both,but,by,can,cannot,could,did,do,does,doing,down,during,each,few,for,from,further,had,has,have,having,he,her,here,hers,herself,him,himself,his,how,i,if,in,into,is,it,its,itself,join,like,me,more,most,my,myself,no,nor,not,of,off,on,once,only,or,other,ought,our,ours,ourselves,out,over,own,same,she,should,so,some,such,than,that,the,their,theirs,them,themselves,then,there,these,they,this,those,through,to,too,under,until,up,very,was,we,were,what,when,where,which,while,who,whom,why,with,would,you,your,yours,yourself,yourselves,will,within,across,per,via,including,plus,etc,us,team,candidate,role,looking,seeking,ideal,apply,able,ensure,help,work,working,years,year,experience,strong,good,great,proficient").split(",").forEach(function (w) { STOPWORDS[w] = true; });

/* motion + a11y helpers */

function reducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function announce(msg) {
  var lr = document.getElementById("live-region");
  if (lr) lr.textContent = msg;
}

/* animated 0–100 count-up for the ATS gauge (instant under reduced motion) */
var scoreAnim = null;
function animateScore(to) {
  var num = document.getElementById("ats-number");
  var ring = document.getElementById("ats-fill");
  var C = 326.73; /* 2πr, r = 52 */
  var color = to >= 80 ? "#15803d" : to >= 60 ? "#b45309" : "#b91c1c";
  var from = parseInt(num.textContent, 10);
  if (isNaN(from)) from = 0;

  ring.style.strokeDashoffset = (C * (1 - to / 100)).toFixed(1);
  ring.style.stroke = color;
  num.style.color = color;

  if (scoreAnim) cancelAnimationFrame(scoreAnim);
  if (reducedMotion() || from === to) { num.textContent = to; return; }

  var start = null, dur = 650;
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / dur, 1);
    var e = 1 - Math.pow(1 - p, 3); /* easeOutCubic — gentle settle */
    num.textContent = Math.round(from + (to - from) * e);
    if (p < 1) scoreAnim = requestAnimationFrame(step);
  }
  scoreAnim = requestAnimationFrame(step);
}

var SEC_LIST_IDS = { experience: "exp-list", education: "edu-list", projects: "proj-list", certifications: "cert-list" };
var SEC_SINGULAR = { experience: "position", education: "education entry", projects: "project", certifications: "certification" };

/* ---------------- state ---------------- */

function blankEntry(sec) {
  if (sec === "experience") return { title: "", company: "", location: "", start: "", end: "", present: false, bullets: "" };
  if (sec === "education")  return { degree: "", institution: "", location: "", date: "", notes: "" };
  if (sec === "projects")   return { name: "", link: "", bullets: "" };
  return { name: "", issuer: "", year: "" }; /* certifications */
}

function blankState() {
  return {
    template: "classic",
    personal: { name: "", title: "", email: "", phone: "", location: "", linkedin: "", website: "" },
    summary: "",
    experience: [blankEntry("experience")],
    education: [blankEntry("education")],
    skills: "",
    projects: [],
    certifications: []
  };
}

function load() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    var s = JSON.parse(raw);
    if (!s || !s.personal) return null;
    return s;
  } catch (e) { return null; }
}

var state = load() || blankState();

var saveTimer = null;
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
}
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 300);
}

/* ---------------- helpers ---------------- */

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function wordCount(text) {
  var t = String(text || "").trim();
  return t ? t.split(/\s+/).length : 0;
}

function splitLines(text) {
  return String(text || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
}

function parseSkills() {
  return String(state.skills || "").split(/[\n,;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
}

function cleanUrl(u) {
  return String(u || "").trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function dateRange(start, end, present) {
  var s = String(start || "").trim();
  var e = present ? "Present" : String(end || "").trim();
  if (s && e) return s + " – " + e;
  return s || e;
}

/* ---------------- sample data ---------------- */

var SAMPLE = {
  template: "modern",
  personal: {
    name: "Arjun Sharma",
    title: "Senior Software Engineer",
    email: "arjun.sharma.dev@gmail.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/arjunsharma-dev",
    website: "arjunsharma.dev"
  },
  summary: "Senior Software Engineer with 5+ years of experience building scalable backend systems and cloud-native applications. Proven track record of leading cross-functional teams, cutting infrastructure costs, and shipping high-impact features used by millions. Strong expertise in Java, microservices, and AWS, with a focus on performance optimization and clean architecture.",
  experience: [
    {
      title: "Senior Software Engineer", company: "Razorpay", location: "Bengaluru, India",
      start: "06/2022", end: "", present: true,
      bullets: "Led migration of the payment processing pipeline to event-driven microservices, reducing transaction latency by 42% while handling 2M+ daily transactions\nArchitected a real-time fraud detection module using Kafka and Redis, cutting fraudulent transactions by 35% and saving \u20B91.2Cr annually\nMentored a team of 4 engineers through code reviews and design discussions, improving sprint velocity by 25%\nOptimized PostgreSQL queries and introduced read replicas, reducing p95 API response time from 800ms to 220ms\nDrove adoption of trunk-based development across 3 teams, reducing merge conflicts by 60%\nPartnered with the security team to achieve SOC 2 Type II compliance, remediating 40+ vulnerabilities across 12 services"
    },
    {
      title: "Software Engineer", company: "Freshworks", location: "Chennai, India",
      start: "07/2019", end: "05/2022", present: false,
      bullets: "Built REST APIs with Spring Boot serving 500K+ requests per day at 99.9% uptime\nImplemented CI/CD pipelines with Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes\nCollaborated with the product team to launch a customer analytics dashboard adopted by 300+ enterprise clients\nReduced AWS infrastructure spend by 30% (\u20B945L/year) by rightsizing EC2 instances and introducing spot fleets\nIntroduced contract testing with Pact across 6 services, catching 30+ integration bugs before production"
    },
    {
      title: "Junior Software Developer", company: "Zoho Corporation", location: "Chennai, India",
      start: "06/2018", end: "06/2019", present: false,
      bullets: "Developed internal tooling in Java that automated report generation for 50+ support agents\nResolved 100+ bugs and wrote unit tests that raised module coverage from 45% to 80%"
    }
  ],
  education: [
    {
      degree: "B.Tech, Computer Science and Engineering",
      institution: "Anna University", location: "Chennai, India",
      date: "2018", notes: "CGPA 8.4/10 — graduated First Class with Distinction"
    }
  ],
  skills: "Java, Spring Boot, Microservices, REST APIs, PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, AWS (EC2, S3, Lambda), React, Git, Jenkins, System Design",
  projects: [
    {
      name: "Distributed Task Scheduler", link: "github.com/arjunsharma/task-scheduler",
      bullets: "Built a fault-tolerant job scheduler handling 10K+ jobs per hour with retries and dead-letter queues\nOpen-sourced the project, earning 400+ GitHub stars"
    }
  ],
  certifications: [
    { name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", year: "2023" },
    { name: "Oracle Certified Professional: Java SE 11 Developer", issuer: "Oracle", year: "2020" }
  ]
};

/* ---------------- editor rendering ---------------- */

function fieldHTML(sec, idx, field, label, opts) {
  opts = opts || {};
  var val = state[sec][idx][field] || "";
  var type = opts.type || "text";
  var ph = opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : "";
  var extra = opts.extra || "";
  var nm = ' name="' + sec + "-" + field + "-" + idx + '" autocomplete="off"';
  if (type === "textarea") {
    return '<label>' + esc(label) + '<textarea data-sec="' + sec + '" data-idx="' + idx + '" data-field="' + field + '" rows="' + (opts.rows || 4) + '"' + ph + extra + nm + '>' + esc(val) + '</textarea></label>';
  }
  return '<label>' + esc(label) + '<input type="' + type + '" data-sec="' + sec + '" data-idx="' + idx + '" data-field="' + field + '" value="' + esc(val) + '"' + ph + extra + nm + '></label>';
}

function expEntryHTML(e, i) {
  var dis = e.present ? " disabled" : "";
  return '<div class="entry">' +
    '<div class="entry-head"><strong>Position ' + (i + 1) + '</strong>' +
    '<button type="button" class="remove" data-action="remove" data-sec="experience" data-idx="' + i + '">Remove</button></div>' +
    '<div class="grid2">' +
    fieldHTML("experience", i, "title", "Job title", { placeholder: "Senior Software Engineer" }) +
    fieldHTML("experience", i, "company", "Company", { placeholder: "Razorpay" }) +
    fieldHTML("experience", i, "location", "Location", { placeholder: "Bengaluru, India" }) +
    '<div class="date-row">' +
    fieldHTML("experience", i, "start", "Start (MM/YYYY)", { placeholder: "06/2022" }) +
    fieldHTML("experience", i, "end", "End (MM/YYYY)", { placeholder: "05/2024", extra: dis }) +
    '<label class="check"><input type="checkbox" data-sec="experience" data-idx="' + i + '" data-field="present"' + (e.present ? " checked" : "") + '> Present</label>' +
    "</div></div>" +
    fieldHTML("experience", i, "bullets", "Achievements — one bullet per line", { type: "textarea", rows: 4, placeholder: "Led migration of… reducing latency by 40%\nBuilt REST APIs serving 500K+ requests/day…" }) +
    "</div>";
}

function eduEntryHTML(e, i) {
  return '<div class="entry">' +
    '<div class="entry-head"><strong>Education ' + (i + 1) + '</strong>' +
    '<button type="button" class="remove" data-action="remove" data-sec="education" data-idx="' + i + '">Remove</button></div>' +
    '<div class="grid2">' +
    fieldHTML("education", i, "degree", "Degree", { placeholder: "B.Tech, Computer Science" }) +
    fieldHTML("education", i, "institution", "Institution", { placeholder: "Anna University" }) +
    fieldHTML("education", i, "location", "Location", { placeholder: "Chennai, India" }) +
    fieldHTML("education", i, "date", "Graduation (MM/YYYY or YYYY)", { placeholder: "2018" }) +
    "</div>" +
    fieldHTML("education", i, "notes", "Notes — CGPA, honors (optional)", { placeholder: "CGPA 8.4/10" }) +
    "</div>";
}

function projEntryHTML(p, i) {
  return '<div class="entry">' +
    '<div class="entry-head"><strong>Project ' + (i + 1) + '</strong>' +
    '<button type="button" class="remove" data-action="remove" data-sec="projects" data-idx="' + i + '">Remove</button></div>' +
    '<div class="grid2">' +
    fieldHTML("projects", i, "name", "Project name", { placeholder: "Distributed Task Scheduler" }) +
    fieldHTML("projects", i, "link", "Link (optional)", { placeholder: "github.com/you/project" }) +
    "</div>" +
    fieldHTML("projects", i, "bullets", "Highlights — one bullet per line (1–3)", { type: "textarea", rows: 3 }) +
    "</div>";
}

function certEntryHTML(c, i) {
  return '<div class="entry">' +
    '<div class="entry-head"><strong>Certification ' + (i + 1) + '</strong>' +
    '<button type="button" class="remove" data-action="remove" data-sec="certifications" data-idx="' + i + '">Remove</button></div>' +
    '<div class="grid2">' +
    fieldHTML("certifications", i, "name", "Certification name", { placeholder: "AWS Certified Solutions Architect" }) +
    fieldHTML("certifications", i, "issuer", "Issuer", { placeholder: "Amazon Web Services" }) +
    fieldHTML("certifications", i, "year", "Year", { placeholder: "2023" }) +
    "</div></div>";
}

function renderEntries() {
  document.getElementById("exp-list").innerHTML =
    state.experience.map(expEntryHTML).join("") || '<p class="hint">No positions yet — add one below.</p>';
  document.getElementById("edu-list").innerHTML =
    state.education.map(eduEntryHTML).join("") || '<p class="hint">No education yet.</p>';
  document.getElementById("proj-list").innerHTML =
    state.projects.map(projEntryHTML).join("") || '<p class="hint">No projects yet.</p>';
  document.getElementById("cert-list").innerHTML =
    state.certifications.map(certEntryHTML).join("") || '<p class="hint">No certifications yet.</p>';
}

function addEntry(sec) {
  state[sec].push(blankEntry(sec));
  renderEntries();
  var list = document.getElementById(SEC_LIST_IDS[sec]);
  var last = list ? list.querySelector(".entry:last-child") : null;
  if (last && !reducedMotion()) last.classList.add("is-entering");
  saveSoon();
  renderPreview();
  announce("New " + (SEC_SINGULAR[sec] || "entry") + " added.");
}

function removeEntry(sec, idx) {
  state[sec].splice(idx, 1);
  renderEntries();
  saveSoon();
  renderPreview();
  announce("Removed " + (SEC_SINGULAR[sec] || "entry") + ".");
}

/* ---------------- resume HTML (preview) ---------------- */

function contactParts() {
  var p = state.personal;
  var parts = [];
  if (p.email) parts.push(esc(p.email));
  if (p.phone) parts.push(esc(p.phone));
  if (p.location) parts.push(esc(p.location));
  if (p.linkedin) parts.push(esc(cleanUrl(p.linkedin)));
  if (p.website) parts.push(esc(cleanUrl(p.website)));
  return parts.join(" &nbsp;•&nbsp; ");
}

function bulletsHTML(bulletsText) {
  var items = splitLines(bulletsText);
  if (!items.length) return "";
  return "<ul>" + items.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>";
}

function buildResumeHTML() {
  var p = state.personal;
  var h = "";

  /* header — modern template wraps the name block for the accent bar */
  var headerInner =
    '<h1 class="r-name">' + esc(p.name || "Your Name") + "</h1>" +
    (p.title ? '<div class="r-title">' + esc(p.title) + "</div>" : "") +
    (contactParts() ? '<div class="r-contact">' + contactParts() + "</div>" : "");
  h += '<div class="r-header">' +
    (state.template === "modern" ? '<div class="r-name-row">' + headerInner + "</div>" : headerInner) +
    "</div>";

  if (state.summary.trim()) {
    h += '<div class="r-section"><h2>Professional Summary</h2><p>' + esc(state.summary.trim()) + "</p></div>";
  }

  var exp = state.experience.filter(function (e) { return e.title || e.company; });
  if (exp.length) {
    h += '<div class="r-section"><h2>Work Experience</h2>';
    exp.forEach(function (e) {
      h += '<div class="r-job">' +
        '<div class="r-job-head"><span class="r-job-title">' + esc(e.title) + '</span>' +
        '<span class="r-dates">' + esc(dateRange(e.start, e.end, e.present)) + "</span></div>" +
        ((e.company || e.location) ? '<div class="r-job-sub">' + esc([e.company, e.location].filter(Boolean).join(", ")) + "</div>" : "") +
        bulletsHTML(e.bullets) +
        "</div>";
    });
    h += "</div>";
  }

  var edu = state.education.filter(function (e) { return e.degree || e.institution; });
  if (edu.length) {
    h += '<div class="r-section"><h2>Education</h2>';
    edu.forEach(function (e) {
      h += '<div class="r-edu">' +
        '<div class="r-edu-head"><span class="r-job-title">' + esc(e.degree) + '</span>' +
        '<span class="r-dates">' + esc(e.date) + "</span></div>" +
        ((e.institution || e.location) ? '<div class="r-job-sub">' + esc([e.institution, e.location].filter(Boolean).join(", ")) + "</div>" : "") +
        (e.notes ? '<p class="r-notes">' + esc(e.notes) + "</p>" : "") +
        "</div>";
    });
    h += "</div>";
  }

  var skills = parseSkills();
  if (skills.length) {
    h += '<div class="r-section"><h2>Skills</h2><p>' + esc(skills.join(", ")) + "</p></div>";
  }

  var proj = state.projects.filter(function (x) { return x.name; });
  if (proj.length) {
    h += '<div class="r-section"><h2>Projects</h2>';
    proj.forEach(function (x) {
      h += '<div class="r-job">' +
        '<div class="r-proj-head">' + esc(x.name) +
        (x.link ? ' <span class="r-dates">' + esc(cleanUrl(x.link)) + "</span>" : "") + "</div>" +
        bulletsHTML(x.bullets) +
        "</div>";
    });
    h += "</div>";
  }

  var cert = state.certifications.filter(function (x) { return x.name; });
  if (cert.length) {
    h += '<div class="r-section"><h2>Certifications</h2>';
    cert.forEach(function (x) {
      h += '<div class="r-cert">' + esc(x.name) +
        (x.issuer ? " — " + esc(x.issuer) : "") +
        (x.year ? " (" + esc(x.year) + ")" : "") + "</div>";
    });
    h += "</div>";
  }

  return h;
}

/* plain-text version — what ATS parsers ingest best */
function buildPlainText() {
  var p = state.personal;
  var L = [];
  L.push((p.name || "YOUR NAME").toUpperCase());
  if (p.title) L.push(p.title);
  var contact = [p.email, p.phone, p.location, cleanUrl(p.linkedin), cleanUrl(p.website)].filter(Boolean).join(" | ");
  if (contact) L.push(contact);
  L.push("");
  if (state.summary.trim()) {
    L.push("PROFESSIONAL SUMMARY");
    L.push(state.summary.trim());
    L.push("");
  }
  var exp = state.experience.filter(function (e) { return e.title || e.company; });
  if (exp.length) {
    L.push("WORK EXPERIENCE");
    exp.forEach(function (e) {
      L.push(e.title + (e.company ? " - " + e.company : "") + (e.location ? ", " + e.location : ""));
      var d = dateRange(e.start, e.end, e.present);
      if (d) L.push(d);
      splitLines(e.bullets).forEach(function (b) { L.push("- " + b); });
      L.push("");
    });
  }
  var edu = state.education.filter(function (e) { return e.degree || e.institution; });
  if (edu.length) {
    L.push("EDUCATION");
    edu.forEach(function (e) {
      L.push(e.degree + (e.institution ? " - " + e.institution : "") + (e.location ? ", " + e.location : "") + (e.date ? " (" + e.date + ")" : ""));
      if (e.notes) L.push(e.notes);
    });
    L.push("");
  }
  var skills = parseSkills();
  if (skills.length) {
    L.push("SKILLS");
    L.push(skills.join(", "));
    L.push("");
  }
  var proj = state.projects.filter(function (x) { return x.name; });
  if (proj.length) {
    L.push("PROJECTS");
    proj.forEach(function (x) {
      L.push(x.name + (x.link ? " (" + cleanUrl(x.link) + ")" : ""));
      splitLines(x.bullets).forEach(function (b) { L.push("- " + b); });
    });
    L.push("");
  }
  var cert = state.certifications.filter(function (x) { return x.name; });
  if (cert.length) {
    L.push("CERTIFICATIONS");
    cert.forEach(function (x) {
      L.push(x.name + (x.issuer ? " - " + x.issuer : "") + (x.year ? ", " + x.year : ""));
    });
    L.push("");
  }
  return L.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

var prevTemplate = null;

function renderPreview() {
  var resume = document.getElementById("resume");
  var tplChanged = prevTemplate !== null && prevTemplate !== state.template;
  prevTemplate = state.template;

  if (tplChanged && !reducedMotion()) {
    /* crossfade: paint the new template faded, then ease it in (double rAF, no layout reads) */
    resume.className = "resume template-" + state.template + " is-switching";
    resume.innerHTML = buildResumeHTML();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { resume.classList.remove("is-switching"); });
    });
  } else {
    resume.className = "resume template-" + state.template;
    resume.innerHTML = buildResumeHTML();
  }

  /* template switcher selected state */
  var btns = document.querySelectorAll("#template-switch button");
  for (var i = 0; i < btns.length; i++) {
    var active = btns[i].getAttribute("data-template") === state.template;
    btns[i].classList.toggle("active", active);
    btns[i].setAttribute("aria-pressed", active ? "true" : "false");
  }

  /* filename hint */
  var nm = (state.personal.name || "YourName").trim().split(/\s+/).join("_") || "YourName";
  document.getElementById("filename-hint").innerHTML =
    'When saving the PDF, name it <code>' + esc(nm) + '_Resume.pdf</code>';

  updateCounts();
  renderATS();
}

function updateCounts() {
  var sw = wordCount(state.summary);
  document.getElementById("summary-count").textContent = sw + (sw === 1 ? " word" : " words");
  var sk = parseSkills().length;
  document.getElementById("skills-count").textContent = sk + (sk === 1 ? " skill" : " skills");
  var total = wordCount(buildPlainText());
  document.getElementById("preview-words").textContent = total + " words";
  document.getElementById("ats-words").textContent = total + " words";
}

/* ---------------- ATS score checker ---------------- */

var DATE_RE = /^(0[1-9]|1[0-2])\/\d{4}$/;

function allBullets() {
  var b = [];
  state.experience.forEach(function (e) { b = b.concat(splitLines(e.bullets)); });
  state.projects.forEach(function (x) { b = b.concat(splitLines(x.bullets)); });
  return b;
}

function analyzeATS() {
  var checks = [];
  var p = state.personal;
  var bullets = allBullets();
  var totalWords = wordCount(buildPlainText());
  var skills = parseSkills();

  function add(label, weight, pass, advice) {
    checks.push({ label: label, weight: weight, pass: !!pass, advice: advice || "" });
  }

  /* 1. contact info */
  var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((p.email || "").trim());
  var phoneOk = ((p.phone || "").replace(/\D/g, "").length >= 7);
  var liOk = !!(p.linkedin || "").trim();
  add("Contact info complete (email, phone, LinkedIn)", 15,
    emailOk && phoneOk && liOk,
    "Add a valid email address, a phone number, and your LinkedIn URL — parsers rank resumes without them lower.");

  /* 2. summary length */
  var sw = wordCount(state.summary);
  add("Professional summary is 30–80 words", 10,
    sw >= 30 && sw <= 80,
    sw === 0 ? "Write a 3–4 line summary (30–80 words)." : "Your summary is " + sw + " words — trim or expand to 30–80.");

  /* 3. standard headings */
  var coreFilled = !!state.summary.trim() &&
    state.experience.some(function (e) { return e.title || e.company; }) &&
    state.education.some(function (e) { return e.degree || e.institution; }) &&
    skills.length > 0;
  add("Standard section headings used", 10, coreFilled,
    "Fill in Summary, Work Experience, Education, and Skills — this template already uses the exact standard headings ATS expects.");

  /* 4. every experience entry has bullets */
  var expFilled = state.experience.filter(function (e) { return e.title || e.company; });
  var bulletsOk = expFilled.length > 0 && expFilled.every(function (e) { return splitLines(e.bullets).length > 0; });
  add("Every work entry has bullet points", 10, bulletsOk,
    "Add at least one achievement bullet under each role — parsers and recruiters skim bullets first.");

  /* 5. action verbs */
  var verbHits = bullets.filter(function (b) {
    var first = b.replace(/^[^a-zA-Z]+/, "").split(/\s+/)[0].toLowerCase();
    return ACTION_VERBS.indexOf(first) !== -1;
  }).length;
  var verbRate = bullets.length ? verbHits / bullets.length : 0;
  add("Bullets start with action verbs (≥70%)", 10,
    bullets.length > 0 && verbRate >= 0.7,
    bullets.length === 0 ? "Write bullets starting with verbs like Led, Built, Reduced, Launched." :
      "Only " + Math.round(verbRate * 100) + "% of bullets start with a strong verb — rewrite weak openers (Responsible for, Worked on…).");

  /* 6. quantified achievements */
  var quantified = bullets.filter(function (b) { return /\d/.test(b); }).length;
  add("Quantified achievements detected (numbers, %, ₹/$)", 10,
    quantified >= 2,
    "Add numbers to at least 2 bullets — e.g. 'reduced latency by 40%', 'served 500K+ requests/day'.");

  /* 7. no first-person pronouns */
  var prose = state.summary + " " + bullets.join(" ");
  var pronounHit = /\b(i|me|my|mine|myself|we|us|our|ours)\b/i.test(prose);
  add("No first-person pronouns (I/me/my…)", 5, !pronounHit,
    "Remove I/me/my — write in implied first person: 'Led a team of 4…' not 'I led a team of 4…'.");

  /* 8. length 1–2 pages */
  add("Length fits 1–2 pages (~400–900 words)", 10,
    totalWords >= 400 && totalWords <= 900,
    totalWords < 400 ? "Only " + totalWords + " words — add more achievements, projects, or skills to reach ~400+." :
      "At " + totalWords + " words this likely spills past 2 pages — trim older roles and weaker bullets.");

  /* 9. skills depth */
  add("Skills section has 8+ skills", 10, skills.length >= 8,
    "List at least 8 skills — ATS filters heavily on keyword matches from this section.");

  /* 10. consistent dates */
  var dateStrs = [];
  state.experience.forEach(function (e) {
    if (e.start) dateStrs.push({ v: e.start, edu: false });
    if (e.end && !e.present) dateStrs.push({ v: e.end, edu: false });
  });
  state.education.forEach(function (e) { if (e.date) dateStrs.push({ v: e.date, edu: true }); });
  var datesOk = dateStrs.length > 0 && dateStrs.every(function (d) {
    return DATE_RE.test(d.v.trim()) || (d.edu && /^\d{4}$/.test(d.v.trim()));
  });
  add("Dates in consistent MM/YYYY format", 5, datesOk,
    "Use MM/YYYY for work dates (e.g. 06/2022) — never \u2018June 22\u2019 or \u20186/22\u2019. Education may use YYYY.");

  /* 11. no references line */
  var refHit = /references available/i.test(buildPlainText());
  add("\u201CReferences available on request\u201D line absent", 5, !refHit,
    "Delete that line — it wastes space and every ATS guide flags it as outdated.");

  var score = checks.reduce(function (s, c) { return s + (c.pass ? c.weight : 0); }, 0);
  return { score: Math.round(score), checks: checks, words: totalWords };
}

function renderATS() {
  var r = analyzeATS();
  animateScore(r.score);
  var num = document.getElementById("ats-number");
  var verdict = document.getElementById("ats-verdict");
  verdict.textContent =
    r.score >= 90 ? "Excellent — this resume should sail through ATS filters." :
    r.score >= 80 ? "Strong — fix the flagged items to be safe." :
    r.score >= 60 ? "Needs work — several ATS risks detected." :
    "At risk — address the failures below before applying.";
  verdict.style.color = num.style.color;

  document.getElementById("ats-checks").innerHTML = r.checks.map(function (c) {
    return '<li class="' + (c.pass ? "pass" : "fail") + '">' +
      '<span class="mark">' + (c.pass ? "✓" : "✕") + "</span>" +
      "<span>" + esc(c.label) +
      (c.pass ? "" : '<span class="advice">' + esc(c.advice) + "</span>") +
      "</span></li>";
  }).join("");
}

/* ---------------- JD keyword matcher ---------------- */

function extractKeywords(text) {
  var freq = {};
  String(text || "").toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .forEach(function (w) {
      w = w.replace(/^[.]+|[.]+$/g, "");
      if (w.length >= 3 && !STOPWORDS[w]) freq[w] = (freq[w] || 0) + 1;
    });
  return Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 40);
}

function analyzeJD() {
  var jd = document.getElementById("jd-input").value;
  var box = document.getElementById("jd-results");
  if (!jd.trim()) {
    box.hidden = true;
    return;
  }
  var keywords = extractKeywords(jd);
  var resumeText = buildPlainText().toLowerCase();
  var matched = keywords.filter(function (k) { return resumeText.indexOf(k) !== -1; });
  var missing = keywords.filter(function (k) { return resumeText.indexOf(k) === -1; });
  var pct = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;

  document.getElementById("jd-score").textContent =
    pct + "% keyword overlap — " + matched.length + " of " + keywords.length + " JD keywords found in your resume.";
  document.getElementById("jd-matched").innerHTML =
    matched.map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") || "<span>—</span>";
  document.getElementById("jd-missing").innerHTML =
    missing.map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") || "<span>—</span>";
  box.hidden = false;
}

/* ---------------- actions ---------------- */

function copyPlainText() {
  var text = buildPlainText();
  function done() {
    var btn = document.getElementById("btn-copy");
    var old = btn.textContent;
    btn.textContent = "Copied \u2713";
    announce("Plain-text resume copied to clipboard.");
    setTimeout(function () { btn.textContent = old; }, 1600);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
  } else {
    fallbackCopy(text);
    done();
  }
}

function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}

function loadSample() {
  if (!confirm("Replace everything with sample data? Your current entries will be lost.")) return;
  state = JSON.parse(JSON.stringify(SAMPLE));
  populateStatic();
  renderEntries();
  save();
  renderPreview();
  announce("Sample resume loaded.");
}

function clearAll() {
  if (!confirm("Clear the entire resume? This cannot be undone.")) return;
  state = blankState();
  populateStatic();
  renderEntries();
  save();
  renderPreview();
  document.getElementById("jd-input").value = "";
  document.getElementById("jd-results").hidden = true;
  announce("Resume cleared.");
}

function populateStatic() {
  var p = state.personal;
  document.getElementById("p-name").value = p.name || "";
  document.getElementById("p-title").value = p.title || "";
  document.getElementById("p-email").value = p.email || "";
  document.getElementById("p-phone").value = p.phone || "";
  document.getElementById("p-location").value = p.location || "";
  document.getElementById("p-linkedin").value = p.linkedin || "";
  document.getElementById("p-website").value = p.website || "";
  document.getElementById("summary").value = state.summary || "";
  document.getElementById("skills").value = state.skills || "";
}

/* ---------------- events ---------------- */

function onEdit(e) {
  var el = e.target;

  if (el.getAttribute("data-personal")) {
    state.personal[el.getAttribute("data-personal")] = el.value;
  } else if (el.id === "summary") {
    state.summary = el.value;
  } else if (el.id === "skills") {
    state.skills = el.value;
  } else if (el.getAttribute("data-sec")) {
    var sec = el.getAttribute("data-sec");
    var idx = parseInt(el.getAttribute("data-idx"), 10);
    var field = el.getAttribute("data-field");
    if (el.type === "checkbox") {
      state[sec][idx][field] = el.checked;
      if (field === "present") {
        if (el.checked) state[sec][idx].end = "";
        renderEntries(); /* reflect disabled end-date input */
      }
    } else {
      state[sec][idx][field] = el.value;
    }
  } else {
    return;
  }
  saveSoon();
  renderPreview();
}

function onClick(e) {
  var t = e.target;

  var tplBtn = t.closest("#template-switch button");
  if (tplBtn) {
    state.template = tplBtn.getAttribute("data-template");
    saveSoon();
    renderPreview();
    return;
  }

  var rm = t.closest('[data-action="remove"]');
  if (rm) {
    var sec = rm.getAttribute("data-sec");
    var idx = parseInt(rm.getAttribute("data-idx"), 10);
    var entryEl = rm.closest(".entry");
    if (entryEl && !reducedMotion()) {
      /* exit animation first, then remove from state */
      entryEl.classList.add("is-leaving");
      setTimeout(function () { removeEntry(sec, idx); }, 190);
    } else {
      removeEntry(sec, idx);
    }
    return;
  }

  switch (t.id) {
    case "btn-add-exp": addEntry("experience"); break;
    case "btn-add-edu": addEntry("education"); break;
    case "btn-add-proj": addEntry("projects"); break;
    case "btn-add-cert": addEntry("certifications"); break;
    case "btn-sample": loadSample(); break;
    case "btn-clear": clearAll(); break;
    case "btn-copy": copyPlainText(); break;
    case "btn-print": window.print(); break;
    case "btn-jd": analyzeJD(); break;
  }
}

/* ---------------- init ---------------- */

function init() {
  populateStatic();
  renderEntries();
  renderPreview();
  var editor = document.getElementById("editor");
  editor.addEventListener("input", onEdit);
  editor.addEventListener("change", onEdit);
  document.addEventListener("click", onClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
