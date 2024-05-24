import { template } from './clash-sub-template'
// import templateRender from 'lodash/template'

const templateUrl = `https://raw.githubusercontent.com/chiui-li/Clash-Template-Config/master/clash-sub-template`
const ipListUrl = `https://raw.githubusercontent.com/chiui-li/Clash-Template-Config/master/ip-list.txt`

const interpolate = /{{([\s\S]+?)}}/g

function proxyYaml(name, location = 'unknown', ip, port = 443, userID) {
  return `
  - type: vless
    name: ${name}
    server: ${ip}
    port: ${port}
    uuid: ${userID}
    network: ws
    tls: true
    udp: false
    sni: ${location}
    client-fingerprint: chrome
    ws-opts:
      path: "/?ed=2048"
      headers:
        host: ${ip}
      health-check:
        enable: true
        url: https://www.gstatic.com/generate_204
        interval: 3000
        timeout: 2000
        lazy: true
        expected-status: 204
      override:
        skip-cert-verify: true  
  `
}

const groupNames = [
  'adblock',
  'cn',
  'chatgpt',
  'netflix',
  'auto',
]

function proxyGroupsYaml(name, ipList) {
  const nameList = ipList.map(i => `      - ${i.name}`).join('\n')
  return `
  - name: ${name}
    type: select
    proxies:
      - DIRECT
      - REJECT
      - auto
${nameList}
`
}

function parseCsv(csv = '') {
  const [, ...rows] = csv.split('\n')
  return rows.map(row => {
    const [ip, port, _, location] = row.split(',') || []
    return {
      name: `${location}${ip}${port}`,
      ip,
      port,
      location
    }
  })
}

/**
 * generateClashSub
 */
export async function generateClashSub(userID) {
  const fetchTemplate = fetch(templateUrl).then(res => res.text())
  const fetchIpList = fetch(ipListUrl).then(res => res.text())
  const template = await fetchTemplate
  const ipCsv = await fetchIpList
  template.replace('{{vps-server}}', '107.175.115.79')
  const ipList = parseCsv(ipCsv).slice(0, 8)
  return `
${template.replace('{{proxy-list}}', ipList.map((ipMsg) => proxyYaml(ipMsg.name, ipMsg.location, ipMsg.ip, ipMsg.port, userID)).join('\n'))}
proxy-groups:
  ${groupNames.map(name => proxyGroupsYaml(name, ipList)).join('\n')}

rule-providers:
  adblock:
    type: http
    url: "https://mirror.ghproxy.com/?q=https%3A%2F%2Fraw.githubusercontent.com%2Fchiui-li%2FClash-Template-Config%2Fmaster%2FFilter%2FAdBlock.yaml"
    interval: 600
    proxy: adblock
    behavior: classical
    format: yaml

  cn:
    type: http
    url: "https://mirror.ghproxy.com/?q=https%3A%2F%2Fraw.githubusercontent.com%2Fchiui-li%2FClash-Template-Config%2Fmaster%2FFilter%2FChina.yaml"
    interval: 600
    proxy: cn
    behavior: classical
    format: yaml
  
  netflix:
    type: http
    url: "https://mirror.ghproxy.com/?q=https%3A%2F%2Fraw.githubusercontent.com%2Fchiui-li%2FClash-Template-Config%2Fmaster%2FFilter%2FNetflix.yaml"
    interval: 600
    proxy: cn
    behavior: classical
    format: yaml

  openai:
    type: http
    url: "https://mirror.ghproxy.com/?q=https%3A%2F%2Fraw.githubusercontent.com%2Fchiui-li%2FClash-Template-Config%2Fmaster%2FFilter%2FOpenAI.yaml"
    interval: 600
    proxy: cn
    behavior: classical
    format: yaml

rules:
  - MATCH,auto
`}

