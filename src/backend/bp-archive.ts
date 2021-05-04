/* eslint-disable @typescript-eslint/quotes */
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import tar from 'tar'

export function buildArchive(pathToArchive, template, qnas, intents): Promise<Buffer> {
  makeDirs(pathToArchive)
  exportQna(pathToArchive, qnas)
  exportIntent(pathToArchive, intents)
  exportFlow(pathToArchive, template)
  exportTop(pathToArchive, template)
  return makeTarball(pathToArchive)
}

export function getTemplate() {
  return {
    flows: {
      'main.flow.json': {
        "version": "0.0.1",
        "catchAll": {"onReceive": [], "next": []},
        "startNode": "entry",
        "nodes": [{"id": "entry", "name": "entry", "next": [], "onEnter": [], "onReceive": null}]
      },
      'main.ui.json': {"nodes": [{"id": "entry", "position": {"x": 100, "y": 100}}], "links": []},
      'error.flow.json': {
        "version": "0.0.1",
        "catchAll": {},
        "startNode": "entry",
        "nodes": [{"id": "3rr0r", "name": "entry", "onEnter": [], "onReceive": null, "next": []}]
      },
      'error.ui.json': {"nodes": [{"id": "3rr0r", "position": {"x": 100, "y": 100}}], "links": []}
    },
    top: {
      'bot.config.json': {
        "locked": false,
        "disabled": false,
        "private": false,
        "details": {},
        "$schema": "../../bot.config.schema.json",
        "description": "",
        "active": true,
        "version": "12.20.1",
        "author": "Botpress, Inc.",
        "license": "AGPL-3.0",
        "imports": {
          "modules": [],
          "incomingMiddleware": [],
          "outgoingMiddleware": [],
          "contentTypes": [
            "builtin_action-button",
            "builtin_card",
            "builtin_carousel",
            "builtin_image",
            "builtin_single-choice",
            "builtin_text",
            "dropdown"
          ]
        },
        "dialog": {
          "timeoutInterval": "5m"
        },
        "logs": {
          "expiration": "1 week"
        },
        "defaultLanguage": "ja",
        "languages": [
          "ja"
        ],
        "id": "empty",
        "name": "empty",
        "pipeline_status": {
          "current_stage": {
            "id": "prod",
            "promoted_on": "2021-04-04T21:43:21.764Z",
            "promoted_by": "example@example.com"
          }
        }
      },
      'revisions.json': []
    }
  }
}

function makeDirs(pathToArchive) {
  const dirs = [
    'content-elements',
    'hooks',
    'qna',
    'actions',
    'intents',
    'flows/skills',
    'media'
  ]
  dirs.forEach(dir => {
    const fullPath = path.join(pathToArchive, dir)
    fs.mkdirSync(fullPath, {recursive: true})
  })
}

async function makeTarball(pathToArchive): Promise<Buffer> {
  const readStream: stream.Readable = tar.c({
    gzip: true,
    C: pathToArchive
  }, ['.'])

  return new Promise((resolve, reject) => {
    const buffers = []
    readStream.on('data', data => {
      buffers.push(data)
    })
    readStream.on('end', () => {
      const result = Buffer.concat(buffers)
      resolve(result)
    })
    readStream.on('error', error => {
      reject(error)
    })
  })
}

function exportFlow(pathToArchive, template) {
  Object.keys(template.flows).forEach(filename => {
    const filePath = path.join(pathToArchive, `flows/${filename}`)
    const content = JSON.stringify(template.flows[filename], null, 2)
    fs.writeFileSync(filePath, content)
  })
}

function exportTop(pathToArchive, template) {
  Object.keys(template.top).forEach(filename => {
    const filePath = path.join(pathToArchive, `${filename}`)
    const content = JSON.stringify(template.top[filename], null, 2)
    fs.writeFileSync(filePath, content)
  })
}

function exportQna(pathToArchive, qnas) {
  qnas.forEach(qna => {
    const filePath = path.join(pathToArchive, `qna/${qna.id}.json`)
    const content = JSON.stringify(qna, null, 2)
    fs.writeFileSync(filePath, content)
  })
}

function exportIntent(pathToArchive, intents) {
  intents.forEach(intent => {
    const filePath = path.join(pathToArchive, `intents/${intent.name}.json`)
    const content = JSON.stringify(intent, null, 2)
    fs.writeFileSync(filePath, content)
  })
}
