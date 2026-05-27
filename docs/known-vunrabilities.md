
### Content Security Policy
We are missing a Content Security Policy (CSP). One could theoretically inject inline `<script>` blocks
using an XSS vunrability, and as we dont have a CSP, we allow this. Adding a CSP to a sveltekit project
is a bit of a problem however, as sveltekit hydrates pages using said `<script>` blocks, thus some blanket
`script-src 'self'` will break the site. **The solution** would be nonces. The server would generate a cryptographically strong token per request,
injecting it into every inline script tag. Then we include `'nonce-{token}'` in the CSP header.

### Distributed brute force attacks
We currently ratelimit based on IP, not account. Theoretically, one could set up a network of devices
attacking a specific account, and we would have no defence. **The solution** would be to track failed attempts (etc) per account in the database.

### Unlimited GET requests
Currently, GET requests are not rate limited. I'm sure there are some funky attack vectors there, I wouldn't know about them