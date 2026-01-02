import createMiddleware from 'next-intl/middleware';
// [FIX] Update import path to point into src/
import { routing } from './src/i18n/routing'; 
 
export default createMiddleware(routing);
 
export const config = {
  // Match all paths except internal Next.js files, APIs, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};