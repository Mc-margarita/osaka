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
  { date:"8.29",dow:"周六",city:"大阪",theme:"梵高 · 动漫 · 梅田",accent:"ART DAY",cost:"交通 ¥1,200",map:"Abeno Harukas Art Museum Osaka",stops:[
    {time:"07:45",title:"从堺出发",meta:"南海 + 周末 Enjoy Eco Card",note:"Eco Card ¥620，当日地铁巴士畅行。",place:"Sakai Station Osaka",kind:"move"},
    {time:"08:35",title:"天王寺公园与 HARUKAS 外观",meta:"树荫短线 · 约 70 分钟",note:"从天王寺站步行至美术馆；炎热时可直接进入 HARUKAS 商场休息。",place:"Tennoji Park Osaka",kind:"nature"},
    {time:"10:00",title:"梵高《吊桥》与印象派画家们",meta:"阿倍野 HARUKAS 美术馆 · 约 2 小时",note:"展出梵高《吊桥》以及马奈、莫奈、雷诺阿、塞尚等 42 位画家的 70 件作品；非抽选、非分时段制。",place:"Abeno Harukas Art Museum Osaka",kind:"culture"},
    {time:"12:15",title:"天王寺午餐",meta:"HARUKAS / Q's Mall 室内休整",place:"Abeno Harukas Osaka restaurants",kind:"food"},
    {time:"13:00",title:"日本桥电电城 + 黑门",meta:"Animate / Mandarake / 骏河屋",place:"Nipponbashi Denden Town",kind:"shopping"},
    {time:"16:30",title:"梅田城市漫游",meta:"Grand Front / LUCUA / 阪急",note:"体力有余再上梅田蓝天大厦。",place:"Umeda Osaka",kind:"shopping"},
  ]},
  { date:"8.30",dow:"周日",city:"京都 → 四日市",theme:"御苑与漫画 · 海上花火",accent:"FIREWORKS",cost:"交通 ¥12,520",map:"Yokkaichi Dome",stops:[
    {time:"06:30",title:"天气 / 雷电 / 铁路首检",meta:"不满足条件即取消花火",note:"官方取消、强雷暴大风、严重铁路中断或身体不适：从京都直接回堺。",kind:"event"},
    {time:"08:50",title:"京都御苑南侧",meta:"免费 · 树荫短线约 50 分钟",note:"从堺町御门进入，只走九条池至南侧林荫；高温或下雨时缩短至 20 分钟。",place:"Kyoto Gyoen National Garden Sakaimachi Gate",kind:"nature"},
    {time:"10:20",title:"京都国际漫画博物馆",meta:"现场出示地铁一日券 ¥960",note:"普通票通常不会售罄；不要提前买电子票，到接待处出示当天有效的京都地铁一日券享八折。",place:"Kyoto International Manga Museum",kind:"culture"},
    {time:"12:20",title:"乌丸御池午餐与咖啡",meta:"室内休整 · 约 70 分钟",place:"Karasuma Oike Kyoto restaurants",kind:"food"},
    {time:"13:40",title:"京都站补给 + 二次检查",meta:"提前进站 · 便当、水、车次与天气",place:"Kyoto Station",kind:"event"},
    {time:"15:14",title:"新干线 NOZOMI 428 → 名古屋",meta:"smart EX 已预订 · 15:48 抵达 · ¥5,710",note:"普通车 · 成人 1 名；邮件注明车次与座席将在 8/30 05:30 后最终确认。",place:"Kyoto Station",kind:"move"},
    {time:"16:22",title:"JR 名古屋 → 富田浜",meta:"17:01 抵达 · ¥680",place:"Tomidahama Station",kind:"move"},
    {time:"17:35",title:"北侧免费观赏区就位",meta:"四日市巨蛋 / 霞浦绿地东侧",note:"选靠撤离方向的位置；矶津南区仅作备选。",place:"Yokkaichi Dome",kind:"event"},
    {time:"19:15",title:"四日市花火大会",meta:"约 45 分钟",place:"Yokkaichi Dome",kind:"event"},
    {time:"20:10",title:"硬撤离：立刻离场",meta:"不逛摊、不补拍",note:"20:35 富田浜 → 20:42 JR 四日市 → 步行约 20 分钟 → 21:15 近铁四日市。",place:"Tomidahama Station",kind:"move"},
    {time:"21:59",title:"近铁特急 → 大阪难波",meta:"23:48 抵达 · 约 ¥3,800",note:"21:45 前必须进站；24:00 / 24:08 南海回堺，不赌 23:50。",place:"Kintetsu Yokkaichi Station",kind:"move"},
  ]},
  { date:"8.31",dow:"周一",city:"神户",theme:"异人馆 · 古寺 · 港湾",accent:"KOBE SLOW DAY",cost:"交通约 ¥5,600",map:"Kobe Kitano Weathercock House",stops:[
    {time:"10:30",title:"堺 → 神户三宫",meta:"南海 + 阪神 · 约 70 分钟 · ¥710",note:"大阪难波步行换乘阪神大阪难波；不再前往奈良。",place:"Kobe Sannomiya Station",kind:"move"},
    {time:"11:45",title:"三宫午餐与补水",meta:"轻食 · 室内休整约 45 分钟",note:"今天气温较高，不把午餐压缩成赶路。",place:"Kobe Sannomiya Center Gai",kind:"food"},
    {time:"12:35",title:"前往北野异人馆",meta:"出租车约 8 分钟 / 步行约 20 分钟上坡",note:"想保存体力时直接打车，预计约 ¥900—1,200。",place:"Kobe Kitano Weathercock House",kind:"move"},
    {time:"13:00",title:"风见鸡馆 + 萌黄之馆",meta:"两馆短线 · 约 70 分钟 · 联票 ¥800",note:"只保留最有代表性的两馆，不扩展异人馆通票路线。",place:"Kobe Kitano Weathercock House",kind:"culture"},
    {time:"14:15",title:"北野 → 能福寺",meta:"直接打车约 15—25 分钟",note:"预计 ¥2,500—3,200；堵车或含叫车费按 ¥3,500 以内准备。",place:"Nofukuji Temple Kobe",kind:"move"},
    {time:"14:45",title:"能福寺与兵库大佛",meta:"免费参拜 · 约 40 分钟",note:"寺院范围不大，重点看兵库大佛与本堂；保持安静并留意参拜礼仪。",place:"Nofukuji Temple Kobe",kind:"culture"},
    {time:"15:30",title:"能福寺 → Harborland",meta:"地铁海岸线 · 约 25 分钟 · 约 ¥210",note:"步行至中央市场前站，乘一站至 Harborland；累时可直接打车。",place:"Kobe Harborland umie",kind:"move"},
    {time:"16:00",title:"Harborland + 美利坚公园",meta:"咖啡、海港与夜景 · 18:20 硬离开",note:"按体力选择室内 umie 或海边短线；19:00 已预约晚餐。",place:"BE KOBE Monument Meriken Park",kind:"nature"},
    {time:"18:20",title:"港湾 → Mouriya",meta:"出租车约 10 分钟 · 约 ¥1,000—1,300",note:"18:50 前抵达；不要继续逛商场。",place:"KOBE BEEF DINING Mouriya",kind:"move"},
    {time:"19:00",title:"KOBE BEEF DINING Mouriya",meta:"已预订 · 神户牛大腿牛排 140g · ¥6,950",note:"1 人，费用当天到店支付；迟到超过 15 分钟可能按取消处理。",place:"KOBE BEEF DINING Mouriya",kind:"food"},
  ]},
  { date:"9.01",dow:"周二",city:"难波 · 日本桥 → 关西机场 T2",theme:"集中采购 · 返程",accent:"DEPARTURE",cost:"交通约 ¥1,260 · 寄存 ¥800",map:"Nankai Namba Station",stops:[
    {time:"08:00",title:"早餐、整理与称重",meta:"证件、充电宝、退税品最后检查",note:"普通卷烟可在值机前放入托运行李；电子烟、IQOS / Ploom / glo 设备和充电宝必须随身。打火机不要放入托运行李。",kind:"event"},
    {time:"09:30",title:"退房",meta:"全部行李带走 · 房间最终检查",place:"Hotel Agora Regency Osaka Sakai",kind:"event"},
    {time:"10:15",title:"抵达难波并寄存28寸行李",meta:"n・e・s・t 难波店 · 2F中央改札口正面 · ¥800",note:"柜台在南海难波站2楼中央检票口正面、检票口外；官方限制为三边合计≤220cm、≤30kg。保留凭证，15:10回来取。",place:"n e s t Nankai Namba Station",kind:"event"},
    {time:"10:35",title:"大阪高岛屋 B1 食品层",meta:"特色食品、点心、伴手礼",note:"先看保质期与包装体积；需要冷藏的食品不买，易碎品最后再装箱。",place:"Osaka Takashimaya",kind:"shopping"},
    {time:"11:15",title:"いちびり庵 难波店",meta:"大阪主题伴手礼、冰箱贴、明信片",place:"Osaka Meibutsu Ichibirian Namba",kind:"shopping"},
    {time:"11:45",title:"旭屋书店 难波CITY店",meta:"日文书、漫画、杂志与文具",place:"Asahiya Bookstore Namba City",kind:"shopping"},
    {time:"12:25",title:"难波午餐",meta:"控制在35分钟内 · 就近解决",place:"Namba City restaurants",kind:"food"},
    {time:"13:05",title:"日本桥二次元采购",meta:"Animate为主 · 骏河屋 / Mandarake按清单补漏",note:"14:20结束采购并返回难波，不再临时增加远处门店。",place:"Animate Osaka Nipponbashi",kind:"shopping"},
    {time:"14:30",title:"ZIPPO SPECIALTY NAKAMURA",meta:"世界纸卷烟、手卷烟、雪茄、烟斗与喫烟具",note:"难波站10号出口旁；周二10:00—19:30。普通卷烟可在值机前装入托运行李；若想买机场免税整条烟，改在T2安检后的TRK购买并随身登机。",place:"ZIPPO SPECIALTY NAKAMURA Osaka",kind:"shopping"},
    {time:"15:10",title:"取行李、重新装箱",meta:"n・e・s・t 难波店 · 25分钟硬上限",note:"食品与纸制品防压；电子烟设备、充电宝和打火机留在随身行李。15:40前进入南海站台。",place:"Nankai Namba Station Central Ticket Gate",kind:"event"},
    {time:"15:45",title:"南海难波 → 关西机场",meta:"乘第一班可用机场急行 · 约45分钟 · ¥970",note:"15:40前进入站台；抵达关西机场站后走到Aeroplaza 1F乘免费接驳巴士前往T2。",place:"Kansai Airport Station",kind:"move"},
    {time:"16:55",title:"抵达关西机场 T2",meta:"17:30开始值机、托运与安检",note:"先确认值机柜台位置；完成安检后可去TRK Duty Free补购免税烟。此时托运行李已经交运，免税品只能随身携带。",place:"Kansai International Airport Terminal 2",kind:"event"},
  ]},
];

const routes:Route[][]=[
  [
    {after:0,time:"约 45 分",from:"关西机场 T1 南海关西机场站",to:"南海堺站西口",fromAddress:"関西空港駅（南海）, 〒549-0011 大阪府泉南郡田尻町泉州空港中1",toAddress:"南海 堺駅 西口, 〒590-0985 大阪府堺市堺区戎島町3丁22-1",line:"南海机场急行",detail:"直达 · 无需换乘",fare:"¥760",alt:"Rapi:t β 指定席 · 更舒适、约 35 分",altFare:"¥1,410",note:"Rapi:t α 不停堺站。"},
    {after:2,time:"步行 18 分",from:"Hotel Agora Regency 正门",to:"旧堺灯塔",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"旧堺燈台, 〒590-0974 大阪府堺市堺区大浜北町5丁1",line:"步行",detail:"沿港湾西行",fare:"¥0",alt:"出租车 · 约 5 分",altFare:"约 ¥900"},
    {after:3,time:"步行约 20 分",from:"旧堺灯塔",to:"酒店 1F the LOOP",fromAddress:"旧堺燈台, 〒590-0974 大阪府堺市堺区大浜北町5丁1",toAddress:"All Day Dining & Lounge the LOOP, ホテル アゴーラ リージェンシー 大阪堺 1F, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"步行",detail:"经大浜公园返回；18:30 前离开灯塔",fare:"¥0",alt:"出租车 · 约 5 分",altFare:"约 ¥800",note:"19:00 已预约，迟到超过 20 分钟可能被取消。"},
  ],
  [
    {after:0,time:"约 40 分",from:"南海堺站西口",to:"阿倍野 HARUKAS 美术馆",fromAddress:"南海 堺駅 西口, 〒590-0985 大阪府堺市堺区戎島町3丁22-1",toAddress:"あべのハルカス美術館, 〒545-6016 大阪府大阪市阿倍野区阿倍野筋1丁目1-43 16F",line:"南海本线 → Osaka Metro 御堂筋线",detail:"难波换乘至天王寺；16F 美术馆",fare:"南海 ¥290 + 通票覆盖",alt:"全程按次付费",altFare:"约 ¥530"},
    {after:3,time:"约 20 分",from:"阿倍野 HARUKAS",to:"Animate 大阪日本桥店",fromAddress:"あべのハルカス, 〒545-0052 大阪府大阪市阿倍野区阿倍野筋1丁目1-43",toAddress:"アニメイト大阪日本橋, 〒556-0005 大阪府大阪市浪速区日本橋4丁目10-6",line:"Osaka Metro 御堂筋线 → 步行",detail:"天王寺 → 难波，再步行进入电电城",fare:"通票覆盖",alt:"出租车",altFare:"约 ¥1,300"},
    {after:4,time:"约 15 分",from:"Animate 大阪日本桥店",to:"Grand Front Osaka 南馆",fromAddress:"アニメイト大阪日本橋, 〒556-0005 大阪府大阪市浪速区日本橋4丁目10-6",toAddress:"グランフロント大阪 南館, 〒530-0011 大阪府大阪市北区大深町4-20",line:"步行 → Osaka Metro 御堂筋线",detail:"难波 → 梅田",fare:"通票覆盖",alt:"按次购买地铁票",altFare:"约 ¥240"},
    {after:5,time:"约 40 分",from:"Grand Front Osaka 南馆",to:"Hotel Agora Regency 正门",fromAddress:"グランフロント大阪 南館, 〒530-0011 大阪府大阪市北区大深町4-20",toAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"Metro → 南海本线",detail:"梅田 → 难波换乘，堺站西口出站",fare:"通票覆盖 + 南海 ¥290",alt:"JR 大阪环状线 → 新今宫 → 南海",altFare:"约 ¥510"},
  ],
  [
    {after:0,time:"约 85 分",from:"Hotel Agora Regency 正门",to:"京都御苑 堺町御门",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"京都御苑 堺町御門, 〒602-0881 京都府京都市上京区京都御苑3",line:"南海 → Metro → JR / 京都地铁",detail:"难波、京都站方向换乘；京都站乘乌丸线至丸太町",fare:"约 ¥1,110",alt:"抵达京都站后出租车到堺町御门",altFare:"约 ¥1,500"},
    {after:1,time:"约 12 分",from:"京都御苑 堺町御门",to:"京都国际漫画博物馆正门",fromAddress:"京都御苑 堺町御門, 〒602-0881 京都府京都市上京区京都御苑3",toAddress:"京都国際マンガミュージアム, 〒604-0846 京都府京都市中京区金吹町452",line:"步行 → 京都地铁乌丸线",detail:"丸太町 → 乌丸御池仅 1 站，减少盛夏步行",fare:"地铁一日券覆盖",alt:"沿夷川通步行约 15—20 分",altFare:"¥0"},
    {after:3,time:"地铁约 12 分",from:"乌丸御池",to:"JR 京都站新干线中央口",fromAddress:"京都市営地下鉄 烏丸御池駅, 〒604-8171 京都府京都市中京区虎屋町",toAddress:"JR京都駅 新幹線中央口, 〒600-8214 京都府京都市下京区東塩小路高倉町8-3",line:"京都市营地铁乌丸线",detail:"乌丸御池 → 京都；13:40 前后抵达并休整",fare:"地铁一日券覆盖",alt:"出租车约 15 分",altFare:"约 ¥1,500"},
    {after:4,time:"34 分",from:"JR 京都站新干线中央口",to:"JR 名古屋站新干线口",fromAddress:"JR京都駅 新幹線中央口, 〒600-8214 京都府京都市下京区東塩小路高倉町8-3",toAddress:"JR名古屋駅 新幹線口, 〒450-0002 愛知県名古屋市中村区名駅1丁目1-4",line:"东海道新干线 NOZOMI 428",detail:"15:14 → 15:48 · smart EX 已预订",fare:"¥5,710",alt:"后续 NOZOMI / HIKARI 指定席",altFare:"按改签时显示价格",note:"普通车 · 成人 1 名；车次与座席将在 8/30 05:30 后最终确认。"},
    {after:5,time:"39 分",from:"JR 名古屋站关西本线月台",to:"JR 富田浜站",fromAddress:"JR名古屋駅, 〒450-0002 愛知県名古屋市中村区名駅1丁目1-4",toAddress:"JR富田浜駅, 〒510-8008 三重県四日市市富田浜町",line:"JR 关西本线",detail:"16:22 → 17:01",fare:"¥680",alt:"近铁名古屋 → 近铁富田 + 步行",altFare:"约 ¥760"},
    {after:6,time:"步行 34 分",from:"JR 富田浜站",to:"四日市巨蛋北侧入口",fromAddress:"JR富田浜駅, 〒510-8008 三重県四日市市富田浜町",toAddress:"四日市ドーム, 〒510-0012 三重県四日市市大字羽津甲5169",line:"官方步行路线",detail:"沿霞浦绿地水道东侧",fare:"¥0",alt:"矶津南侧免费区",altFare:"交通另计"},
    {after:9,time:"约 65 分",from:"四日市巨蛋北侧观赏区",to:"近铁四日市站北口",fromAddress:"四日市ドーム, 〒510-0012 三重県四日市市大字羽津甲5169",toAddress:"近鉄四日市駅 北口, 〒510-0075 三重県四日市市安島1丁目1-56",line:"步行 → JR → 步行",detail:"20:35 富田浜 / 20:42 JR 四日市 / 21:15 近铁",fare:"JR ¥190",alt:"20:30 富田浜早一班",altFare:"¥190",note:"JR 四日市中转点：〒510-0093 三重県四日市市本町3-85；不依赖出租车。"},
    {after:10,time:"109 分",from:"近铁四日市站北口",to:"Hotel Agora Regency 正门",fromAddress:"近鉄四日市駅 北口, 〒510-0075 三重県四日市市安島1丁目1-56",toAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"近铁特急 → 南海本线",detail:"大阪难波 23:48 到；24:00 / 24:08 南海回堺",fare:"约 ¥4,090",alt:"若错过 21:59，立刻咨询站员末班组合",altFare:"价格随车次",note:"大阪难波换乘点：〒542-0076 大阪府大阪市中央区難波4丁目1-17；不赌 23:50 南海。"},
  ],
  [
    {after:0,time:"约 70 分",from:"Hotel Agora Regency 正门",to:"阪神神户三宫站东口",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"阪神 神戸三宮駅 東口, 〒651-0088 兵庫県神戸市中央区小野柄通8丁目1-8",line:"南海本线 → 阪神本线",detail:"堺 → 南海难波；步行换乘阪神大阪难波 → 神户三宫",fare:"约 ¥710",alt:"南海 → JR 新今宫 → JR 三之宫",altFare:"约 ¥940",note:"10:30 出发；今日不前往奈良。"},
    {after:2,time:"约 8 分",from:"神户三宫中心街",to:"风见鸡馆",fromAddress:"神戸三宮センター街, 〒650-0021 兵庫県神戸市中央区三宮町",toAddress:"神戸北野異人館 風見鶏の館, 〒650-0002 兵庫県神戸市中央区北野町3丁目13-3",line:"出租车",detail:"避开北野上坡与正午高温",fare:"约 ¥900—1,200",alt:"步行约 20—25 分钟",altFare:"¥0"},
    {after:4,time:"约 15—25 分",from:"风见鸡馆",to:"能福寺",fromAddress:"神戸北野異人館 風見鶏の館, 〒650-0002 兵庫県神戸市中央区北野町3丁目13-3",toAddress:"能福寺, 〒652-0837 兵庫県神戸市兵庫区北逆瀬川町1-39",line:"出租车",detail:"直接跨越市中心，减少高温步行和换乘",fare:"约 ¥2,500—3,200",alt:"步行下山 → 三宫・花时计前 → 地铁海岸线中央市场前 → 步行",altFare:"地铁约 ¥240",note:"堵车或含叫车费时按 ¥3,500 以内准备。"},
    {after:6,time:"约 25 分",from:"能福寺",to:"Kobe Harborland umie Mosaic",fromAddress:"能福寺, 〒652-0837 兵庫県神戸市兵庫区北逆瀬川町1-39",toAddress:"神戸ハーバーランドumie モザイク, 〒650-0044 兵庫県神戸市中央区東川崎町1丁目6-1",line:"步行 → 地铁海岸线",detail:"中央市场前 → Harborland 1 站；出站后步行至 Mosaic",fare:"约 ¥210",alt:"出租车约 10 分钟",altFare:"约 ¥1,200"},
    {after:8,time:"约 10 分",from:"美利坚公园 BE KOBE 石碑",to:"KOBE BEEF DINING Mouriya",fromAddress:"BE KOBE モニュメント, 〒650-0042 兵庫県神戸市中央区波止場町2",toAddress:"KOBE BEEF DINING モーリヤ, 〒650-0012 兵庫県神戸市中央区北長狭通1丁目9-10 カクテン屋ビル2F",line:"出租车",detail:"18:20 硬离开，18:50 前到店",fare:"约 ¥1,000—1,300",alt:"步行 / JR 元町 → 三之宫",altFare:"步行 ¥0 / JR ¥140",note:"预约时间 19:00；迟到超过 15 分钟可能被取消。"},
    {after:9,time:"约 90 分",from:"KOBE BEEF DINING Mouriya",to:"Hotel Agora Regency 正门",fromAddress:"KOBE BEEF DINING モーリヤ, 〒650-0012 兵庫県神戸市中央区北長狭通1丁目9-10 カクテン屋ビル2F",toAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",line:"步行 → 阪神 → 南海",detail:"步行至阪神神户三宫站，直通大阪难波后换乘南海至堺",fare:"约 ¥710",alt:"JR 三之宫 → 新今宫 → 南海",altFare:"约 ¥940"},
  ],
  [
    {after:1,time:"约 25 分",from:"Hotel Agora Regency 正门",to:"n・e・s・t 难波店",fromAddress:"ホテル アゴーラ リージェンシー 大阪堺, 〒590-0985 大阪府堺市堺区戎島町4丁45-1",toAddress:"n・e・s・t 難波店, 南海なんば駅2階中央改札口正面, 〒542-8503 大阪府大阪市中央区難波5丁目1-60",line:"步行 → 南海本线",detail:"堺 → 南海难波；下车后上2楼中央检票口，柜台在改札外",fare:"约 ¥290 + 寄存 ¥800",alt:"若柜台满位，转难波CITY B2宅急便柜台或大型投币柜",altFare:"按现场价格",note:"28寸箱只要三边合计≤220cm、重量≤30kg即可；保留寄存凭证。"},
    {after:2,time:"站内步行约 5 分",from:"n・e・s・t 难波店",to:"大阪高岛屋 B1 食品层",fromAddress:"n・e・s・t 難波店, 南海なんば駅2階中央改札口正面, 〒542-8503 大阪府大阪市中央区難波5丁目1-60",toAddress:"大阪髙島屋 地下1階, 〒542-8510 大阪府大阪市中央区難波5丁目1-5",line:"站内步行",detail:"从南海难波站向高岛屋方向下至B1",fare:"¥0",alt:"先去难波CITY购物，11:00后再回食品层",altFare:"¥0"},
    {after:4,time:"步行约 8 分",from:"いちびり庵 难波店",to:"旭屋书店 难波CITY店",fromAddress:"大阪名物いちびり庵 なんば店, 〒542-0076 大阪府大阪市中央区難波3丁目2-28",toAddress:"旭屋書店 なんばCITY店, 〒542-0076 大阪府大阪市中央区難波5丁目1-60 なんばCITY南館B2F",line:"步行",detail:"返回南海难波站，进入难波CITY南馆B2",fare:"¥0",alt:"书籍较重时只买清单内项目",altFare:"¥0"},
    {after:6,time:"步行约 12—15 分",from:"难波CITY",to:"Animate 大阪日本桥店",fromAddress:"なんばCITY 南館, 〒542-0076 大阪府大阪市中央区難波5丁目1-60",toAddress:"アニメイト大阪日本橋, 〒556-0005 大阪府大阪市浪速区日本橋4丁目10-6",line:"步行",detail:"沿堺筋方向进入日本桥电电城",fare:"¥0",alt:"炎热或行李增加时乘出租车",altFare:"约 ¥800—1,000"},
    {after:7,time:"步行约 15—20 分",from:"Animate 大阪日本桥店",to:"ZIPPO SPECIALTY NAKAMURA",fromAddress:"アニメイト大阪日本橋, 〒556-0005 大阪府大阪市浪速区日本橋4丁目10-6",toAddress:"ZIPPO SPECIALTY NAKAMURA, 〒542-0076 大阪府大阪市中央区難波4丁目4-5",line:"步行",detail:"沿难波方向返回，店在地铁难波站10号出口旁",fare:"¥0",alt:"出租车约 5 分钟",altFare:"约 ¥800",note:"若只买常规整条烟且看重免税价格，可跳过此店，改去T2安检后TRK Duty Free。"},
    {after:9,time:"约 65—80 分",from:"南海难波站",to:"关西机场 T2 国际出发",fromAddress:"南海 なんば駅 中央改札, 〒542-0076 大阪府大阪市中央区難波5丁目1-60",toAddress:"関西国際空港 第2ターミナル 国際線出発, 〒549-0011 大阪府泉南郡田尻町泉州空港中13",line:"南海机场急行 → T2免费接驳巴士",detail:"15:40前进站，乘第一班机场急行；关西机场站下车后前往Aeroplaza 1F巴士站",fare:"南海约 ¥970 + 接驳 ¥0",alt:"Rapi:t 指定席升级",altFare:"基本车资外另付特急费用",note:"目标16:50—17:05到T2；铁路到站不等于到T2，需另留步行、等车和接驳时间。"},
  ],
];

const alternatives:Alternative[][]=[
  [
    {trigger:"航班晚点 ≥ 60 分",title:"酒店入住后只在堺站周边晚餐",detail:"取消旧港步行，把体力留给第二天；PLATPLAT 商场与车站餐饮最省力。",place:"PLATPLAT Sakai Osaka",tag:"延误"},
    {trigger:"下雨或闷热",title:"PLATPLAT 室内补给",detail:"从酒店与堺站步行可达，完成晚餐、便利补给后直接休息。",place:"PLATPLAT Sakai Osaka",tag:"雨天"},
    {trigger:"状态很好",title:"大浜公园短线替代完整港湾线",detail:"只走公园与旧灯塔往返，不继续向远处延伸，控制在 45 分钟内。",place:"Ohama Park Sakai",tag:"省力"},
  ],
  [
    {trigger:"展馆排队过长或临时不适",title:"缩短美术馆，提前转日本桥",detail:"保留梵高《吊桥》与印象派核心展厅后离馆；午餐与二次元街提前开始。",place:"Abeno Harukas Art Museum Osaka",tag:"室内"},
    {trigger:"高温或暴雨",title:"日本桥缩短，提前进入梅田商场",detail:"Animate / Mandarake 选一至两家，随后转 Grand Front、LUCUA、阪急室内活动。",place:"Grand Front Osaka",tag:"雨天"},
    {trigger:"脚力不足",title:"天王寺后直达梅田",detail:"跳过日本桥，把下午集中给午餐、购物与咖啡；减少一次跨城移动。",place:"Umeda Osaka",tag:"省力"},
  ],
  [
    {trigger:"花火官方取消",title:"京都铁路博物馆后直接回堺",detail:"博物馆 10:00—17:00；放弃名古屋与四日市长途段，傍晚从京都返程。",place:"Kyoto Railway Museum",tag:"取消"},
    {trigger:"京都高温或降雨",title:"御苑缩至 20 分钟，漫画馆后直接进站",detail:"只在堺町御门附近短暂停留；漫画博物馆结束后到京都站地下街午餐、补水并休整。",place:"Kyoto Station",tag:"省力"},
    {trigger:"铁路异常或身体不适",title:"京都站终止跨区行程",detail:"不前往名古屋、富田浜与花火会场，改走最稳妥的京都—大阪—堺返程。",place:"Kyoto Station",tag:"取消"},
  ],
  [
    {trigger:"高温或体力不足",title:"北野只看风见鸡馆外观",detail:"取消两馆入内，把参观压缩至 30 分钟；随后直接打车去能福寺。",place:"Kobe Kitano Weathercock House",tag:"省力"},
    {trigger:"下雨",title:"能福寺后直接进入 Harborland umie",detail:"缩短海边步行，把下午安排在商场、咖啡馆与室内观景区域。",place:"Kobe Harborland umie",tag:"雨天"},
    {trigger:"抵达神户较晚",title:"取消能福寺，北野后直达港湾",detail:"若 14:30 仍未离开北野，优先保证港湾休息与 19:00 晚餐，不再跨城赶寺院。",place:"Kobe Harborland umie",tag:"省力"},
  ],
  [
    {trigger:"n・e・s・t 满位",title:"切换难波CITY B2柜台或大型投币柜",detail:"先在南海难波站内解决寄存，不拖着28寸行李进入日本桥；仍找不到时直接缩短购物。",place:"Namba City South Building",tag:"延误"},
    {trigger:"暴雨或高温",title:"高岛屋 + 难波CITY室内线",detail:"取消黑门与日本桥步行，只保留食品、伴手礼、书店和NAKAMURA；15:10照常取箱。",place:"Namba City Osaka",tag:"雨天"},
    {trigger:"疲劳或时间不足",title:"14:30结束购物并提前去T2",detail:"二次元店与烟草店二选一；T2安检后仍可在TRK Duty Free补购常规免税烟。",place:"Kansai International Airport Terminal 2",tag:"省力"},
  ],
];

const labels:Record<Stop["kind"],string>={move:"交通",culture:"人文",food:"美食",nature:"自然",shopping:"购物",event:"关键"};
const mapsUrl=(query:string)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const directionsUrl=(from:string,to:string)=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=transit`;
const facilityLabels:Record<Facility,{label:string;query:string;icon:string}>={
  none:{label:"地点 / 路线",query:"",icon:"⌖"},smoking:{label:"吸烟所",query:"喫煙所",icon:"🚬"},convenience:{label:"便利店",query:"コンビニ",icon:"▣"},toilet:{label:"公共卫生间",query:"公衆トイレ",icon:"WC"},postoffice:{label:"邮局",query:"郵便局",icon:"〒"},bookstore:{label:"书店",query:"書店",icon:"本"},souvenir:{label:"明信片 / 周边",query:"ポストカード お土産 グッズ",icon:"✦"},
};
const checklist=[
  ["vermeer","维米尔追加抽选未中签","已完成"],
  ["gogh","购买梵高与印象派展电子票或现场购票","P0"],
  ["loop-dinner","8/28 19:00 到酒店 1F 用餐","已预订"],
  ["trains","新干线已订；继续预订 8/30 近铁特急 21:59","P0"],
  ["flight","确认9/1关西机场T2值机柜台与截止时间","P0"],
  ["beef","8/31 19:00 KOBE BEEF DINING Mouriya","已预订"],
  ["weather","出发前 7 天检查台风、花火公告与车次","7 DAYS"],
  ["offline","下载离线地图、保存酒店地址与本页","1 DAY"],
  ["gear","证件、双卡、eSIM、充电宝、雨具与补水","1 DAY"],
] as const;
const sources=[
  ["梵高与印象派展票务","https://www.aham.jp/exhibition/future/wallraf/"],["四日市花火官方","https://kankou43yokkaichi.com/hanabi/"],["免费区交通说明","https://kankou43yokkaichi.com/hanabi/access/no_ticket/"],["京都御苑","https://fng.or.jp/kyoto/"],["京都漫画博物馆","https://kyotomm.jp/en/opentime-cost/"],["n・e・s・t 行李寄存","https://www.nankai.co.jp/en/community/natts/nest/"],["NAKAMURA 烟草店","https://www.z-nakamura.com/pc/shopinfo.htm"],["T2 TRK Duty Free","https://www.kansai-airport.or.jp/en/shop/s141"]
];
const bookings=[
  {day:"8.28",level:"已预订",title:"酒店 1F 晚餐",time:"19:00",detail:"预约已确认；人数、金额、菜单和预约编号不在公开网站展示。",price:"详情不公开",links:[["餐厅官方页面","https://www.agoraregency-sakai.com/restaurants/loop/"]]},
  {day:"8.29",level:"待购买",title:"梵高《吊桥》与印象派画家们",time:"10:00 入场 · 阿倍野 HARUKAS 美术馆 16F",detail:"维米尔追加抽选未中签，已替换。非抽选、非分时段制；周六建议购买电子票以减少现场排队。学生票须出示有效学生证件。",price:"一般 ¥2,100 / 大高生 ¥1,700",links:[["官方展览与购票入口","https://www.aham.jp/exhibition/future/wallraf/"]]},
  {day:"8.30",level:"已预订",title:"京都 → 名古屋 新干线",time:"NOZOMI 428 · 15:14—15:48",detail:"smart EX · 普通车 · 成人 1 名。邮件注明车次与座席将在 8/30 05:30 后最终确认，请当天早晨复核。",price:"已付 ¥5,710",links:[["SmartEX 管理预订","https://shinkansen2.jr-central.co.jp/RSV_P/S_smart_en_index.htm"],["乘车指南","https://smart-ex.jp/en/"]]},
  {day:"8.30",level:"必须",title:"近铁四日市 → 大阪难波",time:"近铁特急 · 21:59—23:48",detail:"特急券从乘车日前 1 个月的 10:30 起售；基本车资另付。",price:"合计约 ¥3,800",links:[["近铁特急官方购票","https://www.ticket.kintetsu.co.jp/vs/en/T/TZZ/TZZ10.do?op=tDisplayVisitorMenu"],["车次查询","https://eki.kintetsu.co.jp/norikae/T7?dw=1&sf=4104&tx=1-9122"]]},
  {day:"8.30",level:"现场",title:"京都国际漫画博物馆",time:"10:20 入场",detail:"不要提前买电子票；到接待处出示当天有效的京都地铁一日券，成人票享八折。普通参观通常不会售罄。",price:"优惠后 ¥960",links:[["开放时间、票价与地铁券优惠","https://kyotomm.jp/en/opentime-cost/"]]},
  {day:"8.31",level:"已预订",title:"KOBE BEEF DINING Mouriya",time:"19:00 · 1 人",detail:"TableCheck 已确认：神户牛大腿牛排套餐 140g。费用当天到店支付；邮件菜单标签显示“午餐”，但预约日期与时间明确为 8/31 19:00。高峰时段晚餐限时 1 小时 50 分。",price:"到店支付 ¥6,950",links:[["查看预约邮件（需登录本人 Gmail）","https://mail.google.com/mail/#all/1a03d9ef83fc95b5"],["餐厅官方页面","https://www.mouriya.co.jp/dsb"],["Google Maps","https://www.google.com/maps/search/?api=1&query=KOBE+BEEF+DINING+Mouriya"]]},
  {day:"9.01",level:"现场",title:"难波寄存 + T2返程",time:"10:15寄存 · 15:10取箱 · 15:40前进站",detail:"28寸箱存南海难波站2楼n・e・s・t；乘第一班可用机场急行，到关西机场站再从Aeroplaza 1F乘免费巴士，目标17:00左右到T2，17:30开始值机。",price:"寄存 ¥800 / 交通约 ¥1,260",links:[["n・e・s・t 官方说明","https://www.nankai.co.jp/en/community/natts/nest/"],["NAKAMURA 官方店铺信息","https://www.z-nakamura.com/pc/shopinfo.htm"],["T2 TRK Duty Free","https://www.kansai-airport.or.jp/en/shop/s141"]]},
  {day:"8.29",level:"可选",title:"梅田蓝天大厦",time:"16:30 后视体力",detail:"不是行程硬点；决定登顶后再购票即可。大阪周游卡仅在规定时段免费，购买前核对当日规则。",price:"以官网当日票价为准",links:[["官方购票与营业信息","https://www.skybldg.co.jp/en/observatory/"]]},
  {day:"8.28",level:"可选",title:"Rapi:t β 舒适升级",time:"关西机场 → 堺",detail:"仅选 β；α 不停堺。若使用机场急行则无需预订。",price:"普通席约 ¥1,410",links:[["南海 Rapi:t 官方","https://www.howto-osaka.com/en/rapit/"],["HopeGoo 购票","https://www.hopegoo.com/zh-hk/shelves/?spu=SPU1871913195475755008"]]},
  {day:"8.31",level:"现场",title:"北野异人馆与能福寺",time:"13:00 北野 · 14:45 能福寺",detail:"风见鸡馆与萌黄之馆购买两馆联票；能福寺与兵库大佛免费参拜，无需预约。",price:"两馆联票 ¥800 / 能福寺 ¥0",links:[["北野异人馆官方信息","https://www.kobe-kazamidori.com/"],["能福寺 Google Maps","https://www.google.com/maps/search/?api=1&query=Nofukuji+Temple+Kobe"]]},
  {day:"8.30",level:"无需",title:"四日市花火免费区",time:"19:15 开始",detail:"四日市北侧免费观赏区不售票，只需持续检查官方公告。",price:"¥0",links:[["花火免费区官方说明","https://kankou43yokkaichi.com/hanabi/access/no_ticket/"]]},
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
      <div className="hero-grid"><div className="hero-copy"><p className="eyebrow">OSAKA · KYOTO · YOKKAICHI · KOBE</p><h1>沿着铁路线，<br/><em>穿过关西盛夏。</em></h1><p className="hero-lede">5 天 · 4 城 · 1 场海上花火。把美术馆、漫画、古寺与港湾夜色，收进一张可以随身使用的路线图。</p><div className="hero-actions"><a className="button primary" href="#journey">打开每日行程 <span>↘</span></a><button className="button ghost" onClick={()=>setFireMode(true)}>花火撤离模式 <span>20:10</span></button></div></div>
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
    <section className="overview" id="overview"><div><p className="eyebrow">TRIP AT A GLANCE</p><h2>一眼掌握<br/>整个旅程</h2></div><div className="metric"><strong>¥19,380</strong><span>预计交通</span></div><div className="metric"><strong>¥{(44580+(student?0:400)+shopping).toLocaleString()}</strong><span>当前总预算*</span></div><div className="metric"><strong>5</strong><span>旅行日</span></div><p className="overview-note">* 不含机票与酒店，已计入下方自定义购物预算。</p></section>
    <section className="planning" id="budget">
      <div className="planning-head"><p className="eyebrow dark">MONEY & MOBILITY</p><h2>钱花在哪里，<br/>一目了然。</h2></div>
      <div className="budget-card"><div className="budget-total"><small>预计总额</small><strong>¥{(44580+(student?0:400)+shopping).toLocaleString()}</strong><span>不含机酒</span></div><div className="bars"><div><span>餐饮 ¥21,500</span><i style={{width:"48%"}}/></div><div><span>交通 ¥19,380</span><i style={{width:"43%"}}/></div><div><span>门票 ¥{student?"3,700":"4,100"}</span><i style={{width:"9%"}}/></div></div><label className="toggle"><input type="checkbox" checked={student} onChange={e=>setStudent(e.target.checked)}/><span/> 使用梵高展学生票（需有效学生证）</label><label className="shop-input">购物预留 <span>¥</span><input type="number" min="0" step="1000" value={shopping} onChange={e=>setShopping(Math.max(0,Number(e.target.value)))}/></label></div>
      <div className="passes-head"><div><small>PASS SELECTOR</small><h3>通票与周游券判断</h3></div><p>价格按 2026 年官方信息整理；特急指定席通常需要另付费用。</p></div>
      <div className="pass-grid">
        <article className="chosen"><span className="pass-status">推荐 · 8/29</span><b>Enjoy Eco Card</b><strong>¥620 <small>官方周末价</small></strong><p>覆盖大阪 Metro 与 Osaka City Bus；南海堺—难波仍另付往返 ¥580。</p><div className="seller-prices"><a href="https://www.hopegoo.com/zh-hk/shelves?spu=SPU1957362140442828800" target="_blank" rel="noreferrer"><span>HopeGoo 同类 QR 票</span><b>HK$63 起</b></a><a href="https://www.klook.com/zh-HK/activity/11515-osaka-metro-pass/" target="_blank" rel="noreferrer"><span>Klook 地铁＋巴士 1日</span><b>HK$50</b></a></div><a href="https://subway.osakametro.co.jp/guide/page/enjoy-eco.php" target="_blank" rel="noreferrer">官方说明 ↗</a></article>
        <article><span className="pass-status conditional">基础工具</span><b>ICOCA</b><strong>¥2,000 <small>含 ¥500 押金</small></strong><p>不提供折扣，但最适合本行程的多运营商零散车费；初始可用余额 ¥1,500。</p><a href="https://www.westjr.co.jp/global/en/howto/icoca/" target="_blank" rel="noreferrer">官方说明 ↗</a></article>
        <article><span className="pass-status no">不推荐</span><b>Osaka Amazing Pass</b><strong>¥3,500 <small>1 日 / 2 日 ¥5,000</small></strong><p>梵高与印象派特展不包含，8/29 付费景点少；相比 Eco Card 回本困难。</p><div className="seller-prices"><span><span>HopeGoo</span><b>未检索到同款</b></span><a href="https://www.klook.com/zh-CN/activity/82312-amazing-pass-osaka/" target="_blank" rel="noreferrer"><span>Klook 1日 / 2日</span><b>¥148 / ¥212</b></a></div><a href="https://osaka-amazing-pass.com/en/info.html" target="_blank" rel="noreferrer">官方价格 ↗</a></article>
        <article><span className="pass-status conditional">条件适用</span><b>Kintetsu Rail Pass</b><strong>¥1,900 <small>1 日 / 2 日 ¥3,700</small></strong><p>通票不覆盖阪神神户段，也不含近铁特急券；需按实际覆盖段比价。</p><div className="seller-prices"><a href="https://www.hopegoo.com/zh-hk/shelves?spu=SPU1961265960069185536" target="_blank" rel="noreferrer"><span>HopeGoo 1日起</span><b>HK$92.27</b></a><a href="https://www.klook.com/zh-HK/activity/5540-kintetsu-rail-pass-osaka/" target="_blank" rel="noreferrer"><span>Klook 1日 / 2日</span><b>HK$92 / HK$178</b></a></div><a href="https://www.kintetsu.co.jp/foreign/english/ticket/index.html" target="_blank" rel="noreferrer">官方范围 ↗</a></article>
        <article><span className="pass-status no">不推荐</span><b>Kintetsu 5day</b><strong>¥4,900 <small>Plus ¥6,700</small></strong><p>京都—名古屋采用新干线，花火返程仍需另买特急券，节省有限且约束路线。</p><div className="seller-prices"><a href="https://www.hopegoo.com/zh-hk/shelves?spu=SPU1961265960069185536" target="_blank" rel="noreferrer"><span>HopeGoo</span><b>商品页实时选规格</b></a><a href="https://www.klook.com/zh-HK/activity/5540-kintetsu-rail-pass-osaka/" target="_blank" rel="noreferrer"><span>Klook 5日 / Plus</span><b>HK$236 / HK$323</b></a></div><a href="https://www.kintetsu.co.jp/foreign/english/ticket/index.html" target="_blank" rel="noreferrer">官方范围 ↗</a></article>
        <article><span className="pass-status conditional">舒适升级</span><b>Rapi:t β</b><strong>约 ¥1,410 <small>普通席</small></strong><p>抵达日仅为舒适度升级；机场急行约 ¥760 已可直达堺。注意 α 不停堺。</p><a href="https://www.howto-osaka.com/en/rapit/" target="_blank" rel="noreferrer">列车说明 ↗</a></article>
      </div>
      <p className="price-note">平台价核对于 2026-08-13。HopeGoo 与 Klook 会随币种、库存、优惠码和结算地区浮动；“起”表示页面最低可售规格。大阪 Metro 第三方游客票与现场 Enjoy Eco Card 的有效期、使用方式并不完全相同，请勿只按价格判断。</p>
    </section>
    <section className="prep" id="prep"><div className="prep-copy"><p className="eyebrow">READY / 准备清单</p><h2>出发之前，<br/>逐项点亮。</h2><p>勾选状态会保存在当前设备。最重要的是梵高展门票、两段指定席和航班信息。</p><div className="progress"><i style={{width:`${checked.length/checklist.length*100}%`}}/><span>{checked.length} / {checklist.length} 已完成</span></div></div><div className="checklist">{checklist.map(([id,title,tag])=><label key={id} className={checked.includes(id)?"done":""}><input type="checkbox" checked={checked.includes(id)} onChange={()=>setChecked(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id])}/><i>✓</i><span><b>{title}</b><small>{tag}</small></span></label>)}</div></section>
    <section className="resources"><div><p className="eyebrow dark">OFFICIAL LINKS</p><h2>出发前，只看官方。</h2></div><div className="resource-list">{sources.map(([title,url],i)=><a key={url} href={url} target="_blank" rel="noreferrer"><small>0{i+1}</small><span>{title}</span><b>↗</b></a>)}</div></section>
    <footer><span>関西盛夏旅行手册 · 2026</span><a href="#top">回到顶部 ↑</a></footer>
    {fireMode&&<div className="fire-modal" role="dialog" aria-modal="true" aria-labelledby="fire-title"><button className="fire-close" aria-label="关闭花火撤离模式" onClick={()=>setFireMode(false)}>×</button><div className="fire-kicker">8.30 / YOKKAICHI</div><h2 id="fire-title">20:10<br/><em>必须撤离</em></h2><p>花火结束立刻沿北侧路线步行，不逛摊、不补拍、不等出租车。</p><div className="escape-line"><div><b>20:10</b><span>离开观赏区</span></div><div><b>20:35</b><span>目标富田浜</span></div><div><b>20:42</b><span>JR → 四日市</span></div><div><b>21:15</b><span>目标近铁站</span></div><div><b>21:45</b><span>必须进站</span></div><div><b>21:59</b><span>特急 → 难波</span></div></div><div className="fire-actions"><a href={mapsUrl("Yokkaichi Dome to Tomidahama Station")} target="_blank" rel="noreferrer">打开撤离地图 ↗</a><button onClick={()=>{setFireMode(false);setActiveDay(2);document.getElementById("journey")?.scrollIntoView()}}>查看当天完整行程</button></div><aside><b>立即放弃花火，如果：</b> 官方取消 · 强雷暴或大风 · 严重铁路中断 · 身体不适</aside></div>}
  </main>
}
