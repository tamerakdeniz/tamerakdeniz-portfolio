import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import { T } from './T';
import { MotionToggle } from './MotionToggle';
import s from './SiteFooter.module.css';

export function SiteFooter({ paper = false, ownerName }: { paper?: boolean; ownerName: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className={`${s.footer} ${paper ? `surface-paper ${s.paper}` : 'surface-dark'}`} data-chrome>
      <div className={`wrap ${s.inner}`}>
        <p className={s.owner}>
          © {year} {ownerName}. <T v={COPY.footer.rights} />
        </p>
        <ul className={s.links}>
          <li>
            <Link className="tlink tlink-quiet hit" href="/resume">
              <T v={COPY.nav.recruiter} />
            </Link>
          </li>
          <li>
            <Link className="tlink tlink-quiet hit" href="/projects">
              <T v={COPY.nav.archive} />
            </Link>
          </li>
          <li>
            <MotionToggle className={`tlink tlink-quiet hit ${s.btn}`} />
          </li>
          <li>
            <Link className="tlink tlink-quiet hit" href="/admin" rel="nofollow">
              <T v={COPY.footer.admin} />
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
