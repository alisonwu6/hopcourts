import { readFileSync, writeFileSync } from 'fs'

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'))
const sw = readFileSync('public/sw.js', 'utf-8')
writeFileSync('public/sw.js', sw.replace(/const VERSION = '[^']*'/, `const VERSION = 'v${version}'`))
console.log(`sw.js → VERSION = v${version}`)
