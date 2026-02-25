import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { writeFileSync } from 'fs'

const SIZE = 512

const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="50%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" rx="100" fill="url(#bg)"/>
  <g transform="translate(${SIZE / 2}, ${SIZE / 2 - 20})" filter="url(#shadow)">
    <polygon points="0,-100 30,-40 100,-40 45,10 65,80 0,40 -65,80 -45,10 -100,-40 -30,-40" fill="white" opacity="0.95"/>
  </g>
  <text x="${SIZE / 2}" y="${SIZE / 2 + 120}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="72" fill="white" opacity="0.95">IT</text>
</svg>`

const pngBuf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer()
const png512 = await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer()

writeFileSync('resources/icon.png', png512)
console.log('Created resources/icon.png')

const icoBuf = await pngToIco([pngBuf])
writeFileSync('resources/icon.ico', icoBuf)
console.log('Created resources/icon.ico')
