export const template = `
port: 7890
socks-port: 7891
allow-lan: true
mode: Rule
log-level: info
external-controller: :9090

proxy-providers:
  cf-pages-proxy:
    type: http
    http: ${'http'}
    interval: 12000
    proxy: DIRECT
    health-check:
      enable: true
      url: https://www.gstatic.com/generate_204
      interval: 3000
      timeout: 2000
      lazy: true
      expected-status: 204
    override:
      skip-cert-verify: true

proxies:
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
    }
`.trim()