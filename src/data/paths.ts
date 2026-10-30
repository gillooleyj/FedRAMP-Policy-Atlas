/** Resolve bundled assets under a root domain or a project subdirectory. */
export function sitePath(path=''):string {
 return import.meta.env.BASE_URL+path.replace(/^\/+/, '');
}
