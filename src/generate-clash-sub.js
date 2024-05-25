// import { template } from './clash-sub-template'
// import templateRender from 'lodash/template'

const templateUrl = `https://mirror.ghproxy.com/https://raw.githubusercontent.com/chiui-li/Clash-Template-Config/master/clash-sub-template`
const ipListUrl = `https://mirror.ghproxy.com/https://raw.githubusercontent.com/chiui-li/Clash-Template-Config/master/ip-list.txt`


function proxyYaml(name, location = 'unknown', ip, port = 443, userID, host) {
  return `
  - type: vless
    name: ${name}
    server: ${ip}
    port: ${port}
    uuid: ${userID}
    network: ws
    tls: true
    udp: false
    sni: ${host}
    client-fingerprint: chrome
    ws-opts:
      path: "/?ed=2048"
      headers:
        host: ${host}
`
}

const groupNames = [
  'adblock',
  'cn',
  'chatgpt',
  'netflix',
  'auto',
  'vmess',
]

function proxyGroupsYaml(name, ipList) {
  const nameList = ipList.map(i => `      - ${i.name}`).join('\n')
  return `
  - name: ${name}
    type: select
    proxies:
      - DIRECT
      - REJECT
      - chiui
      - WARP
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
export async function generateClashSub(userID, host) {
  const fetchTemplate = fetch(templateUrl).then(res => res.text())
  const fetchIpList = fetch(ipListUrl).then(res => res.text())
  const template = await fetchTemplate
  const ipCsv = await fetchIpList
  template.replace('{{vps-server}}', '107.175.115.79')
  const ipList = parseCsv(ipCsv).slice(0, 8)
  return `
  
${
template
.replace('{{proxy-list}}', 
ipList.map((ipMsg) => proxyYaml(ipMsg.name, ipMsg.location, ipMsg.ip, ipMsg.port, userID, host))
.concat(`
  - {
    name: chiui,
    server: 107.175.115.79,
    port: 10811,
    type: vmess,
    uuid: 195b1bf9-51d2-49bb-d5e1-7440af7eda05,
    alterId: 0,
    cipher: auto,
    tls: false,
    network: ws,
    ws-opts: { path: /195b1bf9 },
  }
  - {
    name: WARP,
    type: wireguard,
    server: 162.159.193.1,
    port: 2408,
    ip: 172.16.0.2,
    public-key: bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=,
    private-key: YLP/k9mtF3Fn26xI0OTjoRmQjp6G8MCod1K7dQWzYkM=,
    mtu: 1300,
    udp: true,
    remote-dns-resolve: true,
    dns: [114.114.114.114, 1.1.1.1, 8.8.8.8],
  }`)
.join('\n')

)
}
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

