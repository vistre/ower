/**
 * Mihomo Configuration Script
 * Leo Bennett | Optimized
 * Ver 5.17 | Update: 2026-08-04
 */

function main(config) {
  try {
    // 0. 辅助函数
    const createProvider = (url, path, type = "http", behavior = "domain", format = "mrs", interval = 86400) => ({
      type, behavior, format, interval, path, url
    });

    const createGroup = (name, type, icon, proxies_or_filter, options = {}) => {
      const group = {
        name, type, icon,
        ...options
      };
      // 自动判断是 proxies 数组还是 filter 字符串
      if (Array.isArray(proxies_or_filter)) {
        group.proxies = proxies_or_filter;
      } else if (typeof proxies_or_filter === "string") {
        group.filter = proxies_or_filter;
        // 如果是手动切换，不要 include-all (根据 YAML 逻辑，手动切换虽然 filter 很大，但也可以 include-all)
        // YAML 中 use_all_provider 对所有组生效
        group["include-all"] = true;
      }
      return group;
    };

    // 1. 基础设置
    const generalConfig = {
      "mixed-port": 7890,
      "redir-port": 9797,
      "tproxy-port": 9898,
      "mode": "Rule",
      "ipv6": false,
      "allow-lan": true,
      "bind-address": "*",
      "unified-delay": true,
      "log-level": "warning",
      "find-process-mode": "always",
      "tcp-concurrent": true,
      "keep-alive-interval": 30,
      "external-controller": "0.0.0.0:9090",
      "external-ui": "./dashboard",
      "secret": ""
    };
    Object.assign(config, generalConfig);

    if (!config.profile) config.profile = {};
    config.profile["store-selected"] = true;
    config.profile["store-fake-ip"] = true;

    if (!config.experimental) config.experimental = {};
    config.experimental["http-headers"] = {
      "request": [{
        "name": "User-Agent",
        "value": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36"
      }]
    };

    // 手动添加指纹
    if (Array.isArray(config.proxies)) {
      config.proxies.forEach(p => {
        if ((p.tls || p.network === 'ws' || p.network === 'grpc') && !p["client-fingerprint"]) {
          p["client-fingerprint"] = "chrome";
        }
      });
    }

    // 2. 内核功能
    config["tun"] = {
      enable: true,
      stack: "mixed",
      device: "meta",
      mtu: 9000,
      "exclude-uid": [10320, 10321, 10461, 99910320, 99910461],
      "dns-hijack": ["any:53", "tcp://any:53"],
      "auto-route": true,
      "strict-route": true,
      "auto-redirect": true,
      "auto-detect-interface": true,
      "include-android-user": [0, 10]
    };

    config["sniffer"] = {
      enable: true,
      "parse-pure-ip": true,
      sniff: {
        TLS: { ports: [443, 8443] },
        HTTP: { ports: [80, "8080-8880"], "override-destination": true },
        QUIC: { ports: [443, 8443] }
      },
      "skip-domain": [
        "+.lan",
        "+.local",
        "Mijia Cloud"
      ]
    };

    config["geox-url"] = {
      geoip: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
      geosite: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
      mmdb: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
      asn: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"
    };

    // 3. DNS 配置
    config["dns"] = {
      enable: true,
      listen: ":1053",
      "use-hosts": true,
      "enhanced-mode": "fake-ip",
      "fake-ip-range": "198.18.0.1/16",
      "respect-rules": true,
      ipv6: false,
      "default-nameserver": ["223.5.5.5", "119.29.29.29"],
      nameserver: ["https://8.8.8.8/dns-query", "https://1.1.1.1/dns-query"],
      "proxy-server-nameserver": ["223.5.5.5", "119.29.29.29"],
      "nameserver-policy": {
        'rule-set:CN,Private': ["223.5.5.5", "119.29.29.29"]
      },
      "fake-ip-filter": [
        "+.lan", "+.local", "stun.*", "work.weixin.qq.com", "xbox.*.microsoft.com",
        "+.battlenet.com.cn", "+.servicewechat.com", "+.tenpay.com", "+.qq.com", "+.music.163.com",
        "rule-set:Fake-IP-Filter"
      ]
    };

    // 4. 规则提供者
    config["rule-providers"] = {
      // Core
      "Fake-IP-Filter": createProvider("https://testingcf.jsdelivr.net/gh/DustinWin/ruleset_geodata@mihomo-ruleset/fakeip-filter.mrs", "./rules/fakeip-filter.mrs"),
      "Private": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs", "./rules/Private.mrs"),
      "NoAds": createProvider("https://testingcf.jsdelivr.net/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs", "./rules/AWAvenue-Ads.mrs"),
      // CN
      "ChinaMax": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/ChinaMax/ChinaMax.list", "./ruleset/ChinaMax.list", "http", "classical", "text"),
      "CN": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cn.mrs", "./rules/CN.mrs"),
      "DouYin": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/douyin.mrs", "./rules/DouYin.mrs"),
      "BiliBili": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/bilibili.mrs", "./rules/BiliBili.mrs"),
      // Media & AI
      "OpenAI": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml", "./rules/OpenAI.yaml", "http", "classical", "yaml"),
      "GlobalMedia": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/GlobalMedia/GlobalMedia.yaml", "./rules/GlobalMedia.yaml", "http", "classical", "yaml"),
      "YouTube": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/youtube.mrs", "./rules/YouTube.mrs"),
      "Netflix": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs", "./rules/Netflix.mrs"),
      "Netflix_IP": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo-lite/geoip/netflix.mrs", "./rules/Netflix_IP.mrs", "http", "ipcidr", "mrs"),
      "NetEaseMusic": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/NetEaseMusic/NetEaseMusic.yaml", "./rules/NetEaseMusic.yaml", "http", "classical", "yaml"),
      "Bahamut": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Bahamut/Bahamut.yaml", "./rules/Bahamut.yaml", "http", "classical", "yaml"),
      // Gaming
      "steam_cn": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam@cn.mrs", "./rules/steam_cn.mrs"),
      "steam": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam.mrs", "./rules/steam.mrs"),
      "Epic": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Epic/Epic.yaml", "./rules/Epic.yaml", "http", "classical", "yaml"),
      "Origin": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Origin/Origin.yaml", "./rules/Origin.yaml", "http", "classical", "yaml"),
      "Sony": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Sony/Sony.yaml", "./rules/Sony.yaml", "http", "classical", "yaml"),
      "Nintendo": createProvider("https://testingcf.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Nintendo/Nintendo.yaml", "./rules/Nintendo.yaml", "http", "classical", "yaml"),
      // Social
      "Telegram": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs", "./rules/Telegram.mrs"),
      "Telegram_IP": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo-lite/geoip/telegram.mrs", "./rules/Telegram_IP.mrs", "http", "ipcidr", "mrs"),
      "Microsoft": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft.mrs", "./rules/Microsoft.mrs"),
      "Apple": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple.mrs", "./rules/Apple.mrs"),
      "Apple_IP": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo-lite/geoip/apple.mrs", "./rules/Apple_IP.mrs", "http", "ipcidr", "mrs"),
      "GitHub": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/github.mrs", "./rules/GitHub.mrs"),
      "GoogleFCM": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/googlefcm.mrs", "./rules/GoogleFCM.mrs"),
      "Google": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs", "./rules/Google.mrs"),
      "Google_IP": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo-lite/geoip/google.mrs", "./rules/Google_IP.mrs", "http", "ipcidr", "mrs"),
      "ProxyGFWlist": createProvider("https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/gfw.mrs", "./rules/GFW.mrs"),
    };

    // 5. 策略组
    // 仅剔除无效节点（保留所有地区，用于"手动切换"等需要全量节点的组）
    const filterAll = "^(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low)).*$";
    // 仅保留主力地区并剔除无效节点（用于"自动选择"等需要优选的组）
    const filterMain = "(?i)(香港|HK|🇭🇰|台湾|TW|🇹🇼|日本|JP|🇯🇵|新加坡|SG|🇸🇬|美国|US|🇺🇸|韩国|KR|🇰🇷)(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low))";

    const Icons = {
      Proxy: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
      Auto: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png",
      Select: "https://testingcf.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png",
      Google: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
      ChatGPT: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png",
      Emby: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Emby.png",
      YouTube: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png",
      Netflix: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png",
      Media: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ForeignMedia.png",
      Bahamut: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png",
      Bilibili: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png",
      Music: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netease_Music.png",
      Telegram: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png",
      Microsoft: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png",
      Apple: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png",
      Game: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Game.png",
      LowRate: "https://raw.githubusercontent.com/shindgewongxj/WHATSINStash/master/icon/categorypig.png",
      HK: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png",
      JP: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png",
      US: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png",
      TW: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png",
      SG: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png",
      KR: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png",
      Global: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
      Direct: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
      AdBlock: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png",
      Final: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Final.png",
      Update: "https://cdn.jsdelivr.net/gh/GitMetaio/Surfing@main/app/icon/Update.svg"
    };

    config["proxy-groups"] = [
      createGroup("节点选择", "select", Icons.Proxy, ["自动选择", "香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "手动切换", "低倍率节点", "其他地区", "DIRECT", "REJECT"]),
      createGroup("自动选择", "url-test", Icons.Auto, filterMain, { tolerance: 50, interval: 300 }),
      createGroup("手动切换", "select", Icons.Select, filterAll),
      createGroup("Google/Gemini", "select", Icons.Google, "(?i)(美国|USA|US|🇺🇸|日本|JP|🇯🇵|台湾|TW|🇹🇼|新加坡|SG|🇸🇬|韩国|KR|🇰🇷|英国|UK|🇬🇧|加拿大|CA|🇨🇦|法国|FR|🇫🇷|德国|DE|🇩🇪|澳洲|AU|🇦🇺)(?!.*(?i)(官网|流量|测试|更新|到期|重置|倍|free|low))"),
      createGroup("OpenAI", "select", Icons.ChatGPT, ["Google/Gemini", "美国节点", "日本节点", "新加坡节点", "台湾节点", "韩国节点", "其他地区"]),

      createGroup("Emby", "select", Icons.Emby, "(?i)(香港|HK|🇭🇰|台湾|TW|🇹🇼|新加坡|SG|🇸🇬|美国|US|🇺🇸|韩国|KR|🇰🇷)(?!.*(日本|JP|🇯🇵))", { proxies: ["DIRECT", "低倍率节点"] }),
      createGroup("油管视频", "select", Icons.YouTube, ["自动选择", "节点选择", "香港节点", "台湾节点", "新加坡节点", "日本节点", "美国节点", "韩国节点", "低倍率节点"]),
      createGroup("奈飞视频", "select", Icons.Netflix, ["自动选择", "节点选择", "新加坡节点", "香港节点", "台湾节点", "日本节点", "美国节点", "低倍率节点"]),
      createGroup("国外媒体", "select", Icons.Media, ["自动选择", "节点选择", "香港节点", "台湾节点", "新加坡节点", "日本节点", "美国节点", "低倍率节点"]),
      createGroup("巴哈姆特", "select", Icons.Bahamut, ["台湾节点", "节点选择", "自动选择"]),
      createGroup("哔哩哔哩", "select", Icons.Bilibili, ["DIRECT", "台湾节点", "香港节点"]),
      createGroup("网易音乐", "select", Icons.Music, ["DIRECT", "节点选择"]),

      createGroup("电报消息", "url-test", Icons.Telegram, "(?i)(新加坡|SG|🇸🇬|香港|HK|🇭🇰|台湾|TW|🇹🇼|日本|JP|🇯🇵|美国|US|🇺🇸)", { tolerance: 50, interval: 300 }),
      createGroup("微软服务", "select", Icons.Microsoft, ["节点选择", "DIRECT", "美国节点", "香港节点", "台湾节点"]),
      createGroup("苹果服务", "select", Icons.Apple, ["节点选择", "DIRECT", "美国节点", "香港节点", "台湾节点"]),
      createGroup("谷歌FCM", "select", Icons.Google, ["DIRECT", "节点选择", "美国节点", "香港节点", "台湾节点", "日本节点", "新加坡节点"]),
      createGroup("游戏平台", "select", Icons.Game, ["节点选择", "DIRECT", "香港节点", "日本节点", "美国节点"]),

      createGroup("低倍率节点", "select", Icons.LowRate, "(?i)(0\\.\\d+|0)(\\s)*(x|×|倍)|free|low|公益|低倍"),
      createGroup("香港节点", "url-test", Icons.HK, "(?i)(香港|HK|🇭🇰)(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low))", { tolerance: 50, interval: 300 }),
      createGroup("日本节点", "url-test", Icons.JP, "(?i)(日本|JP|🇯🇵)(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low))", { tolerance: 50, interval: 300 }),
      createGroup("美国节点", "url-test", Icons.US, "(?i)(美国|USA|US|🇺🇸)(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low))", { tolerance: 50, interval: 300 }),
      createGroup("台湾节点", "url-test", Icons.TW, "(?i)(台湾|TW|🇹🇼)(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low))", { tolerance: 50, interval: 300 }),
      createGroup("新加坡节点", "url-test", Icons.SG, "(?i)(新加坡|SG|🇸🇬)(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low))", { tolerance: 50, interval: 300 }),
      createGroup("韩国节点", "url-test", Icons.KR, "(?i)(韩国|KR|🇰🇷)(?!.*(官网|套餐|流量|测试|更新|到期|重置|倍|free|low))", { tolerance: 50, interval: 300 }),
      createGroup("其他地区", "select", Icons.Global, "^(?!.*((?i)香港|HK|🇭🇰|日本|JP|🇯🇵|美国|US|🇺🇸|台湾|TW|🇹🇼|新加坡|SG|🇸🇬|韩国|KR|🇰🇷|官网|套餐|流量|测试|更新|到期|重置|倍|free|low)).*$"),

      createGroup("全球直连", "select", Icons.Direct, ["DIRECT", "节点选择"]),
      createGroup("广告拦截", "select", Icons.AdBlock, ["REJECT", "DIRECT"]),
      createGroup("漏网之鱼", "select", Icons.Final, ["节点选择", "自动选择", "DIRECT", "香港节点", "台湾节点", "日本节点", "美国节点"]),
      createGroup("订阅更新", "select", Icons.Update, ["DIRECT", "节点选择"])
    ];

    // 6. 分流规则
    config["rules"] = [
      "IP-CIDR,0.0.0.0/8,全球直连,no-resolve",
      "IP-CIDR,10.0.0.0/8,全球直连,no-resolve",
      "IP-CIDR,100.64.0.0/10,全球直连,no-resolve",
      "IP-CIDR,127.0.0.0/8,全球直连,no-resolve",
      "IP-CIDR,172.16.0.0/12,全球直连,no-resolve",
      "IP-CIDR,192.168.0.0/16,全球直连,no-resolve",
      "IP-CIDR,198.18.0.0/15,全球直连,no-resolve",
      "IP-CIDR,224.0.0.0/4,全球直连,no-resolve",
      "IP-CIDR6,::1/128,全球直连,no-resolve",
      "IP-CIDR6,fc00::/7,全球直连,no-resolve",
      "IP-CIDR6,fe80::/10,全球直连,no-resolve",
      "DOMAIN-SUFFIX,local,全球直连",
      "DOMAIN-SUFFIX,lan,全球直连",
      "RULE-SET,Private,全球直连",
      "RULE-SET,NoAds,广告拦截",

      // ==========================================
      // ============ 个人自定义保留区 ============
      // ==========================================
      "DOMAIN-KEYWORD,pilipili,全球直连",
      "DOMAIN-KEYWORD,embyplus,Emby",
      "DOMAIN-SUFFIX,cdn.bgp.yt,全球直连",
      "DOMAIN-SUFFIX,media.nijigem.by,全球直连",
      "DOMAIN-KEYWORD,steamtools,全球直连",
      "DOMAIN-SUFFIX,challenges.cloudflare.com,节点选择",
      "DOMAIN,v1.uhdnow.com,全球直连",
      "DOMAIN-SUFFIX,rainbowsky.xyz,全球直连",
      "DOMAIN-SUFFIX,genshin.biliblili.uk,全球直连",
      // ==========================================
      // ============ 自定义区域结束 ============
      // ==========================================

      "RULE-SET,steam_cn,全球直连",
      "RULE-SET,GoogleFCM,谷歌FCM",
      "RULE-SET,Google,Google/Gemini",
      "RULE-SET,Google_IP,Google/Gemini,no-resolve",
      "RULE-SET,OpenAI,OpenAI",
      "RULE-SET,Telegram,电报消息",
      "RULE-SET,Telegram_IP,电报消息,no-resolve",
      "RULE-SET,Microsoft,微软服务",
      "RULE-SET,Apple,苹果服务",
      "RULE-SET,Apple_IP,苹果服务,no-resolve",
      "RULE-SET,GitHub,节点选择",
      "RULE-SET,steam,游戏平台",
      "RULE-SET,Epic,游戏平台",
      "RULE-SET,Origin,游戏平台",
      "RULE-SET,Sony,游戏平台",
      "RULE-SET,Nintendo,游戏平台",
      "RULE-SET,DouYin,全球直连",
      "RULE-SET,YouTube,油管视频",
      "RULE-SET,Netflix,奈飞视频",
      "RULE-SET,Netflix_IP,奈飞视频,no-resolve",
      "RULE-SET,Bahamut,巴哈姆特",
      "RULE-SET,NetEaseMusic,网易音乐",
      "RULE-SET,BiliBili,哔哩哔哩",
      "RULE-SET,GlobalMedia,国外媒体",
      "RULE-SET,ProxyGFWlist,节点选择",
      "RULE-SET,ChinaMax,全球直连",
      "GEOIP,CN,全球直连,no-resolve",
      "MATCH,漏网之鱼"
    ];

    return config;

  } catch (e) {
    console.log("Script Error: " + e);
    return config;
  }
}
