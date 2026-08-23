import 'server-only';

import path from 'path';
import ejs from 'ejs';

import { createLeadFormMeta } from './form-security';

const viewsDir = path.join(process.cwd(), 'views');

/**
 * Renders a legacy EJS page body.
 *
 * `locals` lets a route pass server-fetched data (for example the latest blog
 * posts on the homepage) into the template without every view needing to know
 * about it -- templates read them through the `locals` object, which EJS
 * always defines.
 */
export async function renderLegacyView({ view, title, currentPath, locals = {} }) {
  const formMetaCache = new Map();

  return ejs.renderFile(
    path.join(viewsDir, `${view}.ejs`),
    {
      title,
      currentPath,
      getLeadFormMeta: (formType) => {
        if (!formMetaCache.has(formType)) {
          formMetaCache.set(formType, createLeadFormMeta(formType));
        }

        return formMetaCache.get(formType);
      },
      ...locals,
    },
    {
      views: [viewsDir],
      async: true,
    },
  );
}
