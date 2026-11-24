import { COPY } from '@/lib/content/copy';
import type { Portfolio } from '@/lib/content/portfolio';
import { Ascend, CopyEmail } from './ContactActions';
import { ChapterMark } from './ChapterMark';
import { ContactForm } from './ContactForm';
import { T } from './T';
import s from './ContactSignal.module.css';

/** 06 Contact: the seabed horizon. One large signal — the address — and the way back up. */
export function ContactSignal({ portfolio }: { portfolio: Portfolio }) {
  const { contact } = portfolio;
  const channels = [
    contact.social.linkedin && { label: 'LinkedIn', href: contact.social.linkedin },
    contact.social.github && { label: 'GitHub', href: contact.social.github },
    contact.social.instagram && { label: 'Instagram', href: contact.social.instagram },
  ].filter(Boolean) as { label: string; href: string }[];
  const [user, domain] = contact.email.split('@');

  return (
    <section id="contact" className={`chapter surface-dark ${s.contact}`} aria-labelledby="contact-title">
      <div className="wrap">
        <ChapterMark id="contact" />

        <div className={s.stage}>
          <h2 id="contact-title" className={s.title}>
            <T v={COPY.contact.titleA} />{' '}
            <span className="serif">
              <T v={COPY.contact.titleSerif} />
            </span>
          </h2>
          <p className={s.lede}>
            <T v={COPY.contact.lede} />
          </p>

          <div className={s.signal}>
            <p className={`${s.label} meta`}>
              <T v={COPY.contact.emailLabel} />
            </p>
            <a className={s.address} href={`mailto:${contact.email}`}>
              <span>{user}</span>
              <span className={s.at}>@</span>
              <wbr />
              <span>{domain}</span>
            </a>
            <div className={s.signalTools}>
              <CopyEmail email={contact.email} />
              {contact.location && (
                <span className={`${s.where} meta`}>
                  <T v={contact.location} />
                </span>
              )}
            </div>
          </div>

          <div className={s.channels}>
            <p className="sr-only">
              <T v={COPY.contact.elsewhere} />
            </p>
            <ul>
              {channels.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target="_blank" rel="noopener me">
                    {c.label}
                    <span className="arrow arrow-ne" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a href={portfolio.cv.viewUrl} target="_blank" rel="noopener" data-cv-link>
                  <T v={COPY.nav.cv} />
                  <span className="arrow arrow-ne" aria-hidden="true">
                    ↗
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
            <div className={s.formInner}>
              <ContactForm email={contact.email} />
            </div>
          </details>

          <Ascend />
        </div>
      </div>
    </section>
  );
}
