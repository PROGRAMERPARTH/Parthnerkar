/* ===================================================================
   Resume PDF Generator
   Generates a native, clean, vector PDF resume using jsPDF.
   Produces a valid %PDF binary document (selectable text, ATS-friendly)
   that downloads directly with .pdf extension.
   =================================================================== */

import { jsPDF } from 'jspdf';

/**
 * Builds a structured, beautifully formatted jsPDF document.
 */
export function buildPdfDocument(skills = [], projects = [], certificates = []) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 18;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;
  const maxY = pageHeight - 18;
  let y = 20;

  // Helper to ensure enough vertical space or trigger a new page
  const ensureSpace = (needed) => {
    if (y + needed > maxY) {
      doc.addPage();
      y = 20;
    }
  };

  // Section heading helper
  const drawSectionHeading = (title) => {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138); // Primary navy
    doc.text(title.toUpperCase(), margin, y);
    y += 2;

    doc.setDrawColor(226, 232, 240); // Light border
    doc.setLineWidth(0.35);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;
  };

  // ==================== HEADER ====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138);
  doc.text('Parth Nerkar', margin, y);
  y += 7.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105); // Slate gray
  doc.text('AI & Data Science Student | Pune, Maharashtra', margin, y);
  y += 5.5;

  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Email: nerkarparth06@gmail.com   |   Portfolio: Parth Nerkar Portfolio', margin, y);
  y += 5.5;

  // Decorative blue header bar
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.75);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  // ==================== SUMMARY ====================
  drawSectionHeading('Professional Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  const summaryText =
    'Motivated AI & Data Science student with a passionate focus on artificial intelligence, machine learning, data engineering, and modern web applications. Driven to build intelligent, scalable systems that create real-world impact.';
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  ensureSpace(summaryLines.length * 4.5 + 4);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 5;

  // ==================== TECHNICAL SKILLS ====================
  drawSectionHeading('Technical Skills');
  const safeSkills = Array.isArray(skills) ? skills : [];

  if (safeSkills.length > 0) {
    const grouped = safeSkills.reduce((acc, skill) => {
      const cat = skill?.category || 'General';
      const name = skill?.name?.trim();
      if (!name) return acc;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(name);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([cat, names]) => {
      ensureSpace(6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 58, 138);
      const prefix = `${cat}: `;
      doc.text(prefix, margin, y);

      const prefixWidth = doc.getTextWidth(prefix);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      const skillString = names.join(', ');
      const skillLines = doc.splitTextToSize(skillString, contentWidth - prefixWidth);

      if (skillLines.length > 0) {
        doc.text(skillLines[0], margin + prefixWidth, y);
        for (let i = 1; i < skillLines.length; i++) {
          y += 4.5;
          ensureSpace(5);
          doc.text(skillLines[i], margin + prefixWidth, y);
        }
      }
      y += 5.5;
    });
    y += 2;
  } else {
    ensureSpace(6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No technical skills added yet.', margin, y);
    y += 7;
  }

  // ==================== PROJECTS ====================
  drawSectionHeading('Projects');
  const safeProjects = Array.isArray(projects) ? projects : [];

  if (safeProjects.length > 0) {
    safeProjects.forEach((project) => {
      ensureSpace(16);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138);
      doc.text(project.title || 'Untitled Project', margin, y);
      y += 4.8;

      // Tech Stack
      if (project.techStack) {
        ensureSpace(5);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text(`Tech Stack: ${project.techStack}`, margin, y);
        y += 4.5;
      }

      // Description
      if (project.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.2);
        doc.setTextColor(55, 65, 81);
        const descLines = doc.splitTextToSize(project.description, contentWidth);
        ensureSpace(descLines.length * 4.3 + 4);
        doc.text(descLines, margin, y);
        y += descLines.length * 4.3 + 4;
      } else {
        y += 2;
      }
    });
  } else {
    ensureSpace(6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No projects listed yet.', margin, y);
    y += 7;
  }

  // ==================== CERTIFICATES ====================
  drawSectionHeading('Certificates & Credentials');
  const safeCertificates = Array.isArray(certificates) ? certificates : [];

  if (safeCertificates.length > 0) {
    safeCertificates.forEach((cert) => {
      ensureSpace(12);

      // Title & Issuer
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      const titleLine = cert.issuer
        ? `• ${cert.title} — ${cert.issuer}`
        : `• ${cert.title}`;
      doc.text(titleLine, margin, y);
      y += 4.6;

      // Description
      if (cert.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const descLines = doc.splitTextToSize(cert.description, contentWidth - 4);
        ensureSpace(descLines.length * 4.2 + 3);
        doc.text(descLines, margin + 4, y);
        y += descLines.length * 4.2 + 4;
      } else {
        y += 2;
      }
    });
  } else {
    ensureSpace(6);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No certificates listed yet.', margin, y);
    y += 7;
  }

  // Page Numbers Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Parth Nerkar — Resume | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Downloads the resume directly as a native PDF file.
 */
export function generateResume(skills = [], projects = [], certificates = []) {
  try {
    const doc = buildPdfDocument(skills, projects, certificates);
    doc.save('Parth_Nerkar_Resume.pdf');
    return true;
  } catch (error) {
    console.error('Failed to generate PDF resume:', error);
    throw error;
  }
}

/**
 * Opens the native PDF in a new browser tab for preview.
 */
export function previewResume(skills = [], projects = [], certificates = []) {
  try {
    const doc = buildPdfDocument(skills, projects, certificates);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const previewWindow = window.open(url, '_blank');
    if (!previewWindow) {
      // If popup blocker intervened, fallback to saving the file
      doc.save('Parth_Nerkar_Resume.pdf');
    } else {
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    return true;
  } catch (error) {
    console.error('Failed to preview PDF resume:', error);
    throw error;
  }
}
