import React from 'react';
import type { CandidateProfileUI } from '../types';

interface ProfilePdfTemplateProps {
  candidate: CandidateProfileUI;
  aboutText?: string;
}

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

    const contactItems: string[] = [];
    if (candidate.phone) contactItems.push(candidate.phone);
    if (candidate.email) contactItems.push(candidate.email);
    if (candidate.contacts && candidate.contacts.length > 0) {
      candidate.contacts.forEach((c) => contactItems.push(c.type ? `${c.type}: ${c.value}` : c.value));
    }
    if (candidate.socials && candidate.socials.length > 0) {
      candidate.socials.forEach((s) => contactItems.push(`${s.platform}: ${s.username || s.url}`));
    }

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
        {/* ── HEADER ── Keep as one unbreakable block */}
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
              {/* Section header: orphan protection so header isn't left alone at bottom */}
              <div className="flex flex-col" data-pdf-header="true" data-pdf-block="true">
                <h2
                  className="text-[11pt] font-bold uppercase tracking-wider text-black m-0 leading-tight font-serif"
                  style={{ letterSpacing: '0.06em' }}
                >
                  SUMMARY
                </h2>
                <div className="w-full h-[1.5px] bg-black mt-1 mb-2" />
              </div>
              {/* Each paragraph is a separate breakable block */}
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
              <div className="flex flex-col" data-pdf-header="true" data-pdf-block="true">
                <h2
                  className="text-[11pt] font-bold uppercase tracking-wider text-black m-0 leading-tight font-serif"
                  style={{ letterSpacing: '0.06em' }}
                >
                  EDUCATION
                </h2>
                <div className="w-full h-[1.5px] bg-black mt-1 mb-2" />
              </div>
              <div className="flex flex-col gap-4">
                {candidate.educations.map((edu) => (
                  // ← data-pdf-block on the WHOLE item so spacer is inserted
                  //   as a flex sibling (valid HTML), never inside a <ul>
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
                      <ul className="list-disc pl-5 text-[10pt] text-slate-900 m-0 mt-1 space-y-0.5">
                        {edu.description.split('\n').filter(Boolean).map((line, lIdx) => (
                          <li key={lIdx}>{line.replace(/^[-•*]\s*/, '')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {candidate.experiences && candidate.experiences.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col" data-pdf-header="true" data-pdf-block="true">
                <h2
                  className="text-[11pt] font-bold uppercase tracking-wider text-black m-0 leading-tight font-serif"
                  style={{ letterSpacing: '0.06em' }}
                >
                  EXPERIENCE
                </h2>
                <div className="w-full h-[1.5px] bg-black mt-1 mb-2" />
              </div>
              <div className="flex flex-col gap-4">
                {candidate.experiences.map((exp) => {
                  const locStr =
                    typeof exp.location === 'object' && exp.location
                      ? exp.location.formattedAddress
                      : typeof exp.location === 'string'
                        ? exp.location
                        : '';
                  return (
                    // ← data-pdf-block on the WHOLE item (title + bullets together)
                    <div key={exp.id} className="flex flex-col gap-0.5" data-pdf-block="true">
                      <div className="flex justify-between items-baseline text-[11pt]">
                        <span className="font-bold text-black">{exp.companyName}</span>
                        <span className="text-xs text-black font-serif font-medium">
                          {locStr ? `${locStr}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-[10pt]">
                        <span className="italic text-slate-900 font-medium">
                          {exp.jobTitle}
                          {exp.type && <span className="not-italic text-slate-700 font-normal"> ({exp.type.replace('_', ' ')})</span>}
                        </span>
                        <span className="text-xs text-black italic">
                          {formatDate(exp.startDate)} -- {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <ul className="list-disc pl-5 text-[10pt] text-slate-900 m-0 mt-1 space-y-1">
                          {exp.description.split('\n').filter(Boolean).map((line, lIdx) => (
                            <li key={lIdx} className="leading-snug">
                              {line.replace(/^[-•*]\s*/, '')}
                            </li>
                          ))}
                        </ul>
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
              <div className="flex flex-col" data-pdf-header="true" data-pdf-block="true">
                <h2
                  className="text-[11pt] font-bold uppercase tracking-wider text-black m-0 leading-tight font-serif"
                  style={{ letterSpacing: '0.06em' }}
                >
                  SKILLS &amp; CERTIFICATIONS
                </h2>
                <div className="w-full h-[1.5px] bg-black mt-1 mb-2" />
              </div>
              <div className="flex flex-col gap-2 text-[10.5pt] text-slate-900">
                {candidate.skills && candidate.skills.length > 0 && (
                  <div data-pdf-block="true">
                    <span className="font-bold text-black">Technical Skills: </span>
                    <span>
                      {candidate.skills.map((s) => (s.level ? `${s.title} (${s.level})` : s.title)).join(', ')}
                    </span>
                  </div>
                )}

                {candidate.certificates && candidate.certificates.length > 0 && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="font-bold text-black" data-pdf-block="true">Certifications: </span>
                    <ul className="list-disc pl-5 m-0 space-y-0.5 text-[10pt]">
                      {candidate.certificates.map((cert) => (
                        <li key={cert.id} data-pdf-block="true">
                          <span className="font-semibold">{cert.name}</span> -- {cert.issuer} ({formatDate(cert.issueDate)}{cert.expiryDate ? ` -- ${formatDate(cert.expiryDate)}` : ''})
                        </li>
                      ))}
                    </ul>
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