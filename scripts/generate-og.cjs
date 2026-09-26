const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%" fx="50%" fy="20%">
      <stop offset="0%" stop-color="#1a2436" />
      <stop offset="50%" stop-color="#0f1117" />
      <stop offset="100%" stop-color="#090a0d" />
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.08)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)" />
    </linearGradient>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2997ff" />
      <stop offset="100%" stop-color="#0052a3" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Subtle glow orb -->
  <circle cx="600" cy="220" r="320" fill="#0066cc" opacity="0.22" />

  <!-- Border Card Frame -->
  <rect x="50" y="45" width="1100" height="540" rx="32" fill="url(#cardGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />

  <!-- Logo Mark Squircle -->
  <g transform="translate(100, 95)">
    <rect width="84" height="84" rx="22" fill="url(#iconGrad)" />
    <path d="M24 28h36 M24 42h24 M24 56h36" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
    <circle cx="64" cy="42" r="4.5" fill="#93c5fd" />
  </g>

  <!-- Brand Title -->
  <text x="205" y="148" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="700" fill="#ffffff" letter-spacing="-0.02em">
    DeDupe<tspan fill="#2997ff">Kit</tspan>
  </text>
  <text x="390" y="148" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#a1a1a6" letter-spacing="0.04em">
    • DEDUPEKIT.PAGES.DEV
  </text>

  <!-- Privacy Badge Pill -->
  <g transform="translate(860, 115)">
    <rect width="190" height="42" rx="21" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1" />
    <circle cx="24" cy="21" r="5" fill="#34d399" />
    <text x="38" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#34d399">100% Client-Side</text>
  </g>

  <!-- Main Headline -->
  <text x="100" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="800" fill="#ffffff" letter-spacing="-0.03em">
    Remove Duplicates Online
  </text>
  <text x="100" y="332" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="600" fill="#2997ff" letter-spacing="-0.02em">
    Free Online Duplicate Line Remover Tool
  </text>

  <!-- Description / Selling points -->
  <text x="100" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400" fill="#a1a1a6">
    Fast, private text list deduplication. Preserves Excel tabs, original order, and casing.
  </text>

  <!-- Feature Pills -->
  <g transform="translate(100, 465)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="200" height="42" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="22" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#f5f5f7">✓ Case Sensitivity</text>

    <!-- Pill 2 -->
    <rect x="220" y="0" width="220" height="42" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="24" y="26" transform="translate(220, 0)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#f5f5f7">✓ Excel Delimiters</text>

    <!-- Pill 3 -->
    <rect x="460" y="0" width="210" height="42" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="24" y="26" transform="translate(460, 0)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#f5f5f7">✓ Sorting Suite</text>

    <!-- Pill 4 -->
    <rect x="690" y="0" width="260" height="42" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="24" y="26" transform="translate(690, 0)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#f5f5f7">✓ 100k+ Lines in &lt;100ms</text>
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png({ quality: 95 })
  .toFile(path.join(__dirname, '..', 'public', 'og-image.png'))
  .then(info => console.log('Successfully generated public/og-image.png:', info))
  .catch(err => {
    console.error('Error generating og-image:', err);
    process.exit(1);
  });
