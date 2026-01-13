/**
 * Mihomo Party / Clash Verge Rev 专用 JS 覆写脚本
 * Leo Bennett 专属优化版
 * * 🛠️ 优化日志：
 * 1. [规范] 全局命名标准化：废除 "狮城节点"，统一使用 "新加坡节点"
 * 2. [体验] "手动切换" 增加热门地区白名单，不再显示冷门节点
 * 3. [体验] 流媒体策略组 (YouTube/Netflix) 默认优先使用 "自动选择"
 * 4. [维护] 保持 DNS/NTP/Fastly 加速/Chrome 指纹等核心优化
 */

function main(config) {
  try {
    // ==============================================================================
    // 1. 基础设置
    // ==============================================================================
    config["port"] = 7890;
    config["socks-port"] = 7891;
    config["mixed-port"] = 7890;
    config["allow-lan"] = true;
    config["bind-address"] = "*";
    config["unified-delay"] = true;
    config["keep-alive-interval"] = 15;
    
    // 开启 TCP 并发 (低延迟)
    config["tcp-concurrent"] = true;
    // 模拟 Chrome 指纹 (防断流)
    config["global-client-fingerprint"] = "chrome";
    
    config["external-controller"] = "0.0.0.0:9090";
    config["external-ui"] = "ui";
    config["external-ui-url"] = "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip";

    // ==============================================================================
    // 2. DNS & TUN 配置
    // ==============================================================================
    config["tun"] = {
      enable: true,
      device: "mihomo",
      stack: "mixed",
      "dns-hijack": ["any:53"],
      mtu: 1500,
      "strict-route": true
    };

    config["dns"] = {
      enable: true,
      listen: ":1053",
      ipv6: true,
      "enhanced-mode": "fake-ip",
      "fake-ip-range": "198.18.0.1/16",
      "respect-rules": true,
      "fake-ip-filter": [
        "+.lan", "+.local", "+.msftconnecttest.com", "+.msftncsi.com",
        "localhost.ptlogin2.qq.com", "localhost.sec.qq.com",
        "+.srv.nintendo.net", "+.stun.playstation.net",
        "xbox.*.microsoft.com", "+.xboxlive.com"
      ],
      "default-nameserver": ["223.5.5.5", "119.29.29.29", "2400:3200::1"],
      "proxy-server-nameserver": ["tls://dns.alidns.com", "tls://dot.pub"],
      nameserver: ["tls://dns.google", "tls://1.1.1.1"],
      "nameserver-policy": {
        "geosite:cn,private,apple-cn,google-cn,category-games@cn": ["tls://dns.alidns.com", "tls://dot.pub"],
        "geosite:!cn,!private": ["tls://dns.google", "tls://1.1.1.1"]
      }
    };

    config["sniffer"] = {
      enable: true,
      "parse-pure-ip": true,
      "force-dns-mapping": true,
      "override-destination": false,
      sniff: {
        HTTP: { ports: [80, 443], "override-destination": false },
        TLS: { ports: [443] }
      },
      "skip-domain": ["+.push.apple.com"]
    };

    // ==============================================================================
    // 3. 规则源 (Rule Providers) - Fastly 加速
    // ==============================================================================
    var ruleProviderBase = {
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http",
    };

    var providersDef = {
      Gemini: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Gemini/Gemini.list", path: "./ruleset/Gemini.list" },
      Google: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google.list", path: "./ruleset/Google.list" },
      OpenAi: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.list", path: "./ruleset/OpenAI.list" },
      TikTok: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/TikTok/TikTok.list", path: "./ruleset/TikTok.list" },
      Spotify: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.list", path: "./ruleset/Spotify.list" },
      Discord: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Discord/Discord.list", path: "./ruleset/Discord.list" },
      Microsoft: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Microsoft/Microsoft.list", path: "./ruleset/Microsoft.list" },
      Speedtest: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Speedtest/Speedtest.list", path: "./ruleset/Speedtest.list" },
      WeChat: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/WeChat/WeChat.list", path: "./ruleset/WeChat.list" },
      Direct: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Direct/Direct.list", path: "./ruleset/Direct.list" },
      ChinaMax: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/ChinaMax/ChinaMax.list", path: "./ruleset/ChinaMax.list" },
      ChinaMedia: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/ChinaMedia/ChinaMedia.list", path: "./ruleset/ChinaMedia.list" },
      Download: { url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Download/Download.list", path: "./ruleset/Download.list" },
      LocalAreaNetwork: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/LocalAreaNetwork.list", path: "./ruleset/LocalAreaNetwork.list" },
      UnBan: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/UnBan.list", path: "./ruleset/UnBan.list" },
      BanAD: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanAD.list", path: "./ruleset/BanAD.list" },
      BanProgramAD: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanProgramAD.list", path: "./ruleset/BanProgramAD.list" },
      GoogleFCM: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/GoogleFCM.list", path: "./ruleset/GoogleFCM.list" },
      GoogleCN: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/GoogleCN.list", path: "./ruleset/GoogleCN.list" },
      SteamCN: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/SteamCN.list", path: "./ruleset/SteamCN.list" },
      Apple: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Apple.list", path: "./ruleset/Apple.list" },
      Telegram: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Telegram.list", path: "./ruleset/Telegram.list" },
      NetEaseMusic: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/NetEaseMusic.list", path: "./ruleset/NetEaseMusic.list" },
      Epic: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Epic.list", path: "./ruleset/Epic.list" },
      Origin: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Origin.list", path: "./ruleset/Origin.list" },
      Sony: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Sony.list", path: "./ruleset/Sony.list" },
      Steam: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Steam.list", path: "./ruleset/Steam.list" },
      Nintendo: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Nintendo.list", path: "./ruleset/Nintendo.list" },
      YouTube: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/YouTube.list", path: "./ruleset/YouTube.list" },
      Netflix: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Netflix.list", path: "./ruleset/Netflix.list" },
      Bahamut: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Bahamut.list", path: "./ruleset/Bahamut.list" },
      BilibiliHMT: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/BilibiliHMT.list", path: "./ruleset/BilibiliHMT.list" },
      Bilibili: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Bilibili.list", path: "./ruleset/Bilibili.list" },
      ProxyMedia: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyMedia.list", path: "./ruleset/ProxyMedia.list" },
      ProxyGFWlist: { url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyGFWlist.list", path: "./ruleset/ProxyGFWlist.list" }
    };

    var myRuleProviders = {};
    for (var key in providersDef) {
      if (Object.prototype.hasOwnProperty.call(providersDef, key)) {
         myRuleProviders[key] = Object.assign({}, ruleProviderBase, providersDef[key]);
      }
    }
    config["rule-providers"] = myRuleProviders;

    // ==============================================================================
    // 4. 策略组 (Proxy Groups)
    // ==============================================================================
    
    if (!config.proxies) config.proxies = [];

    // 定义排除关键词
    var excludeFilter = "(?i)官网|官網|套餐|流量|测试|test|订阅|更新|维护|暂停|通知|超时|到期|剩余|重置|(([2-9]|\\d{2,})(\\.\\d+)?|1\\.[1-9])\\s*(x|×|倍)|(0\\.\\d+|0)(\\s)*(x|×|倍)|高倍|free|low|公益|低倍";
    // 定义热门地区关键词 (用于手动切换白名单)
    var hotRegionsFilter = "(?i)(香港|台湾|日本|新加坡|美国|韩国|🇭🇰|🇹🇼|🇯🇵|🇸🇬|🇺🇸|🇰🇷)";

    var groups = [
      // 🟢 第一梯队：控制中心
      {
        name: "节点选择",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
        type: "select",
        // [规范化] 狮城节点 -> 新加坡节点
        proxies: [
          "自动选择", "香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", 
          "手动切换", "低倍率节点", "其他地区", "DIRECT"
        ]
      },
      {
        name: "自动选择",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png",
        type: "url-test",
        "include-all": true,
        filter: hotRegionsFilter + "(?!.*(" + excludeFilter + "))",
        interval: 300,
        tolerance: 50
      },
      {
        name: "Google/Gemini",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
        type: "select",
        "include-all": true,
        filter: "(?i)美国|USA|States|US|🇺🇸|日本|JP|Japan|🇯🇵|台湾|TW|Taiwan|🇹🇼|新加坡|SG|Singapore|🇸🇬|韩国|KR|Korea|🇰🇷|英国|UK|🇬🇧"
      },
      {
        name: "OpenAI",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png",
        type: "select",
        // [规范化] 狮城节点 -> 新加坡节点
        proxies: [
          "Google/Gemini", "美国节点", "日本节点", "新加坡节点",
          "台湾节点", "韩国节点", "其他地区"
        ]
      },

      // 🟡 第二梯队：流媒体 & 娱乐
      {
        name: "Emby",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Emby.png",
        type: "select",
        "include-all": true,
        proxies: ["DIRECT"],
        filter: "(?i)(香港|Hong Kong|HK|🇭🇰|台湾|Taiwan|TW|🇹🇼|新加坡|Singapore|SG|狮城|🇸🇬|美国|USA|States|US|🇺🇸|韩国|Korea|KR|🇰🇷)"
      },
      {
        name: "油管视频",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png",
        type: "select",
        // [规范化] 狮城节点 -> 新加坡节点
        proxies: [
          "自动选择", "节点选择", "香港节点", "台湾节点",
          "新加坡节点", "日本节点", "美国节点", "韩国节点", "低倍率节点", "其他地区"
        ]
      },
      {
        name: "奈飞视频",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png",
        type: "select",
        // [规范化] 狮城节点 -> 新加坡节点
        proxies: [
          "自动选择", "节点选择", "新加坡节点", "香港节点",
          "台湾节点", "日本节点", "美国节点", "韩国节点", "低倍率节点", "其他地区"
        ]
      },
      {
        name: "国外媒体",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ForeignMedia.png",
        type: "select",
        // [规范化] 狮城节点 -> 新加坡节点
        proxies: [
          "自动选择", "节点选择", "香港节点", "台湾节点",
          "新加坡节点", "日本节点", "美国节点", "韩国节点", "低倍率节点", "其他地区"
        ]
      },
      {
        name: "巴哈姆特",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png",
        type: "select",
        proxies: ["台湾节点", "节点选择", "自动选择"]
      },
      {
        name: "哔哩哔哩",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png",
        type: "select",
        proxies: ["DIRECT", "台湾节点", "香港节点"]
      },
      {
        name: "网易音乐",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netease_Music.png",
        type: "select",
        "include-all": true,
        filter: "(?i)网易|音乐|Music|解锁",
        proxies: ["DIRECT", "节点选择"]
      },

      // 🔵 第三梯队：常用服务
      {
        name: "电报消息",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png",
        type: "select",
        // [规范化] 狮城节点 -> 新加坡节点
        proxies: [
          "自动选择", "节点选择", "新加坡节点", "香港节点", "台湾节点",
          "日本节点", "美国节点", "韩国节点", "其他地区"
        ]
      },
      {
        name: "微软服务",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png",
        type: "select",
        proxies: ["DIRECT", "节点选择", "美国节点", "香港节点", "台湾节点"]
      },
      {
        name: "苹果服务",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png",
        type: "select",
        proxies: ["DIRECT", "节点选择", "美国节点", "香港节点", "台湾节点"]
      },
      {
        name: "谷歌FCM",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
        type: "select",
        // [规范化] 狮城节点 -> 新加坡节点
        proxies: [
          "DIRECT", "节点选择", "美国节点", "香港节点", "台湾节点", "日本节点", "新加坡节点"
        ]
      },
      {
        name: "游戏平台",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Game.png",
        type: "select",
        proxies: ["DIRECT", "节点选择", "香港节点", "日本节点", "美国节点"]
      },

      // ⚪ 第四梯队：地区与功能仓库
      {
        name: "低倍率节点",
        icon: "https://raw.githubusercontent.com/shindgewongxj/WHATSINStash/master/icon/categorypig.png",
        type: "select",
        "include-all": true,
        filter: "(0\\.\\d+|0)(\\s)*(x|×|倍)|(?i)free|low|公益|低倍"
      },
      {
        name: "高倍率节点",
        icon: "https://raw.githubusercontent.com/shindgewongxj/WHATSINStash/master/icon/fastcloud.png",
        type: "select",
        "include-all": true,
        filter: "(?i)(([2-9]|\\d{2,})(\\.\\d+)?|1\\.[1-9])\\s*(x|×|倍)|高倍"
      },
      // 地区自动测速
      {
        name: "香港节点",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png",
        type: "url-test",
        "include-all": true,
        filter: "(?i)(香港|Hong Kong|HK|🇭🇰)(?!.*(" + excludeFilter + "))",
        interval: 300,
        tolerance: 50
      },
      {
        name: "日本节点",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png",
        type: "url-test",
        "include-all": true,
        filter: "(?i)(日本|Japan|JP|🇯🇵)(?!.*(" + excludeFilter + "))",
        interval: 300,
        tolerance: 50
      },
      {
        name: "美国节点",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png",
        type: "url-test",
        "include-all": true,
        filter: "(?i)(美国|USA|States|US|🇺🇸)(?!.*(" + excludeFilter + "|Australia|澳洲|Austria|Russia|Plus|Music))",
        interval: 300,
        tolerance: 50
      },
      {
        name: "台湾节点",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png",
        type: "url-test",
        "include-all": true,
        filter: "(?i)(台湾|Taiwan|TW|🇹🇼)(?!.*(" + excludeFilter + "))",
        interval: 300,
        tolerance: 50
      },
      // [规范化] 组名：狮城节点 -> 新加坡节点
      {
        name: "新加坡节点",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png",
        type: "url-test",
        "include-all": true,
        // Filter 保持原样以抓取所有别名
        filter: "(?i)(新加坡|狮城|Singapore|SG|🇸🇬)(?!.*(" + excludeFilter + "))",
        interval: 300,
        tolerance: 50
      },
      {
        name: "韩国节点",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png",
        type: "url-test",
        "include-all": true,
        filter: "(?i)(韩国|Korea|KR|🇰🇷)(?!.*(" + excludeFilter + "))",
        interval: 300,
        tolerance: 50
      },
      {
        name: "其他地区",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
        type: "select",
        "include-all": true,
        filter: "^(?!.*((?i)香港|Hong Kong|HK|🇭🇰|日本|Japan|JP|🇯🇵|美国|USA|States|US(?!tralia|tria)|🇺🇸|台湾|Taiwan|TW|🇹🇼|新加坡|Singapore|SG|🇸🇬|韩国|Korea|KR|🇰🇷|" + excludeFilter + ")).*$"
      },
      
      // 手动切换
      {
        name: "手动切换",
        icon: "https://testingcf.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png",
        type: "select",
        "include-all": true,
        filter: hotRegionsFilter + "(?!.*(" + excludeFilter + "))"
      },

      // 🟣 第五梯队：系统兜底
      {
        name: "国内媒体",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/DomesticMedia.png",
        type: "select",
        proxies: ["DIRECT", "香港节点", "台湾节点"]
      },
      {
        name: "全球直连",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
        type: "select",
        proxies: ["DIRECT", "节点选择"]
      },
      {
        name: "广告拦截",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png",
        type: "select",
        proxies: ["REJECT", "DIRECT"]
      },
      {
        name: "应用净化",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hijacking.png",
        type: "select",
        proxies: ["REJECT", "DIRECT"]
      },
      {
        name: "漏网之鱼",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Final.png",
        type: "select",
        proxies: [
          "节点选择", "自动选择", "DIRECT", "香港节点", "台湾节点",
          "日本节点", "美国节点"
        ]
      }
    ];

    config["proxy-groups"] = groups;

    // ==============================================================================
    // 5. 分流规则 (Rules)
    // ==============================================================================
    var rules = [
      "DST-PORT,123,全球直连",
      
      // 0. 用户自定义分区
      "DOMAIN-KEYWORD,pilipili,DIRECT",
      "DOMAIN-KEYWORD,embyplus,Emby",
      "DOMAIN-SUFFIX,cdn.bgp.yt,DIRECT",
      "DOMAIN-SUFFIX,steamtools.net,DIRECT",
      "DOMAIN-KEYWORD,steamtools,DIRECT",
      "DOMAIN-SUFFIX,challenges.clouflare.com,节点选择",
      "DOMAIN,v1.uhdnow.com,DIRECT",
      "DOMAIN-SUFFIX,rainbowsky.xyz,DIRECT",
      "DOMAIN,steamcdn-a.akamaihd.net,DIRECT",
      "DOMAIN-SUFFIX,cm.steampowered.com,DIRECT",
      "DOMAIN-SUFFIX,steamserver.net,DIRECT",

      // 1. 基础设施
      "IP-CIDR,192.168.0.0/16,全球直连,no-resolve",
      "IP-CIDR,10.0.0.0/8,全球直连,no-resolve",
      "IP-CIDR,172.16.0.0/12,全球直连,no-resolve",
      "IP-CIDR,127.0.0.0/8,全球直连,no-resolve",
      "DOMAIN,ntp.aliyun.com,全球直连",
      "DOMAIN,time.apple.com,全球直连",
      "DOMAIN,time.windows.com,全球直连",

      // 2. 直连优化
      "RULE-SET,LocalAreaNetwork,全球直连",
      "RULE-SET,Download,全球直连",
      "RULE-SET,GoogleCN,全球直连",
      "RULE-SET,SteamCN,全球直连",
      "RULE-SET,WeChat,全球直连",
      "RULE-SET,UnBan,全球直连",
      "RULE-SET,Direct,全球直连",

      // 3. 广告拦截
      "RULE-SET,BanAD,广告拦截",
      "RULE-SET,BanProgramAD,应用净化",

      // 4. Google & Gemini
      "RULE-SET,Gemini,Google/Gemini",
      "RULE-SET,Google,Google/Gemini",
      "RULE-SET,GoogleFCM,谷歌FCM",

      // 5. 热门 APP
      "RULE-SET,TikTok,国外媒体",
      "RULE-SET,Spotify,国外媒体",
      "RULE-SET,Discord,国外媒体",
      "RULE-SET,OpenAi,OpenAI",
      "RULE-SET,Microsoft,微软服务",
      "RULE-SET,Apple,苹果服务",

      // 6. 社交与媒体
      "RULE-SET,Telegram,电报消息",
      "RULE-SET,NetEaseMusic,网易音乐",
      "RULE-SET,YouTube,油管视频",
      "RULE-SET,Netflix,奈飞视频",
      "RULE-SET,Bahamut,巴哈姆特",
      "RULE-SET,BilibiliHMT,哔哩哔哩",
      "RULE-SET,Bilibili,哔哩哔哩",
      "RULE-SET,ProxyMedia,国外媒体",
      "RULE-SET,ChinaMedia,国内媒体",

      // 7. 游戏平台
      "RULE-SET,Epic,游戏平台",
      "RULE-SET,Origin,游戏平台",
      "RULE-SET,Sony,游戏平台",
      "RULE-SET,Steam,游戏平台",
      "RULE-SET,Nintendo,游戏平台",

      // 8. 兜底
      "RULE-SET,Speedtest,全球直连",
      "RULE-SET,ProxyGFWlist,节点选择",
      "RULE-SET,ChinaMax,全球直连",
      "GEOIP,CN,全球直连",
      "MATCH,漏网之鱼"
    ];

    config["rules"] = rules;

    return JSON.parse(JSON.stringify(config));

  } catch (e) {
    console.log("Overwrite Script Error: " + e);
    return config;
  }
}
