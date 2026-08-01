import type { CandidateProfileUI } from '../types';

/**
 * Utility to generate valid, compilable LaTeX source code (.tex)
 * based on Jake's Resume / Harvard LaTeX CV template.
 */
export function generateCandidateLatexCode(candidate: CandidateProfileUI, bioText?: string): string {
  const sanitize = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return sanitize(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return sanitize(dateStr);
    }
  };

  const name = sanitize(candidate.name || 'Candidate Name');
  const title = sanitize(candidate.title || '');
  const email = sanitize(candidate.email || '');
  const phone = sanitize(candidate.phone || '');
  const bio = bioText || (Array.isArray(candidate.about) ? candidate.about.join(' ') : candidate.about) || '';

  const contactList: string[] = [];
  if (phone) contactList.push(phone);
  if (email) contactList.push(`\\href{mailto:${email}}{${email}}`);

  if (candidate.contacts) {
    candidate.contacts.forEach((c) => {
      contactList.push(sanitize(c.type ? `${c.type}: ${c.value}` : c.value));
    });
  }

  if (candidate.socials) {
    candidate.socials.forEach((s) => {
      const platform = sanitize(s.platform);
      const url = sanitize(s.url || s.username || '');
      contactList.push(`\\href{${url}}{${platform}}`);
    });
  }

  const contactLine = contactList.join(' \\$|\\$ ');

  let tex = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\vline height 1.5pt width \\linewidth\\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}

\\renewcommand{\\labelitemii}{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{marginlist}}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{marginlist}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING-------------
\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    ${title ? `\\small \\textit{${title}} \\\\ \\vspace{2pt}` : ''}
    \\small ${contactLine}
\\end{center}

`;

  // Summary
  if (bio.trim()) {
    tex += `%-----------SUMMARY-----------
\\section{Summary}
  \\small{${sanitize(bio)}}
\\vspace{5pt}

`;
  }

  // Education
  if (candidate.educations && candidate.educations.length > 0) {
    tex += `%-----------EDUCATION-----------
\\section{Education}
  \\begin{itemize}[leftmargin=0.15in, label={}]
`;
    candidate.educations.forEach((edu) => {
      const school = sanitize(edu.school);
      const dates = `${formatDate(edu.startDate)} -- ${edu.endDate ? formatDate(edu.endDate) : 'Present'}`;
      const degree = sanitize([edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in '));
      const gpa = edu.grade ? sanitize(`GPA: ${edu.grade}`) : '';

      tex += `    \\resumeSubheading
      {${school}}{${dates}}
      {${degree}}{${gpa}}
`;
      if (edu.description) {
        tex += `      \\resumeItemListStart
`;
        edu.description.split('\n').filter(Boolean).forEach((line) => {
          tex += `        \\resumeItem{${sanitize(line.replace(/^[-•*]\s*/, ''))}}
`;
        });
        tex += `      \\resumeItemListEnd
`;
      }
    });
    tex += `  \\end{itemize}

`;
  }

  // Experience
  if (candidate.experiences && candidate.experiences.length > 0) {
    tex += `%-----------EXPERIENCE-----------
\\section{Experience}
  \\begin{itemize}[leftmargin=0.15in, label={}]
`;
    candidate.experiences.forEach((exp) => {
      const company = sanitize(exp.companyName);
      const dates = `${formatDate(exp.startDate)} -- ${exp.endDate ? formatDate(exp.endDate) : 'Present'}`;
      const role = sanitize(exp.jobTitle);
      const locStr =
        typeof exp.location === 'object' && exp.location
          ? sanitize(exp.location.formattedAddress)
          : typeof exp.location === 'string'
          ? sanitize(exp.location)
          : '';

      tex += `    \\resumeSubheading
      {${company}}{${locStr}}
      {${role}}{${dates}}
`;
      if (exp.description) {
        tex += `      \\resumeItemListStart
`;
        exp.description.split('\n').filter(Boolean).forEach((line) => {
          tex += `        \\resumeItem{${sanitize(line.replace(/^[-•*]\s*/, ''))}}
`;
        });
        tex += `      \\resumeItemListEnd
`;
      }
    });
    tex += `  \\end{itemize}

`;
  }

  // Skills & Certifications
  if (
    (candidate.skills && candidate.skills.length > 0) ||
    (candidate.certificates && candidate.certificates.length > 0)
  ) {
    tex += `%-----------SKILLS \\& CERTIFICATIONS-----------
\\section{Skills \\& Certifications}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
`;
    if (candidate.skills && candidate.skills.length > 0) {
      const skillList = candidate.skills
        .map((s) => sanitize(s.level ? `${s.title} (${s.level})` : s.title))
        .join(', ');
      tex += `      \\textbf{Skills}{: ${skillList}} \\\\ \\vspace{2pt}
`;
    }
    if (candidate.certificates && candidate.certificates.length > 0) {
      const certList = candidate.certificates
        .map(
          (c) =>
            `${sanitize(c.name)} (${sanitize(c.issuer)}, ${formatDate(c.issueDate)})`
        )
        .join('; ');
      tex += `      \\textbf{Certifications}{: ${certList}}
`;
    }
    tex += `    }}
  \\end{itemize}
`;
  }

  tex += `

\\end{document}
`;

  return tex;
}
