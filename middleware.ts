export default function middleware(request: Request) {
  const url = new URL(request.url);
}
 
// Configure which paths trigger the Middleware
export const config = {
  matcher: [
    // Run on all paths except static files
    '/rutainexistente',
  ],
};