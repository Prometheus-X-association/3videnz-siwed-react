import { parseJson } from '../base64.js'

async function decode(tokenURI, template) {
  const json = parseJson(tokenURI)
  const publicKey = json.external_url.match(/[a-zA-Z0-9]{128}/)[0]
  const [ _, env, __, domain ] = template.toolbox.url.match(/https:\/\/toolbox(-(demo|staging))?.([^.]+.[^.\/]+)/)
  return await fetch(`https://api${env || ''}.${domain}/data/${publicKey}/all`)
    .then(response => response.json())
    .then(json => Object.values(json.certified)[0])
    .then(data => {
      Object.keys(data).filter(key => key.match(/^(meta_.*|data_encoding)/)).forEach(key => delete data[key])
      return data
    })
}

export default { decode }