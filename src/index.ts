import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { request } from 'undici'

export const downloadRelease = async (owner: string, repo: string, assetNumber: number, targetFolder: string) => {
  const response = await request(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: {
      'User-Agent': `UA/${Date.now().toString()}`
    }
  })
  let data
  if (response.statusCode === 200) {
    data = await response.body.json() as TagDetail
  } else {
    // Not Found
    // no redirect to /latest/<LATEST_TAG>
    // but is redirected to /releases because latest tag is missing
    const [firstTag] = await request(`https://api.github.com/repos/${owner}/${repo}/tags`, {
      headers: {
        'User-Agent': `UA/${Date.now().toString()}`
      }
    }).then((resp) => resp.body.json()) as Tag[]
    const tag = firstTag.name
    data = await request(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
      headers: {
        'User-Agent': `UA/${Date.now().toString()}`
      }
    }).then((resp) => resp.body.json()) as TagDetail
  }
  const asset = data.assets[assetNumber]
  const { browser_download_url, name } = asset
  const dataRedirectFile = await request(browser_download_url)
  if (dataRedirectFile.statusCode === 302) {
    fs.mkdirSync(targetFolder, { recursive: true })
    // <filename>.<extension> --> <filename>_<tag_name>.<extension>
    const splittedFilename = name.split('.')
    splittedFilename[splittedFilename.length - 2] = `${splittedFilename[splittedFilename.length - 2]}_${data.tag_name}`
    const filename = splittedFilename.join('.')
    const filepath = path.join(targetFolder, filename)
    if (fs.existsSync(filepath) === true) {
      return
    }
    const { location } = dataRedirectFile.headers as { location: string }
    const dataFile = await request(location, {
      headers: {
        Accept: 'application/octet-stream'
      }
    })
    const writer = fs.createWriteStream(filepath)
    await pipeline(dataFile.body, writer)
    return
  }
  console.error(`dataRedirectFile.statusCode !== 302; browser_download_url=${browser_download_url}`)
  throw dataRedirectFile
}