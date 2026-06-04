#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  getScriptRoot,
  loadEnv,
  previewText,
  printCliError,
  readGraphConfig,
  readRequiredSecretEnv,
} from './lib/env.mjs';
import { graphGet, graphPost, graphPostMultipart } from './lib/meta-client.mjs';

const CLIENT_NAME = '韓食日常鍋物';
const CAMPAIGN_NAME = 'HIH_202606_OpeningPromo_Meta_Local';
const API_OBJECTIVE = 'OUTCOME_TRAFFIC';
const START_TIME = '2026-06-03T00:00:00+0800';
const END_TIME = '2026-06-30T23:59:00+0800';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const { apiBase, graphVersion } = readGraphConfig(env);
  const scriptRoot = getScriptRoot();
  const brainRoot = path.resolve(scriptRoot, '../..');
  const campaignDir = path.join(
    brainRoot,
    '01_客戶/韓食日常鍋物/03_提案與交付/2026-06_開幕慶廣告活動',
  );
  const csvPath = path.join(campaignDir, '2026-06-02_Meta廣告建稿表.csv');
  const outputPath = path.join(campaignDir, '2026-06-03_Meta廣告全自動建稿_dry-run.json');

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const plan = buildPlan(rows, {
    campaignDir,
    env,
    graphVersion,
  });

  fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

  console.log('Meta 廣告全自動建稿 dry-run 已完成');
  console.log(`客戶：${CLIENT_NAME}`);
  console.log(`Campaign：${CAMPAIGN_NAME}`);
  console.log(`素材數：${plan.ads.length}`);
  console.log(`Live blockers：${plan.blockers.length}`);
  console.log(`輸出：${outputPath}`);

  if (!args.createPaused) {
    printBlockers(plan);
    return;
  }

  assertApprovedLiveRun(args, plan);

  const token = readRequiredSecretEnv(
    env,
    'META_ADS_ACCESS_TOKEN',
    '請使用具備 ads_management 的 User token 或 System User token。',
  );

  const result = await createPausedAds(plan, {
    apiBase,
    graphVersion,
    token,
  });

  console.log('Meta 廣告已建立為 PAUSED');
  console.log(`Campaign ID：${result.campaignId}`);
  for (const item of result.ads) {
    console.log(`Ad Set：${item.adSetId} / Creative：${item.creativeId} / Ad：${item.adId}`);
  }
}

function buildPlan(rows, context) {
  const { campaignDir, env, graphVersion } = context;
  const adAccountId = normalizeAdAccountId(env.META_AD_ACCOUNT_ID || '');
  const pageId = env.META_PAGE_ID || '1082884688247950';
  const latitude = numberOrNull(env.META_HANSIK_LATITUDE);
  const longitude = numberOrNull(env.META_HANSIK_LONGITUDE);
  const radiusKm = numberOrNull(env.META_HANSIK_RADIUS_KM) || 3;

  const blockers = [];

  if (!adAccountId) blockers.push('缺少 META_AD_ACCOUNT_ID，無法建立 Meta 廣告。');
  if (!env.META_ADS_ACCESS_TOKEN) blockers.push('缺少 META_ADS_ACCESS_TOKEN，無法呼叫 Marketing API。');
  if (!pageId) blockers.push('缺少 META_PAGE_ID，無法建立 Page link ad creative。');
  if (latitude === null || longitude === null) {
    blockers.push('缺少 META_HANSIK_LATITUDE / META_HANSIK_LONGITUDE，無法建立店周邊地理投放。');
  }
  if (!env.META_TAIWAN_UNIVERSAL_BENEFICIARY_ID || !env.META_TAIWAN_UNIVERSAL_PAYER_ID) {
    blockers.push('缺少 META_TAIWAN_UNIVERSAL_BENEFICIARY_ID / META_TAIWAN_UNIVERSAL_PAYER_ID，台灣地區廣告需完成受益者與出資者驗證。');
  }

  const ads = rows.map((row) => {
    const creativePath = path.resolve(campaignDir, row.Creative || '');
    const destinationInfo = resolveDestination(row, env);
    const destination = destinationInfo.value;
    const itemBlockers = [];

    if (!fs.existsSync(creativePath)) itemBlockers.push(`素材不存在：${creativePath}`);
    if (isPending(destination)) {
      itemBlockers.push(destinationInfo.blocker || `Destination 尚未補正式連結：${destination || row.Destination}`);
    }

    const dailyBudget = Number(row['Daily Budget Reference']);
    if (!Number.isFinite(dailyBudget) || dailyBudget <= 0) {
      itemBlockers.push(`Daily Budget Reference 不正確：${row['Daily Budget Reference']}`);
    }

    const adSetName = row['Ad Set'];
    const targeting = buildTargeting(adSetName, {
      latitude,
      longitude,
      radiusKm,
    });

    return {
      campaign: row.Campaign,
      adSet: adSetName,
      objective: row['Campaign Objective'],
      age: row.Age,
      geo: row.Geo,
      audience: row.Audience,
      dailyBudgetReferenceTwd: dailyBudget,
      creativePath,
      primaryText: row['Primary Text'],
      primaryTextPreview: previewText(row['Primary Text'], 90),
      headline: row.Headline,
      description: row.Description,
      cta: row.CTA,
      metaCtaType: mapCta(row.CTA),
      destination,
      destinationSource: destinationInfo.source,
      status: row.Status,
      targeting,
      blockers: itemBlockers,
    };
  });

  for (const ad of ads) {
    blockers.push(...ad.blockers.map((message) => `${ad.adSet}: ${message}`));
  }

  const campaignDailyBudgetReferenceTwd = ads.reduce((sum, ad) => sum + ad.dailyBudgetReferenceTwd, 0);

  return {
    client: CLIENT_NAME,
    generatedAt: new Date().toISOString(),
    graphVersion,
    mode: 'dry-run',
    livePolicy: '所有 Campaign / Ad Set / Ad 正式建立時一律使用 PAUSED；ACTIVE 需提姆先生另行批准。',
    adAccountId: adAccountId || '(missing)',
    pageId,
    campaignPayload: {
      name: CAMPAIGN_NAME,
      objective: API_OBJECTIVE,
      status: 'PAUSED',
      special_ad_categories: [],
      daily_budget: campaignDailyBudgetReferenceTwd,
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    },
    schedule: {
      startTime: START_TIME,
      endTime: END_TIME,
    },
    location: {
      latitude,
      longitude,
      radiusKm,
    },
    taiwanUniversalBeneficiaryId: env.META_TAIWAN_UNIVERSAL_BENEFICIARY_ID || null,
    taiwanUniversalPayerId: env.META_TAIWAN_UNIVERSAL_PAYER_ID || null,
    ads,
    blockers,
  };
}

async function createPausedAds(plan, options) {
  const { apiBase, graphVersion, token } = options;
  const adAccountPath = plan.adAccountId;

  const campaign = await findOrCreatePausedCampaign(plan, {
    apiBase,
    graphVersion,
    token,
  });

  const createdAds = [];

  for (const ad of plan.ads) {
    const adSet = await graphPost(`${adAccountPath}/adsets`, {
      apiBase,
      graphVersion,
      token,
      params: {
        name: ad.adSet,
        campaign_id: campaign.id,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS',
        start_time: plan.schedule.startTime,
        end_time: plan.schedule.endTime,
        targeting: JSON.stringify(ad.targeting),
        regional_regulated_categories: JSON.stringify(['TAIWAN_UNIVERSAL']),
        regional_regulation_identities: JSON.stringify({
          taiwan_universal_beneficiary: plan.taiwanUniversalBeneficiaryId,
          taiwan_universal_payer: plan.taiwanUniversalPayerId,
        }),
        status: 'PAUSED',
      },
    });

    const imageBuffer = fs.readFileSync(ad.creativePath);
    const imageUpload = await graphPostMultipart(`${adAccountPath}/adimages`, {
      apiBase,
      graphVersion,
      token,
      files: [
        {
          field: 'filename',
          blob: new Blob([imageBuffer]),
          filename: path.basename(ad.creativePath),
        },
      ],
    });
    const imageHash = Object.values(imageUpload.images || {})[0]?.hash;
    if (!imageHash) throw new Error(`Meta 未回傳 image hash：${ad.creativePath}`);

    const creative = await graphPost(`${adAccountPath}/adcreatives`, {
      apiBase,
      graphVersion,
      token,
      params: {
        name: `${ad.adSet}_${ad.headline}`,
        object_story_spec: JSON.stringify({
          page_id: plan.pageId,
          link_data: {
            image_hash: imageHash,
            link: ad.destination,
            message: ad.primaryText,
            name: ad.headline,
            description: ad.description,
            call_to_action: {
              type: ad.metaCtaType,
              value: {
                link: ad.destination,
              },
            },
          },
        }),
      },
    });

    const createdAd = await graphPost(`${adAccountPath}/ads`, {
      apiBase,
      graphVersion,
      token,
      params: {
        name: `${ad.adSet}_${ad.headline}`,
        adset_id: adSet.id,
        creative: JSON.stringify({ creative_id: creative.id }),
        status: 'PAUSED',
      },
    });

    createdAds.push({
      adSetName: ad.adSet,
      adSetId: adSet.id,
      creativeId: creative.id,
      adId: createdAd.id,
    });
  }

  return {
    campaignId: campaign.id,
    ads: createdAds,
  };
}

async function findOrCreatePausedCampaign(plan, options) {
  const { apiBase, graphVersion, token } = options;
  const adAccountPath = plan.adAccountId;
  const existing = await graphGet(`${adAccountPath}/campaigns`, {
    apiBase,
    graphVersion,
    token,
    params: {
      fields: 'id,name,status,effective_status',
      limit: '50',
    },
  });
  const campaign = (existing.data || []).find((item) => item.name === plan.campaignPayload.name);

  if (campaign) {
    if (campaign.status !== 'PAUSED') {
      throw new Error(`同名 Campaign 已存在但不是 PAUSED：${campaign.id} / ${campaign.status}`);
    }
    return campaign;
  }

  return graphPost(`${adAccountPath}/campaigns`, {
    apiBase,
    graphVersion,
    token,
    params: {
      name: plan.campaignPayload.name,
      objective: plan.campaignPayload.objective,
      status: 'PAUSED',
      special_ad_categories: JSON.stringify(plan.campaignPayload.special_ad_categories),
      daily_budget: String(plan.campaignPayload.daily_budget),
      bid_strategy: plan.campaignPayload.bid_strategy,
    },
  });
}

function assertApprovedLiveRun(args, plan) {
  if (args.approvedBy !== '提姆先生') {
    throw new Error('正式建立 PAUSED 廣告前，必須加上 --approved-by "提姆先生"。');
  }

  if (!args.confirmAdAccountId || normalizeAdAccountId(args.confirmAdAccountId) !== plan.adAccountId) {
    throw new Error('正式建立 PAUSED 廣告前，必須加上 --confirm-ad-account-id 並與 META_AD_ACCOUNT_ID 完全一致。');
  }

  if (plan.blockers.length) {
    throw new Error(`仍有 ${plan.blockers.length} 個 live blocker，不能呼叫 Meta API 建稿。請先看 dry-run JSON。`);
  }
}

function printBlockers(plan) {
  if (!plan.blockers.length) {
    console.log('Dry-run 未發現 live blocker。若要建立 PAUSED 草稿，仍需提姆先生批准。');
    return;
  }

  console.log('目前不能正式呼叫 Meta 建稿，原因：');
  for (const blocker of plan.blockers) {
    console.log(`- ${blocker}`);
  }
}

function buildTargeting(adSetName, location) {
  const [ageMin, ageMax] = parseAge(adSetName);
  const targeting = {
    age_min: ageMin,
    age_max: ageMax,
  };

  if (location.latitude !== null && location.longitude !== null) {
    targeting.geo_locations = {
      custom_locations: [
        {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: location.radiusKm,
          distance_unit: 'kilometer',
        },
      ],
    };
  }

  return targeting;
}

function parseAge(adSetName) {
  if (adSetName === 'Student_Office_Meal') return [18, 35];
  if (adSetName === 'Local_5km_Delivery') return [20, 44];
  return [18, 44];
}

function mapCta(label) {
  if (/私訊/.test(label)) return 'MESSAGE_PAGE';
  return 'LEARN_MORE';
}

function resolveDestination(row, env) {
  const adSet = row['Ad Set'];
  const original = row.Destination || '';

  if (adSet === 'Local_3km_Core' || adSet === 'Student_Office_Meal') {
    return valueFromEnvOrOriginal({
      env,
      keys: ['META_HANSIK_GOOGLE_MAPS_URL'],
      original,
      blocker: '缺少 META_HANSIK_GOOGLE_MAPS_URL，無法替換 Google 商家導航連結。',
    });
  }

  if (adSet === 'Local_5km_Delivery') {
    return valueFromEnvOrOriginal({
      env,
      keys: ['META_HANSIK_DELIVERY_URL', 'META_HANSIK_UBER_EATS_URL', 'META_HANSIK_FOODPANDA_URL'],
      original,
      blocker: '缺少 META_HANSIK_DELIVERY_URL / META_HANSIK_UBER_EATS_URL / META_HANSIK_FOODPANDA_URL，無法替換外送平台連結。',
    });
  }

  if (adSet === 'IG_FB_Engagers') {
    return valueFromEnvOrOriginal({
      env,
      keys: ['META_HANSIK_MESSAGE_URL', 'META_HANSIK_GOOGLE_MAPS_URL'],
      original,
      blocker: '缺少 META_HANSIK_MESSAGE_URL，無法替換私訊或粉專導流連結。',
    });
  }

  return {
    value: original,
    source: 'csv',
    blocker: '',
  };
}

function valueFromEnvOrOriginal({ env, keys, original, blocker }) {
  for (const key of keys) {
    const value = env[key];
    if (value && !isPending(value)) {
      return {
        value,
        source: key,
        blocker: '',
      };
    }
  }

  return {
    value: original,
    source: 'csv',
    blocker,
  };
}

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseArgs(argv) {
  const args = {
    createPaused: false,
    approvedBy: '',
    confirmAdAccountId: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--create-paused') args.createPaused = true;
    if (arg === '--approved-by') args.approvedBy = argv[++i] || '';
    if (arg === '--confirm-ad-account-id') args.confirmAdAccountId = argv[++i] || '';
  }

  return args;
}

function normalizeAdAccountId(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.startsWith('act_') ? text : `act_${text}`;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isPending(value) {
  return !value || /待補|待連結|確認後|FB \/ IG 私訊/.test(value);
}

main().catch(printCliError);
