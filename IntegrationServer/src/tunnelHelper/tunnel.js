const localtunnel = require('localtunnel')

const MAX_ATTEMPTS = 5

const createTunnel = async (port, retries = 0) => {
  try {
    const tunnel = await localtunnel({
      port,
      subdomain: process.env.TUNNEL_SUBDOMAIN
    })

    const usedSubDomain = tunnel.url.includes(process.env.TUNNEL_SUBDOMAIN)
    if (!usedSubDomain && retries < MAX_ATTEMPTS) {
      console.warn('subdomain not available')
      tunnel.close()
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(createTunnel(port, retries + 1))
        }, 500)
      })
    }

    if (!usedSubDomain) {
      console.warn('could not use the wanted subdomain, a random one was used instead')
    }

    console.log(`listening at localhost:${port} || tunnel: ${tunnel.url}`)
  } catch (error) {
    console.error('Failed to create tunnel:', error.message)
    if (retries < MAX_ATTEMPTS) {
      console.warn('Retrying...')
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(createTunnel(port, retries + 1))
        }, 500)
      })
    }
    throw new Error('Failed to create tunnel')
  }
}

module.exports = {
  createTunnel
}