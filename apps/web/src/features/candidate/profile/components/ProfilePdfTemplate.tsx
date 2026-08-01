import React from 'react';
import type { CandidateProfileUI } from '../types';

interface ProfilePdfTemplateProps {
  candidate: CandidateProfileUI;
  aboutText?: string;
}

/**
 * Canonical display names for skills, keyed by lowercase for fast lookup.
 * Sourced from prisma/data/Skill.ts so names match exactly what was seeded.
 */
const SKILL_DISPLAY_MAP: Record<string, string> = {
  // Web / Markup
  'html': 'HTML', 'css': 'CSS', 'xml': 'XML', 'json': 'JSON', 'yaml': 'YAML',
  'svg': 'SVG', 'jsx': 'JSX', 'tsx': 'TSX', 'sass/less': 'SASS/LESS',
  // Languages
  'javascript': 'JavaScript', 'typescript': 'TypeScript', 'python': 'Python',
  'java': 'Java', 'go': 'Go', 'rust': 'Rust', 'kotlin': 'Kotlin', 'swift': 'Swift',
  'scala': 'Scala', 'julia': 'Julia', 'php': 'PHP', 'ruby on rails': 'Ruby on Rails',
  'c#': 'C#', 'c++': 'C++', 'r': 'R', 'matlab': 'MATLAB', 'solidity': 'Solidity',
  'verilog': 'Verilog', 'vhdl': 'VHDL', 'objective-c': 'Objective-C',
  'sql': 'SQL',
  // Frameworks / Libraries
  'react': 'React', 'react.js': 'React', 'reactjs': 'React',
  'next.js': 'Next.js', 'nextjs': 'Next.js',
  'nuxt.js': 'Nuxt.js', 'nuxtjs': 'Nuxt.js',
  'node.js': 'Node.js', 'nodejs': 'Node.js',
  'express': 'Express', 'express.js': 'Express',
  'angular': 'Angular', 'vue.js': 'Vue.js', 'vuejs': 'Vue.js',
  'svelte': 'Svelte', 'django': 'Django', 'flask': 'Flask',
  'spring boot': 'Spring Boot', 'laravel': 'Laravel',
  'tailwind css': 'Tailwind CSS', 'bootstrap': 'Bootstrap',
  'material ui': 'Material UI', 'three.js': 'Three.js', 'd3.js': 'D3.js',
  'react native': 'React Native', 'flutter': 'Flutter', 'ionic': 'Ionic',
  'electron': 'Electron', 'tauri': 'Tauri',
  'langchain': 'LangChain', 'llamaindex': 'LlamaIndex',
  'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch', 'keras': 'Keras',
  'scikit-learn': 'Scikit-learn', 'opencv': 'OpenCV',
  // Databases
  'mysql': 'MySQL', 'postgresql': 'PostgreSQL', 'mongodb': 'MongoDB',
  'redis': 'Redis', 'mariadb': 'MariaDB', 'dynamodb': 'DynamoDB',
  'cassandra': 'Cassandra', 'elasticsearch': 'Elasticsearch',
  'kafka': 'Kafka', 'rabbitmq': 'RabbitMQ', 'graphql': 'GraphQL',
  // Cloud / DevOps
  'aws': 'AWS', 'gcp': 'GCP', 'docker': 'Docker', 'kubernetes': 'Kubernetes',
  'terraform': 'Terraform', 'ansible': 'Ansible', 'jenkins': 'Jenkins',
  'github actions': 'GitHub Actions', 'gitlab ci/cd': 'GitLab CI/CD',
  'git': 'Git', 'firebase': 'Firebase',
  // APIs / Protocols
  'rest apis': 'REST APIs', 'grpc': 'gRPC', 'jwt': 'JWT',
  'oauth 2.0': 'OAuth 2.0', 'ssl/tls': 'SSL/TLS', 'saml': 'SAML',
  'webgl': 'WebGL', 'webassembly': 'WebAssembly',
  // Testing
  'jest': 'Jest', 'cypress': 'Cypress', 'selenium': 'Selenium',
  'pytest': 'PyTest', 'junit': 'JUnit', 'mocha': 'Mocha', 'chai': 'Chai',
  'playwright': 'Playwright',
  // Build tools
  'webpack': 'Webpack', 'vite': 'Vite', 'babel': 'Babel',
  'eslint': 'ESLint', 'prettier': 'Prettier',
  // Data / ML
  'mlops': 'MLOps', 'mlflow': 'MLflow', 'rag': 'RAG', 'vba': 'VBA',
  'bigquery': 'BigQuery', 'snowflake': 'Snowflake', 'databricks': 'Databricks',
  // Security
  'siem': 'SIEM', 'sast': 'SAST', 'dast': 'DAST', 'sca': 'SCA',
  'owasp': 'OWASP', 'soc 2': 'SOC 2', 'pci dss': 'PCI DSS',
  'gdpr': 'GDPR', 'ccpa': 'CCPA', 'nist': 'NIST',
  'iam': 'IAM', 'mfa': 'MFA', 'sso': 'SSO', 'pam': 'PAM',
  'dlp': 'DLP', 'casb': 'CASB', 'edr': 'EDR', 'xdr': 'XDR',
  'ids/ips': 'IDS/IPS', 'vpn configuration': 'VPN Configuration',
  // Tools & Design
  'figma': 'Figma', 'jira': 'JIRA', 'sap': 'SAP',
  'hris': 'HRIS', 'erp systems': 'ERP Systems',
  'autocad': 'AutoCAD', 'solidworks': 'SolidWorks',
  'fpga design': 'FPGA Design', 'scada': 'SCADA',
  'plc programming': 'PLC Programming',
  // General
  'manual qa testing': 'Manual QA Testing',
  'qa': 'QA', 'ui/ux design': 'UI/UX Design',
  'ui/ux': 'UI/UX', 'seo': 'SEO', 'sem': 'SEM',
  'english': 'English', 'vietnamese': 'Vietnamese',
  'postman': 'Postman', 'streamlit': 'Streamlit',
};

/**
 * Returns the canonical display name for a skill.
 * Lookup is case-insensitive; falls back to capitalizing the first letter.
 */
function formatSkillName(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (SKILL_DISPLAY_MAP[key]) return SKILL_DISPLAY_MAP[key];
  // Fallback: capitalize first letter of the raw value
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Known tech acronyms that should be fully uppercased. */


export const ProfilePdfTemplate = React.forwardRef<HTMLDivElement, ProfilePdfTemplateProps>(
  ({ candidate, aboutText }, ref) => {
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const bio = aboutText || (Array.isArray(candidate.about) ? candidate.about.join('\n') : candidate.about) || '';

    // Build contact items with deduplication.
    // - No verbose labels (EMAIL:, PHONE:, GITHUB:)
    // - URLs stripped of https:// for compact display
    // - candidate.email / candidate.phone are the "primary" — contacts/socials dedup against them
    const contactItems: string[] = [];
    const seenKeys = new Set<string>();

    const addContactItem = (key: string, display: string) => {
      const normalized = key.trim().toLowerCase();
      if (!normalized || seenKeys.has(normalized)) return;
      seenKeys.add(normalized);
      contactItems.push(display.trim());
    };

    // Primary fields first (shown without any label)
    if (candidate.email) addContactItem(candidate.email, candidate.email);
    if (candidate.phone) addContactItem(candidate.phone, candidate.phone);

    // Extra contacts — show value only (skip type label)
    if (candidate.contacts) {
      for (const c of candidate.contacts) {
        const val = (c.value || '').trim();
        if (!val) continue;
        addContactItem(val, val);
      }
    }

    // Socials — strip protocol, prefer username@platform or clean URL
    if (candidate.socials) {
      for (const s of candidate.socials) {
        const url = (s.url || '').trim();
        const username = (s.username || '').trim();
        const platform = (s.platform || '').trim();
        // key for dedup = raw URL or username
        const key = url || username;
        if (!key) continue;
        // Display: clean URL (no https://) or "Platform: username"
        let display: string;
        if (url) {
          display = url.replace(/^https?:\/\//, '');
        } else if (username && platform) {
          display = `${platform}: ${username}`;
        } else {
          display = username || url;
        }
        addContactItem(key, display);
      }
    }


    // Reusable bullet list — uses explicit "•" character so html2canvas
    // renders it identically to the browser preview (no list-disc CSS dependency).
    const BulletList = ({ lines, className = '' }: { lines: string[]; className?: string }) => (
      <div className={`flex flex-col gap-0.5 text-[10pt] text-slate-900 ${className}`}>
        {lines.map((line, idx) => (
          <div key={idx} className="flex items-start gap-1.5 leading-snug">
            <span
              className="flex-shrink-0 text-black"
              style={{ fontSize: '10pt', lineHeight: '1.45', marginTop: '0px' }}
            >
              •
            </span>
            <span>{line.replace(/^[-•*]\s*/, '')}</span>
          </div>
        ))}
      </div>
    );

    // Reusable section header with underline rule
    const SectionHeader = ({ title, isHeader = true }: { title: string; isHeader?: boolean }) => (
      <div
        className="flex flex-col"
        data-pdf-block="true"
        {...(isHeader ? { 'data-pdf-header': 'true' } : {})}
      >
        <h2
          className="text-[11pt] font-bold uppercase tracking-wider text-black m-0 leading-tight font-serif"
          style={{ letterSpacing: '0.06em' }}
        >
          {title}
        </h2>
        <div className="w-full h-[1.5px] bg-black mt-1 mb-2" />
      </div>
    );

    return (
      <div
        ref={ref}
        id="jobly-pdf-print-container"
        className="w-[794px] bg-white text-black px-12 py-10 flex flex-col gap-6 shadow-none box-border select-none"
        style={{
          minHeight: '1123px',
          fontFamily: '"Latin Modern Roman", "Computer Modern", "CMU Serif", "Times New Roman", Times, Georgia, serif',
          color: '#000000',
          fontSize: '10.5pt',
          lineHeight: '1.45',
        }}
      >
        {/* ── HEADER ── */}
        <div className="flex flex-col items-center text-center gap-1 mb-4 pb-1" data-pdf-block="true">
          <h1
            className="text-2xl font-bold tracking-wider text-black uppercase m-0 leading-none"
            style={{ fontFamily: 'serif', letterSpacing: '0.08em' }}
          >
            {candidate.name || 'CANDIDATE NAME'}
          </h1>
          {candidate.title && (
            <div className="text-xs italic text-slate-800 font-serif mt-1">
              {candidate.title}
            </div>
          )}
          {contactItems.length > 0 && (
            <div className="text-[11px] text-slate-900 flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1.5 mt-2 leading-relaxed">
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400 font-normal">|</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-7">

          {/* ── SUMMARY ── */}
          {bio.trim() && (
            <div className="flex flex-col gap-2">
              <SectionHeader title="SUMMARY" />
              <div className="flex flex-col gap-1">
                {bio.split('\n').filter(Boolean).map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-[10.5pt] text-slate-900 leading-relaxed m-0" data-pdf-block="true">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ── EDUCATION ── */}
          {candidate.educations && candidate.educations.length > 0 && (
            <div className="flex flex-col gap-3">
              <SectionHeader title="EDUCATION" />
              <div className="flex flex-col gap-4">
                {candidate.educations.map((edu) => (
                  <div key={edu.id} className="flex flex-col gap-0.5" data-pdf-block="true">
                    <div className="flex justify-between items-baseline text-[11pt]">
                      <span className="font-bold text-black">{edu.school}</span>
                      <span className="text-xs text-black font-serif font-medium">
                        {formatDate(edu.startDate)} -- {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[10pt]">
                      <span className="italic text-slate-900 font-medium">
                        {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ')}
                      </span>
                      {edu.grade && (
                        <span className="text-xs text-slate-800">GPA: {edu.grade}</span>
                      )}
                    </div>
                    {edu.description && (
                      <BulletList
                        lines={edu.description.split('\n').filter(Boolean)}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {candidate.experiences && candidate.experiences.length > 0 && (
            <div className="flex flex-col gap-3">
              <SectionHeader title="EXPERIENCE" />
              <div className="flex flex-col gap-4">
                {candidate.experiences.map((exp) => {
                  const locStr =
                    typeof exp.location === 'object' && exp.location
                      ? exp.location.formattedAddress
                      : typeof exp.location === 'string'
                        ? exp.location
                        : '';
                  return (
                    <div key={exp.id} className="flex flex-col gap-0.5" data-pdf-block="true">
                      <div className="flex justify-between items-baseline text-[11pt]">
                        <span className="font-bold text-black">{exp.companyName}</span>
                        <span className="text-xs text-black font-serif font-medium">
                          {locStr || ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-[10pt]">
                        <span className="italic text-slate-900 font-medium">
                          {exp.jobTitle}
                          {exp.type && (
                            <span className="not-italic text-slate-700 font-normal">
                              {' '}({exp.type.replace('_', ' ')})
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-black italic">
                          {formatDate(exp.startDate)} -- {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <BulletList
                          lines={exp.description.split('\n').filter(Boolean)}
                          className="mt-1"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SKILLS & CERTIFICATIONS ── */}
          {((candidate.skills && candidate.skills.length > 0) || (candidate.certificates && candidate.certificates.length > 0)) && (
            <div className="flex flex-col gap-3">
              <SectionHeader title="SKILLS & CERTIFICATIONS" />
              <div className="flex flex-col gap-1.5 text-[10.5pt] text-slate-900">
                {candidate.skills && candidate.skills.length > 0 && (
                  <div data-pdf-block="true">
                    <span className="font-bold text-black">Technical Skills: </span>
                    <span>
                      {candidate.skills.map((s) => formatSkillName(s.title)).join(', ')}
                    </span>
                  </div>
                )}

                {candidate.certificates && candidate.certificates.length > 0 && (
                  <div className="flex flex-col gap-0.5" data-pdf-block="true">
                    <span className="font-bold text-black">Certifications:</span>
                    <div className="flex flex-col gap-0.5 text-[10pt]">
                      {candidate.certificates.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-1.5">
                          <span className="flex-shrink-0 text-black" style={{ fontSize: '10pt', lineHeight: '1.45' }}>•</span>
                          <span>
                            <span className="font-semibold">{cert.name}</span>
                            {' '}-- {cert.issuer} ({formatDate(cert.issueDate)}{cert.expiryDate ? ` -- ${formatDate(cert.expiryDate)}` : ''})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }
);

ProfilePdfTemplate.displayName = 'ProfilePdfTemplate';