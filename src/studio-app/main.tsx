/**
 * LIMINAL · THE STUDIO — its own entry point, not part of the site.
 *
 * WHY SEPARATE. The site is a product page: it tells a story about the system. The studio
 * is a tool: it produces and inspects components. They have different jobs, different
 * lifetimes and different audiences, and running one inside the other meant every change
 * to the tool touched the page a visitor reads.
 *
 * So it is its own HTML entry and its own React root. It imports the engine and the
 * components directly, and nothing from `src/site`.
 *
 * AND EVERY PAGE IN IT IS BUILT FROM THE POLICY. The reader's correction, and it is the
 * same lesson this project keeps re-learning: a test page that hand-writes its own values
 * is a page that drifts, and then the thing being judged is the page rather than the
 * system. So the studio reads the engine for every colour, every level and every
 * distance, and it shows the POLICY's numbers beside the rendering.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { Studio } from './Studio';

const root = document.getElementById('studio-root');
if (root) createRoot(root).render(<React.StrictMode><Studio /></React.StrictMode>);
