const findFreePort = require('find-free-port')
const path = require('path')

module.exports = { startSonarAndRemix }

if (process.argv[2] === 'start') {
  startSonarAndRemix().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
if (process.argv[2] === 'dev') {
  startSonarAndRemix({ dev: true }).catch(err => {
    console.error(err)
    process.exit(1)
  })
}

async function startSonarAndRemix ({ dev } = {}) {
  process.chdir(__dirname)
  let remixURL
  const closing = []
  try {
    const [sonarServer, sonarOpts] = await startSonar()
    closing.push(() => sonarServer.close())
    remixURL = await startRemix({ sonar: sonarOpts, dev })
  } catch (err) {
    console.error(`initializing failed: ${err}`)
  }
  return { remixURL, close }
  function close () {
    for (const close of closing) close()
  }
}

async function startRemix (opts = {}) {
  if (opts.sonar?.url) process.env.SONAR_URL = opts.sonar.url
  if (opts.sonar?.collection) process.env.SONAR_COLLECTION = opts.sonar.collection
  const port = opts.port || process.env.PORT || (await findFreePort(3000))[0]
  if (!opts.dev) {
    require('@remix-run/serve/env.js')
    const { createApp } = require('@remix-run/serve/index.js')
    const hostname = 'localhost'
    const buildPath = path.resolve(process.cwd(), 'build')
    const url = `http://${hostname}:${port}`
    await new Promise((resolve, reject) => {
      createApp(buildPath).listen(port, hostname, () => {
        console.log(`Remix App Server started at ${url}`)
        resolve()
      })
    })
    return url
  } else {
    const commands = require('@remix-run/dev/cli/commands')
    commands.dev(__dirname)
  }
}

async function startSonar () {
  const Server = require('@arsonar/server/server.js')
  const port = (await findFreePort(15000))[0]
  const dataDir = process.env.SONAR_STORAGE || path.resolve('.data')
  const opts = {
    port,
    hostname: 'localhost',
    storage: dataDir,
    disableAuthentication: true
  }
  const server = new Server(opts)
  await server.start()
  const sonarOpts = {
    url: `http://localhost:${port}/api/v1/default`,
    collection: 'default'
  }
  console.log(`Sonar running on ${sonarOpts.url} with storage at ${dataDir}`)
  return [server, sonarOpts]
}
