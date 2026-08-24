"use client";

import { useEffect, useMemo, useState } from "react";

type Stop = { time:string; title:string; meta:string; note?:string; place?:string; kind:"move"|"culture"|"food"|"nature"|"shopping"|"event" };
type Day = { date:string; dow:string; city:string; theme:string; accent:string; map:string; cost:string; stops:Stop[] };
type Route = { after:number; time:string; from:string; to:string; fromAddress:string; toAddress:string; line:string; detail:string; fare:string; alt:string; altFare:string; note?:string };
type Alternative = { trigger:string; title:string; detail:string; place:string; tag:"省力"|"雨天"|"延误"|"取消"|"室内" };
type Facility = "none"|"smoking"|"convenience"|"toilet"|"postoffice"|"bookstore"|"souvenir";

const days: Day[] = [
  { date:"8.28",dow:"周五",city:"关西机场 → 堺",theme:"抵达 · 港口暮色",accent:"ARRIVAL",cost:"交通约 ¥760",map:"Hotel Agora Regency Osaka Sakai",stops:[
    {time:"15:25",title:"抵达关西机场",meta:"入境、行李 · 约 65 分钟",note:"航班时间仍为暂定；若延误超过 60 分钟，直接取消港口散步。",place:"Kansai International Airport",kind:"move"},
    {time:"16:40",title:"南海机场急行 → 堺",meta:"约 45 分钟 · ¥760",note:"舒适备选：Rapi:t β。注意 α 不停堺站。",place:"Sakai Station Osaka",kind:"move"},
    {time:"17:25",title:"酒店入住",meta:"Hotel Agora Regency Osaka Sakai",place:"Hotel Agora Regency Osaka Sakai",kind:"event"},
    {time:"18:00",title:"堺旧港与旧灯塔",meta:"港湾短线 · 最晚 18:30 返程",note:"仅走旧堺灯塔短线；18:30 必须返回，预留时间回酒店参加 19:00 晚餐。",place:"Old Sakai Lighthouse",kind:"nature"},
    {time:"19:00",title:"酒店 1F 晚餐",meta:"已预订 · 预约详情见本人 Gmail",note:"按预约时间到达酒店 1 楼餐厅；公开行程不显示人数、金额、菜单或预约编号。",place:"All Day Dining & Lounge the LOOP Hotel Agora Regency Osaka Sakai",kind:"food"},
  ]},
  { date:"8.29",dow:"周六",city:"大阪",theme:"维米尔 · 动漫 · 梅田",accent:"ART DAY",cost:"交通 ¥1,200",map:"Nakanoshima Museum of Art Osaka",stops:[
    {time:"07:45",title:"从堺出发",meta:"南海 + 周末 Enjoy Eco Card",note:"Eco Card ¥620，当日地铁巴士畅行。",place:"Sakai Station Osaka",kind:"move"},
    {time:"08:40",title:"中之岛建筑散步",meta:"河岸 · 45 分钟",place:"Nakanoshima Osaka",kind:"nature"},
    {time:"10:00*",title:"维米尔《戴珍珠耳环的少女》",meta:"追加抽选已申请 · 首选 10:00 · 约 2 小时",note:"8/27 约 15:00 公布结果；备选 11:00、12:00、13:00，最终入场时间以中签通知为准。现场不售当日票。",place:"Nakanoshima Museum of Art Osaka",kind:"culture"},
    {time:"11:30",title:"中之岛午餐",meta:"避开正午暴晒",place:"Nakanoshima Osaka restaurants",kind:"food"},
    {time:"13:00",title:"日本桥电电城 + 黑门",meta:"Animate / Mandarake / 骏河屋",place:"Nipponbashi Denden Town",kind:"shopping"},
    {time:"16:30",title:"梅田城市漫游",meta:"Grand Front / LUCUA / 阪急",note:"体力有余再上梅田蓝天大厦。",place:"Umeda Osaka",kind:"shopping"},
  ]},
  { date:"8.30",dow:"周日",city:"京都 → 四日市",theme:"城与漫画 · 海上花火",accent:"FIREWORKS",cost:"交通 ¥12,520",map:"Yokkaichi Dome",stops:[
    {time:"06:30",title:"天气 / 雷电 / 铁路首检",meta:"不满足条件即取消花火",note:"官方取消、强雷暴大风、严重铁路中断或身体不适：从京都直接回堺。",kind:"event"},
    {time:"08:45",title:"二条城与二之丸御殿",meta:"门票 ¥1,300",place:"Nijo Castle Kyoto",kind:"culture"},
    {time:"10:20",title:"京都国际漫画博物馆",meta:"门票 ¥1,200",place:"Kyoto International Manga Museum",kind:"culture"},
    {time:"12:45",title:"京都御苑南侧",meta:"轻量散步 · 50 分钟",place:"Kyoto Gyoen National Garden",kind:"nature"},
    {time:"14:05",title:"京都站补给 + 二次检查",meta:"便当、水、车次与天气",place:"Kyoto Station",kind:"event"},
    {time:"15:14",title:"新干线 NOZOMI 428 → 名古屋",meta:"smart EX 已预订 · 15:48 抵达 · ¥5,710",note:"普通车 · 成人 1 名；邮件注明车次与座席将在 8/30 05:30 后最终确认。",place:"Kyoto Station",kind:"move"},
    {time:"16:22",title:"JR 名古屋 → 富田浜",meta:"17:01 抵达 · ¥680",place:"Tomidahama Station",kind:"move"},
    {time:"17:35",title:"北侧免费观赏区就位",meta:"四日市巨蛋 / 霞浦绿地东侧",note:"选靠撤离方向的位置；矶津南区仅作备选。",place:"Yokkaichi Dome",kind:"event"},
    {time:"19:15",title:"四日市花火大会",meta:"约 45 分钟",place:"Yokkaichi Dome",kind:"event"},
    {time:"20:10",title:"硬撤离：立刻离场",meta:"不逛摊、不补拍",note:"20:35 富田浜 → 20:42 JR 四日市 → 步行约 20 分钟 → 21:15 近铁四日市。",place:"Tomidahama Station",kind:"move"},
    {time:"21:59",title:"近铁特急 → 大阪难波",meta:"23:48 抵达 · 约 ¥3,800",note:"21:45 前必须进站；24:00 / 24:08 南海回堺，不赌 23:50。",place:"Kintetsu Yokkaichi Station",kind:"move"},
  ]},
  { date:"8.31",dow:"周一",city:"奈良 → 神户",theme:"古寺 · 山瀑 · 港湾",accent:"TWIN CITIES",cost:"交通 ¥4,180",map:"Todai-ji Nara",stops:[
    {time:"08:15",title:"堺 → 近铁奈良",meta:"晚起版 · ¥970",place:"Kintetsu Nara Station",kind:"move"},
    {time:"09:45",title:"兴福寺外观",meta:"30 分钟",place:"Kofuku-ji Nara",kind:"culture"},
    {time:"10:20",title:"东大寺大佛殿",meta:"门票 ¥800",place:"Todai-ji Nara",kind:"culture"},
    {time:"11:30",title:"二月堂与奈良公园",meta:"林间慢行",place:"Nigatsudo Nara",kind:"nature"},
    {time:"12:50",title:"奈良町午餐",meta:"45 分钟",place:"Naramachi Nara",kind:"food"},
    {time:"13:45",title:"奈良 → 神户三宫",meta:"约 85 分钟 · ¥1,410",place:"Kobe Sannomiya Station",kind:"move"},
    {time:"15:10",title:"北野异人馆外观 + 老咖啡馆",meta:"50 分钟",place:"Kitano Ijinkan Kobe",kind:"culture"},
    {time:"16:15",title:"布引瀑布",meta:"雨天 / 雷电 / 湿滑取消",note:"布引香草园 8/31—9/3 设备检查闭园。",place:"Nunobiki Waterfall Kobe",kind:"nature"},
    {time:"17:45",title:"美利坚公园与 Harborland",meta:"夜景 + 神户牛晚餐",place:"Meriken Park Kobe",kind:"food"},
  ]},
  { date:"9.01",dow:"周二",city:"临空城 → 关西机场",theme:"收尾购物 · 返程",accent:"DEPARTURE",cost:"交通 ¥1,010",map:"Rinku Premium Outlets",stops:[
    {time:"08:00",title:"早餐、整理行李",meta:"房内最终检查",kind:"event"},
    {time:"09:30",title:"退房",meta:"最晚 10:30 · 全部行李带走",place:"Hotel Agora Regency Osaka Sakai",kind:"event"},
    {time:"10:45",title:"堺 → 临空城",meta:"约 45 分钟 · ¥640 · 存行李",place:"Rinku Town Station",kind:"move"},
    {time:"11:30",title:"临空奥特莱斯",meta:"护照退税 / 游客券",place:"Rinku Premium Outlets",kind:"shopping"},
    {time:"15:20",title:"购物硬停止",meta:"15:25 上车去机场",place:"Rinku Town Station",kind:"event"},
    {time:"15:40",title:"机场手续",meta:"值机、托运、安检；T2 需接驳",note:"仅在手续后仍余 2.5 小时以上时考虑休息室；航班约 19:30，仍待确认。",place:"Kansai International Airport",kind:"move"},
  ]},
];

const routes:Route[][]=[
  [
    {after:0,time:"约 45 分",from:"关西机场 T1 南海关西机场站",to:"南海堺站西口",fromAddress:"関西空港駅（南海）, 〒549-0011 大阪府泉南郡田尻町泉州空港中1",toAddress:"南海 堺駅 西口, 〒590-0985 大阪府堺市堺区戎島町3丁22-1",line:"南海机场急行",detail:"直达 · 无需换乘",fare:"¥760",alt:"Rapi:t β 指定席 · 更舒适、约 35 分",altFare:"¥1,410",note:"Rapi:t α 不停堺站。"},
    {after:2,time:"步行 18 分",from:"Hotel Agora Regency 正门",to:"旧堺灯塔",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"旧堺燈台, 〒590-0974 大阪府堺市堺区大浜北町5丁1",line:"步行",detail:"沿港湾西行",fare:"¥0",alt:"出租车 · 约 5 分",altFare:"约 ¥900"},
    {after:3,time:"步行约 20 分",from:"旧堺灯塔",to:"酒店 1F the LOOP",fromAddress:"旧堺燈台, 〒590-0974 大阪府堺市堺区大浜北町5丁1",toAddress:"All Day Dining & Lounge the LOOP, ホテル アゴーラ リージェンシー 大阪堺 1F, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"步行",detail:"经大浜公园返回；18:30 前离开灯塔",fare:"¥0",alt:"出租车 · 约 5 分",altFare:"约 ¥800",note:"19:00 已预约，迟到超过 20 分钟可能被取消。"},
  ],
  [
    {after:0,time:"约 50 分",from:"南海堺站西口",to:"大阪中之岛美术馆正门",fromAddress:"南海 堺駅 西口, 〒590-0985 大阪府堺市堺区戎島町3丁22-1",toAddress:"大阪中之島美術館, 〒530-0005 大阪府大阪市北区中之島4丁目3-1",line:"南海本线 → Osaka Metro",detail:"难波换乘御堂筋线至淀屋桥，再步行至馆",fare:"南海 ¥290 + 通票覆盖",alt:"全程按次付费",altFare:"约 ¥530"},
    {after:3,time:"约 20 分",from:"大阪中之岛美术馆",to:"Animate 大阪日本桥店",fromAddress:"大阪中之島美術館, 〒530-0005 大阪府大阪市北区中之島4丁目3-1",toAddress:"アニメイト大阪日本橋, 〒556-0005 大阪府大阪市浪速区日本橋4丁目10-6",line:"步行 → Osaka Metro",detail:"肥后桥 / 淀屋桥方向进站，至难波或日本桥",fare:"通票覆盖",alt:"按次购买地铁票",altFare:"约 ¥240"},
    {after:4,time:"约 15 分",from:"Animate 大阪日本桥店",to:"Grand Front Osaka 南馆",fromAddress:"アニメイト大阪日本橋, 〒556-0005 大阪府大阪市浪速区日本橋4丁目10-6",toAddress:"グランフロント大阪 南館, 〒530-0011 大阪府大阪市北区大深町4-20",line:"步行 → Osaka Metro 御堂筋线",detail:"难波 → 梅田",fare:"通票覆盖",alt:"按次购买地铁票",altFare:"约 ¥240"},
    {after:5,time:"约 40 分",from:"Grand Front Osaka 南馆",to:"Hotel Agora Regency 正门",fromAddress:"グランフロント大阪 南館, 〒530-0011 大阪府大阪市北区大深町4-20",toAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"Metro → 南海本线",detail:"梅田 → 难波换乘，堺站西口出站",fare:"通票覆盖 + 南海 ¥290",alt:"JR 大阪环状线 → 新今宫 → 南海",altFare:"约 ¥510"},
  ],
  [
    {after:0,time:"约 85 分",from:"Hotel Agora Regency 正门",to:"二条城东大手门",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"元離宮二条城 東大手門, 〒604-8301 京都府京都市中京区二条城町541",line:"南海 → Metro → JR / 地铁",detail:"难波、京都站方向换乘",fare:"约 ¥1,110",alt:"南海 → 难波 → 近铁京都 → 地铁",altFare:"约 ¥1,300"},
    {after:1,time:"步行 18 分",from:"二条城东大手门",to:"京都国际漫画博物馆正门",fromAddress:"元離宮二条城 東大手門, 〒604-8301 京都府京都市中京区二条城町541",toAddress:"京都国際マンガミュージアム, 〒604-0846 京都府京都市中京区金吹町452",line:"步行",detail:"沿押小路通向乌丸御池",fare:"¥0",alt:"地铁 二条城前 → 乌丸御池",altFare:"¥220"},
    {after:4,time:"34 分",from:"JR 京都站新干线中央口",to:"JR 名古屋站新干线口",fromAddress:"JR京都駅 新幹線中央口, 〒600-8214 京都府京都市下京区東塩小路高倉町8-3",toAddress:"JR名古屋駅 新幹線口, 〒450-0002 愛知県名古屋市中村区名駅1丁目1-4",line:"东海道新干线 NOZOMI 428",detail:"15:14 → 15:48 · smart EX 已预订",fare:"¥5,710",alt:"后续 NOZOMI / HIKARI 指定席",altFare:"按改签时显示价格",note:"普通车 · 成人 1 名；车次与座席将在 8/30 05:30 后最终确认。"},
    {after:5,time:"39 分",from:"JR 名古屋站关西本线月台",to:"JR 富田浜站",fromAddress:"JR名古屋駅, 〒450-0002 愛知県名古屋市中村区名駅1丁目1-4",toAddress:"JR富田浜駅, 〒510-8008 三重県四日市市富田浜町",line:"JR 关西本线",detail:"16:22 → 17:01",fare:"¥680",alt:"近铁名古屋 → 近铁富田 + 步行",altFare:"约 ¥760"},
    {after:6,time:"步行 34 分",from:"JR 富田浜站",to:"四日市巨蛋北侧入口",fromAddress:"JR富田浜駅, 〒510-8008 三重県四日市市富田浜町",toAddress:"四日市ドーム, 〒510-0012 三重県四日市市大字羽津甲5169",line:"官方步行路线",detail:"沿霞浦绿地水道东侧",fare:"¥0",alt:"矶津南侧免费区",altFare:"交通另计"},
    {after:9,time:"约 65 分",from:"四日市巨蛋北侧观赏区",to:"近铁四日市站北口",fromAddress:"四日市ドーム, 〒510-0012 三重県四日市市大字羽津甲5169",toAddress:"近鉄四日市駅 北口, 〒510-0075 三重県四日市市安島1丁目1-56",line:"步行 → JR → 步行",detail:"20:35 富田浜 / 20:42 JR 四日市 / 21:15 近铁",fare:"JR ¥190",alt:"20:30 富田浜早一班",altFare:"¥190",note:"JR 四日市中转点：〒510-0093 三重県四日市市本町3-85；不依赖出租车。"},
    {after:10,time:"109 分",from:"近铁四日市站北口",to:"Hotel Agora Regency 正门",fromAddress:"近鉄四日市駅 北口, 〒510-0075 三重県四日市市安島1丁目1-56",toAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"近铁特急 → 南海本线",detail:"大阪难波 23:48 到；24:00 / 24:08 南海回堺",fare:"约 ¥4,090",alt:"若错过 21:59，立刻咨询站员末班组合",altFare:"价格随车次",note:"大阪难波换乘点：〒542-0076 大阪府大阪市中央区難波4丁目1-17；不赌 23:50 南海。"},
  ],
  [
    {after:0,time:"约 70 分",from:"Hotel Agora Regency 正门",to:"近铁奈良站 1号出口",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"近鉄奈良駅 1番出口, 〒630-8215 奈良県奈良市東向中町29",line:"南海 → 近铁奈良线",detail:"大阪难波换乘 · 快速急行优先",fare:"¥970",alt:"南海 → JR 新今宫 → JR 奈良",altFare:"约 ¥1,050"},
    {after:4,time:"约 85 分",from:"近铁奈良站 1号出口",to:"阪神神户三宫站东口",fromAddress:"近鉄奈良駅 1番出口, 〒630-8215 奈良県奈良市東向中町29",toAddress:"阪神 神戸三宮駅 東口, 〒651-0088 兵庫県神戸市中央区小野柄通8丁目1-8",line:"近铁奈良线 → 阪神本线",detail:"多数班次大阪难波贯通",fare:"约 ¥1,410",alt:"JR 奈良 → 大阪 → 三之宫",altFare:"约 ¥1,740"},
    {after:6,time:"约 15 分",from:"北野异人馆街 Rhine House",to:"JR 新神户站 1F",fromAddress:"ラインの館, 〒650-0002 兵庫県神戸市中央区北野町2丁目10-24",toAddress:"JR新神戸駅, 〒650-0001 兵庫県神戸市中央区加納町1丁目3-1",line:"步行或巴士",detail:"上坡，留意体力；瀑布从新神户站后方进入",fare:"巴士 ¥210",alt:"出租车到新神户站",altFare:"约 ¥800"},
    {after:7,time:"约 30 分",from:"JR 新神户站 1F",to:"Kobe Harborland umie Mosaic",fromAddress:"JR新神戸駅, 〒650-0001 兵庫県神戸市中央区加納町1丁目3-1",toAddress:"神戸ハーバーランドumie モザイク, 〒650-0044 兵庫県神戸市中央区東川崎町1丁目6-1",line:"地铁 → JR / 步行",detail:"三宫或元町换乘",fare:"约 ¥280",alt:"City Loop / Port Loop 巴士",altFare:"约 ¥260"},
    {after:8,time:"约 90 分",from:"阪神神户三宫站东口",to:"Hotel Agora Regency 正门",fromAddress:"阪神 神戸三宮駅 東口, 〒651-0088 兵庫県神戸市中央区小野柄通8丁目1-8",toAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"阪神 → 南海",detail:"大阪难波换乘",fare:"约 ¥710",alt:"JR 三之宫 → 新今宫 → 南海",altFare:"约 ¥940"},
  ],
  [
    {after:1,time:"约 45 分",from:"Hotel Agora Regency 正门",to:"临空城站 2号出口",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"りんくうタウン駅 2番出口, 〒598-0048 大阪府泉佐野市りんくう往来北1",line:"南海本线 → 空港线",detail:"从酒店直连堺站西口；泉佐野方向，部分车次换乘",fare:"约 ¥640",alt:"南海机场急行至临空城",altFare:"同级约 ¥640"},
    {after:4,time:"6 分",from:"临空城站 2号出口",to:"关西机场 T1 4F 国际出发层",fromAddress:"りんくうタウン駅 2番出口, 〒598-0048 大阪府泉佐野市りんくう往来北1",toAddress:"関西国際空港 第1ターミナル 4F 国際線出発, 〒549-0001 大阪府泉佐野市泉州空港北1",line:"JR / 南海空港线",detail:"15:25 → 15:31；下车后按航站楼标识移动",fare:"¥370",alt:"出租车 · 约 15 分",altFare:"约 ¥3,500",note:"若为 T2，抵达 T1 后还需前往 Aeroplaza 1F 搭免费接驳车。"},
  ],
];

const alternatives:Alternative[][]=[
  [
    {trigger:"航班晚点 ≥ 60 分",title:"酒店入住后只在堺站周边晚餐",detail:"取消旧港步行，把体力留给第二天；PLATPLAT 商场与车站餐饮最省力。",place:"PLATPLAT Sakai Osaka",tag:"延误"},
    {trigger:"下雨或闷热",title:"PLATPLAT 室内补给",detail:"从酒店与堺站步行可达，完成晚餐、便利补给后直接休息。",place:"PLATPLAT Sakai Osaka",tag:"雨天"},
    {trigger:"状态很好",title:"大浜公园短线替代完整港湾线",detail:"只走公园与旧灯塔往返，不继续向远处延伸，控制在 45 分钟内。",place:"Ohama Park Sakai",tag:"省力"},
  ],
  [
    {trigger:"维米尔未中签",title:"大阪市立科学馆 + 中之岛室内线",detail:"科学馆 8/29 开馆，9:30—17:00；可替换美术馆时段，仍保持中之岛动线。",place:"Osaka Science Museum",tag:"室内"},
    {trigger:"高温或暴雨",title:"日本桥缩短，提前进入梅田商场",detail:"Animate / Mandarake 选一至两家，随后转 Grand Front、LUCUA、阪急室内活动。",place:"Grand Front Osaka",tag:"雨天"},
    {trigger:"脚力不足",title:"中之岛后直达梅田",detail:"跳过日本桥，把下午集中给午餐、购物与咖啡；减少一次跨城移动。",place:"Umeda Osaka",tag:"省力"},
  ],
  [
    {trigger:"花火官方取消",title:"京都铁路博物馆后直接回堺",detail:"博物馆 10:00—17:00；放弃名古屋与四日市长途段，傍晚从京都返程。",place:"Kyoto Railway Museum",tag:"取消"},
    {trigger:"京都高温",title:"取消京都御苑，京都站提前休整",detail:"二条城与漫画博物馆结束后直接去京都站，补水、吃午餐并做天气二次检查。",place:"Kyoto Station",tag:"省力"},
    {trigger:"铁路异常或身体不适",title:"京都站终止跨区行程",detail:"不前往名古屋、富田浜与花火会场，改走最稳妥的京都—大阪—堺返程。",place:"Kyoto Station",tag:"取消"},
  ],
  [
    {trigger:"奈良高温",title:"奈良公园缩短 + NARANICLE 休整",detail:"保留东大寺，取消二月堂长线；到三条通观光中心补水、用餐后前往神户。",place:"NARANICLE Nara",tag:"省力"},
    {trigger:"神户下雨",title:"取消布引瀑布，改 Harborland umie",detail:"北野结束后直接去海港商场，用室内购物、咖啡与晚餐替代湿滑山路。",place:"Kobe Harborland umie",tag:"雨天"},
    {trigger:"前一晚太晚或疲劳",title:"只选奈良或神户一城",detail:"优先保留东大寺奈良线；若想购物与夜景，则中午直接前往神户。",place:"Kintetsu Nara Station",tag:"省力"},
  ],
  [
    {trigger:"暴雨",title:"临空 SEACLE 室内线",detail:"车站直结，10:00—20:00；减少奥特莱斯露天步行，仍可用餐和补买日用品。",place:"Rinku Pleasure Town Seacle",tag:"雨天"},
    {trigger:"行李或体力负担大",title:"提早前往关西机场",detail:"放弃购物，把时间用于值机、吃饭与航站楼移动；尤其适合 T2 航班。",place:"Kansai International Airport",tag:"省力"},
    {trigger:"购物提前完成",title:"临空公园看海 30 分钟",detail:"天气舒适且时间充足时短暂停留；15:20 购物硬停止不变。",place:"Rinku Park Osaka",tag:"省力"},
  ],
];

const labels:Record<Stop["kind"],string>={move:"交通",culture:"人文",food:"美食",nature:"自然",shopping:"购物",event:"关键"};
const mapsUrl=(query:string)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const directionsUrl=(from:string,to:string)=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=transit`;
const facilityLabels:Record<Facility,{label:string;query:string;icon:string}>={
  none:{label:"地点 / 路线",query:"",icon:"⌖"},smoking:{label:"吸烟所",query:"喫煙所",icon:"🚬"},convenience:{label:"便利店",query:"コンビニ",icon:"▣"},toilet:{label:"公共卫生间",query:"公衆トイレ",icon:"WC"},postoffice:{label:"邮局",query:"郵便局",icon:"〒"},bookstore:{label:"书店",query:"書店",icon:"本"},souvenir:{label:"明信片 / 周边",query:"ポストカード お土産 グッズ",icon:"✦"},
};
const checklist=[
  ["vermeer","维米尔追加抽选已提交","已完成"],
  ["result","8/27 约 15:00 查抽选结果并保存 QR","P0"],
  ["loop-dinner","8/28 19:00 到酒店 1F 用餐","已预订"],
  ["trains","新干线已订；继续预订 8/30 近铁特急 21:59","P0"],
  ["flight","补齐往返航班、航站楼与值机信息","P0"],
  ["beef","按需预约神户牛晚餐","可选"],
  ["weather","出发前 7 天检查台风、花火公告与车次","7 DAYS"],
  ["offline","下载离线地图、保存酒店地址与本页","1 DAY"],
  ["gear","证件、双卡、eSIM、充电宝、雨具与补水","1 DAY"],
] as const;
const sources=[
  ["维米尔展票务","https://vermeer2026.exhibit.jp/tickets/"],["四日市花火官方","https://kankou43yokkaichi.com/hanabi/"],["免费区交通说明","https://kankou43yokkaichi.com/hanabi/access/no_ticket/"],["二条城票价","https://nijo-jocastle.city.kyoto.lg.jp/admission/fee/?lang=en"],["京都漫画博物馆","https://kyotomm.jp/en/opentime-cost/"],["关西机场休息室","https://www.kansai-airport.or.jp/en/service/lounge/credit-card"]
];
const bookings=[
  {day:"8.28",level:"已预订",title:"酒店 1F 晚餐",time:"19:00",detail:"预约已确认；人数、金额、菜单和预约编号仅保留在本人 Gmail 邮件中。",price:"详情不公开",links:[["查看预约邮件（需登录本人 Gmail）","https://mail.google.com/mail/#all/1a022be191cb3766"],["餐厅官方页面","https://www.agoraregency-sakai.com/restaurants/loop/"]]},
  {day:"8.29",level:"已申请",title:"维米尔追加抽选",time:"首选 10:00 · 备选 11:00 / 12:00 / 13:00",detail:"追加抽选已提交；8/27 约 15:00 公布结果。中签后保存电子票与入场时段；现场不售当日票。",price:"一般 ¥3,000 / 学生 ¥1,500",links:[["票务与结果说明","https://vermeer2026.exhibit.jp/tickets/"],["展览规则","https://vermeer2026.exhibit.jp/overview/"]]},
  {day:"8.30",level:"已预订",title:"京都 → 名古屋 新干线",time:"NOZOMI 428 · 15:14—15:48",detail:"smart EX · 普通车 · 成人 1 名。邮件注明车次与座席将在 8/30 05:30 后最终确认，请当天早晨复核。",price:"已付 ¥5,710",links:[["SmartEX 管理预订","https://shinkansen2.jr-central.co.jp/RSV_P/S_smart_en_index.htm"],["乘车指南","https://smart-ex.jp/en/"]]},
  {day:"8.30",level:"必须",title:"近铁四日市 → 大阪难波",time:"近铁特急 · 21:59—23:48",detail:"特急券从乘车日前 1 个月的 10:30 起售；基本车资另付。",price:"合计约 ¥3,800",links:[["近铁特急官方购票","https://www.ticket.kintetsu.co.jp/vs/en/T/TZZ/TZZ10.do?op=tDisplayVisitorMenu"],["车次查询","https://eki.kintetsu.co.jp/norikae/T7?dw=1&sf=4104&tx=1-9122"]]},
  {day:"8.30",level:"建议",title:"二条城 + 二之丸御殿",time:"08:45 入场",detail:"二之丸无需预约，但提前买 Web Ticket 可减少现场排队；本丸御殿则必须预约，本计划不进入本丸。",price:"¥1,300",links:[["官方票务说明 / 购票","https://nijo-jocastle.city.kyoto.lg.jp/admission/ticket/?lang=en"]]},
  {day:"8.30",level:"建议",title:"京都国际漫画博物馆",time:"10:20 入场",detail:"普通参观可现场购票；官网提供个人电子票，适合提前保存。",price:"¥1,200",links:[["个人电子票","https://www.e-tix.jp/kyotomm/en/"],["开放时间与票价","https://kyotomm.jp/en/opentime-cost/"]]},
  {day:"8.31",level:"建议",title:"神户牛晚餐",time:"17:45—20:00",detail:"尚未指定餐厅；先从神户牛官方认证餐厅筛选，再进入各店预约页锁定 18:30 左右。",price:"按餐厅套餐",links:[["神户牛官方餐厅指南","https://kobebeef-org.jp/"],["Google Maps 餐厅列表","https://www.google.com/maps/search/?api=1&query=Kobe+beef+official+restaurant+Harborland"]]},
  {day:"8.29",level:"可选",title:"梅田蓝天大厦",time:"16:30 后视体力",detail:"不是行程硬点；决定登顶后再购票即可。大阪周游卡仅在规定时段免费，购买前核对当日规则。",price:"以官网当日票价为准",links:[["官方购票与营业信息","https://www.skybldg.co.jp/en/observatory/"]]},
  {day:"8.28",level:"可选",title:"Rapi:t β 舒适升级",time:"关西机场 → 堺",detail:"仅选 β；α 不停堺。若使用机场急行则无需预订。",price:"普通席约 ¥1,410",links:[["南海 Rapi:t 官方","https://www.howto-osaka.com/en/rapit/"],["HopeGoo 购票","https://www.hopegoo.com/zh-hk/shelves/?spu=SPU1871913195475755008"]]},
  {day:"现场",level:"无需",title:"东大寺、奈良巴士与花火免费区",time:"按当天节奏",detail:"东大寺大佛殿与奈良巴士可现场购票；四日市北侧免费观赏区不售票，只需持续检查官方公告。",price:"东大寺 ¥800 / 巴士 ¥600",links:[["东大寺参拜信息","https://www.todaiji.or.jp/"],["奈良巴士 Pass","https://www.narakotsu.co.jp/language/en/pass.html"],["花火免费区官方说明","https://kankou43yokkaichi.com/hanabi/access/no_ticket/"]]},
] as const;

export default function Home(){
  const [activeDay,setActiveDay]=useState(0); const [filter,setFilter]=useState("all"); const [selected,setSelected]=useState("s-0"); const [facility,setFacility]=useState<Facility>("none"); const [routeEnd,setRouteEnd]=useState<"from"|"to">("from"); const [fireMode,setFireMode]=useState(false); const [student,setStudent]=useState(true); const [shopping,setShopping]=useState(0); const [checked,setChecked]=useState<string[]>([]); const day=days[activeDay];
  useEffect(()=>{try{setChecked(JSON.parse(localStorage.getItem("kansai-checks")||"[]"));setShopping(Number(localStorage.getItem("kansai-shopping")||0))}catch{}},[]);
  useEffect(()=>{localStorage.setItem("kansai-checks",JSON.stringify(checked));localStorage.setItem("kansai-shopping",String(shopping))},[checked,shopping]);
  const visible=useMemo(()=>day.stops.map((s,i)=>({s,i})).filter(({s})=>filter==="all"||s.kind===filter),[day,filter]);
  const daysLeft=Math.max(0,Math.ceil((new Date("2026-08-28T00:00:00+09:00").getTime()-Date.now())/86400000));
  const selectedRoute=selected.startsWith("r-")?routes[activeDay][Number(selected.slice(2))]:undefined;
  const selectedStop=selected.startsWith("s-")?day.stops[Number(selected.slice(2))]:undefined;
  const selectedAlternative=selected.startsWith("a-")?alternatives[activeDay][Number(selected.slice(2))]:undefined;
  const routeAnchor=selectedRoute?(routeEnd==="from"?selectedRoute.fromAddress:selectedRoute.toAddress):"";
  const mapAnchor=selectedRoute?routeAnchor:(selectedAlternative?.place||selectedStop?.place||selectedStop?.title||day.map);
  const facilitySearch=facility==="none"?"":`${facilityLabels[facility].query} near ${mapAnchor}`;
  const mapLabel=facility!=="none"?`${facilityLabels[facility].label} · ${mapAnchor}`:selectedRoute?`${selectedRoute.from} → ${selectedRoute.to}`:(selectedAlternative?.title||selectedStop?.place||selectedStop?.title||day.map);
  const embed=facility!=="none"?`https://www.google.com/maps?q=${encodeURIComponent(facilitySearch)}&output=embed`:selectedRoute?`https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(selectedRoute.fromAddress)}&daddr=${encodeURIComponent(selectedRoute.toAddress)}&dirflg=r`:`https://www.google.com/maps?q=${encodeURIComponent(mapAnchor)}&output=embed`;
  const externalMap=facility!=="none"?mapsUrl(facilitySearch):selectedRoute?directionsUrl(selectedRoute.fromAddress,selectedRoute.toAddress):mapsUrl(mapAnchor);
  const selectMapItem=(id:string)=>{setSelected(id);setFacility("none");setRouteEnd("from")};
  return <main>
    <section className="hero" id="top"><div className="rail-line" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <nav className="topbar" aria-label="主导航"><a className="brand" href="#top"><span className="brand-mark">関</span><span>关西盛夏<br/><small>TRIP FILE 026</small></span></a><div className="navlinks"><a href="#journey">行程</a><a href="#map">地图</a><a href="#booking">预订</a><a href="#budget">通票</a><a href="#prep">准备</a></div><div className="status-dot"><span/> 行程已定稿</div></nav>
      <div className="hero-grid"><div className="hero-copy"><p className="eyebrow">OSAKA · KYOTO · YOKKAICHI · NARA · KOBE</p><h1>沿着铁路线，<br/><em>穿过关西盛夏。</em></h1><p className="hero-lede">5 天 · 5 城 · 1 场海上花火。把美术馆、古城、漫画、山瀑与港湾夜色，收进一张可以随身使用的路线图。</p><div className="hero-actions"><a className="button primary" href="#journey">打开每日行程 <span>↘</span></a><button className="button ghost" onClick={()=>setFireMode(true)}>花火撤离模式 <span>20:10</span></button></div></div>
        <aside className="ticket" aria-label="旅行信息"><div className="ticket-head"><span>旅 行 券</span><b>KIX / 0828</b></div><div className="ticket-body"><div><small>出发</small><strong>08.28</strong><span>FRI</span></div><div className="ticket-arrow">→</div><div><small>返程</small><strong>09.01</strong><span>TUE</span></div></div><div className="ticket-foot"><div><small>BASE</small><b>SAKAI</b></div><div><small>TRAVELER</small><b>01</b></div><div><small>DAYS TO GO</small><b>{daysLeft}</b></div></div><div className="barcode" aria-hidden="true"/></aside>
      </div><div className="hero-note"><b>旅行基地</b><span>Hotel Agora Regency Osaka Sakai</span><a href={mapsUrl("Hotel Agora Regency Osaka Sakai")} target="_blank" rel="noreferrer">Google Maps ↗</a></div>
    </section>
    <section className="journey" id="journey"><div className="section-heading"><div><p className="eyebrow dark">DAILY ROUTE / 每日路线</p><h2>五日，五种关西表情</h2></div><p>点击日期切换当天路线；用标签筛选想看的段落。所有地点都可以直接在 Google Maps 中打开。</p></div>
      <div className="day-tabs" role="tablist" aria-label="选择日期">{days.map((d,i)=><button key={d.date} role="tab" aria-selected={activeDay===i} className={activeDay===i?"active":""} onClick={()=>{setActiveDay(i);setFilter("all");setSelected("s-0");setFacility("none");setRouteEnd("from")}}><small>DAY {i+1}</small><b>{d.date}</b><span>{d.dow}</span></button>)}</div>
      <div className="day-title"><div><span className="day-index">0{activeDay+1}</span><div><p>{day.city}</p><h3>{day.theme}</h3></div></div><div className="day-meta"><span>{day.accent}</span><b>{day.cost}</b></div></div>
      <div className="filter-row" aria-label="筛选行程类型">{[["all","全部"],["culture","人文"],["nature","自然"],["shopping","购物"],["food","美食"],["move","交通"],["event","关键"]].map(([v,l])=><button key={v} className={filter===v?"active":""} onClick={()=>setFilter(v)}>{l}</button>)}</div>
      <section className="alternative-block" aria-labelledby="alternative-title"><div className="alternative-head"><div><small>PLAN B / 当日备选</small><h4 id="alternative-title">根据天气、体力和延误切换</h4></div><p>点击任一方案可在右侧地图定位；它们是替换项，不会自动叠加到主行程。</p></div><div className="alternative-grid">{alternatives[activeDay].map((item,i)=><button key={item.title} className={`alternative-card ${selected===`a-${i}`?"selected":""}`} onClick={()=>selectMapItem(`a-${i}`)}><span className={`alternative-tag tag-${item.tag}`}>{item.tag}</span><small>{item.trigger}</small><b>{item.title}</b><p>{item.detail}</p><em>地图定位 ↗</em></button>)}</div></section>
      <div className="journey-grid"><div className="timeline">{visible.map(({s:stop,i})=><div key={`${stop.time}-${stop.title}`}>
        <article role="button" tabIndex={0} aria-pressed={selected===`s-${i}`} className={`stop stop-${stop.kind} ${selected===`s-${i}`?"selected":""}`} onClick={()=>selectMapItem(`s-${i}`)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")selectMapItem(`s-${i}`)}}><time>{stop.time}</time><div className="dot" aria-hidden="true"/><div className="stop-card"><div className="stop-top"><span>{labels[stop.kind]} · 点击定位</span>{stop.place&&<a onClick={e=>e.stopPropagation()} href={mapsUrl(stop.place)} target="_blank" rel="noreferrer">地图 ↗</a>}</div><h4>{stop.title}</h4><p>{stop.meta}</p>{stop.place&&<div className="facility-mini"><span>🚬 吸烟所</span><span>▣ 便利店</span><span>WC 卫生间</span><span>〒 邮局</span><span>本 书店</span><span>✦ 明信片 / 周边</span><small>选中后在地图查询</small></div>}{stop.note&&<div className="stop-note">{stop.note}</div>}</div></article>
        {(filter==="all"||filter==="move")&&routes[activeDay].map((route,ri)=>route.after===i&&<button key={`${route.from}-${route.to}`} className={`route-card ${selected===`r-${ri}`?"selected":""}`} onClick={()=>selectMapItem(`r-${ri}`)}><span className="route-icon">乗</span><span className="route-main"><small>{route.time} · 点击显示精确路线</small><b>{route.from}<i>→</i>{route.to}</b><span className="route-addresses"><span><mark>起</mark>{route.fromAddress}</span><span><mark>终</mark>{route.toAddress}</span></span><em>{route.line} · {route.detail}</em><span className="route-facilities">精确地址附近设施：🚬 · ▣ · WC · 〒 · 本 · ✦</span></span><span className="route-price"><small>主方案</small><b>{route.fare}</b></span><span className="route-alt"><small>备选</small><b>{route.alt}</b><em>{route.altFare}</em>{route.note&&<strong>{route.note}</strong>}</span></button>)}
      </div>)}</div>
        <aside className="map-panel" id="map"><div className="map-head"><div><small>{facility!=="none"?"LIVE FACILITIES · 实时设施":selectedRoute?"TRANSIT ROUTE · 精确路线":"GOOGLE MAPS · 行程点位"}</small><b>{mapLabel}</b></div><a href={externalMap} target="_blank" rel="noreferrer">在 Google Maps 打开 ↗</a></div>{selectedRoute&&<><div className="route-end-toggle" aria-label="选择路线设施查询端点"><button className={routeEnd==="from"?"active":""} onClick={()=>{setRouteEnd("from");setFacility("none")}}>起点 · {selectedRoute.from}</button><button className={routeEnd==="to"?"active":""} onClick={()=>{setRouteEnd("to");setFacility("none")}}>终点 · {selectedRoute.to}</button></div><div className="map-precise-address"><span><b>起点地址</b>{selectedRoute.fromAddress}</span><span><b>终点地址</b>{selectedRoute.toAddress}</span></div></>}<div className="facility-tabs" aria-label="附近设施地图图层">{(Object.keys(facilityLabels) as Facility[]).map(key=><button key={key} className={facility===key?"active":""} aria-pressed={facility===key} onClick={()=>setFacility(key)}><span>{facilityLabels[key].icon}</span>{facilityLabels[key].label}</button>)}</div><p className="facility-note">路线与设施查询均使用上方精确地址；吸烟只使用明确标识的喫煙所，现场开放状态以当日为准。</p><iframe key={embed} title={`${mapLabel} Google 地图`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><div className="map-foot"><span className="pulse"/> 已与左侧选中项联动 · {mapLabel}</div>{selectedRoute&&<div className="map-route-summary"><span>{selectedRoute.line}</span><b>{selectedRoute.time}</b><strong>{selectedRoute.fare}</strong><p>备选：{selectedRoute.alt} · {selectedRoute.altFare}</p></div>}{selectedAlternative&&<div className="map-alt-summary"><small>{selectedAlternative.tag} · {selectedAlternative.trigger}</small><b>{selectedAlternative.title}</b><p>{selectedAlternative.detail}</p></div>}</aside>
      </div>
    </section>
    <section className="booking" id="booking"><div className="booking-head"><div><p className="eyebrow">BOOKING DESK / 预订中心</p><h2>该订的，<br/>都在这里。</h2></div><p>按优先级集中所有购票与预约入口。点击按钮会打开对应的官方或指定平台页面；航班承运人尚未补齐，因此暂不能提供值机入口。</p></div><div className="booking-grid">{bookings.map((item,i)=><article key={item.title} className={`booking-card level-${item.level}`}><div className="booking-no">{String(i+1).padStart(2,"0")}</div><div className="booking-copy"><div className="booking-tags"><span>{item.level}</span><small>{item.day}</small></div><h3>{item.title}</h3><b>{item.time}</b><p>{item.detail}</p><strong>{item.price}</strong><div className="booking-links">{item.links.map(([label,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{label} ↗</a>)}</div></div></article>)}</div></section>
    <section className="overview" id="overview"><div><p className="eyebrow">TRIP AT A GLANCE</p><h2>一眼掌握<br/>整个旅程</h2></div><div className="metric"><strong>¥19,130</strong><span>预计交通</span></div><div className="metric"><strong>¥{(43930+(student?0:1500)+shopping).toLocaleString()}</strong><span>当前总预算*</span></div><div className="metric"><strong>5</strong><span>旅行日</span></div><p className="overview-note">* 不含机票与酒店，已计入下方自定义购物预算。</p></section>
    <section className="planning" id="budget">
      <div className="planning-head"><p className="eyebrow dark">MONEY & MOBILITY</p><h2>钱花在哪里，<br/>一目了然。</h2></div>
      <div className="budget-card"><div className="budget-total"><small>预计总额</small><strong>¥{(43930+(student?0:1500)+shopping).toLocaleString()}</strong><span>不含机酒</span></div><div className="bars"><div><span>餐饮 ¥21,500</span><i style={{width:"47%"}}/></div><div><span>交通 ¥19,130</span><i style={{width:"42%"}}/></div><div><span>门票 ¥{student?"4,800":"6,300"}</span><i style={{width:"14%"}}/></div></div><label className="toggle"><input type="checkbox" checked={student} onChange={e=>setStudent(e.target.checked)}/><span/> 使用维米尔学生票（需有效学生证）</label><label className="shop-input">购物预留 <span>¥</span><input type="number" min="0" step="1000" value={shopping} onChange={e=>setShopping(Math.max(0,Number(e.target.value)))}/></label></div>
      <div className="passes-head"><div><small>PASS SELECTOR</small><h3>通票与周游券判断</h3></div><p>价格按 2026 年官方信息整理；特急指定席通常需要另付费用。</p></div>
      <div className="pass-grid">
        <article className="chosen"><span className="pass-status">推荐 · 8/29</span><b>Enjoy Eco Card</b><strong>¥620 <small>官方周末价</small></strong><p>覆盖大阪 Metro 与 Osaka City Bus；南海堺—难波仍另付往返 ¥580。</p><div className="seller-prices"><a href="https://www.hopegoo.com/zh-hk/shelves?spu=SPU1957362140442828800" target="_blank" rel="noreferrer"><span>HopeGoo 同类 QR 票</span><b>HK$63 起</b></a><a href="https://www.klook.com/zh-HK/activity/11515-osaka-metro-pass/" target="_blank" rel="noreferrer"><span>Klook 地铁＋巴士 1日</span><b>HK$50</b></a></div><a href="https://subway.osakametro.co.jp/guide/page/enjoy-eco.php" target="_blank" rel="noreferrer">官方说明 ↗</a></article>
        <article><span className="pass-status conditional">基础工具</span><b>ICOCA</b><strong>¥2,000 <small>含 ¥500 押金</small></strong><p>不提供折扣，但最适合本行程的多运营商零散车费；初始可用余额 ¥1,500。</p><a href="https://www.westjr.co.jp/global/en/howto/icoca/" target="_blank" rel="noreferrer">官方说明 ↗</a></article>
        <article><span className="pass-status no">不推荐</span><b>Osaka Amazing Pass</b><strong>¥3,500 <small>1 日 / 2 日 ¥5,000</small></strong><p>维米尔特别展不包含，8/29 付费景点少；相比 Eco Card 回本困难。</p><div className="seller-prices"><span><span>HopeGoo</span><b>未检索到同款</b></span><a href="https://www.klook.com/zh-CN/activity/82312-amazing-pass-osaka/" target="_blank" rel="noreferrer"><span>Klook 1日 / 2日</span><b>¥148 / ¥212</b></a></div><a href="https://osaka-amazing-pass.com/en/info.html" target="_blank" rel="noreferrer">官方价格 ↗</a></article>
        <article><span className="pass-status conditional">条件适用</span><b>Kintetsu Rail Pass</b><strong>¥1,900 <small>1 日 / 2 日 ¥3,700</small></strong><p>通票不覆盖阪神神户段，也不含近铁特急券；需按实际覆盖段比价。</p><div className="seller-prices"><a href="https://www.hopegoo.com/zh-hk/shelves?spu=SPU1961265960069185536" target="_blank" rel="noreferrer"><span>HopeGoo 1日起</span><b>HK$92.27</b></a><a href="https://www.klook.com/zh-HK/activity/5540-kintetsu-rail-pass-osaka/" target="_blank" rel="noreferrer"><span>Klook 1日 / 2日</span><b>HK$92 / HK$178</b></a></div><a href="https://www.kintetsu.co.jp/foreign/english/ticket/index.html" target="_blank" rel="noreferrer">官方范围 ↗</a></article>
        <article><span className="pass-status no">不推荐</span><b>Kintetsu 5day</b><strong>¥4,900 <small>Plus ¥6,700</small></strong><p>京都—名古屋采用新干线，花火返程仍需另买特急券，节省有限且约束路线。</p><div className="seller-prices"><a href="https://www.hopegoo.com/zh-hk/shelves?spu=SPU1961265960069185536" target="_blank" rel="noreferrer"><span>HopeGoo</span><b>商品页实时选规格</b></a><a href="https://www.klook.com/zh-HK/activity/5540-kintetsu-rail-pass-osaka/" target="_blank" rel="noreferrer"><span>Klook 5日 / Plus</span><b>HK$236 / HK$323</b></a></div><a href="https://www.kintetsu.co.jp/foreign/english/ticket/index.html" target="_blank" rel="noreferrer">官方范围 ↗</a></article>
        <article><span className="pass-status conditional">舒适升级</span><b>Rapi:t β</b><strong>约 ¥1,410 <small>普通席</small></strong><p>抵达日仅为舒适度升级；机场急行约 ¥760 已可直达堺。注意 α 不停堺。</p><a href="https://www.howto-osaka.com/en/rapit/" target="_blank" rel="noreferrer">列车说明 ↗</a></article>
      </div>
      <p className="price-note">平台价核对于 2026-08-13。HopeGoo 与 Klook 会随币种、库存、优惠码和结算地区浮动；“起”表示页面最低可售规格。大阪 Metro 第三方游客票与现场 Enjoy Eco Card 的有效期、使用方式并不完全相同，请勿只按价格判断。</p>
    </section>
    <section className="prep" id="prep"><div className="prep-copy"><p className="eyebrow">READY / 准备清单</p><h2>出发之前，<br/>逐项点亮。</h2><p>勾选状态会保存在当前设备。最重要的是维米尔抽选、两段指定席和航班信息。</p><div className="progress"><i style={{width:`${checked.length/checklist.length*100}%`}}/><span>{checked.length} / {checklist.length} 已完成</span></div></div><div className="checklist">{checklist.map(([id,title,tag])=><label key={id} className={checked.includes(id)?"done":""}><input type="checkbox" checked={checked.includes(id)} onChange={()=>setChecked(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id])}/><i>✓</i><span><b>{title}</b><small>{tag}</small></span></label>)}</div></section>
    <section className="resources"><div><p className="eyebrow dark">OFFICIAL LINKS</p><h2>出发前，只看官方。</h2></div><div className="resource-list">{sources.map(([title,url],i)=><a key={url} href={url} target="_blank" rel="noreferrer"><small>0{i+1}</small><span>{title}</span><b>↗</b></a>)}</div></section>
    <footer><span>関西盛夏旅行手册 · 2026</span><a href="#top">回到顶部 ↑</a></footer>
    {fireMode&&<div className="fire-modal" role="dialog" aria-modal="true" aria-labelledby="fire-title"><button className="fire-close" aria-label="关闭花火撤离模式" onClick={()=>setFireMode(false)}>×</button><div className="fire-kicker">8.30 / YOKKAICHI</div><h2 id="fire-title">20:10<br/><em>必须撤离</em></h2><p>花火结束立刻沿北侧路线步行，不逛摊、不补拍、不等出租车。</p><div className="escape-line"><div><b>20:10</b><span>离开观赏区</span></div><div><b>20:35</b><span>目标富田浜</span></div><div><b>20:42</b><span>JR → 四日市</span></div><div><b>21:15</b><span>目标近铁站</span></div><div><b>21:45</b><span>必须进站</span></div><div><b>21:59</b><span>特急 → 难波</span></div></div><div className="fire-actions"><a href={mapsUrl("Yokkaichi Dome to Tomidahama Station")} target="_blank" rel="noreferrer">打开撤离地图 ↗</a><button onClick={()=>{setFireMode(false);setActiveDay(2);document.getElementById("journey")?.scrollIntoView()}}>查看当天完整行程</button></div><aside><b>立即放弃花火，如果：</b> 官方取消 · 强雷暴或大风 · 严重铁路中断 · 身体不适</aside></div>}
  </main>
}
