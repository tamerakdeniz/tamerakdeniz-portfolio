import { COPY } from '@/lib/content/copy';
import type { Portfolio } from '@/lib/content/portfolio';
import { ChapterLabel } from './ChapterLabel';
import { Horizon } from './ContourField';
import { ContactForm } from './ContactForm';
import { T } from './T';
import s from './ContactHorizon.module.css';

export function ContactHorizon({ portfolio }: { portfolio: Portfolio }) {
  const { contact, cv } = portfolio;
  const channels = [
    contact.social.linkedin && { label: 'LinkedIn', href: contact.social.linkedin },
    contact.social.github && { label: 'GitHub', href: contact.social.github },
    contact.social.instagram && { label: 'Instagram', href: contact.social.instagram },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="contact" className={`chapter surface-dark ${s.contact}`} aria-labelledby="contact-title">
      <div className="wrap">
        <ChapterLabel id="contact" />
      </div>

      <div className={s.horizonWrap} aria-hidden="true">
        <Horizon className={s.horizon} />
        <span className={s.signal} />
      </div>

      <div className="wrap">
        <div className={`grid ${s.grid}`}>
          <div className={s.main}>
            <h2 id="contact-title" className={`h2 ${s.h}`} data-reveal>
              <T v={COPY.contact.titleA} />{' '}
              <span className="serif">
                <T v={COPY.contact.titleSerif} />
              </span>
            </h2>
            <p className={`lede ${s.lede}`} data-reveal>
              <T v={COPY.contact.lede} />
            </p>

            <div className={s.mail}>
              <p className="meta muted">
                <T v={COPY.contact.emailLabel} />
              </p>
              <a className={s.address} href={`mailto:${contact.email}`}>
                {contact.email}
                <span className="arrow arrow-ne" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>

          <div className={s.side}>
            <p className="meta muted">
              <T v={COPY.contact.elsewhere} />
            </p>
            <ul className={s.channels}>
              {channels.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target="_blank" rel="noopener me">
                    <span>{c.label}</span>
                    <span className="arrow arrow-ne" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a href={cv.viewUrl} target="_blank" rel="noopener">
                  <span>
                    <T v={COPY.nav.cv} /> <span className="muted meta-plain">PDF</span>
                  </span>
                  <span className="arrow arrow-ne" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a href="#surface">
                  <T v={COPY.contact.back} />
                  <span className="arrow arrow-up" aria-hidden="true">
                    ↑
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <details className={s.formBox}>
            <summary className={s.summary}>
              <T v={COPY.contact.formToggle} />
              <span className={s.plus} aria-hidden="true" />
            </summary>
            <ContactForm email={contact.email} />
          </details>
        </div>
      </div>
    </section>
  );
}
