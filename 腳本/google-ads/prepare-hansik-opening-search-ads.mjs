import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const campaignDir = resolve(
  'Ewalk.ai Brain/01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動'
);

const outputJson = resolve(campaignDir, '2026-06-03_GoogleAds_PAUSED草稿_dry-run.json');
const outputCsv = resolve(campaignDir, '2026-06-03_GoogleAds_Editor匯入草稿.csv');
const outputMutates = resolve(campaignDir, '2026-06-03_GoogleAds_API_mutate_operations_preview.json');

const officialOrderingUrl = 'https://shop.ichefpos.com/store/nNLhMqsW/ordering';
const googleMapsUrl =
  'https://www.google.com/maps/place/%E9%9F%93%E9%A3%9F%E6%97%A5%E5%B8%B8%E9%8D%8B%E7%89%A9+%E6%96%87%E5%8D%97%E5%BA%97/@22.9830414,120.1897276,1948m/data=!3m2!1e3!4b1!4m6!3m5!1s0x346e77f80f0cb895:0x25665092d56ed1cb!8m2!3d22.9830414!4d120.1897276!16s%2Fg%2F11z9rg471f?entry=ttu';
const uberEatsUrl =
  'https://www.ubereats.com/tw/store/%E9%9F%93%E9%A3%9F%E6%97%A5%E5%B8%B8%E9%8D%8B%E7%89%A9/NN13z4XCUzC1LnsuTcQjhw';

const sharedSettings = {
  customerId: '7287266360',
  currency: 'TWD',
  status: 'PAUSED',
  startDate: '2026-06-03',
  endDate: '2026-06-30',
  location: {
    name: '臺南市',
    storeAddress: '台南市南區文南路49號1樓',
    latitude: 22.9830414,
    longitude: 120.1897276,
    geoTargetConstant: 'NEEDS_GOOGLE_ADS_API_RESOLUTION'
  },
  language: {
    name: '繁體中文（台灣）',
    languageConstant: 'NEEDS_GOOGLE_ADS_API_RESOLUTION'
  },
  networks: {
    targetGoogleSearch: true,
    targetSearchPartners: false,
    targetContentNetwork: false
  },
  bidding: {
    strategy: 'MAXIMIZE_CLICKS',
    cpcBidCeilingMicros: 20_000_000
  },
  callAsset: {
    phoneNumber: '06 263 5885',
    countryCode: 'TW'
  }
};

const campaigns = [
  {
    name: 'HIH_202606_Search_Brand_Map',
    adGroupName: 'Brand_Search',
    dailyBudgetTwd: 43,
    finalUrl: officialOrderingUrl,
    originalIntentUrl: googleMapsUrl,
    finalUrlNote:
      '後台實測使用官方 iCHEF 點餐頁較穩定；Google Maps 連結保留作為 sitelink/導航素材，避免搜尋廣告主網址驗證卡住。',
    displayPath: ['opening', 'hansik'],
    keywords: [
      { text: '韓食日常', matchType: 'PHRASE' },
      { text: '韓食日常', matchType: 'EXACT' },
      { text: '韓食日常鍋物', matchType: 'PHRASE' },
      { text: '韓食日常鍋物', matchType: 'EXACT' },
      { text: '韓食日常文南店', matchType: 'PHRASE' },
      { text: '韓食日常文南店', matchType: 'EXACT' },
      { text: 'Hansik Ilsang', matchType: 'PHRASE' },
      { text: '韓食日常 Uber Eats', matchType: 'PHRASE' }
    ],
    headlines: [
      '韓食日常鍋物開幕慶',
      '點鍋物送手工料',
      '韓食日常文南店',
      '導航前往韓食日常',
      'Uber Eats看韓食日常',
      '6月開幕慶進行中'
    ],
    descriptions: [
      '韓食日常鍋物文南店6/1至6/30開幕慶，點鍋物隨鍋送手工料。',
      '想吃韓式鍋物可查看菜單、導航前往，或搜尋Uber Eats韓食日常。'
    ]
  },
  {
    name: 'HIH_202606_Search_Local_KoreanHotpot',
    adGroupName: 'Local_KoreanHotpot',
    dailyBudgetTwd: 71,
    finalUrl: officialOrderingUrl,
    originalIntentUrl: googleMapsUrl,
    finalUrlNote:
      '附近韓式鍋物搜尋先導到官方菜單頁；Google Maps 導航作為 sitelink，降低主網址政策與追蹤風險。',
    displayPath: ['korean', 'hotpot'],
    keywords: [
      '附近韓式料理',
      '附近韓式鍋物',
      '韓式火鍋',
      '韓式料理',
      '泡菜鍋',
      '大醬湯',
      '韓式湯飯',
      '海鮮豆腐湯',
      '馬鈴薯排骨湯'
    ].map((text) => ({ text, matchType: 'PHRASE' })),
    headlines: [
      '韓式鍋物新選擇',
      '今天晚餐來一鍋',
      '泡菜鍋與大醬湯',
      '附近韓式鍋物',
      '平日也能吃韓食',
      '文南店開幕慶'
    ],
    descriptions: [
      '想吃韓式鍋物、泡菜鍋、大醬湯或韓式湯飯？韓食日常鍋物文南店開幕慶進行中。',
      '文南店6月開幕慶進行中，點鍋物隨鍋送手工料，適合午餐晚餐到店享用。'
    ]
  },
  {
    name: 'HIH_202606_Search_Delivery',
    adGroupName: 'Delivery_Search',
    dailyBudgetTwd: 29,
    finalUrl: uberEatsUrl,
    originalIntentUrl: uberEatsUrl,
    finalUrlNote: '外送搜尋以 Uber Eats 已確認店家頁承接；Foodpanda 未確認前不放入正式廣告文字。',
    displayPath: ['delivery', 'hansik'],
    keywords: [
      '韓式料理外送',
      '韓式鍋物外送',
      '泡菜鍋外送',
      'Uber Eats 韓式',
      '韓食日常外送',
      '附近外送韓式料理'
    ].map((text) => ({ text, matchType: 'PHRASE' })),
    headlines: [
      '韓式鍋物也能外送',
      'Uber Eats搜尋韓食日常',
      '官方點餐看菜單',
      '點鍋物送手工料',
      '在家吃韓式鍋物'
    ],
    descriptions: [
      '想外送韓式鍋物，可先查看Uber Eats或官方點餐頁。6/1至6/30開幕慶點鍋物送手工料。',
      '可先查看Uber Eats或官方點餐頁，想吃韓式鍋物在家也能輕鬆安排。'
    ]
  }
];

const sitelinks = [
  { text: '導航前往', finalUrl: googleMapsUrl, description1: '查看店址', description2: '前往文南店' },
  { text: '查看官方菜單', finalUrl: officialOrderingUrl, description1: '多款鍋物', description2: '查看餐點' },
  { text: 'Uber Eats外送', finalUrl: uberEatsUrl, description1: '外送平台', description2: '搜尋韓食日常' }
];

const callouts = ['6/1-6/30開幕慶', '點鍋物送手工料', '多款韓式湯鍋', '文南店新開幕', '可導航前往'];

const negativeKeywords = [
  '食譜',
  '做法',
  '教學',
  '影片',
  '韓劇',
  '免費',
  '加盟',
  '批發',
  '求職',
  '工作',
  '二手',
  '泡菜製作',
  '火鍋料批發',
  '韓文',
  '韓國旅遊'
];

const payload = {
  client: '韓食日常鍋物',
  generatedAt: new Date().toISOString(),
  mode: 'dry-run',
  livePolicy: '全部 Campaign / Ad Group / Ad / Keyword 預設 PAUSED；未經提姆先生批准不得啟用 ACTIVE 或發布正式花費。',
  googleAdsAccount: {
    accountName: 'EWALK數位漫步｜美業AI行銷服務領航者',
    customerId: sharedSettings.customerId
  },
  sourceFiles: [
    '2026-06-02_Google搜尋廣告建稿表.csv',
    '2026-06-03_GoogleAds後台設定實測紀錄.md',
    '2026-06-03_GoogleAds_PAUSED草稿設定操作單.md'
  ],
  sharedSettings,
  campaigns: campaigns.map((campaign) => ({
    ...campaign,
    status: 'PAUSED',
    dailyBudgetMicros: campaign.dailyBudgetTwd * 1_000_000,
    adGroupStatus: 'PAUSED',
    adStatus: 'PAUSED',
    keywordStatus: 'PAUSED',
    responsiveSearchAd: {
      status: 'PAUSED',
      finalUrls: [campaign.finalUrl],
      displayPath: campaign.displayPath,
      headlines: campaign.headlines.map((text) => ({ text })),
      descriptions: campaign.descriptions.map((text) => ({ text }))
    }
  })),
  assets: {
    sitelinks,
    callouts,
    call: sharedSettings.callAsset
  },
  negativeKeywords,
  apiReadiness: {
    readyForLiveApi: false,
    missingBeforeLiveApi: [
      'Google Ads developer token',
      'Google Ads API OAuth client / refresh token',
      '確認臺南市 geoTargetConstant',
      '確認繁體中文（台灣） languageConstant',
      '確認是否要以 API 建立正式 PAUSED 草稿'
    ],
    safeNextStep:
      '使用本 dry-run JSON 轉成 Google Ads API mutate operations，或先用 Google Ads Editor 匯入 CSV 檢查，所有狀態保持 PAUSED。'
  }
};

function toGoogleAdsDate(date) {
  return date.replaceAll('-', '');
}

function todayIsoDateInTaipei() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

function effectiveStartDate() {
  const today = todayIsoDateInTaipei();
  return sharedSettings.startDate > today ? sharedSettings.startDate : today;
}

function makeAdTextAssets(values) {
  return values.map((text) => ({ text }));
}

function buildMutateOperationsPreview({ customerId, campaigns: campaignPayloads }) {
  const operations = [];
  let tempId = -1;

  for (const campaign of campaignPayloads) {
    const budgetResourceName = `customers/${customerId}/campaignBudgets/${tempId--}`;
    const campaignResourceName = `customers/${customerId}/campaigns/${tempId--}`;
    const adGroupResourceName = `customers/${customerId}/adGroups/${tempId--}`;

    operations.push({
      campaignBudgetOperation: {
        create: {
          resourceName: budgetResourceName,
          name: `${campaign.name}_DailyBudget`,
          amountMicros: campaign.dailyBudgetMicros,
          deliveryMethod: 'STANDARD',
          explicitlyShared: false
        }
      }
    });

    operations.push({
      campaignOperation: {
        create: {
          resourceName: campaignResourceName,
          name: campaign.name,
          status: 'PAUSED',
          advertisingChannelType: 'SEARCH',
          campaignBudget: budgetResourceName,
          startDate: toGoogleAdsDate(effectiveStartDate()),
          endDate: toGoogleAdsDate(sharedSettings.endDate),
          containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
          manualCpc: {
            enhancedCpcEnabled: false
          },
          networkSettings: {
            targetGoogleSearch: sharedSettings.networks.targetGoogleSearch,
            targetSearchNetwork: sharedSettings.networks.targetSearchPartners,
            targetPartnerSearchNetwork: sharedSettings.networks.targetSearchPartners,
            targetContentNetwork: sharedSettings.networks.targetContentNetwork
          }
        }
      }
    });

    operations.push({
      campaignCriterionOperation: {
        create: {
          campaign: campaignResourceName,
          location: {
            geoTargetConstant: sharedSettings.location.geoTargetConstant
          }
        },
        unresolved: true,
        note: '需先以 Google Ads API geo target lookup 解析「臺南市」對應的 geoTargetConstant。'
      }
    });

    operations.push({
      campaignCriterionOperation: {
        create: {
          campaign: campaignResourceName,
          language: {
            languageConstant: sharedSettings.language.languageConstant
          }
        },
        unresolved: true,
        note: '需先確認「繁體中文（台灣）」對應的 Google Ads API languageConstant。'
      }
    });

    operations.push({
      adGroupOperation: {
        create: {
          resourceName: adGroupResourceName,
          campaign: campaignResourceName,
          name: campaign.adGroupName,
          status: 'PAUSED',
          type: 'SEARCH_STANDARD',
          cpcBidMicros: sharedSettings.bidding.cpcBidCeilingMicros
        }
      }
    });

    for (const keyword of campaign.keywords) {
      operations.push({
        adGroupCriterionOperation: {
          create: {
            adGroup: adGroupResourceName,
            status: 'PAUSED',
            keyword: {
              text: keyword.text,
              matchType: keyword.matchType
            }
          }
        }
      });
    }

    operations.push({
      adGroupAdOperation: {
        create: {
          adGroup: adGroupResourceName,
          status: 'PAUSED',
          ad: {
            finalUrls: [campaign.finalUrl],
            displayUrl: campaign.finalUrl,
            responsiveSearchAd: {
              headlines: makeAdTextAssets(campaign.headlines),
              descriptions: makeAdTextAssets(campaign.descriptions),
              path1: campaign.displayPath[0],
              path2: campaign.displayPath[1]
            }
          }
        }
      }
    });
  }

  return {
    client: payload.client,
    generatedAt: new Date().toISOString(),
    mode: 'preview-only',
    livePolicy: payload.livePolicy,
    endpoint: `customers/${customerId}/googleAds:mutate`,
    unresolvedBlockers: [
      'Google Ads developer token',
      'OAuth access token / refresh token',
      'login-customer-id if required',
      'geoTargetConstant for 臺南市',
      'languageConstant for 繁體中文（台灣）'
    ],
    requestHeadersNeeded: [
      'developer-token',
      'Authorization: Bearer <access_token>',
      'login-customer-id（若 manager account 操作 client account）'
    ],
    mutateRequestPreview: {
      customerId,
      partialFailure: false,
      validateOnly: true,
      responseContentType: 'MUTABLE_RESOURCE',
      mutateOperations: operations
    }
  };
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const editorRows = [];
for (const campaign of payload.campaigns) {
  editorRows.push({
    Type: 'Campaign',
    Campaign: campaign.name,
    'Campaign status': 'Paused',
    Budget: campaign.dailyBudgetTwd,
    'Budget type': 'Daily',
    'Campaign type': 'Search',
    Networks: 'Google search;Search partners',
    Location: sharedSettings.location.name,
    Language: sharedSettings.language.name,
    'Bid strategy': 'Maximize clicks',
    'Max CPC': '20',
    'Final URL': campaign.finalUrl,
    Notes: campaign.finalUrlNote
  });

  editorRows.push({
    Type: 'Ad group',
    Campaign: campaign.name,
    'Ad group': campaign.adGroupName,
    'Ad group status': 'Paused',
    'Final URL': campaign.finalUrl
  });

  for (const keyword of campaign.keywords) {
    editorRows.push({
      Type: 'Keyword',
      Campaign: campaign.name,
      'Ad group': campaign.adGroupName,
      Keyword: keyword.text,
      'Match type': keyword.matchType,
      Status: 'Paused'
    });
  }

  editorRows.push({
    Type: 'Responsive search ad',
    Campaign: campaign.name,
    'Ad group': campaign.adGroupName,
    Status: 'Paused',
    'Final URL': campaign.finalUrl,
    'Path 1': campaign.displayPath[0],
    'Path 2': campaign.displayPath[1],
    'Headline 1': campaign.headlines[0],
    'Headline 2': campaign.headlines[1],
    'Headline 3': campaign.headlines[2],
    'Headline 4': campaign.headlines[3],
    'Headline 5': campaign.headlines[4],
    'Headline 6': campaign.headlines[5] || '',
    'Description 1': campaign.descriptions[0],
    'Description 2': campaign.descriptions[1]
  });
}

const columns = Array.from(new Set(editorRows.flatMap((row) => Object.keys(row))));
const csv = [columns.join(','), ...editorRows.map((row) => columns.map((col) => csvEscape(row[col])).join(','))].join('\n');

mkdirSync(dirname(outputJson), { recursive: true });
writeFileSync(outputJson, JSON.stringify(payload, null, 2));
writeFileSync(outputCsv, csv);
writeFileSync(
  outputMutates,
  JSON.stringify(
    buildMutateOperationsPreview({
      customerId: payload.googleAdsAccount.customerId,
      campaigns: payload.campaigns
    }),
    null,
    2
  )
);

console.log(JSON.stringify({ outputJson, outputCsv, outputMutates, campaigns: campaigns.length, mode: payload.mode }, null, 2));
