const STORAGE_KEY = "resumeBuilderDataV1";

// Centralized default placeholder text for cleaner preview updates.
const placeholders = {
  fullName: "Your Name",
  jobTitle: "Your Job Title",
  email: "your.email@example.com",
  phone: "+1 (000) 000-0000",
  summary: "Your professional summary will appear here.",
  skills: ["Add skills in the form."],
  education: ["Add education details in the form."],
  experience: ["Add work experience in the form."],
  projects: ["Add project details in the form."],
};

const form = document.getElementById("resumeForm");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const clearDataBtn = document.getElementById("clearDataBtn");
const resumePreview = document.getElementById("resumePreview");

const previewRefs = {
  fullName: document.getElementById("previewFullName"),
  jobTitle: document.getElementById("previewJobTitle"),
  email: document.getElementById("previewEmail"),
  phone: document.getElementById("previewPhone"),
  summary: document.getElementById("previewSummary"),
  skills: document.getElementById("previewSkills"),
  education: document.getElementById("previewEducation"),
  experience: document.getElementById("previewExperience"),
  projects: document.getElementById("previewProjects"),
};

function getFormData() {
  // Convert current form data to a plain object for easy storage/update usage.
  return {
    fullName: form.fullName.value.trim(),
    jobTitle: form.jobTitle.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    summary: form.summary.value.trim(),
    skills: form.skills.value.trim(),
    education: form.education.value.trim(),
    experience: form.experience.value.trim(),
    projects: form.projects.value.trim(),
  };
}

function splitEntries(multilineText) {
  // Split by lines and keep only non-empty entries.
  return multilineText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitParagraphs(paragraphText) {
  // Paragraph blocks are separated by one or more blank lines.
  return paragraphText
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderList(container, items, fallbackItems) {
  container.innerHTML = "";
  const finalItems = items.length ? items : fallbackItems;

  finalItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderParagraphs(container, items, fallbackItems) {
  container.innerHTML = "";
  const finalItems = items.length ? items : fallbackItems;

  finalItems.forEach((item) => {
    const p = document.createElement("p");
    p.textContent = item;
    container.appendChild(p);
  });
}

function updatePreview() {
  const data = getFormData();

  previewRefs.fullName.textContent = data.fullName || placeholders.fullName;
  previewRefs.jobTitle.textContent = data.jobTitle || placeholders.jobTitle;
  previewRefs.email.textContent = data.email || placeholders.email;
  previewRefs.phone.textContent = data.phone || placeholders.phone;
  previewRefs.summary.textContent = data.summary || placeholders.summary;

  renderList(previewRefs.skills, splitEntries(data.skills), placeholders.skills);
  renderParagraphs(
    previewRefs.education,
    splitParagraphs(data.education),
    placeholders.education
  );
  renderParagraphs(
    previewRefs.experience,
    splitParagraphs(data.experience),
    placeholders.experience
  );
  renderParagraphs(
    previewRefs.projects,
    splitParagraphs(data.projects),
    placeholders.projects
  );
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);

    // Restore only known fields to prevent accidental key pollution.
    [
      "fullName",
      "jobTitle",
      "email",
      "phone",
      "summary",
      "skills",
      "education",
      "experience",
      "projects",
    ].forEach((key) => {
      if (typeof saved[key] === "string") {
        form[key].value = saved[key];
      }
    });
  } catch (error) {
    console.warn("Could not restore saved resume data:", error);
  }
}

async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const paperRect = resumePreview.getBoundingClientRect();

  // Render the preview area to a high-resolution canvas for a crisp PDF.
  const canvas = await html2canvas(resumePreview, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: Math.ceil(paperRect.width),
    height: Math.ceil(paperRect.height),
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 0;
  let heightLeft = imgHeight;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pageHeight;

  // If content overflows, continue on additional pages.
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }

  const fullName = form.fullName.value.trim().replace(/\s+/g, "-") || "resume";
  pdf.save(`${fullName}.pdf`);
}

function clearSavedData() {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  updatePreview();
}

// Persist + render every time user changes an input to keep preview live.
form.addEventListener("input", () => {
  saveToLocalStorage();
  updatePreview();
});

downloadPdfBtn.addEventListener("click", () => {
  downloadPdf().catch((error) => {
    console.error("PDF generation failed:", error);
    alert("Sorry, PDF generation failed. Please try again.");
  });
});

clearDataBtn.addEventListener("click", clearSavedData);

// Initial boot sequence.
loadFromLocalStorage();
updatePreview();
