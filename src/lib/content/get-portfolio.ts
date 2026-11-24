import 'server-only';
import { cache } from 'react';
import { getSiteData } from './site-data';
import { buildPortfolio } from './portfolio';

export const getPortfolio = cache(async () => buildPortfolio(await getSiteData()));
