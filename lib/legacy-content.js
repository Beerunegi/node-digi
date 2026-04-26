import 'server-only';

import { createRequire } from 'module';
import path from 'path';

import { createLeadFormMeta } from './form-security';

const require = createRequire(import.meta.url);
const ejs = require('ejs');
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
