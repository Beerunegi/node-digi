import 'server-only';

import path from 'path';
import ejs from 'ejs';

import { createLeadFormMeta } from './form-security';

const viewsDir = path.join(process.cwd(), 'views');

export async function renderLegacyView({ view, title, currentPath }) {
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
    },
    {
      views: [viewsDir],
      async: true,
    },
  );
}
