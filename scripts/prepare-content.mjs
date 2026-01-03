import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { marked } from 'marked'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const workspaceRoot = path.resolve(__dirname, '..')

const cacheDir = path.join(workspaceRoot, 'build', 'cache')
const tambouiDir = path.join(cacheDir, 'tamboui')
const tambouiRemote = 'https://github.com/tamboui/tamboui.git'
const tambouiAntoraRoot = path.join(tambouiDir, 'antora')

function run (cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} failed with exit code ${code}`))
    })
  })
}

async function ensureFreshClone () {
  await fs.mkdir(cacheDir, { recursive: true })
  // Simple + predictable: wipe and reclone (keeps Antora deterministic).
  await fs.rm(tambouiDir, { recursive: true, force: true })
  await run('git', ['clone', '--depth', '1', tambouiRemote, tambouiDir], { cwd: workspaceRoot })
}

function wrapHtmlAsAdoc ({ title, html }) {
  return `= ${title}
:page-role: terminal

++++
${html}
++++
`
}

async function readFileIfExists (p) {
  try {
    return await fs.readFile(p, 'utf8')
  } catch (e) {
    if (e && e.code === 'ENOENT') return null
    throw e
  }
}

async function writeTambouiWrapperComponent () {
  // Layout expected by Antora under start_path: antora/
  const pagesDir = path.join(tambouiAntoraRoot, 'modules', 'ROOT', 'pages')
  const navDir = path.join(tambouiAntoraRoot, 'modules', 'ROOT')
  await fs.mkdir(pagesDir, { recursive: true })
  await fs.mkdir(navDir, { recursive: true })

  const upstreamReadme = await readFileIfExists(path.join(tambouiDir, 'README.md'))
  const upstreamToolkitTutorial = await readFileIfExists(path.join(tambouiDir, 'docs', 'toolkit-tutorial.md'))
  const upstreamVideoReadme = await readFileIfExists(path.join(tambouiDir, 'docs', 'video', 'readme.md'))

  const readmeHtml = marked.parse(upstreamReadme ?? '# Tamboui\n\nDocs not found.')
  const tutorialHtml = marked.parse(upstreamToolkitTutorial ?? '# Toolkit Tutorial\n\nNot found.')
  const videoHtml = marked.parse(upstreamVideoReadme ?? '# Videos\n\nNot found.')

  await fs.writeFile(
    path.join(tambouiAntoraRoot, 'antora.yml'),
    `name: tamboui
title: Tamboui
version: ~
nav:
  - modules/ROOT/nav.adoc
`
  )

  await fs.writeFile(
    path.join(navDir, 'nav.adoc'),
    `* xref:index.adoc[Overview]
* xref:toolkit-tutorial.adoc[Toolkit tutorial]
* xref:videos.adoc[Videos]
`
  )

  await fs.writeFile(path.join(pagesDir, 'index.adoc'), wrapHtmlAsAdoc({ title: 'Tamboui', html: readmeHtml }))
  await fs.writeFile(path.join(pagesDir, 'toolkit-tutorial.adoc'), wrapHtmlAsAdoc({ title: 'Toolkit tutorial', html: tutorialHtml }))
  await fs.writeFile(path.join(pagesDir, 'videos.adoc'), wrapHtmlAsAdoc({ title: 'Videos', html: videoHtml }))
}

async function main () {
  await ensureFreshClone()
  await writeTambouiWrapperComponent()
}

await main()
