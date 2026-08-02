import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

// Skill display lookup map for canonical capitalization
const SKILL_DISPLAY_MAP: Record<string, string> = {
  html: 'HTML', css: 'CSS', xml: 'XML', json: 'JSON', yaml: 'YAML',
  svg: 'SVG', jsx: 'JSX', tsx: 'TSX', 'sass/less': 'SASS/LESS',
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', go: 'Go', rust: 'Rust', kotlin: 'Kotlin', swift: 'Swift',
  scala: 'Scala', julia: 'Julia', php: 'PHP', 'ruby on rails': 'Ruby on Rails',
  'c#': 'C#', 'c++': 'C++', r: 'R', matlab: 'MATLAB', solidity: 'Solidity',
  verilog: 'Verilog', vhdl: 'VHDL', 'objective-c': 'Objective-C', sql: 'SQL',
  react: 'React', 'react.js': 'React', reactjs: 'React',
  'next.js': 'Next.js', nextjs: 'Next.js', 'nuxt.js': 'Nuxt.js', nuxtjs: 'Nuxt.js',
  'node.js': 'Node.js', nodejs: 'Node.js', express: 'Express', 'express.js': 'Express',
  angular: 'Angular', 'vue.js': 'Vue.js', vuejs: 'Vue.js', svelte: 'Svelte',
  django: 'Django', flask: 'Flask', 'spring boot': 'Spring Boot', laravel: 'Laravel',
  'tailwind css': 'Tailwind CSS', bootstrap: 'Bootstrap', 'material ui': 'Material UI',
  'three.js': 'Three.js', 'd3.js': 'D3.js', 'react native': 'React Native',
  flutter: 'Flutter', ionic: 'Ionic', electron: 'Electron', tauri: 'Tauri',
  langchain: 'LangChain', llamaindex: 'LlamaIndex', tensorflow: 'TensorFlow',
  pytorch: 'PyTorch', keras: 'Keras', 'scikit-learn': 'Scikit-learn', opencv: 'OpenCV',
  mysql: 'MySQL', postgresql: 'PostgreSQL', mongodb: 'MongoDB', redis: 'Redis',
  mariadb: 'MariaDB', dynamodb: 'DynamoDB', cassandra: 'Cassandra',
  elasticsearch: 'Elasticsearch', kafka: 'Kafka', rabbitmq: 'RabbitMQ', graphql: 'GraphQL',
  aws: 'AWS', gcp: 'GCP', docker: 'Docker', kubernetes: 'Kubernetes',
  terraform: 'Terraform', ansible: 'Ansible', jenkins: 'Jenkins',
  'github actions': 'GitHub Actions', 'gitlab ci/cd': 'GitLab CI/CD',
  git: 'Git', firebase: 'Firebase', 'rest apis': 'REST APIs', grpc: 'gRPC',
  jwt: 'JWT', 'oauth 2.0': 'OAuth 2.0', 'ssl/tls': 'SSL/TLS', saml: 'SAML',
  webgl: 'WebGL', webassembly: 'WebAssembly', jest: 'Jest', cypress: 'Cypress',
  selenium: 'Selenium', pytest: 'PyTest', junit: 'JUnit', mocha: 'Mocha', chai: 'Chai',
  playwright: 'Playwright', webpack: 'Webpack', vite: 'Vite', babel: 'Babel',
  eslint: 'ESLint', prettier: 'Prettier', mlops: 'MLOps', mlflow: 'MLflow',
  rag: 'RAG', vba: 'VBA', bigquery: 'BigQuery', snowflake: 'Snowflake',
  databricks: 'Databricks', siem: 'SIEM', sast: 'SAST', dast: 'DAST', sca: 'SCA',
  owasp: 'OWASP', 'soc 2': 'SOC 2', 'pci dss': 'PCI DSS', gdpr: 'GDPR', ccpa: 'CCPA',
  nist: 'NIST', iam: 'IAM', mfa: 'MFA', sso: 'SSO', pam: 'PAM', dlp: 'DLP',
  casb: 'CASB', edr: 'EDR', xdr: 'XDR', 'ids/ips': 'IDS/IPS',
  'vpn configuration': 'VPN Configuration', figma: 'Figma', jira: 'JIRA',
  sap: 'SAP', hris: 'HRIS', 'erp systems': 'ERP Systems', autocad: 'AutoCAD',
  solidworks: 'SolidWorks', 'fpga design': 'FPGA Design', scada: 'SCADA',
  'plc programming': 'PLC Programming', 'manual qa testing': 'Manual QA Testing',
  qa: 'QA', 'ui/ux design': 'UI/UX Design', 'ui/ux': 'UI/UX', seo: 'SEO',
  sem: 'SEM', english: 'English', vietnamese: 'Vietnamese', postman: 'Postman',
  streamlit: 'Streamlit',
};

function formatSkillName(raw: any): string {
  if (!raw) return '';
  const str = typeof raw === 'string' ? raw : raw?.title || raw?.name || '';
  if (!str) return '';
  const key = str.trim().toLowerCase();
  if (SKILL_DISPLAY_MAP[key]) return SKILL_DISPLAY_MAP[key];
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr?: any): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

@Injectable()
export class PdfExporterService {
  private readonly logger = new Logger(PdfExporterService.name);

  /**
   * Renders a candidate profile into a high-precision, vector-text A4 PDF using Puppeteer.
   */
  async generateCandidatePdf(candidate: any): Promise<Buffer> {
    const html = this.buildCvHtml(candidate);

    let browser: any = null;
    try {
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--font-render-hinting=none',
          ],
        });
      } catch (launchErr) {
        this.logger.warn('Standard Puppeteer launch failed, attempting fallback to system Chrome/Edge...');
        try {
          browser = await puppeteer.launch({
            channel: 'chrome',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          });
        } catch {
          browser = await puppeteer.launch({
            channel: 'msedge' as any,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          });
        }
      }

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '15mm',
          bottom: '12mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (err) {
      this.logger.error('Failed to generate PDF via Puppeteer:', err);
      throw err;
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  private buildCvHtml(candidate: any): string {
    const name = candidate.name || 'CANDIDATE NAME';
    const title = candidate.title || '';
    const bio = Array.isArray(candidate.about)
      ? candidate.about.join('\n')
      : candidate.about || '';

    // Build deduplicated contact list
    const contactItems: string[] = [];
    const seen = new Set<string>();

    const add = (key: string, val: string) => {
      const norm = key.trim().toLowerCase();
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      contactItems.push(val.trim());
    };

    if (candidate.email) add(candidate.email, candidate.email);
    if (candidate.phone) add(candidate.phone, candidate.phone);
    if (candidate.contacts) {
      for (const c of candidate.contacts) {
        if (c.value) add(c.value, c.value);
      }
    }
    if (candidate.socials) {
      for (const s of candidate.socials) {
        const url = (s.url || '').trim();
        const username = (s.username || '').trim();
        const platform = (s.platform || '').trim();
        const key = url || username;
        if (!key) continue;
        const display = url
          ? url.replace(/^https?:\/\//, '')
          : username && platform
          ? `${platform}: ${username}`
          : username || url;
        add(key, display);
      }
    }

    const contactHeaderHtml = contactItems.length > 0
      ? `<div class="contact-bar">${contactItems
          .map((item, idx) => `${idx > 0 ? '<span class="sep">|</span>' : ''}<span>${item}</span>`)
          .join('')}</div>`
      : '';

    // Render Summary
    const summaryHtml = bio.trim()
      ? `<div class="section-block">
          <div class="section-header">
            <h2>SUMMARY</h2>
            <div class="section-line"></div>
          </div>
          <div class="summary-text">
            ${bio.split('\n').filter(Boolean).map((p: string) => `<p>${p}</p>`).join('')}
          </div>
        </div>`
      : '';

    // Render Education
    const educationsHtml = candidate.educations && candidate.educations.length > 0
      ? `<div class="section-block">
          <div class="section-header">
            <h2>EDUCATION</h2>
            <div class="section-line"></div>
          </div>
          <div class="item-list">
            ${candidate.educations
              .map((edu: any) => `
                <div class="item-block">
                  <div class="item-top">
                    <span class="item-bold">${edu.school}</span>
                    <span class="item-date">${formatDate(edu.startDate)} -- ${edu.endDate ? formatDate(edu.endDate) : 'Present'}</span>
                  </div>
                  <div class="item-sub">
                    <span class="item-italic">${[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ')}</span>
                    ${edu.grade ? `<span class="item-grade">GPA: ${edu.grade}</span>` : ''}
                  </div>
                  ${edu.description ? this.renderBullets(edu.description) : ''}
                </div>
              `).join('')}
          </div>
        </div>`
      : '';

    // Render Experience
    const experiencesHtml = candidate.experiences && candidate.experiences.length > 0
      ? `<div class="section-block">
          <div class="section-header">
            <h2>EXPERIENCE</h2>
            <div class="section-line"></div>
          </div>
          <div class="item-list">
            ${candidate.experiences
              .map((exp: any) => {
                const locStr = typeof exp.location === 'object' && exp.location
                  ? exp.location.formattedAddress
                  : typeof exp.location === 'string' ? exp.location : '';
                return `
                  <div class="item-block">
                    <div class="item-top">
                      <span class="item-bold">${exp.companyName}</span>
                      <span class="item-date">${locStr || ''}</span>
                    </div>
                    <div class="item-sub">
                      <span class="item-italic">
                        ${exp.jobTitle}${exp.type ? ` (${exp.type.replace('_', ' ')})` : ''}
                      </span>
                      <span class="item-date">${formatDate(exp.startDate)} -- ${exp.endDate ? formatDate(exp.endDate) : 'Present'}</span>
                    </div>
                    ${exp.description ? this.renderBullets(exp.description) : ''}
                  </div>
                `;
              }).join('')}
          </div>
        </div>`
      : '';

    // Render Skills & Certifications
    const hasSkills = candidate.skills && candidate.skills.length > 0;
    const hasCerts = candidate.certificates && candidate.certificates.length > 0;
    const skillsCertsHtml = (hasSkills || hasCerts)
      ? `<div class="section-block">
          <div class="section-header">
            <h2>SKILLS & CERTIFICATIONS</h2>
            <div class="section-line"></div>
          </div>
          <div class="skills-certs-content">
            ${hasSkills ? `
              <div class="skills-row item-block">
                <span class="item-bold">Technical Skills: </span>
                <span>${candidate.skills.map((s: any) => formatSkillName(s)).join(', ')}</span>
              </div>
            ` : ''}
            ${hasCerts ? `
              <div class="certs-block item-block">
                <div class="item-bold" style="margin-bottom: 3px;">Certifications:</div>
                <div class="bullet-list">
                  ${candidate.certificates.map((cert: any) => `
                    <div class="bullet-item">
                      <span class="bullet-dot">•</span>
                      <span>
                        <strong>${cert.name}</strong> -- ${cert.issuer} (${formatDate(cert.issueDate)}${cert.expiryDate ? ` -- ${formatDate(cert.expiryDate)}` : ''})
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${name} - CV</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');

    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'EB Garamond', 'Times New Roman', Times, Georgia, serif;
      font-size: 10.5pt;
      line-height: 1.45;
      color: #000000;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }

    /* ── HEADER ── */
    .header-container {
      text-align: center;
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .candidate-name {
      font-size: 20pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .candidate-title {
      font-size: 10pt;
      font-style: italic;
      color: #334155;
      margin-bottom: 6px;
    }
    .contact-bar {
      font-size: 9.5pt;
      color: #0f172a;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 6px 8px;
    }
    .contact-bar .sep {
      color: #94a3b8;
    }

    /* ── SECTIONS ── */
    .sections-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .section-block {
      display: flex;
      flex-direction: column;
    }
    .section-header {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
      break-after: avoid;
      page-break-after: avoid;
    }
    .section-header h2 {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #000000;
      line-height: 1;
    }
    .section-line {
      width: 100%;
      height: 1.5px;
      background-color: #000000;
    }

    /* ── ITEMS ── */
    .item-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .item-block {
      display: flex;
      flex-direction: column;
      gap: 2px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 11pt;
    }
    .item-sub {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 10pt;
    }
    .item-bold {
      font-weight: 700;
      color: #000000;
    }
    .item-italic {
      font-style: italic;
      color: #1e293b;
    }
    .item-date {
      font-size: 9.5pt;
      color: #000000;
      font-style: italic;
    }
    .item-grade {
      font-size: 9.5pt;
      color: #334155;
    }

    /* ── BULLETS ── */
    .bullet-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 4px;
      padding-left: 14px;
    }
    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 10pt;
      line-height: 1.4;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .bullet-dot {
      font-size: 9pt;
      line-height: 1.4;
      flex-shrink: 0;
    }

    .summary-text p {
      font-size: 10.5pt;
      line-height: 1.45;
      margin-bottom: 4px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .skills-certs-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 10.5pt;
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div class="candidate-name">${name}</div>
    ${title ? `<div class="candidate-title">${title}</div>` : ''}
    ${contactHeaderHtml}
  </div>

  <div class="sections-wrapper">
    ${summaryHtml}
    ${educationsHtml}
    ${experiencesHtml}
    ${skillsCertsHtml}
  </div>
</body>
</html>`;
  }

  private renderBullets(description: string): string {
    const lines = description.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return '';
    return `<div class="bullet-list">
      ${lines.map((line) => `
        <div class="bullet-item">
          <span class="bullet-dot">•</span>
          <span>${line.replace(/^[-•*]\s*/, '')}</span>
        </div>
      `).join('')}
    </div>`;
  }
}
