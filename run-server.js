#!/usr/bin/env node
const http = require('http')
const fs = require('fs')
const path = require('path')

const port = process.env.PORT || 8080
const root = process.cwd()

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
}

function sendResponse(res, code, data, type) {
  res.writeHead(code, { 'Content-Type': type })
  res.end(data)
}

const server = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname)
    let filePath = path.join(root, url)

    fs.stat(filePath, (err, stats) => {
      if (err) {
        // try serving index.html for root or return 404
        if (url === '/' || url === '') {
          const idx = path.join(root, 'index.html')
          return fs.readFile(idx, (err2, data2) => {
            if (err2) return sendResponse(res, 404, 'Not found', 'text/plain')
            return sendResponse(res, 200, data2, mime['.html'])
          })
        }
        return sendResponse(res, 404, 'Not found', 'text/plain')
      }

      if (stats.isDirectory()) filePath = path.join(filePath, 'index.html')

      fs.readFile(filePath, (err2, data) => {
        if (err2) return sendResponse(res, 500, 'Server error', 'text/plain')
        const ext = path.extname(filePath).toLowerCase()
        const type = mime[ext] || 'application/octet-stream'
        sendResponse(res, 200, data, type)
      })
    })
  } catch (e) {
    sendResponse(res, 500, 'Server error', 'text/plain')
  }
})

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`)
})
