import { Download, FileDown, PackageOpen } from 'lucide-react';
import rawCaseStudyContent from '../../data/case-study-content.json';
import { RELEASE_ARTIFACTS } from '../../data/release-artifacts';
import { formatBytes } from '../../lib/format';

type CaseStudySection = {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  table?: { columns: string[]; rows: string[][] };
  guardrails?: string[];
};

type CaseStudyContent = {
  productName: string;
  publicLabel: string;
  publicUrl: string;
  hero: { kicker: string; title: string; summary: string };
  sections: CaseStudySection[];
  downloads: { heading: string; notes: string[] };
};

const caseStudyContent = rawCaseStudyContent as CaseStudyContent;

const SCREENSHOTS = [
  { fileName: 'desktop-dashboard.png', alt: '桌面端「今日」视图截图（脱敏固定示例）' },
  { fileName: 'mobile-practice.png', alt: '移动端「练习」视图截图（脱敏固定示例）' },
  { fileName: 'review-flow.png', alt: '「复习」视图截图（脱敏固定示例）' },
] as const;

function downloadUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}downloads/${encodeURIComponent(fileName)}`;
}

function screenshotUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}screenshots/${fileName}`;
}

export function CaseStudyView() {
  const { pdf, zip, screenshots } = RELEASE_ARTIFACTS;
  const offlinePackage = import.meta.env.VITE_OFFLINE_PACKAGE === '1';
  const zipAvailable = zip.available && !offlinePackage;

  return (
    <section className="view case-study-view" aria-labelledby="case-study-title">
      <header className="view-header">
        <div>
          <h1 id="case-study-title" className="view-title">产品案例</h1>
          <p className="view-subtitle">{caseStudyContent.hero.kicker}</p>
        </div>
      </header>

      <div className="card case-hero">
        <h2 className="case-hero__title">{caseStudyContent.hero.title}</h2>
        <p className="case-hero__summary">{caseStudyContent.hero.summary}</p>
        <p className="case-hero__url">
          公开地址：{caseStudyContent.publicUrl}
        </p>
      </div>

      {screenshots.available ? (
        <div className="card case-shots" aria-label="产品界面截图（脱敏固定示例）">
          <div className="card__header">
            <h2 className="card__title">界面形态</h2>
            <span className="card__meta">由本站构建产物生成的截图</span>
          </div>
          <div className="case-shots__grid">
            {SCREENSHOTS.map(shot => (
              <figure key={shot.fileName} className="case-shot">
                <img
                  src={screenshotUrl(shot.fileName)}
                  alt={shot.alt}
                  loading="lazy"
                />
                <figcaption>{shot.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      {caseStudyContent.sections.map(section => {
        const guardrails = section.guardrails ?? [];
        return (
          <div key={section.id} className="card case-section" id={`case-${section.id}`}>
          <div className="case-section__head">
            <span className="case-section__number" aria-hidden="true">{section.number}</span>
            <h2 className="case-section__title">{section.title}</h2>
          </div>
          {section.paragraphs.map(paragraph => (
            <p key={paragraph} className="case-section__paragraph">{paragraph}</p>
          ))}
          {section.bullets ? (
            <ul className="case-section__bullets">
              {section.bullets.map(bullet => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {section.table ? (
            <div className="case-table-wrap" role="region" aria-label={section.title} tabIndex={0}>
              <table className="case-table">
                <thead>
                  <tr>
                    {section.table.columns.map(column => (
                      <th key={column} scope="col">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map(row => (
                    <tr key={row[0]}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${row[0]}-${cellIndex}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {guardrails.length > 0 ? (
            <ul className="case-section__bullets case-guardrails">
              {guardrails.map(guardrail => (
                <li key={guardrail}>
                  <span className="case-guardrail__mark" aria-hidden="true">护栏</span>
                  {guardrail}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        );
      })}

      <div className="card case-downloads" aria-labelledby="case-downloads-title">
        <div className="card__header">
          <h2 id="case-downloads-title" className="card__title">
            <Download size={18} aria-hidden="true" />
            {caseStudyContent.downloads.heading}
          </h2>
        </div>
        <ul className="case-downloads__list">
          <li className="case-download">
            <div className="case-download__icon" aria-hidden="true">
              <FileDown size={22} />
            </div>
            <div className="case-download__body">
              <span className="case-download__name">{pdf.fileName}</span>
              <span className="case-download__meta">
                {pdf.available && pdf.sizeBytes > 0 ? `${formatBytes(pdf.sizeBytes)} · PDF 产品案例` : '暂未生成，发布前生成'}
              </span>
            </div>
            {pdf.available ? (
              <a
                className="btn btn--primary"
                href={downloadUrl(pdf.fileName)}
                download={pdf.fileName}
              >
                下载 PDF
              </a>
            ) : (
              <span className="btn btn--primary btn--disabled" aria-disabled="true">
                暂未生成
              </span>
            )}
          </li>
          <li className="case-download">
            <div className="case-download__icon" aria-hidden="true">
              <PackageOpen size={22} />
            </div>
            <div className="case-download__body">
              <span className="case-download__name">{zip.fileName}</span>
              <span className="case-download__meta">
                {zipAvailable && zip.sizeBytes > 0
                  ? `${formatBytes(zip.sizeBytes)} · 离线演示包（含启动器与完整性清单）`
                  : offlinePackage
                    ? '离线包不含自身副本'
                    : zip.available
                      ? '离线演示包'
                      : '暂未生成，发布前生成'}
              </span>
            </div>
            {zipAvailable ? (
              <a
                className="btn btn--primary"
                href={downloadUrl(zip.fileName)}
                download={zip.fileName}
              >
                下载 ZIP
              </a>
            ) : (
              <span className="btn btn--primary btn--disabled" aria-disabled="true">
                {offlinePackage ? '离线包内不含自身' : '暂未生成'}
              </span>
            )}
          </li>
        </ul>
        <ul className="case-downloads__notes">
          {caseStudyContent.downloads.notes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
