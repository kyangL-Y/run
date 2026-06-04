const resultView = window.FliggyOpsResultView
const statusDot = document.getElementById("status-dot")
const statusText = document.getElementById("status-text")
const workspaceGate = document.getElementById("workspace-gate")
const workspaceGateTitle = document.getElementById("workspace-gate-title")
const workspaceGateNote = document.getElementById("workspace-gate-note")
const workspaceGateBtn = document.getElementById("workspace-gate-btn")
const appShell = document.getElementById("app-shell")
const resultBox = document.getElementById("result-box")
const targetsInput = document.getElementById("targets-input")
const merchantPlatformUrlInputs = {
  fliggy: document.getElementById("merchant-platform-url-fliggy"),
  ctrip: document.getElementById("merchant-platform-url-ctrip"),
  meituan: document.getElementById("merchant-platform-url-meituan")
}
const workflowLoadBtn = document.getElementById("workflow-load-btn")
const workflowAnalyzeBtn = document.getElementById("workflow-analyze-btn")
const workflowFillBtn = document.getElementById("workflow-fill-btn")
const workflowSubmitBtn = document.getElementById("workflow-submit-btn")
const workflowBox = document.getElementById("workflow-box")
const configuredHotelsBox = document.getElementById("configured-hotels-box")
const competitorRoomPricesBox = document.getElementById("competitor-room-prices-box")
const roomPricesBtn = document.getElementById("room-prices-btn")
const refreshRoomConfigBtn = document.getElementById("refresh-room-config-btn")
const debugRoomConfigBtn = document.getElementById("debug-room-config-btn")
const roomSettingsBtn = document.getElementById("open-room-settings-btn")
const competitorAdviceHotelInput = document.getElementById("competitor-advice-hotel-input")
const competitorAdviceTotalRoomsInput = document.getElementById("competitor-advice-total-rooms-input")
const competitorAdviceAvailableRoomsInput = document.getElementById("competitor-advice-available-rooms-input")
const competitorAdviceCurrentPriceInput = document.getElementById("competitor-advice-current-price-input")
const competitorAdviceStrategySelect = document.getElementById("competitor-advice-strategy-select")
const competitorAdviceBtn = document.getElementById("competitor-advice-btn")
const competitorTrendRefreshBtn = document.getElementById("competitor-trend-refresh-btn")
const competitorTrendSeriesSelect = document.getElementById("competitor-trend-series-select")
const competitorTrendBox = document.getElementById("competitor-trend-box")
const competitorAdviceBox = document.getElementById("competitor-advice-box")
const uniformPriceUrlInput = document.getElementById("uniform-price-url-input")
const uniformTargetPriceInput = document.getElementById("uniform-target-price-input")
const uniformSubmitBtn = document.getElementById("uniform-submit-btn")
const refreshBtn = document.getElementById("refresh-btn")
const statusBtn = document.getElementById("status-btn")
const collectBtn = document.getElementById("collect-btn")
const panelBtn = document.getElementById("panel-btn")
const optionsBtn = document.getElementById("options-btn")

const RUNTIME_TIMEOUT_MS = 30000
const TAB_TIMEOUT_MS = 4000
const DEFAULT_MERCHANT_PRICE_URL = "https://hotel.fliggy.com/ebooking/hotelBaseInfoUv.htm#/ebk-rp/roomsVsManage"
const MERCHANT_PLATFORM_DEFS = {
  fliggy: {
    id: "fliggy",
    name: "飞猪",
    priceUrl: DEFAULT_MERCHANT_PRICE_URL,
    hostPattern: /(?:fliggy\.com|taobao\.com|alitrip\.com)/i
  },
  ctrip: {
    id: "ctrip",
    name: "携程",
    priceUrl: "",
    hostPattern: /(?:ctrip\.com|trip\.com)/i
  },
  meituan: {
    id: "meituan",
    name: "美团",
    priceUrl: "",
    hostPattern: /(?:meituan\.com|dianping\.com)/i
  }
}
const MERCHANT_WORKFLOW_PLATFORM_IDS = ["fliggy", "ctrip", "meituan"]
const POPUP_VIEW_DEFS = [
  { id: "workspace", label: "工作台" },
  { id: "feedback", label: "反馈" }
]
const WORKSPACE_GROUP_DEFS = [
  { id: "basic", label: "基础功能" },
  { id: "merchant", label: "商家改价" }
]
const BASIC_SECTION_DEFS = [
  { id: "room-prices", label: "配置竞对房型价" },
  { id: "advice", label: "我的价格" },
  { id: "quick-actions", label: "快捷动作" }
]
const IS_EMBEDDED_POPUP = new URLSearchParams(window.location.search).get("embedded") === "1"
const COMPETITOR_ROOM_PRICE_MESSAGE_TYPES = [
  "COMPETITOR_ROOM_PRICES_TABS",
  "COMPETITOR_ROOM_PRICES"
]

const DEFAULT_EXTENSION_CONFIG = {
  baseUrl: "http://49.232.42.9",
  tenantId: "1",
  shopId: "1",
  debugUrl: "http://127.0.0.1:9222",
  startUrl: "https://hotel.fliggy.com/",
  latestPriceLimit: 5,
  maxPages: 1,
  maxHotels: 1,
  saveResult: false,
  authToken: "",
  authUser: null,
  currentShop: null,
  shops: [],
  authenticated: false,
  competitorHotels: [],
  manualRoomMappingsByShop: {},
  manualRoomMappings: [],
  manualTargets: ""
}

function coercePositiveInt(value, fallback, minimum, maximum) {
  const next = Number(value)
  if (!Number.isFinite(next)) {
    return fallback
  }
  return Math.min(Math.max(Math.round(next), minimum), maximum)
}

function normalizeCompetitorHotels(items) {
  if (!Array.isArray(items)) {
    return []
  }

  const result = []
  const seen = new Set()
  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue
    }
    const name = String(item.name || "").replace(/\s+/g, " ").trim()
    const url = String(item.url || "").trim()
    if (!name || !url) {
      continue
    }
    const key = `${name}|${url}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    result.push({ name, url })
    if (result.length >= 20) {
      break
    }
  }
  return result
}

function normalizeManualRoomTerms(items) {
  if (!Array.isArray(items)) {
    return []
  }

  const result = []
  const seen = new Set()
  for (const rawItem of items) {
    const item = String(rawItem || "").replace(/\s+/g, " ").trim()
    if (!item || seen.has(item)) {
      continue
    }
    seen.add(item)
    result.push(item)
    if (result.length >= 20) {
      break
    }
  }
  return result
}

function normalizeManualRoomMapping(item) {
  if (!item || typeof item !== "object") {
    return null
  }
  const displayName = String(item.displayName || item.display_name || "").replace(/\s+/g, " ").trim()
  const roomType = String(item.roomType || item.room_type || "").replace(/\s+/g, " ").trim()
  const rateName = String(item.rateName || item.rate_name || "").replace(/\s+/g, " ").trim() || "标准价"
  const currentPrice = toPositiveNumber(item.currentPrice ?? item.current_price)
  if (!displayName || !currentPrice) {
    return null
  }
  return {
    displayName,
    roomType: roomType || displayName,
    rateName,
    currentPrice,
    competitorRoomNames: normalizeManualRoomTerms(item.competitorRoomNames || item.competitor_room_names),
    enabled: item.enabled !== false
  }
}

function normalizeManualRoomMappings(items) {
  if (!Array.isArray(items)) {
    return []
  }

  const result = []
  const seen = new Set()
  for (const item of items) {
    const normalized = normalizeManualRoomMapping(item)
    if (!normalized || normalized.enabled === false) {
      continue
    }
    const dedupeKey = [normalized.displayName, normalized.roomType, normalized.rateName].join("|")
    if (seen.has(dedupeKey)) {
      continue
    }
    seen.add(dedupeKey)
    result.push(normalized)
    if (result.length >= 50) {
      break
    }
  }
  return result
}

function normalizeManualRoomMappingsByShop(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }
  const result = {}
  for (const [shopId, items] of Object.entries(value)) {
    const normalizedItems = normalizeManualRoomMappings(items)
    if (!normalizedItems.length) {
      continue
    }
    result[String(shopId).trim()] = normalizedItems
  }
  return result
}

function normalizeAuthUser(value) {
  if (!value || typeof value !== "object") {
    return null
  }
  const tenantId = Number(value.tenant_id ?? value.tenantId ?? 0)
  const username = String(value.username || "").trim()
  if (!tenantId || !username) {
    return null
  }
  return {
    user_id: Number(value.user_id ?? value.userId ?? 0) || 0,
    tenant_id: tenantId,
    username,
    is_admin: Boolean(value.is_admin ?? value.isAdmin)
  }
}

function normalizeShopSummary(value) {
  if (!value || typeof value !== "object") {
    return null
  }
  const shopId = Number(value.shop_id ?? value.shopId ?? 0)
  if (!shopId) {
    return null
  }
  return {
    shop_id: shopId,
    shop_name: String(value.shop_name || value.shopName || "").trim() || `Shop ${shopId}`,
    status: String(value.status || "enabled").trim() || "enabled"
  }
}

function normalizeShopSummaries(items) {
  if (!Array.isArray(items)) {
    return []
  }
  const result = []
  const seen = new Set()
  for (const item of items) {
    const normalized = normalizeShopSummary(item)
    if (!normalized || seen.has(normalized.shop_id)) {
      continue
    }
    seen.add(normalized.shop_id)
    result.push(normalized)
  }
  return result
}

function resolveActiveShopId(config) {
  const currentShopId = String(config?.currentShop?.shop_id || "").trim()
  if (currentShopId) {
    return currentShopId
  }
  const shopId = String(config?.shopId || "").trim()
  return shopId || DEFAULT_EXTENSION_CONFIG.shopId
}

function getManualRoomMappingsForShop(config, explicitShopId = "") {
  const mappingsByShop = normalizeManualRoomMappingsByShop(config?.manualRoomMappingsByShop)
  const shopId = String(explicitShopId || resolveActiveShopId(config) || "").trim()
  if (shopId && Array.isArray(mappingsByShop[shopId]) && mappingsByShop[shopId].length) {
    return mappingsByShop[shopId]
  }
  return normalizeManualRoomMappings(config?.manualRoomMappings)
}


function normalizeMerchantRoomMapping(item) {
  if (!item || typeof item !== "object") {
    return null
  }
  const status = String(item.status || "").trim().toLowerCase()
  if (["disabled", "inactive", "deleted", "archived"].includes(status)) {
    return null
  }
  const roomType = String(item.room_name || item.roomName || "").replace(/\s+/g, " ").trim()
  const rateName = String(item.rate_name || item.rateName || "").replace(/\s+/g, " ").trim() || "标准价"
  const currentPrice = toPositiveNumber(item.current_price ?? item.currentPrice)
  if (!roomType) {
    return null
  }
  const displayName = String(item.display_name || item.displayName || "").replace(/\s+/g, " ").trim()
    || (rateName && rateName !== "标准价" ? `${roomType} / ${rateName}` : roomType)
  return {
    displayName,
    roomType,
    rateName,
    currentPrice: currentPrice || null,
    gid: String(item.gid || "").trim(),
    hid: String(item.hid || "").trim(),
    competitorRoomNames: normalizeManualRoomTerms(item.competitorRoomNames || item.competitor_room_names),
    enabled: item.enabled !== false
  }
}

function normalizeMerchantRoomMappings(items) {
  if (!Array.isArray(items)) {
    return []
  }

  const result = []
  const seen = new Set()
  for (const item of items) {
    const normalized = normalizeMerchantRoomMapping(item)
    if (!normalized || normalized.enabled === false) {
      continue
    }
    const dedupeKey = [normalized.roomType, normalized.rateName].join("|")
    if (seen.has(dedupeKey)) {
      continue
    }
    seen.add(dedupeKey)
    result.push(normalized)
    if (result.length >= 100) {
      break
    }
  }
  return result
}

function getPreferredRoomMappingState(config, merchantMappings) {
  const localMappings = getManualRoomMappingsForShop(config)
  if (localMappings.length) {
    return {
      items: localMappings,
      count: localMappings.length,
      source: "local",
      sourceLabel: "本地映射"
    }
  }

  return {
    items: [],
    count: 0,
    source: "none",
    sourceLabel: "未维护"
  }
}

function mergeStoredConfigAreas(localStored, syncStored) {
  const localData = localStored && typeof localStored === "object" ? localStored : {}
  const syncData = syncStored && typeof syncStored === "object" ? syncStored : {}
  const merged = {
    ...syncData,
    ...localData
  }

  const localUpdatedAt = Number(localData.configUpdatedAt || 0)
  const syncUpdatedAt = Number(syncData.configUpdatedAt || 0)
  if (localUpdatedAt && syncUpdatedAt && localUpdatedAt !== syncUpdatedAt) {
    return localUpdatedAt >= syncUpdatedAt
      ? { ...syncData, ...localData }
      : { ...localData, ...syncData }
  }

  const localCompetitorHotels = normalizeCompetitorHotels(localData.competitorHotels)
  const syncCompetitorHotels = normalizeCompetitorHotels(syncData.competitorHotels)
  if (localCompetitorHotels.length) {
    merged.competitorHotels = localCompetitorHotels
  } else if (syncCompetitorHotels.length) {
    merged.competitorHotels = syncCompetitorHotels
  }

  const localManualTargets = String(localData.manualTargets || "").trim()
  const syncManualTargets = String(syncData.manualTargets || "").trim()
  if (localManualTargets) {
    merged.manualTargets = localManualTargets
  } else if (syncManualTargets) {
    merged.manualTargets = syncManualTargets
  }

  const localManualRoomMappingsByShop = normalizeManualRoomMappingsByShop(localData.manualRoomMappingsByShop)
  const syncManualRoomMappingsByShop = normalizeManualRoomMappingsByShop(syncData.manualRoomMappingsByShop)
  merged.manualRoomMappingsByShop = Object.keys(localManualRoomMappingsByShop).length
    ? { ...syncManualRoomMappingsByShop, ...localManualRoomMappingsByShop }
    : syncManualRoomMappingsByShop

  const localManualRoomMappings = normalizeManualRoomMappings(localData.manualRoomMappings)
  const syncManualRoomMappings = normalizeManualRoomMappings(syncData.manualRoomMappings)
  if (localManualRoomMappings.length) {
    merged.manualRoomMappings = localManualRoomMappings
  } else if (syncManualRoomMappings.length) {
    merged.manualRoomMappings = syncManualRoomMappings
  }

  for (const key of ["baseUrl", "tenantId", "shopId", "debugUrl", "startUrl"]) {
    const localValue = String(localData[key] || "").trim()
    const syncValue = String(syncData[key] || "").trim()
    if (localValue) {
      merged[key] = localValue
    } else if (syncValue) {
      merged[key] = syncValue
    }
  }

  for (const key of ["latestPriceLimit", "maxPages", "maxHotels"]) {
    const localValue = Number(localData[key])
    const syncValue = Number(syncData[key])
    if (Number.isFinite(localValue) && localValue > 0) {
      merged[key] = localValue
    } else if (Number.isFinite(syncValue) && syncValue > 0) {
      merged[key] = syncValue
    }
  }

  if (typeof localData.saveResult === "boolean") {
    merged.saveResult = localData.saveResult
  } else if (typeof syncData.saveResult === "boolean") {
    merged.saveResult = syncData.saveResult
  }

  return merged
}

function normalizeConfig(config) {
  const stored = config && typeof config === "object" ? config : {}
  const manualRoomMappingsByShop = normalizeManualRoomMappingsByShop(stored.manualRoomMappingsByShop)
  const authUser = normalizeAuthUser(stored.authUser)
  const currentShop = normalizeShopSummary(stored.currentShop)
  const authToken = String(stored.authToken || "").trim()
  const shopId = resolveActiveShopId(stored)
  return {
    ...DEFAULT_EXTENSION_CONFIG,
    ...stored,
    baseUrl: String(stored.baseUrl || DEFAULT_EXTENSION_CONFIG.baseUrl).trim() || DEFAULT_EXTENSION_CONFIG.baseUrl,
    tenantId: String(stored.tenantId || DEFAULT_EXTENSION_CONFIG.tenantId).trim() || DEFAULT_EXTENSION_CONFIG.tenantId,
    shopId: String(stored.shopId || DEFAULT_EXTENSION_CONFIG.shopId).trim() || DEFAULT_EXTENSION_CONFIG.shopId,
    debugUrl: String(stored.debugUrl || DEFAULT_EXTENSION_CONFIG.debugUrl).trim() || DEFAULT_EXTENSION_CONFIG.debugUrl,
    startUrl: String(stored.startUrl || DEFAULT_EXTENSION_CONFIG.startUrl).trim() || DEFAULT_EXTENSION_CONFIG.startUrl,
    latestPriceLimit: coercePositiveInt(stored.latestPriceLimit, DEFAULT_EXTENSION_CONFIG.latestPriceLimit, 1, 500),
    maxPages: coercePositiveInt(stored.maxPages, DEFAULT_EXTENSION_CONFIG.maxPages, 1, 20),
    maxHotels: coercePositiveInt(stored.maxHotels, DEFAULT_EXTENSION_CONFIG.maxHotels, 1, 500),
    saveResult: Boolean(stored.saveResult),
    authToken,
    authUser,
    currentShop,
    shops: normalizeShopSummaries(stored.shops),
    authenticated: Boolean(stored.authenticated || authToken && authUser && currentShop),
    competitorHotels: normalizeCompetitorHotels(stored.competitorHotels),
    manualRoomMappingsByShop,
    manualRoomMappings: getManualRoomMappingsForShop({
      ...stored,
      manualRoomMappingsByShop
    }, shopId),
    manualTargets: String(stored.manualTargets || "")
  }
}
async function readConfigFromStorage() {
  const [localStored, syncStored] = await Promise.all([
    chrome.storage.local.get(null).catch(() => ({})),
    chrome.storage.sync.get(null).catch(() => ({}))
  ])
  return normalizeConfig(mergeStoredConfigAreas(localStored, syncStored))
}

function selectPreferredConfig(runtimeConfig, storageConfig) {
  const runtimeValue = normalizeConfig(runtimeConfig)
  if (!storageConfig) {
    return runtimeValue
  }
  if (Boolean(runtimeValue?.authenticated && runtimeValue?.authUser && runtimeValue?.currentShop)) {
    return runtimeValue
  }

  const storageValue = normalizeConfig(storageConfig)
  const runtimeHotels = normalizeCompetitorHotels(runtimeValue.competitorHotels)
  const storageHotels = normalizeCompetitorHotels(storageValue.competitorHotels)
  const runtimeManualTargets = String(runtimeValue.manualTargets || "").trim()
  const storageManualTargets = String(storageValue.manualTargets || "").trim()
  const runtimeManualRoomMappings = getManualRoomMappingsForShop(runtimeValue)
  const storageManualRoomMappings = getManualRoomMappingsForShop(storageValue)

  if (!runtimeHotels.length && !storageHotels.length && !runtimeManualTargets && !storageManualTargets && !runtimeManualRoomMappings.length && !storageManualRoomMappings.length) {
    return runtimeValue
  }

  return normalizeConfig({
    ...storageValue,
    ...runtimeValue,
    competitorHotels: runtimeHotels.length ? runtimeHotels : storageHotels,
    manualRoomMappingsByShop: Object.keys(runtimeValue?.manualRoomMappingsByShop || {}).length
      ? runtimeValue.manualRoomMappingsByShop
      : storageValue.manualRoomMappingsByShop,
    manualRoomMappings: runtimeManualRoomMappings.length ? runtimeManualRoomMappings : storageManualRoomMappings,
    manualTargets: runtimeManualTargets || storageManualTargets
  })
}
async function getEffectiveConfig() {
  const storageConfig = await readConfigFromStorage().catch(() => null)
  try {
    const runtimeConfig = normalizeConfig(await sendRuntimeMessage({ type: "GET_CONFIG" }))
    return selectPreferredConfig(runtimeConfig, storageConfig)
  } catch (error) {
    if (storageConfig) {
      return storageConfig
    }
    throw error
  }
}

function normalizeDebugSnapshot(config) {
  const stored = config && typeof config === "object" ? config : {}
  return {
    ...stored,
    competitorHotels: normalizeCompetitorHotels(stored.competitorHotels),
    manualRoomMappingsByShop: normalizeManualRoomMappingsByShop(stored.manualRoomMappingsByShop),
    manualRoomMappings: getManualRoomMappingsForShop(stored),
    manualTargets: String(stored.manualTargets || "")
  }
}
async function buildConfigDebugInfo() {
  const [localStored, syncStored] = await Promise.all([
    chrome.storage.local.get(null).catch(() => ({})),
    chrome.storage.sync.get(null).catch(() => ({}))
  ])
  const mergedStored = mergeStoredConfigAreas(localStored, syncStored)

  let runtimeConfig = null
  let runtimeGetConfigError = null
  let runtimeDebug = null
  let runtimeDebugError = null

  try {
    runtimeDebug = await sendRuntimeMessage({ type: "GET_CONFIG_DEBUG" })
  } catch (error) {
    runtimeDebugError = error instanceof Error ? error.message : String(error)
  }

  try {
    runtimeConfig = normalizeConfig(await sendRuntimeMessage({ type: "GET_CONFIG" }))
  } catch (error) {
    runtimeGetConfigError = error instanceof Error ? error.message : String(error)
  }

  const storageConfig = normalizeConfig(mergedStored)
  const effectiveConfig = selectPreferredConfig(runtimeConfig || storageConfig, storageConfig)
  return {
    source: runtimeDebug ? "background_debug+popup_storage" : "popup_storage_only",
    local: normalizeDebugSnapshot(localStored),
    sync: normalizeDebugSnapshot(syncStored),
    merged: normalizeDebugSnapshot(mergedStored),
    effective: effectiveConfig,
    runtime: {
      getConfigOk: Boolean(runtimeConfig),
      getConfigError: runtimeGetConfigError,
      getConfigDebugOk: Boolean(runtimeDebug),
      getConfigDebugError: runtimeDebugError,
      config: runtimeConfig,
      debugPayload: runtimeDebug || null
    },
    counts: {
      local: normalizeCompetitorHotels(localStored.competitorHotels).length,
      sync: normalizeCompetitorHotels(syncStored.competitorHotels).length,
      merged: normalizeCompetitorHotels(mergedStored.competitorHotels).length,
      effective: normalizeCompetitorHotels(effectiveConfig.competitorHotels).length
    },
    meta: {
      generatedAt: new Date().toISOString(),
      localUpdatedAt: Number(localStored.configUpdatedAt || 0),
      syncUpdatedAt: Number(syncStored.configUpdatedAt || 0)
    }
  }
}

let currentConfig = null
let currentPageContext = null
let currentMerchantSnapshots = null
let currentMerchantMappingsPreview = null
let currentCompetitorRoomPrices = null
let currentCompetitorPricingAdvice = null
let currentCompetitorTrendSummary = null
let currentMerchantMappings = []
let merchantMappingsLoaded = false
let currentMerchantMappingShopId = ""
let popupViewNav = null
let popupWorkspaceNav = null
let popupBasicSectionNav = null
let activePopupView = "workspace"
let activeWorkspaceGroup = "basic"
let activeBasicSection = "room-prices"

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual"
}

function resetEmbeddedScrollTop() {
  if (!IS_EMBEDDED_POPUP) {
    return
  }
  requestAnimationFrame(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  })
  setTimeout(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, 80)
}

function isAuthenticatedConfig(config) {
  return Boolean(config?.authenticated && config?.authUser && config?.currentShop)
}

function isMerchantPortalContext(pageContext) {
  if (!pageContext || typeof pageContext !== "object") {
    return false
  }
  if (String(pageContext.pageType || "").trim().toLowerCase() === "merchant_portal") {
    return true
  }
  const url = String(pageContext.startUrl || pageContext.tabUrl || "")
  return /ebooking\.fliggy\.com|ctrip\.com|trip\.com|meituan\.com|dianping\.com/i.test(url)
}

function applyContextualPopupCopy(pageContext) {
  const merchantPortal = isMerchantPortalContext(pageContext)
  workflowAnalyzeBtn.textContent = merchantPortal ? "生成价格映射" : "生成价格映射"
  workflowFillBtn.textContent = "按当前价填充最终价"
  workflowSubmitBtn.textContent = merchantPortal ? "确认映射并提交" : "确认映射并提交"
  roomPricesBtn.textContent = "查看竞对价格"
  roomSettingsBtn.textContent = merchantPortal ? "维护竞对与映射" : "维护竞对酒店"
  refreshBtn.textContent = merchantPortal ? "刷新后台识别" : "刷新页面识别"
  collectBtn.textContent = merchantPortal ? "采集当前后台页" : "按当前页采集"
  panelBtn.textContent = merchantPortal ? "打开商家面板" : "打开页面面板"
}

function getMerchantWorkflowPlatforms() {
  return MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => {
    const platform = MERCHANT_PLATFORM_DEFS[platformId]
    const input = merchantPlatformUrlInputs[platformId]
    const priceUrl = String(input?.value || "").trim() || platform.priceUrl || ""
    return {
      id: platform.id,
      name: platform.name,
      priceUrl
    }
  })
}

function getMerchantWorkflowPlatform(platformId) {
  return MERCHANT_PLATFORM_DEFS[String(platformId || "").trim().toLowerCase()] || MERCHANT_PLATFORM_DEFS.fliggy
}

function getPopupViewCards() {
  const workspaceGroupCards = getWorkspaceGroupCards()
  return {
    workspace: Object.values(workspaceGroupCards).flat(),
    feedback: [
      resultBox?.closest(".card")
    ].filter(Boolean)
  }
}

function getWorkspaceGroupCards() {
  const basicSectionCards = getBasicSectionCards()
  return {
    basic: [
      popupBasicSectionNav,
      ...Object.values(basicSectionCards).flat()
    ].filter(Boolean),
    merchant: [
      appShell?.querySelector('.group-banner.merchant'),
      workflowAnalyzeBtn?.closest(".card"),
      uniformSubmitBtn?.closest(".card")
    ].filter(Boolean)
  }
}

function getBasicSectionCards() {
  return {
    "room-prices": [
      roomPricesBtn?.closest(".card")
    ].filter(Boolean),
    advice: [
      competitorAdviceBtn?.closest(".card")
    ].filter(Boolean),
    "quick-actions": [
      collectBtn?.closest(".card")
    ].filter(Boolean)
  }
}

function ensurePopupViewNav() {
  if (!appShell || popupViewNav) {
    return
  }
  const navCard = document.createElement("div")
  navCard.className = "card view-nav-card"
  navCard.innerHTML = `
    <div class="view-nav" role="tablist" aria-label="工作台页面切换">
      ${POPUP_VIEW_DEFS.map((view) => `
        <button type="button" data-popup-view="${view.id}" role="tab" aria-selected="false">
          ${view.label}
        </button>
      `).join("")}
    </div>
  `
  navCard.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-popup-view]")
    if (!button) {
      return
    }
    setActivePopupView(button.dataset.popupView || "workspace")
  })
  appShell.prepend(navCard)
  popupViewNav = navCard
}

function ensureWorkspaceGroupNav() {
  if (!appShell || popupWorkspaceNav) {
    return
  }
  const navCard = document.createElement("div")
  navCard.className = "card workspace-nav-card"
  navCard.innerHTML = `
    <div class="workspace-nav" role="tablist" aria-label="工作台分组切换">
      ${WORKSPACE_GROUP_DEFS.map((group) => `
        <button type="button" data-workspace-group="${group.id}" role="tab" aria-selected="false">
          ${group.label}
        </button>
      `).join("")}
    </div>
  `
  navCard.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-workspace-group]")
    if (!button) {
      return
    }
    setActiveWorkspaceGroup(button.dataset.workspaceGroup || "basic")
  })

  const firstWorkspaceCard = WORKSPACE_GROUP_DEFS
    .flatMap((group) => getWorkspaceGroupCards()[group.id] || [])
    .find(Boolean)
  if (firstWorkspaceCard) {
    appShell.insertBefore(navCard, firstWorkspaceCard)
  } else {
    appShell.append(navCard)
  }
  popupWorkspaceNav = navCard
}

function ensureBasicSectionNav() {
  if (!appShell || popupBasicSectionNav) {
    return
  }
  const navCard = document.createElement("div")
  navCard.className = "card basic-section-nav-card"
  navCard.innerHTML = `
    <div class="basic-section-nav" role="tablist" aria-label="基础功能切换">
      ${BASIC_SECTION_DEFS.map((section) => `
        <button type="button" data-basic-section="${section.id}" role="tab" aria-selected="false">
          ${section.label}
        </button>
      `).join("")}
    </div>
  `
  navCard.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-basic-section]")
    if (!button) {
      return
    }
    setActiveBasicSection(button.dataset.basicSection || BASIC_SECTION_DEFS[0].id)
  })

  const basicBanner = appShell.querySelector('.group-banner.basic')
  const firstBasicCard = BASIC_SECTION_DEFS
    .flatMap((section) => getBasicSectionCards()[section.id] || [])
    .find(Boolean)
  if (popupWorkspaceNav?.nextSibling) {
    appShell.insertBefore(navCard, popupWorkspaceNav.nextSibling)
  } else if (popupWorkspaceNav) {
    appShell.append(navCard)
  } else if (basicBanner?.nextSibling) {
    appShell.insertBefore(navCard, basicBanner.nextSibling)
  } else if (firstBasicCard) {
    appShell.insertBefore(navCard, firstBasicCard)
  } else {
    appShell.append(navCard)
  }
  popupBasicSectionNav = navCard
}

function setActivePopupView(viewId) {
  const nextView = POPUP_VIEW_DEFS.some((view) => view.id === viewId) ? viewId : "workspace"
  const viewCards = getPopupViewCards()
  activePopupView = nextView

  for (const view of POPUP_VIEW_DEFS) {
    const active = view.id === nextView
    for (const card of viewCards[view.id] || []) {
      card.classList.toggle("hidden", !active || !isAuthenticatedConfig(currentConfig))
    }
  }

  if (!popupViewNav) {
    return
  }

  for (const button of popupViewNav.querySelectorAll("[data-popup-view]")) {
    const active = button.dataset.popupView === nextView
    button.classList.toggle("active", active)
    button.setAttribute("aria-selected", active ? "true" : "false")
  }

  if (popupWorkspaceNav) {
    popupWorkspaceNav.classList.toggle("hidden", !isAuthenticatedConfig(currentConfig) || nextView !== "workspace")
  }
  setActiveWorkspaceGroup(activeWorkspaceGroup)
}

function setActiveWorkspaceGroup(groupId) {
  const nextGroup = WORKSPACE_GROUP_DEFS.some((group) => group.id === groupId)
    ? groupId
    : WORKSPACE_GROUP_DEFS[0].id
  const workspaceCards = getWorkspaceGroupCards()
  const showWorkspaceGroup = activePopupView === "workspace" && isAuthenticatedConfig(currentConfig)
  activeWorkspaceGroup = nextGroup

  for (const group of WORKSPACE_GROUP_DEFS) {
    for (const card of workspaceCards[group.id] || []) {
      card.classList.toggle("hidden", !showWorkspaceGroup || group.id !== nextGroup)
    }
  }

  if (!popupWorkspaceNav) {
    return
  }

  for (const button of popupWorkspaceNav.querySelectorAll("[data-workspace-group]")) {
    const active = button.dataset.workspaceGroup === nextGroup
    button.classList.toggle("active", active)
    button.setAttribute("aria-selected", active ? "true" : "false")
  }

  setActiveBasicSection(activeBasicSection)
}

function setActiveBasicSection(sectionId) {
  const nextSection = BASIC_SECTION_DEFS.some((section) => section.id === sectionId)
    ? sectionId
    : BASIC_SECTION_DEFS[0].id
  const sectionCards = getBasicSectionCards()
  const showSection = activePopupView === "workspace"
    && isAuthenticatedConfig(currentConfig)
    && activeWorkspaceGroup === "basic"
  activeBasicSection = nextSection

  for (const section of BASIC_SECTION_DEFS) {
    for (const card of sectionCards[section.id] || []) {
      card.classList.toggle("hidden", !showSection || section.id !== nextSection)
    }
  }

  if (!popupBasicSectionNav) {
    return
  }

  popupBasicSectionNav.classList.toggle("hidden", !showSection)
  for (const button of popupBasicSectionNav.querySelectorAll("[data-basic-section]")) {
    const active = button.dataset.basicSection === nextSection
    button.classList.toggle("active", active)
    button.setAttribute("aria-selected", active ? "true" : "false")
  }
}

chrome.storage?.onChanged?.addListener((changes, areaName) => {
  if (areaName !== "sync" && areaName !== "local") {
    return
  }
  if (!changes?.competitorHotels && !changes?.manualTargets && !changes?.configUpdatedAt) {
    return
  }
  refreshCurrentConfig().catch(() => {})
})

targetsInput?.addEventListener("blur", () => {
  saveManualTargets().catch(() => {})
})

workspaceGateBtn?.addEventListener("click", async () => {
  await withBusy(async () => {
    await openOptionsPage()
  })
})

workflowAnalyzeBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    if (!currentMerchantSnapshots) {
      currentMerchantSnapshots = await loadMerchantPlatformSnapshots()
    }
    currentMerchantMappingsPreview = normalizeWorkflowPreview(currentMerchantSnapshots)
    renderWorkflowPreview()
    updateStatus(`已生成 ${Number(currentMerchantMappingsPreview?.rows?.length || 0)} 组价格映射`, "ok")
    resultBox.textContent = formatWorkflowResult(currentMerchantMappingsPreview)
  })
})

workflowLoadBtn?.addEventListener("click", async () => {
  await withBusy(async () => {
    currentMerchantSnapshots = await loadMerchantPlatformSnapshots()
    currentMerchantMappingsPreview = normalizeWorkflowPreview(currentMerchantSnapshots)
    renderWorkflowPreview()
    const okCount = Object.values(currentMerchantSnapshots.snapshots || {}).filter((item) => item.status === "success").length
    updateStatus(`已读取 ${okCount}/3 个平台的商家价格`, okCount ? "ok" : "error")
    resultBox.textContent = formatWorkflowResult(currentMerchantMappingsPreview)
  })
})

workflowFillBtn.addEventListener("click", () => {
  applySuggestedPricesToWorkflow()
  renderWorkflowPreview()
})

workflowSubmitBtn.addEventListener("click", async () => {
  await submitWorkflowPricing()
})

roomPricesBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    currentConfig = await getEffectiveConfig()
    applyCurrentConfig(currentConfig)
    const configuredHotels = Array.isArray(currentConfig?.competitorHotels) ? currentConfig.competitorHotels : []
    const payload = configuredHotels.length ? { hotels: configuredHotels, saveResult: true } : { saveResult: true }
    const response = await requestCompetitorRoomPrices(payload)
    currentCompetitorRoomPrices = response
    currentCompetitorPricingAdvice = null
    await refreshCompetitorTrendSummary({ silent: true })
    if (!String(competitorAdviceHotelInput?.value || "").trim() && Array.isArray(response?.hotels) && response.hotels.length === 1) {
      competitorAdviceHotelInput.value = String(response.hotels[0]?.hotel_name || "")
    }
    renderCompetitorRoomPricesPanel()
    renderCompetitorTrendPanel()
    renderCompetitorPricingAdvice()
    updateStatus(`已抓取 ${Number(response?.hotel_count || 0)} 家竞对酒店的 ${Number(response?.total_rooms || 0)} 条房型价`, "ok")
  })
})
competitorTrendRefreshBtn?.addEventListener("click", async () => {
  await withBusy(async () => {
    await refreshCompetitorTrendSummary({ silent: false })
    renderCompetitorTrendPanel()
    updateStatus("竞对趋势图已刷新", "ok")
  })
})
competitorTrendSeriesSelect?.addEventListener("change", async () => {
  await withBusy(async () => {
    await refreshCompetitorTrendSummary({ silent: false })
    renderCompetitorTrendPanel()
    updateStatus("竞对趋势维度已切换", "ok")
  })
})
refreshRoomConfigBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    currentConfig = await refreshCurrentConfig()
    const competitorHotels = Array.isArray(currentConfig?.competitorHotels) ? currentConfig.competitorHotels : []
    updateStatus(`已刷新竞对配置，当前 ${competitorHotels.length} 家`, "ok")
    resultBox.textContent = JSON.stringify({
      competitorHotels
    }, null, 2)
  })
})
debugRoomConfigBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    const response = await buildConfigDebugInfo()
    currentConfig = normalizeConfig(response?.effective || response?.merged || {})
    applyCurrentConfig(currentConfig)
    const effectiveCount = Number(response?.counts?.effective || 0)
    updateStatus(`\u8bca\u65ad\u5b8c\u6210\uff0c\u5f53\u524d\u751f\u6548\u7ade\u5bf9\u914d\u7f6e ${effectiveCount} \u5bb6`, effectiveCount ? "ok" : "error")
    resultBox.textContent = JSON.stringify(response, null, 2)
  })
})

roomSettingsBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    await sendRuntimeMessage({ type: "OPEN_OPTIONS" })
    updateStatus("已打开竞对酒店设置", "ok")
  })
})

competitorAdviceBtn?.addEventListener("click", async () => {
  await withBusy(async () => {
    const totalRooms = toPositiveInteger(competitorAdviceTotalRoomsInput?.value)
    if (!totalRooms) {
      throw new Error("请先填写有效的总房量")
    }
    const availableRooms = toNonNegativeInteger(competitorAdviceAvailableRoomsInput?.value)
    if (availableRooms === null) {
      throw new Error("请先填写有效的可售房量")
    }
    if (availableRooms > totalRooms) {
      throw new Error("可售房量不能大于总房量")
    }
    const currentPrice = toPositiveNumber(competitorAdviceCurrentPriceInput?.value)
    const response = await sendRuntimeMessage({
      type: "COMPETITOR_PRICING_ADVICE_PREVIEW",
      payload: {
        competitorHotelName: competitorAdviceHotelInput?.value,
        totalRooms,
        availableRooms,
        currentPrice: currentPrice || undefined,
        strategy: competitorAdviceStrategySelect?.value || "balanced",
        manualRoomMappings: getPreferredRoomMappingState(currentConfig, currentMerchantMappings).items,
      }
    })
    currentCompetitorPricingAdvice = response
    renderCompetitorPricingAdvice()
    const suggestedPrice = Number(response?.advice_summary?.suggested_price || 0)
    updateStatus(suggestedPrice ? `建议价已生成: ¥${suggestedPrice.toFixed(2)}` : "我的价格建议已生成", "ok")
    resultBox.textContent = formatCompetitorPricingAdviceResult(response)
  })
})
workflowBox.addEventListener("click", async (event) => {
  const action = event.target?.dataset?.action
  if (!action) {
    return
  }
  if (action === "toggle-all-workflow") {
    toggleAllWorkflowItems(event.target.dataset.checked !== "1")
    renderWorkflowPreview()
  } else if (action === "fill-current-prices") {
    applySuggestedPricesToWorkflow()
    renderWorkflowPreview()
  }
})

workflowBox.addEventListener("change", (event) => {
  if (!event.target) {
    return
  }
  if (event.target.matches("[data-role='workflow-check']") || event.target.matches("[data-role='workflow-final-price']")) {
    syncWorkflowItemsFromDom()
  }
})

Object.values(merchantPlatformUrlInputs).forEach((input) => {
  input?.addEventListener("change", () => {
    currentMerchantSnapshots = null
    currentMerchantMappingsPreview = null
    renderWorkflowPreview()
  })
})

uniformSubmitBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    const priceUrl = String(uniformPriceUrlInput.value || "").trim()
    const targetPrice = toPositiveNumber(uniformTargetPriceInput.value)
    if (!priceUrl) {
      throw new Error("请先填写调价官网链接")
    }
    if (!targetPrice) {
      throw new Error("请先填写有效的目标价格")
    }
    if (!confirmUniformSubmit(priceUrl, targetPrice)) {
      updateStatus("已取消统一目标价提交", "error")
      return
    }
    const response = await sendRuntimeMessage({
      type: "MERCHANT_UNIFORM_PRICE_SUBMIT",
      payload: {
        priceUrl,
        targetPrice,
        comment: "browser_extension_uniform_submit"
      }
    })
    updateStatus(`已按目标价 ¥${targetPrice.toFixed(2)} 发起改价`, response.failed_count ? "error" : "ok")
    resultBox.textContent = formatSubmitResult(response)
  })
})

refreshBtn.addEventListener("click", () => load())
statusBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    const status = await sendRuntimeMessage({ type: "SERVICE_STATUS" })
    updateStatus(`服务在线: ${status.plugin}`, "ok")
    resultBox.textContent = JSON.stringify(status, null, 2)
  })
})
collectBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    const collectMaxPages = 1
    const manualTargets = getManualTargets()
    const pageSnapshot = await getCurrentPageSnapshot(true, {
      maxPages: collectMaxPages,
      collectAllPages: false,
      targetHotelNames: manualTargets
    })
    const pageContext = pageSnapshot?.pageContext || currentPageContext
    if (!pageContext || pageContext.unsupported) {
      throw new Error("\u8bf7\u5148\u5728\u8bbe\u7f6e\u9875\u914d\u7f6e\u81f3\u5c11\u4e00\u6761\u7ade\u5bf9\u9152\u5e97\u8be6\u60c5\u9875")
    }
    currentPageContext = pageContext
    renderPageContext(currentPageContext)
    await saveManualTargets()
    const response = await sendRuntimeMessage({
      type: "RUN_COLLECT",
      payload: {
        pageContext,
        pageSnapshot,
        targetHotelNames: manualTargets,
        maxPages: 1
      }
    })
    updateStatus("已完成当前页真实采集", "ok")
    resultBox.innerHTML = resultView.renderCollectSummary(response, {
      ...pageContext,
      targetHotelNames: manualTargets
    })
  })
})
panelBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    const tab = await getActiveTab()
    if (!tab?.id) {
      throw new Error("未找到当前活动标签页")
    }
    const response = await sendTabMessage(tab.id, { type: "OPEN_PANEL" })
    currentPageContext = response
    renderPageContext(currentPageContext)
    updateStatus("已在页面中打开运营助手", "ok")
    resultBox.textContent = "页面浮层已打开。"
  })
})
optionsBtn.addEventListener("click", async () => {
  await withBusy(async () => {
    await openOptionsPage()
  })
})

load()

async function load() {
  resetEmbeddedScrollTop()
  await withBusy(async () => {
    const [configResult, statusResult, pageSnapshotResult] = await Promise.allSettled([
      getEffectiveConfig(),
      sendRuntimeMessage({ type: "SERVICE_STATUS" }),
      getCurrentPageSnapshot(false)
    ])

    currentConfig = configResult.status === "fulfilled"
      ? configResult.value
      : normalizeConfig(DEFAULT_EXTENSION_CONFIG)

    const nextShopId = isAuthenticatedConfig(currentConfig) ? String(resolveActiveShopId(currentConfig) || "").trim() : ""
    if (nextShopId !== currentMerchantMappingShopId) {
      currentMerchantMappings = []
      merchantMappingsLoaded = false
      currentMerchantMappingShopId = nextShopId
    }

    currentPageContext = pageSnapshotResult.status === "fulfilled"
      ? (pageSnapshotResult.value?.pageContext || unsupportedPageContext("当前页面不是酒店详情页", ""))
      : unsupportedPageContext(pageSnapshotResult.reason?.message || "页面识别失败", "")

    applyCurrentConfig(currentConfig)
    if (isAuthenticatedConfig(currentConfig) && !merchantMappingsLoaded) {
      try {
        const response = await requestMerchantMappingsSummary({ onlyEnabled: false })
        currentMerchantMappings = normalizeMerchantRoomMappings(response?.items)
        merchantMappingsLoaded = true
      } catch (error) {
      }
      applyCurrentConfig(currentConfig)
    }
    renderPageContext(currentPageContext)
    renderWorkflowPreview()
    renderCompetitorRoomPricesPanel()
    await refreshCompetitorTrendSummary({ silent: true })
    renderCompetitorTrendPanel()
    renderCompetitorPricingAdvice()
    if (configResult.status === "rejected") {
      updateStatus(`配置读取失败: ${configResult.reason?.message || "未知错误"}`, "error")
      resultBox.textContent = configResult.reason?.stack || String(configResult.reason || "未知错误")
      resetEmbeddedScrollTop()
      return
    }

    if (statusResult.status === "fulfilled") {
      updateStatus(`服务在线: ${statusResult.value.plugin}`, "ok")
      resetEmbeddedScrollTop()
      return
    }

    updateStatus(`服务异常: ${statusResult.reason?.message || "无法连接插件服务"}`, "error")
    resetEmbeddedScrollTop()
  })
}

async function ensurePageContext(forceRefresh) {
  if (forceRefresh || !currentPageContext) {
    const pageSnapshot = await getCurrentPageSnapshot(forceRefresh)
    currentPageContext = pageSnapshot?.pageContext || unsupportedPageContext("当前标签页未注入插件内容脚本", "")
    renderPageContext(currentPageContext)
  }
  return currentPageContext
}

async function getCurrentPageSnapshot(forceRefresh, options = {}) {
  const tab = await getActiveTab()
  if (!tab) {
    return {
      pageContext: unsupportedPageContext("未找到当前活动标签页", ""),
      candidateRows: []
    }
  }

  try {
    const snapshot = await sendTabMessage(tab.id, {
      type: "GET_PAGE_SNAPSHOT",
      forceRefresh,
      maxPages: Number(options.maxPages) || 1,
      collectAllPages: Boolean(options.collectAllPages),
      targetHotelNames: Array.isArray(options.targetHotelNames) ? options.targetHotelNames : []
    })
    const pageContext = snapshot?.pageContext || snapshot || {}
    return {
      ...snapshot,
      pageContext: {
        ...pageContext,
        tabUrl: tab.url || pageContext.startUrl || "",
        tabTitle: tab.title || pageContext.pageTitle || ""
      },
      candidateRows: Array.isArray(snapshot?.candidateRows) ? snapshot.candidateRows : []
    }
  } catch (error) {
    return {
      pageContext: unsupportedPageContext(error.message, tab.url || "", tab.title || ""),
      candidateRows: []
    }
  }
}

function getManualTargets() {
  return String(targetsInput.value || "")
    .split(/[\n,，、;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, 20)
}

async function saveManualTargets() {
  currentConfig = await sendRuntimeMessage({
    type: "SAVE_CONFIG",
    payload: { manualTargets: getManualTargets().join("\n") }
  })
  applyCurrentConfig(currentConfig)
}

function unsupportedPageContext(message, tabUrl, tabTitle = "") {
  return {
    unsupported: true,
    pageType: "unsupported",
    pageTitle: tabTitle,
    startUrl: tabUrl,
    targetHotelNames: [],
    error: message
  }
}

function fallbackPageContext(pageContext) {
  return pageContext && !pageContext.unsupported
    ? pageContext
    : {
        pageType: "generic",
        cityName: "",
        keyword: "",
        startUrl: pageContext?.startUrl || "",
        targetHotelNames: []
      }
}

function normalizeWorkflowPreview(snapshotPayload) {
  const snapshots = snapshotPayload?.snapshots && typeof snapshotPayload.snapshots === "object"
    ? snapshotPayload.snapshots
    : {}
  const keyIndex = new Map()
  const rows = []

  for (const platformId of MERCHANT_WORKFLOW_PLATFORM_IDS) {
    const snapshot = snapshots[platformId]
    const items = Array.isArray(snapshot?.items) ? snapshot.items : []
    items.forEach((item, itemIndex) => {
      const keys = buildMerchantMappingKeys(item)
      const existingKey = keys.find((key) => keyIndex.has(key))
      let row = existingKey ? keyIndex.get(existingKey) : null
      if (!row) {
        row = {
          key: keys[0] || `${platformId}-${itemIndex}`,
          displayName: item.displayName || item.roomName || item.rateName || `映射${rows.length + 1}`,
          entries: {}
        }
        rows.push(row)
      }
      for (const key of keys) {
        keyIndex.set(key, row)
      }
      if (!row.entries[platformId]) {
        row.entries[platformId] = {
          ...item,
          selected: Boolean(item.submitReady),
          finalPrice: item.finalPrice || item.currentPrice || null
        }
      }
      row.displayName = pickMerchantMappingLabel(row)
    })
  }

  return {
    snapshots,
    rows,
    readySubmitCount: rows.reduce((total, row) => {
      return total + Object.values(row.entries).filter((entry) => entry?.submitReady).length
    }, 0),
    generatedAt: new Date().toLocaleString()
  }
}

function normalizeWorkflowRoomIntroText(value, item = {}) {
  if (value === null || value === undefined || typeof value === "object") {
    return ""
  }
  const text = String(value).replace(/\s+/g, " ").trim()
  if (!text || text === "[object Object]") {
    return ""
  }
  if (/规则|底价|卖价|匹配平台|最终价|GID|HID|未读取|提交/.test(text)) {
    return ""
  }

  const priceValues = [
    item?.current_price,
    item?.currentPrice,
    item?.price,
    item?.final_price,
    item?.finalPrice
  ].map((price) => Number(price)).filter(Number.isFinite)

  const chunks = text.split(/\s*(?:\||｜|\/|,|，|;|；)\s*/)
    .map((chunk) => chunk.replace(/\s+/g, " ").trim())
    .filter((chunk) => {
      if (!chunk) {
        return false
      }
      if (/^(提交|最终价|现价|价格|当前价|GID|HID)$/i.test(chunk)) {
        return false
      }
      const numeric = Number(String(chunk).replace(/[¥￥元起]/g, ""))
      if (Number.isFinite(numeric) && priceValues.some((price) => Math.abs(price - numeric) < 0.01)) {
        return false
      }
      return true
    })

  const compactText = (chunks.length ? chunks : [text]).join(" / ").replace(/\s+/g, " ").trim()
  return compactText.length > 160 ? `${compactText.slice(0, 157)}...` : compactText
}

function formatWorkflowRoomIntroName(roomName, rateName) {
  const room = String(roomName || "").replace(/\s+/g, " ").trim()
  const rate = String(rateName || "").replace(/\s+/g, " ").trim()
  if (!room && !rate) {
    return ""
  }
  if (room && rate && !room.includes(rate) && !/规则|底价|卖价|匹配平台|最终价|GID|HID/.test(rate)) {
    return `${room}<${rate}>`
  }
  return room || rate
}

function getWorkflowRoomIntro(item) {
  const structuredIntro = formatWorkflowRoomIntroName(item?.room_name || item?.roomName, item?.rate_name || item?.rateName)
  if (structuredIntro) {
    return structuredIntro
  }
  const candidates = [
    item?.room_intro,
    item?.roomIntro,
    item?.room_description,
    item?.roomDescription,
    item?.description,
    item?.detail,
    item?.details,
    item?.raw_text,
    item?.raw
  ]
  for (const candidate of candidates) {
    const intro = normalizeWorkflowRoomIntroText(candidate, item)
    if (intro) {
      return intro
    }
  }
  return ""
}

function normalizeMerchantWorkflowItem(item, platformId, index) {
  const currentPrice = toPositiveNumber(item?.current_price ?? item?.currentPrice ?? item?.price)
  const suggestedPrice = toPositiveNumber(item?.suggested_price ?? item?.final_price)
  const finalPrice = toPositiveNumber(item?.final_price) ?? suggestedPrice ?? currentPrice
  const roomName = item?.room_name || ""
  const rateName = item?.rate_name || item?.display_name || ""
  const displayName = item?.display_name || formatWorkflowRoomIntroName(roomName, rateName) || rateName || roomName || `房型${index + 1}`
  return {
    id: `${platformId}-${item?.gid || "gid"}-${item?.hid || "hid"}-${index}`,
    platformId,
    platformName: getMerchantWorkflowPlatform(platformId).name,
    displayName,
    roomName,
    rateName,
    gid: String(item?.gid || "").trim(),
    hid: String(item?.hid || "").trim(),
    currentPrice,
    suggestedPrice,
    finalPrice,
    changePct: toPositiveNumber(item?.change_pct) || 0,
    riskLevel: item?.risk_level || "L2",
    competitorMinPrice: toPositiveNumber(item?.competitor_min_price),
    competitorAvgPrice: toPositiveNumber(item?.competitor_avg_price),
    competitorMaxPrice: toPositiveNumber(item?.competitor_max_price),
    matchMode: item?.match_mode || item?.room_advice?.match_mode || "",
    matchedRoomCount: Number(item?.matched_room_count || item?.room_advice?.matched_room_count || 0),
    roomIntro: getWorkflowRoomIntro(item),
    submitReady: Boolean(item?.submit_ready || currentPrice || item?.display_name || item?.room_name || item?.rate_name),
    selected: Boolean(item?.submit_ready || currentPrice || item?.display_name || item?.room_name || item?.rate_name),
    raw: item
  }
}

function buildMerchantMappingKeys(item) {
  const keys = []
  const addKey = (prefix, value) => {
    const normalized = String(value || "").replace(/\s+/g, " ").trim().toLowerCase()
    if (normalized) {
      keys.push(`${prefix}:${normalized}`)
    }
  }
  if (item?.gid || item?.hid) {
    addKey("gid-hid", `${item?.gid || ""}|${item?.hid || ""}`)
  }
  addKey("display", item?.displayName || item?.display_name)
  addKey("room", item?.roomName || item?.room_name)
  addKey("rate", item?.rateName || item?.rate_name)
  addKey("name", `${item?.displayName || item?.display_name || ""}|${item?.roomName || item?.room_name || ""}|${item?.rateName || item?.rate_name || ""}`)
  return Array.from(new Set(keys))
}

function pickMerchantMappingLabel(row) {
  const entries = Object.values(row?.entries || {})
  const preferred = entries.find((entry) => entry?.displayName && entry.displayName !== "房型1")
    || entries.find((entry) => entry?.displayName)
  return preferred?.displayName || row?.displayName || "未命名映射"
}

async function loadMerchantPlatformSnapshots() {
  const platforms = getMerchantWorkflowPlatforms()
  let response = null
  try {
    response = await sendRuntimeMessage({
      type: "MERCHANT_PLATFORM_PRICE_SNAPSHOTS",
      payload: {
        platforms
      }
    })
  } catch (error) {
    if (!isUnsupportedMessageTypeError(error)) {
      throw error
    }
    const results = await Promise.all(platforms.map(async (platform) => {
      if (!platform.priceUrl) {
        return {
          platformId: platform.id,
          platformName: platform.name,
          priceUrl: "",
          status: "failed",
          error: "未填写平台价格页 URL",
          items: []
        }
      }
      try {
        const legacyResponse = await sendRuntimeMessage({
          type: "MERCHANT_PRICING_ITEMS",
          payload: {
            priceUrl: platform.priceUrl,
            platform: platform.id,
            platformName: platform.name,
            collectMode: "extension_current_tab"
          }
        })
        const items = Array.isArray(legacyResponse?.items) ? legacyResponse.items : []
        return {
          platformId: platform.id,
          platformName: platform.name,
          priceUrl: platform.priceUrl,
          status: legacyResponse?.status || (items.length ? "success" : "failed"),
          error: legacyResponse?.error || "",
          itemCount: Number(legacyResponse?.item_count || items.length || 0),
          readySubmitCount: Number(legacyResponse?.ready_submit_count || items.filter((item) => item?.submit_ready).length || 0),
          items: items.map((item, index) => normalizeMerchantWorkflowItem(item, platform.id, index)),
          debug: legacyResponse?.debug || null
        }
      } catch (legacyError) {
        return {
          platformId: platform.id,
          platformName: platform.name,
          priceUrl: platform.priceUrl,
          status: "failed",
          error: legacyError instanceof Error ? legacyError.message : String(legacyError),
          items: []
        }
      }
    }))
    return {
      snapshots: results.reduce((acc, item) => {
        acc[item.platformId] = item
        return acc
      }, {}),
      generatedAt: new Date().toLocaleString(),
      source: "popup_fallback_legacy_merchant_items"
    }
  }
  return {
    snapshots: platforms.reduce((acc, platform) => {
      const snapshot = response?.snapshots?.[platform.id] || {
        platformId: platform.id,
        platformName: platform.name,
        priceUrl: platform.priceUrl,
        status: "failed",
        error: "未返回数据",
        items: []
      }
      acc[platform.id] = {
        ...snapshot,
        items: Array.isArray(snapshot.items) ? snapshot.items.map((item, index) => normalizeMerchantWorkflowItem(item, platform.id, index)) : []
      }
      return acc
    }, {}),
    generatedAt: response?.generatedAt || new Date().toLocaleString(),
    source: response?.source || "extension_local_merchant_platform_snapshots"
  }
}

async function submitWorkflowPricing() {
  await withBusy(async () => {
    syncWorkflowItemsFromDom()
    const confirmedItems = collectConfirmedWorkflowItems()
    if (!confirmedItems.length) {
      throw new Error("请先生成并勾选至少一条可提交映射")
    }
    if (!confirmWorkflowSubmission(confirmedItems)) {
      updateStatus("已取消提交，最终价仍可继续调整", "error")
      return
    }
    const response = await sendRuntimeMessage({
      type: "MERCHANT_PLATFORM_MAPPING_SUBMIT",
      payload: {
        platforms: getMerchantWorkflowPlatforms(),
        confirmedItems,
        comment: "browser_extension_merchant_mapping_submit"
      }
    })
    const submitResults = Array.isArray(response?.platform_results) ? response.platform_results : []
    const aggregatedItems = Array.isArray(response?.items) ? response.items : []
    const successCount = Number(response?.success_count || 0)
    const failedCount = Number(response?.failed_count || 0)
    const skippedCount = Number(response?.skipped_submit_count || 0)
    const nextResponse = {
      status: response?.status || (failedCount ? (successCount ? "partial_failed" : "failed") : "success"),
      submit_channel: response?.submit_channel || "browser_extension_merchant_mapping_submit",
      success_count: successCount,
      failed_count: failedCount,
      skipped_submit_count: skippedCount,
      items: aggregatedItems,
      platform_results: submitResults
    }
    updateStatus("已按确认后的映射最终价提交到商家后台", nextResponse.failed_count ? "error" : "ok")
    resultBox.textContent = formatSubmitResult(nextResponse)
    currentMerchantSnapshots = null
    currentMerchantMappingsPreview = null
    renderWorkflowPreview()
    renderCompetitorRoomPricesPanel()
    renderCompetitorPricingAdvice()
  })
}
function applyCurrentConfig(config) {
  currentConfig = config || currentConfig || {}
  for (const platformId of MERCHANT_WORKFLOW_PLATFORM_IDS) {
    const input = merchantPlatformUrlInputs[platformId]
    const platform = MERCHANT_PLATFORM_DEFS[platformId]
    if (input && !String(input.value || "").trim() && platform.priceUrl) {
      input.value = platform.priceUrl
    }
  }
  renderWorkspaceAccessState(currentConfig)
  targetsInput.value = String(currentConfig?.manualTargets || "")
  renderConfiguredCompetitorHotels(currentConfig)
  renderCompetitorRoomPricesPanel()
  renderCompetitorTrendPanel()
  renderCompetitorPricingAdvice()
}

async function openOptionsPage() {
  await sendRuntimeMessage({ type: "OPEN_OPTIONS" })
  updateStatus("已打开设置页", "ok")
  if (!isAuthenticatedConfig(currentConfig)) {
    resultBox.textContent = "账号登录、当前配置和当前页面已经迁到设置页，请先在设置页完成登录后再回来使用工作台。"
  }
}

function renderWorkspaceAccessState(config) {
  const authenticated = isAuthenticatedConfig(config)
  ensurePopupViewNav()
  ensureWorkspaceGroupNav()
  ensureBasicSectionNav()
  workspaceGate?.classList.toggle("hidden", authenticated)
  appShell?.classList.toggle("hidden", !authenticated)
  if (popupViewNav) {
    popupViewNav.classList.toggle("hidden", !authenticated)
  }
  if (popupWorkspaceNav) {
    popupWorkspaceNav.classList.toggle("hidden", !authenticated || activePopupView !== "workspace")
  }
  if (popupBasicSectionNav) {
    popupBasicSectionNav.classList.toggle("hidden", !authenticated || activePopupView !== "workspace" || activeWorkspaceGroup !== "basic")
  }

  if (!authenticated) {
    if (workspaceGateTitle) {
      workspaceGateTitle.textContent = "账号登录、当前页面和当前配置已迁到设置页。"
    }
    if (workspaceGateNote) {
      workspaceGateNote.textContent = "请先在设置页登录并选择店铺，再回到 Popup 使用这里的工作台。"
    }
    setActivePopupView(activePopupView)
    return
  }

  const currentShop = config?.currentShop || null
  if (workspaceGateTitle) {
    workspaceGateTitle.textContent = `${config?.authUser?.username || "当前账号"} 已登录`
  }
  if (workspaceGateNote) {
    workspaceGateNote.textContent = `当前店铺 ${currentShop?.shop_name || "-"} (${currentShop?.shop_id || "-"})，需要切店或看配置请进入设置页。`
  }
  setActivePopupView(activePopupView)
}

async function refreshCurrentConfig() {
  const config = await getEffectiveConfig()
  currentConfig = config
  const nextShopId = isAuthenticatedConfig(config) ? String(resolveActiveShopId(config) || "").trim() : ""
  if (nextShopId !== currentMerchantMappingShopId) {
    currentMerchantMappings = []
    merchantMappingsLoaded = false
    currentMerchantMappingShopId = nextShopId
  }
  applyCurrentConfig(config)
  if (isAuthenticatedConfig(config) && !merchantMappingsLoaded) {
    try {
      const response = await requestMerchantMappingsSummary({ onlyEnabled: false })
      currentMerchantMappings = normalizeMerchantRoomMappings(response?.items)
      merchantMappingsLoaded = true
    } catch (error) {
    }
    applyCurrentConfig(config)
  }
  return config
}

function renderConfiguredCompetitorHotels(config) {
  const hotels = Array.isArray(config?.competitorHotels) ? config.competitorHotels : []
  const mappingState = getPreferredRoomMappingState(config, currentMerchantMappings)
  if (!hotels.length) {
    configuredHotelsBox.innerHTML = '<div class="empty-state">当前还没有维护竞对酒店，请先填写酒店名称或 URL。</div>'
    return
  }

  configuredHotelsBox.innerHTML = `
    <div>已配置 <strong>${hotels.length}</strong> 家竞对酒店</div>
    <div class="tip">当前店铺已维护 <strong>${mappingState.count}</strong> 条${mappingState.sourceLabel}房型映射${mappingState.source === "merchant" ? "，建议价会优先使用后端映射" : ""}</div>
    <div class="tags" style="margin-top: 10px;">
      ${hotels.map((hotel) => `<span class="tag">${escapeHtml(hotel.name || hotel.url || "未命名酒店")}</span>`).join("")}
    </div>
  `
}

function renderCompetitorRoomPrices(response) {
  const hotels = Array.isArray(response?.hotels) ? response.hotels : []
  if (!hotels.length) {
    return '<div class="empty-state">当前没有返回任何竞对酒店房型价。</div>'
  }

  return `
    <div class="summary-box">
      已抓取 ${Number(response?.hotel_count || hotels.length)} 家酒店，返回 ${Number(response?.total_rooms || 0)} 条房型价，写回 ${Number(response?.saved_count || 0)} 条。
    </div>
    <div class="workflow-list" style="margin-top: 12px;">
      ${hotels.map((hotel, index) => renderCompetitorHotelCard(hotel, index)).join("")}
    </div>
  `
}

function renderCompetitorRoomPricesPanel() {
  if (!competitorRoomPricesBox) {
    return
  }
  if (!currentCompetitorRoomPrices) {
    competitorRoomPricesBox.innerHTML = '<div class="empty-state">抓取完成后，会直接在这里展示竞对房型价。</div>'
    return
  }
  competitorRoomPricesBox.innerHTML = renderCompetitorRoomPrices(currentCompetitorRoomPrices)
}

async function refreshCompetitorTrendSummary({ silent = false } = {}) {
  if (!isAuthenticatedConfig(currentConfig)) {
    currentCompetitorTrendSummary = null
    return null
  }
  try {
    currentCompetitorTrendSummary = await sendRuntimeMessage({
      type: "COMPETITOR_PRICE_TREND_SUMMARY",
      payload: {
        days: 2,
        pointLimit: 120,
        seriesType: competitorTrendSeriesSelect?.value || "room_category",
        includeAdvice: true
      }
    })
    return currentCompetitorTrendSummary
  } catch (error) {
    if (!silent) {
      throw error
    }
    currentCompetitorTrendSummary = null
    return null
  }
}

function getTrendSeriesPalette(index) {
  return ["#ef6c00", "#0f9d58", "#1a73e8", "#c2185b", "#7b61ff", "#00897b"][index % 6]
}

function formatTrendDateLabel(value) {
  const text = String(value || "").trim()
  return text.length >= 16 ? text.slice(5, 16).replace(" ", "\n") : text || "-"
}

function formatTrendDateInline(value) {
  return formatTrendDateLabel(value).replace("\n", " ")
}

function formatRecentTrendChange(amount, pct) {
  if (!Number.isFinite(Number(amount))) {
    return "近三次暂无变化数据"
  }
  const normalizedAmount = Math.round(Number(amount) * 100) / 100
  if (Math.abs(normalizedAmount) < 0.005) {
    return "近三次持平"
  }
  const direction = normalizedAmount > 0 ? "近三次上涨" : "近三次下降"
  const pctText = Number.isFinite(Number(pct)) ? `（${formatSignedPercent(pct)}）` : ""
  return `${direction} ${formatPrice(Math.abs(normalizedAmount))}${pctText}`
}

function formatTrendScheduleText(schedule, trendResponse = null) {
  if (!schedule || typeof schedule !== "object") {
    return "插件提醒检查状态未知"
  }
  const enabled = schedule.enabled !== false
  const interval = Number(schedule.intervalMinutes || 120)
  const lastRunAt = String(schedule.lastRunAt || "").trim()
  const nextRunAt = String(schedule.nextRunAt || "").trim()
  const cloudCollectedAt = String(schedule.lastCloudCollectedAt || trendResponse?.latest_collected_at || "").trim()
  const lastStatus = String(schedule.lastStatus || "").trim()
  const lastError = String(schedule.lastError || "").trim()
  const statusText = enabled ? `插件本地采集已开启，每 ${interval / 60} 小时采集并同步云端` : "插件本地采集已关闭"
  const runText = lastRunAt ? `最近采集 ${formatTrendDateLabel(lastRunAt).replace("\n", " ")}` : "尚未采集"
  const nextText = nextRunAt ? `下次采集 ${formatTrendDateLabel(nextRunAt).replace("\n", " ")}` : "等待浏览器调度"
  const cloudText = cloudCollectedAt ? `云端最新采集 ${formatTrendDateInline(cloudCollectedAt)}` : "云端暂无采集时间"
  const errorText = lastStatus === "failed" && lastError ? `，最近失败：${lastError}` : ""
  return `${statusText}；${cloudText}；${runText}；${nextText}${errorText}`
}

function getTrendSeriesTitle(item, index) {
  const categoryName = String(item?.category_name || "").trim()
  const hotelName = String(item?.hotel_name || "").trim()
  if (categoryName && hotelName) {
    return `${categoryName} · ${hotelName}`
  }
  return categoryName || hotelName || `趋势 ${index + 1}`
}

function buildCompetitorTrendSvg(series) {
  const visibleSeries = Array.isArray(series) ? series.slice(0, 8) : []
  if (!visibleSeries.length) {
    return ""
  }
  const allLabels = Array.from(new Set(
    visibleSeries.flatMap((item) => Array.isArray(item?.points) ? item.points.map((point) => String(point.collected_at || "").trim()) : [])
  )).filter(Boolean).sort()
  const labels = allLabels.slice(-3)
  if (!labels.length) {
    return ""
  }
  const labelSet = new Set(labels)
  const recentSeries = visibleSeries.map((item) => {
    const points = Array.isArray(item?.points)
      ? item.points
        .filter((point) => labelSet.has(String(point?.collected_at || "").trim()))
        .sort((left, right) => String(left?.collected_at || "").localeCompare(String(right?.collected_at || "")))
      : []
    const firstPoint = points[0] || null
    const lastPoint = points[points.length - 1] || null
    const firstPrice = Number(firstPoint?.min_price || 0)
    const lastPrice = Number(lastPoint?.min_price || 0)
    const recentChangeAmount = firstPoint && lastPoint ? Math.round((lastPrice - firstPrice) * 100) / 100 : null
    const recentChangePct = firstPrice > 0 && recentChangeAmount !== null
      ? Math.round((recentChangeAmount / firstPrice) * 10000) / 100
      : null
    return {
      ...item,
      points,
      recentChangeAmount,
      recentChangePct,
    }
  })

  const width = 320
  const height = 180
  const paddingLeft = 22
  const paddingRight = 8
  const paddingTop = 12
  const paddingBottom = 22
  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom
  const allPrices = recentSeries.flatMap((item) => Array.isArray(item?.points) ? item.points.map((point) => Number(point.min_price || 0)).filter((price) => price > 0) : [])
  if (!allPrices.length) {
    return ""
  }
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const safeRange = Math.max(maxPrice - minPrice, 1)
  const xForIndex = (index) => {
    if (labels.length === 1) {
      return paddingLeft + chartWidth / 2
    }
    return paddingLeft + (chartWidth * index) / (labels.length - 1)
  }
  const yForPrice = (price) => {
    return paddingTop + chartHeight - ((Number(price || 0) - minPrice) / safeRange) * chartHeight
  }

  const guides = [0, 0.5, 1].map((ratio, index) => {
    const y = paddingTop + chartHeight * ratio
    return `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(167,115,54,0.16)" stroke-dasharray="4 4" />`
  }).join("")

  const seriesLines = recentSeries.map((item, index) => {
    const color = getTrendSeriesPalette(index)
    const pointMap = new Map((item.points || []).map((point) => [String(point.collected_at || "").trim(), point]))
    const polylinePoints = labels
      .map((label, labelIndex) => {
        const point = pointMap.get(label)
        if (!point) {
          return null
        }
        return `${xForIndex(labelIndex)},${yForPrice(point.min_price)}`
      })
      .filter(Boolean)
      .join(" ")
    const circles = labels.map((label, labelIndex) => {
      const point = pointMap.get(label)
      if (!point) {
        return ""
      }
      return `<circle cx="${xForIndex(labelIndex)}" cy="${yForPrice(point.min_price)}" r="2.8" fill="${color}" />`
    }).join("")
    return `
      <polyline fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
      ${circles}
    `
  }).join("")

  const minLabel = Math.floor(minPrice)
  const maxLabel = Math.ceil(maxPrice)
  return `
    <div class="chart-shell">
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="竞对主流房型与酒店最低价折线图">
        <text x="2" y="${paddingTop + 4}" font-size="10" fill="#8d6542">¥${maxLabel}</text>
        <text x="2" y="${paddingTop + chartHeight}" font-size="10" fill="#8d6542">¥${minLabel}</text>
        ${guides}
        ${seriesLines}
      </svg>
      <div class="chart-axis-labels">
        ${labels.map((label) => `<span>${escapeHtml(formatTrendDateInline(label))}</span>`).join("")}
      </div>
      <div class="chart-legend">
        ${recentSeries.map((item, index) => `
          <div class="chart-legend-item">
            <span class="chart-swatch" style="background:${getTrendSeriesPalette(index)}"></span>
            <div class="chart-legend-text">
              <div class="chart-legend-title">${escapeHtml(getTrendSeriesTitle(item, index))}</div>
              <div class="chart-legend-meta">最新最低价 ${formatPrice(item?.latest_min_price)} | 时间 ${escapeHtml(formatTrendDateInline(item?.latest_collected_at || item?.latest_bucket_at || ""))} | ${formatRecentTrendChange(item?.recentChangeAmount, item?.recentChangePct)}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `
}

function renderTrendHotelSourceLink(hotelUrl) {
  const normalizedUrl = String(hotelUrl || "").trim()
  if (!normalizedUrl) {
    return "-"
  }
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    return escapeHtml(normalizedUrl)
  }
  return `<a href="${escapeHtml(normalizedUrl)}" target="_blank" rel="noreferrer">打开酒店详情页</a>`
}

function renderCompetitorTrendSeriesDetails(series, seriesType) {
  const items = Array.isArray(series) ? series : []
  if (!items.length) {
    return ""
  }

  const isHotelMinPrice = String(seriesType || "") === "hotel_min_price"
  const title = isHotelMinPrice ? "曲线明细：按竞对酒店区分" : "曲线明细：按主流房型 + 竞对酒店区分"
  return `
    <div class="workflow-list" style="margin-top: 12px;">
      <div class="tip">${escapeHtml(title)}</div>
      ${items.map((item, index) => {
        const categoryName = String(item?.category_name || "").trim()
        const hotelName = String(item?.hotel_name || "").trim()
        const hotelUrl = String(item?.hotel_url || "").trim()
        const recentPoints = (Array.isArray(item?.points) ? item.points : [])
          .filter((point) => Number.isFinite(Number(point?.min_price)))
          .sort((left, right) => String(left?.collected_at || "").localeCompare(String(right?.collected_at || "")))
          .slice(-3)
        const trendStartPoint = recentPoints[0] || null
        const trendEndPoint = recentPoints[recentPoints.length - 1] || null
        const trendDetail = trendStartPoint && trendEndPoint
          ? `趋势依据：${escapeHtml(formatTrendDateInline(trendStartPoint?.collected_at || ""))} 低价 ${formatPrice(trendStartPoint?.min_price)} → ${escapeHtml(formatTrendDateInline(trendEndPoint?.collected_at || ""))} 低价 ${formatPrice(trendEndPoint?.min_price)}`
          : "趋势依据：暂无足够数据"
        const trendChangeAmount = trendStartPoint && trendEndPoint
          ? Math.round((Number(trendEndPoint?.min_price || 0) - Number(trendStartPoint?.min_price || 0)) * 100) / 100
          : null
        const trendChangePct = trendStartPoint && Number(trendStartPoint?.min_price || 0) > 0 && trendChangeAmount !== null
          ? Math.round((trendChangeAmount / Number(trendStartPoint?.min_price || 0)) * 10000) / 100
          : null
        const dimensionText = isHotelMinPrice
          ? "维度: 竞对酒店最低价"
          : `主流房型: ${escapeHtml(categoryName || "-")}`
        return `
          <div class="workflow-item">
            <div class="workflow-item-name">${escapeHtml(getTrendSeriesTitle(item, index))}</div>
            <div class="workflow-item-meta">${dimensionText} | 竞对酒店: ${escapeHtml(hotelName || "-")}</div>
            <div class="workflow-item-meta">竞对酒店来源: 云端历史价 | 配置链接: ${renderTrendHotelSourceLink(hotelUrl)}</div>
            <div class="workflow-item-meta">最新最低价 ${formatPrice(item?.latest_min_price)} | 最新采集 ${escapeHtml(formatTrendDateInline(item?.latest_collected_at || item?.latest_bucket_at || ""))}</div>
            <div class="workflow-item-meta">${formatRecentTrendChange(trendChangeAmount, trendChangePct)} | 点数 ${Number(item?.point_count || 0)}</div>
            <div class="workflow-item-meta">${trendDetail}</div>
          </div>
        `
      }).join("")}
    </div>
  `
}

function renderCompetitorTrendPanel() {
  if (!competitorTrendBox) {
    return
  }
  if (!isAuthenticatedConfig(currentConfig)) {
    competitorTrendBox.innerHTML = '<div class="empty-state">登录后会在这里展示竞对价格趋势与自动采集状态。</div>'
    return
  }
  const trendResponse = currentCompetitorTrendSummary?.trend || null
  const schedule = currentCompetitorTrendSummary?.schedule || null
  const series = Array.isArray(trendResponse?.series) ? trendResponse.series : []
  const advice = trendResponse?.advice || {}
  const adviceItems = Array.isArray(advice?.items) ? advice.items : []
  const seriesType = String(trendResponse?.series_type || competitorTrendSeriesSelect?.value || "room_category")
  const dimensionLabel = seriesType === "hotel_min_price" ? "竞对酒店" : "主流房型 + 酒店"
  if (!series.length) {
    competitorTrendBox.innerHTML = `
      <div class="empty-state">当前还没有可绘制的${escapeHtml(dimensionLabel)}历史数据，等待自动采集或先手动抓取一次竞对房型价。</div>
      <div class="tip">${escapeHtml(formatTrendScheduleText(schedule, trendResponse))}</div>
    `
    return
  }

  const trendDays = Number(trendResponse?.days || 2)
  const trendWindowLabel = trendDays === 2 ? "48 小时" : `${trendDays} 天`
  competitorTrendBox.innerHTML = `
    <div>最近 <strong>${trendWindowLabel}</strong> 已记录 <strong>${Number(trendResponse?.point_count || 0)}</strong> 个价格点，覆盖 <strong>${Number(trendResponse?.category_count || series.length)}</strong> 条${escapeHtml(dimensionLabel)}曲线。</div>
    <div class="summary-grid">
      <div class="summary-pill">
        <div class="summary-label">${seriesType === "hotel_min_price" ? "酒店均值" : "曲线均值"}</div>
        <div class="summary-value">${formatPrice(trendResponse?.latest_price_avg)}</div>
      </div>
      <div class="summary-pill">
        <div class="summary-label">最新采集</div>
        <div class="summary-value">${escapeHtml(formatTrendDateInline(trendResponse?.latest_collected_at || "-"))}</div>
      </div>
    </div>
    ${buildCompetitorTrendSvg(series)}
    ${renderCompetitorTrendSeriesDetails(series, seriesType)}
    <div class="tip">${escapeHtml(formatTrendScheduleText(schedule, trendResponse))}</div>
    <div class="tip">AI 建议来源：${escapeHtml(String(advice?.source || "rule_based"))}${advice?.summary ? ` | ${escapeHtml(advice.summary)}` : ""}</div>
    <div class="tags">${series.map((item, index) => `<span class="tag">${escapeHtml(getTrendSeriesTitle(item, index))}</span>`).join("")}</div>
    <div class="advice-list">
      ${adviceItems.length ? adviceItems.map((item) => `
        <div class="advice-item">
          <div class="advice-item-title">${escapeHtml(item?.title || "趋势建议")}</div>
          <div class="advice-item-detail">${escapeHtml(item?.detail || "-")}</div>
        </div>
      `).join("") : '<div class="empty-state">当前没有额外建议，继续等待更多采样点。</div>'}
    </div>
  `
}

function formatMerchantSnapshotSource(source, itemCount) {
  const count = Number(itemCount || 0)
  if (source === "manual_room_mappings") {
    return `\u624b\u5de5\u623f\u578b\u4ef7\u683c ${count} \u6761`
  }
  if (source === "merchant_price_snapshot") {
    return `\u6293\u53d6\u623f\u578b\u5feb\u7167 ${count} \u6761`
  }
  return `\u672c\u5e97\u623f\u578b\u6837\u672c ${count} \u6761`
}

function renderCompetitorPricingAdvice() {
  if (!competitorAdviceBox) {
    return
  }
  const hotels = Array.isArray(currentCompetitorRoomPrices?.hotels) ? currentCompetitorRoomPrices.hotels : []
  const mappingState = getPreferredRoomMappingState(currentConfig, currentMerchantMappings)
  const manualRoomMappings = mappingState.items
  const hotelTags = hotels.slice(0, 6).map((hotel) => `<span class="tag">${escapeHtml(hotel?.hotel_name || "未命名酒店")}</span>`).join("")
  if (!currentCompetitorPricingAdvice) {
    competitorAdviceBox.innerHTML = hotels.length
      ? `
        <div>已缓存 <strong>${Number(currentCompetitorRoomPrices?.hotel_count || hotels.length)}</strong> 家竞对酒店，<strong>${Number(currentCompetitorRoomPrices?.total_rooms || 0)}</strong> 条房型价</div>
        <div class="tip">${manualRoomMappings.length ? `当前店铺已维护 ${manualRoomMappings.length} 条${mappingState.sourceLabel}房型映射；点击生成时将读取数据库最近一次自动抓取的竞对房型价。` : '当前还没有可用的本店房型映射，请先在设置页维护我的房型映射。'}</div>
        <div class="tags">${hotelTags}</div>
      `
      : `
        <div class="empty-state">无需先手动抓取；点击生成时会直接读取数据库里最近一次自动抓取的竞对房型价。</div>
        <div class="tip">${manualRoomMappings.length ? `当前店铺已维护 ${manualRoomMappings.length} 条${mappingState.sourceLabel}房型映射。` : '当前还没有可用的本店房型映射，请先在设置页维护我的房型映射。'}</div>
      `
    return
  }

  const advice = currentCompetitorPricingAdvice
  const summary = advice?.advice_summary || {}
  const competitorContext = advice?.competitor_context || {}
  const merchantHistory = advice?.merchant_history_context || {}
  const merchantSnapshot = advice?.merchant_room_snapshot || {}
  const marketTrend = advice?.market_trend_context || {}
  const roomRecommendations = Array.isArray(advice?.room_recommendations) ? advice.room_recommendations : []
  const reasons = Array.isArray(summary?.reasons) ? summary.reasons.filter(Boolean) : []
  const targetName = String(advice?.competitor_hotel_name || competitorAdviceHotelInput?.value || "").trim()
  const sourceLabel = formatMerchantSnapshotSource(merchantSnapshot?.source, merchantSnapshot?.item_count || roomRecommendations.length || 0)
  const roomCards = roomRecommendations.slice(0, 8).map((item) => `
    <div class="workflow-item">
      <div class="workflow-item-name">${escapeHtml(item?.display_name || item?.room_name || item?.rate_name || '未命名房型')}</div>
      <div class="workflow-item-meta">现价 ${formatPrice(item?.current_price)} | 竞对最低 ${formatPrice(item?.competitor_min_price)} | 竞对均价 ${formatPrice(item?.competitor_avg_price)} | 竞对最高 ${formatPrice(item?.competitor_max_price)}</div>
      <div class="workflow-item-meta">趋势锚点 ${formatPrice(item?.trend_based_price)} | 竞对趋势 ${formatSignedPercent(item?.market_trend_pct)}</div>
      <div class="workflow-item-meta">建议价 ${formatPrice(item?.suggested_price)} | 调整 ${formatSignedPrice(item?.change_amount)} | 调整比例 ${formatSignedPercent(item?.change_pct)} | 风险 ${escapeHtml(item?.risk_level || '-')}</div>
      <div class="tip">${escapeHtml(item?.reasoning || '-')}</div>
    </div>
  `).join("")

  competitorAdviceBox.innerHTML = `
    <div>
      <strong>${escapeHtml(targetName || '综合竞对酒店')}</strong>
      ${targetName ? ' 的建议价结果' : ' 的建议价结果（按本次抓取汇总）'}
    </div>
    <div class="summary-grid">
      <div class="summary-pill">
        <div class="summary-label">建议房型</div>
        <div class="summary-value">${Number(summary?.recommended_room_count || roomRecommendations.length || 0)}</div>
      </div>
      <div class="summary-pill">
        <div class="summary-label">建议均价</div>
        <div class="summary-value">${formatPrice(summary?.suggested_price)}</div>
      </div>
      <div class="summary-pill">
        <div class="summary-label">竞对均价</div>
        <div class="summary-value">${formatPrice(summary?.competitor_avg_price)}</div>
      </div>
      <div class="summary-pill">
        <div class="summary-label">风险等级</div>
        <div class="summary-value">${escapeHtml(summary?.risk_level || '-')}</div>
      </div>
    </div>
    <div class="tip">竞对样本 ${Number(competitorContext?.price_count || 0)} 条 | ${sourceLabel} | 来源 ${escapeHtml(advice?.recommendation_source || '-')}</div>
    <div class="tip">竞对趋势 ${escapeHtml(formatMarketTrendSummary(marketTrend))}</div>
    <div class="tip">历史样本 ${Number(merchantHistory?.price_count || 0)} 条 | ${escapeHtml(summary?.reason_summary || '已按当前库存、房型映射和竞对房价生成建议。')}</div>
    ${reasons.length ? `<div class="tags">${reasons.slice(0, 6).map((reason) => `<span class="tag">${escapeHtml(reason)}</span>`).join("")}</div>` : `<div class="tags">${hotelTags}</div>`}
    <div class="workflow-list" style="margin-top: 12px;">
      ${roomCards || '<div class="empty-state">当前没有可展示的房型建议。</div>'}
    </div>
  `
}

function renderCompetitorHotelCard(hotel, index) {
  const rooms = Array.isArray(hotel?.rooms) ? hotel.rooms : []
  const hotelName = hotel?.hotel_name || `竞对酒店 ${index + 1}`
  if (hotel?.error) {
    return `
      <div class="workflow-item">
        <div class="workflow-item-name">${escapeHtml(hotelName)}</div>
        <div class="tip">抓取失败: ${escapeHtml(hotel.error)}</div>
      </div>
    `
  }

  return `
    <div class="workflow-item">
      <div class="workflow-item-name">${escapeHtml(hotelName)}</div>
      <div class="tip">房型价 ${rooms.length} 条 | 采集时间 ${escapeHtml(hotel?.collected_at || "-")}</div>
      <div class="workflow-list" style="margin-top: 10px;">
        ${rooms.length ? rooms.map((room, idx) => renderCompetitorRoomRow(room, idx, hotelName)).join("") : '<div class="empty-state">未识别到可见房型价。</div>'}
      </div>
    </div>
  `
}

function renderCompetitorRoomRow(room, index, hotelName = "") {
  const displayName = room?.rate_name || room?.room_type || `房型 ${index + 1}`
  return `
    <div class="workflow-item">
      <div class="workflow-item-name">${escapeHtml(displayName)}</div>
      <div class="workflow-item-meta">竞对酒店: ${escapeHtml(hotelName || "未命名酒店")}</div>
      <div class="workflow-item-meta">房型: ${escapeHtml(room?.room_type || "-")} | 价型: ${escapeHtml(room?.rate_name || room?.room_type || "-")}</div>
      <div class="workflow-item-meta">早餐: ${escapeHtml(room?.breakfast || "未知")} | 退改: ${escapeHtml(room?.cancelable || "未知")}</div>
      <div class="summary-grid" style="margin-top: 10px;">
        <div class="summary-pill">
          <div class="summary-label">实时价格</div>
          <div class="summary-value">${formatPrice(room?.price)}</div>
        </div>
      </div>
    </div>
  `
}

function renderPageContext(pageContext) {
  applyContextualPopupCopy(pageContext)
}

function renderWorkflowPreview() {
  const preview = currentMerchantMappingsPreview || (currentMerchantSnapshots ? normalizeWorkflowPreview(currentMerchantSnapshots) : null)
  if (!preview || !Array.isArray(preview.rows) || preview.rows.length === 0) {
    const snapshotSummary = currentMerchantSnapshots
      ? MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => {
        const snapshot = currentMerchantSnapshots.snapshots?.[platformId]
        const platform = getMerchantWorkflowPlatform(platformId)
        if (!snapshot) {
          return `${platform.name}: 未读取`
        }
        if (snapshot.status !== "success") {
          return `${platform.name}: ${snapshot.error || "读取失败"}`
        }
        return `${platform.name}: ${Number(snapshot.itemCount || snapshot.items?.length || 0)} 条`
      }).join(" | ")
      : ""
    workflowBox.innerHTML = `
      <div class="empty-state">先填写三个平台的商家价格页，再读取价格生成映射。</div>
      ${snapshotSummary ? `<div class="tip">${escapeHtml(snapshotSummary)}</div>` : ""}
    `
    return
  }

  const rows = preview.rows
  const readyEntries = rows.flatMap((row) => Object.values(row.entries || {}).filter((entry) => entry?.submitReady))
  const selectedEntries = rows.flatMap((row) => Object.values(row.entries || {}).filter((entry) => entry?.submitReady && entry.selected))
  const allSelected = readyEntries.length > 0 && selectedEntries.length === readyEntries.length
  const snapshotSummary = MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => {
    const snapshot = preview.snapshots?.[platformId]
    const platform = getMerchantWorkflowPlatform(platformId)
    if (!snapshot) {
      return `${platform.name}: 未读取`
    }
    if (snapshot.status !== "success") {
      return `${platform.name}: ${snapshot.error || "读取失败"}`
    }
    return `${platform.name}: ${Number(snapshot.itemCount || snapshot.items?.length || 0)} 条`
  }).join(" | ")

  workflowBox.innerHTML = `
    <div>
      <strong>三平台价格映射</strong> 已生成。
      已生成 ${rows.length} 组映射，可提交 ${readyEntries.length} 条，当前选中 ${selectedEntries.length} 条。
    </div>
    <div class="summary-grid">
      ${MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => {
        const snapshot = preview.snapshots?.[platformId]
        const platform = getMerchantWorkflowPlatform(platformId)
        const count = Number(snapshot?.itemCount || snapshot?.items?.length || 0)
        const status = snapshot?.status === "success" ? "已读取" : (snapshot?.error || "未读取")
        return `
          <div class="summary-pill">
            <div class="summary-label">${escapeHtml(platform.name)}</div>
            <div class="summary-value">${count}</div>
            <div class="tip">${escapeHtml(status)}</div>
          </div>
        `
      }).join("")}
      <div class="summary-pill">
        <div class="summary-label">映射组</div>
        <div class="summary-value">${rows.length}</div>
      </div>
    </div>
    <div class="tip">${escapeHtml(snapshotSummary)}</div>
    <div class="workflow-tools">
      <button type="button" data-action="toggle-all-workflow" data-checked="${allSelected ? "1" : "0"}">${allSelected ? "取消全选" : "全选可提交项"}</button>
      <button type="button" data-action="fill-current-prices">按当前价填充</button>
      <button type="button" class="secondary" disabled>${escapeHtml(preview.generatedAt || "刚刚")}</button>
    </div>
    <div class="workflow-list">
      ${rows.map((row, index) => renderWorkflowRow(row, index)).join("")}
    </div>
  `
}

function renderWorkflowRow(row, index) {
  const entries = MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => row.entries?.[platformId] || null)
  const presentPlatforms = entries.filter(Boolean).map((entry) => entry.platformName || getMerchantWorkflowPlatform(entry.platformId).name)
  return `
    <div class="workflow-item compact">
      <div class="workflow-item-name">${escapeHtml(row.displayName || "未命名映射")}</div>
      <div class="workflow-item-meta">匹配平台: ${escapeHtml(presentPlatforms.length ? presentPlatforms.join(" / ") : "-")}</div>
      <div class="workflow-item-meta">映射键: ${escapeHtml(row.key || "-")}</div>
      <div class="merchant-platform-grid">
        ${entries.map((entry, cellIndex) => renderWorkflowEntryCell(row, entry, index, MERCHANT_WORKFLOW_PLATFORM_IDS[cellIndex])).join("")}
      </div>
    </div>
  `
}

function renderWorkflowEntryCell(row, entry, rowIndex, platformId) {
  const platform = getMerchantWorkflowPlatform(platformId)
  if (!entry) {
    return `
      <div class="summary-pill merchant-platform-card" style="opacity:.72;">
        <div class="summary-label">${escapeHtml(platform.name)}</div>
        <div class="empty-state" style="margin:8px 0 0; padding: 8px;">未读取</div>
      </div>
    `
  }
  return `
    <div class="summary-pill merchant-platform-card">
      <div class="summary-label">${escapeHtml(platform.name)}</div>
      <label style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:12px;">
        <input type="checkbox" data-role="workflow-check" data-platform="${platformId}" data-index="${rowIndex}" ${entry.selected && entry.submitReady ? "checked" : ""} ${entry.submitReady ? "" : "disabled"}>
        <span>提交</span>
      </label>
      <div class="workflow-item-meta workflow-room-intro">房间介绍: ${escapeHtml(entry.roomIntro || "暂无房间介绍")}</div>
      <div class="workflow-item-meta">GID/HID: ${escapeHtml(entry.gid || "-")} / ${escapeHtml(entry.hid || "-")}</div>
      <div class="workflow-item-meta">匹配 ${escapeHtml(formatWorkflowMatchMode(entry.matchMode))}${entry.matchedRoomCount ? ` ${entry.matchedRoomCount}条` : ""}</div>
      <label style="display:grid;gap:6px;margin-top:6px;font-size:12px;">最终价
        <input type="number" min="1" step="0.01" data-role="workflow-final-price" data-platform="${platformId}" data-index="${rowIndex}" value="${entry.finalPrice ?? ""}" ${entry.submitReady ? "" : "disabled"}>
      </label>
    </div>
  `
}

function formatWorkflowMatchMode(value) {
  return ({
    manual_mapping: "手动映射",
    smart_match: "智能匹配",
    broad_match: "宽松匹配",
    market_fallback: "市场兜底"
  })[String(value || "").trim()] || "-"
}

function syncWorkflowItemsFromDom() {
  if (!currentMerchantMappingsPreview?.rows) {
    return
  }
  currentMerchantMappingsPreview.rows.forEach((row, rowIndex) => {
    MERCHANT_WORKFLOW_PLATFORM_IDS.forEach((platformId) => {
      const entry = row.entries?.[platformId]
      if (!entry) {
        return
      }
      const checkedNode = workflowBox.querySelector(`[data-role='workflow-check'][data-platform='${platformId}'][data-index='${rowIndex}']`)
      const finalPriceNode = workflowBox.querySelector(`[data-role='workflow-final-price'][data-platform='${platformId}'][data-index='${rowIndex}']`)
      entry.selected = Boolean(checkedNode?.checked) && entry.submitReady
      entry.finalPrice = toPositiveNumber(finalPriceNode?.value) ?? entry.finalPrice
    })
  })
}

function toggleAllWorkflowItems(nextChecked) {
  if (!currentMerchantMappingsPreview?.rows) {
    return
  }
  currentMerchantMappingsPreview.rows.forEach((row) => {
    MERCHANT_WORKFLOW_PLATFORM_IDS.forEach((platformId) => {
      const entry = row.entries?.[platformId]
      if (entry?.submitReady) {
        entry.selected = nextChecked
      }
    })
  })
}

function applySuggestedPricesToWorkflow() {
  if (!currentMerchantMappingsPreview?.rows) {
    return
  }
  syncWorkflowItemsFromDom()
  currentMerchantMappingsPreview.rows.forEach((row) => {
    MERCHANT_WORKFLOW_PLATFORM_IDS.forEach((platformId) => {
      const entry = row.entries?.[platformId]
      if (entry?.selected && entry.submitReady && entry.currentPrice) {
        entry.finalPrice = entry.currentPrice
      }
    })
  })
}

function collectConfirmedWorkflowItems() {
  if (!currentMerchantMappingsPreview?.rows) {
    return []
  }
  return currentMerchantMappingsPreview.rows.flatMap((row) => {
    return MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => row.entries?.[platformId])
      .filter((entry) => entry && entry.selected && entry.submitReady && entry.finalPrice)
      .map((entry) => ({
        room_name: entry.roomName,
        rate_name: entry.rateName,
        display_name: entry.displayName,
        current_price: entry.currentPrice,
        final_price: entry.finalPrice,
        suggested_price: entry.currentPrice,
        risk_level: entry.riskLevel,
        gid: entry.gid,
        hid: entry.hid,
        platform: entry.platformId,
        platform_name: entry.platformName,
        comment: "browser_extension_merchant_mapping_submit"
      }))
  })
}

function formatWorkflowSubmitLine(item) {
  const name = item?.display_name || item?.rate_name || item?.room_name || "未命名房型"
  const currentPrice = Number(item?.current_price || 0)
  const finalPrice = Number(item?.final_price || 0)
  const platformName = item?.platform_name || getMerchantWorkflowPlatform(item?.platform).name
  const changeText = currentPrice && finalPrice
    ? `，较现价${finalPrice >= currentPrice ? "+" : ""}${(finalPrice - currentPrice).toFixed(2)}`
    : ""
  return `- ${platformName} / ${name}: 现价 ${formatPrice(currentPrice)} / 最终 ${formatPrice(finalPrice)}${changeText}`
}

function buildWorkflowSubmitConfirmation(confirmedItems) {
  const items = Array.isArray(confirmedItems) ? confirmedItems : []
  const grouped = items.reduce((acc, item) => {
    const key = String(item?.platform || "fliggy").trim().toLowerCase() || "fliggy"
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})
  const sampleLines = items.slice(0, 5).map(formatWorkflowSubmitLine)
  const platformLines = MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => {
    const platform = getMerchantWorkflowPlatform(platformId)
    return `${platform.name}: ${Number(grouped[platformId]?.length || 0)}`
  })
  const changedCount = items.filter((item) => {
    const currentPrice = Number(item?.current_price || 0)
    const finalPrice = Number(item?.final_price || 0)
    return currentPrice > 0 && finalPrice > 0 && Math.round(currentPrice * 100) !== Math.round(finalPrice * 100)
  }).length
  return [
    "将按以下映射最终价提交到商家后台，确认后会执行真实改价。",
    `总房型数: ${items.length}`,
    `价格发生变化: ${changedCount}`,
    `分平台: ${platformLines.join(" / ")}`,
    sampleLines.length ? "提交预览:" : "",
    sampleLines.join("\n"),
    items.length > sampleLines.length ? `...另有 ${items.length - sampleLines.length} 个房型` : "",
    "",
    "确认继续提交？"
  ].filter((line) => line !== "").join("\n")
}

function confirmWorkflowSubmission(confirmedItems) {
  return window.confirm(buildWorkflowSubmitConfirmation(confirmedItems))
}

function confirmUniformSubmit(priceUrl, targetPrice) {
  return window.confirm([
    "统一目标价是高级备用流程，确认后会把所有可提交房型按同一个目标价提交到商家后台。",
    `目标价: ¥${Number(targetPrice).toFixed(2)}`,
    `链接: ${priceUrl}`,
    "",
    "优先建议使用上方三平台映射流程。确认继续提交？"
  ].join("\n"))
}

function formatWorkflowResult(response) {
  const snapshots = response?.snapshots || {}
  const rows = Array.isArray(response?.rows) ? response.rows : []
  const platformLines = MERCHANT_WORKFLOW_PLATFORM_IDS.map((platformId) => {
    const snapshot = snapshots[platformId]
    const platform = getMerchantWorkflowPlatform(platformId)
    if (!snapshot) {
      return `${platform.name}: -`
    }
    return `${platform.name}: ${snapshot.status || "unknown"} / ${Number(snapshot.itemCount || snapshot.items?.length || 0)} 条`
  })
  return [
    "商家映射工作流",
    ...platformLines,
    `映射组: ${rows.length}`,
    `可提交项: ${Number(response?.readySubmitCount || 0)}`,
    `生成时间: ${response?.generatedAt || "-"}` 
  ].join("\n")
}

function formatCompetitorPricingAdviceResult(response) {
  const summary = response?.advice_summary || {}
  const competitorContext = response?.competitor_context || {}
  const merchantHistory = response?.merchant_history_context || {}
  const merchantSnapshot = response?.merchant_room_snapshot || {}
  const marketTrend = response?.market_trend_context || {}
  const roomRecommendations = Array.isArray(response?.room_recommendations) ? response.room_recommendations : []
  const roomLines = roomRecommendations.slice(0, 12).map((item) => {
    const roomName = item?.display_name || item?.room_name || item?.rate_name || '\u672a\u547d\u540d\u623f\u578b'
    return [
      `${roomName}`,
      `\u5f53\u524d\u4ef7: ${formatPrice(item?.current_price)} | \u7ade\u5bf9\u6700\u4f4e: ${formatPrice(item?.competitor_min_price)} | \u7ade\u5bf9\u5747\u4ef7: ${formatPrice(item?.competitor_avg_price)} | \u7ade\u5bf9\u6700\u9ad8: ${formatPrice(item?.competitor_max_price)}`,
      `\u8d8b\u52bf\u951a\u70b9: ${formatPrice(item?.trend_based_price)} | \u7ade\u5bf9\u8d8b\u52bf: ${formatSignedPercent(item?.market_trend_pct)}`,
      `\u5efa\u8bae\u4ef7: ${formatPrice(item?.suggested_price)} | \u8c03\u6574: ${formatSignedPrice(item?.change_amount)} | \u8c03\u6574\u6bd4\u4f8b: ${formatSignedPercent(item?.change_pct)} | \u98ce\u9669: ${item?.risk_level || '-'}`,
      `\u8bf4\u660e: ${item?.reasoning || '-'}`,
    ].join("\\n")
  })
  return [
    `\u7ade\u5bf9\u9152\u5e97: ${response?.competitor_hotel_name || '\u7efc\u5408\u7ade\u5bf9\u9152\u5e97'}`,
    `\u623f\u578b\u5efa\u8bae\u6570: ${Number(summary?.recommended_room_count || roomRecommendations.length || 0)}`,
    `\u5efa\u8bae\u5747\u4ef7: ${formatPrice(summary?.suggested_price)}`,
    `\u7ade\u5bf9\u5747\u4ef7: ${formatPrice(summary?.competitor_avg_price)}`,
    `\u7ade\u5bf9\u4e2d\u4f4d\u4ef7: ${formatPrice(summary?.competitor_median_price)}`,
    `\u7ade\u5bf9\u6837\u672c: ${Number(competitorContext?.price_count || 0)}`,
    `\u7ade\u5bf9\u8d8b\u52bf: ${formatMarketTrendSummary(marketTrend)}`,
    `\u672c\u5e97\u53c2\u8003\u6837\u672c: ${Number(merchantHistory?.price_count || 0)}`,
    `\u672c\u5e97\u4ef7\u683c\u6765\u6e90: ${formatMerchantSnapshotSource(merchantSnapshot?.source, merchantSnapshot?.item_count || roomRecommendations.length || 0)}`,
    `\u5efa\u8bae\u6765\u6e90: ${response?.recommendation_source || '-'}`,
    `\u6458\u8981: ${summary?.reason_summary || '-'}`,
    roomLines.length ? '' : null,
    ...roomLines,
  ].filter((item) => item !== null).join("\\n")
}
function formatSubmitResult(response) {
  const items = Array.isArray(response?.items) ? response.items : []
  const sampleLines = items.slice(0, 5).map((item) => {
    const name = item?.display_name || item?.rate_name || item?.room_name || "未命名房型"
    const platformName = item?.platform_name ? `${item.platform_name} / ` : ""
    const finalPrice = item?.final_price ?? "-"
    const status = item?.status || "unknown"
    const message = item?.message || ""
    return `- ${platformName}${name}: ${finalPrice} / ${status}${message ? ` / ${message}` : ""}`
  })
  return [
    "OTA 提交完成",
    `状态: ${response?.status || "unknown"}`,
    `成功: ${response?.success_count || 0}`,
    `失败: ${response?.failed_count || 0}`,
    `跳过: ${response?.skipped_submit_count || 0}`,
    `通道: ${response?.submit_channel || "merchant_portal"}`,
    sampleLines.length ? "提交示例:" : "",
    sampleLines.join("\n")
  ].filter(Boolean).join("\n")
}

function updateStatus(message, state) {
  statusText.textContent = message
  statusDot.classList.remove("ok", "error")
  if (state) {
    statusDot.classList.add(state)
  }
}

async function withBusy(task) {
  setBusy(true)
  try {
    await task()
  } catch (error) {
    updateStatus(`请求失败: ${error.message}`, "error")
    resultBox.textContent = error.stack || error.message
  } finally {
    setBusy(false)
  }
}

function setBusy(isBusy) {
  ;[
    workspaceGateBtn,
    targetsInput,
    ...Object.values(merchantPlatformUrlInputs),
    workflowLoadBtn,
    workflowAnalyzeBtn,
    workflowFillBtn,
    workflowSubmitBtn,
    roomPricesBtn,
    roomSettingsBtn,
    competitorAdviceHotelInput,
    competitorAdviceTotalRoomsInput,
    competitorAdviceAvailableRoomsInput,
    competitorAdviceCurrentPriceInput,
    competitorAdviceStrategySelect,
    competitorTrendRefreshBtn,
    competitorTrendSeriesSelect,
    competitorAdviceBtn,
    uniformPriceUrlInput,
    uniformTargetPriceInput,
    uniformSubmitBtn,
    refreshBtn,
    statusBtn,
    collectBtn,
    panelBtn,
    optionsBtn,
    ...(popupViewNav ? Array.from(popupViewNav.querySelectorAll("button")) : []),
    ...(popupWorkspaceNav ? Array.from(popupWorkspaceNav.querySelectorAll("button")) : []),
    ...(popupBasicSectionNav ? Array.from(popupBasicSectionNav.querySelectorAll("button")) : []),
    ...Array.from(workflowBox.querySelectorAll("button, input")),
    ...Array.from(competitorTrendBox?.querySelectorAll("button, input, select") || []),
    ...Array.from(competitorAdviceBox?.querySelectorAll("button, input, select") || [])
  ].filter(Boolean).forEach((node) => {
    node.disabled = isBusy
  })
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs[0] || null
}

function withTimeout(promise, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label}超时`))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

function sendRuntimeMessage(message) {
  return withTimeout(new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      if (!response?.ok) {
        reject(new Error(response?.error || "Unknown extension error"))
        return
      }
      resolve(response.data)
    })
  }), RUNTIME_TIMEOUT_MS, `扩展消息 ${message?.type || "unknown"}`)
}

function isUnsupportedMessageTypeError(error) {
  return /Unsupported message type/i.test(String(error?.message || error || ""))
}

function normalizeRequestBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_EXTENSION_CONFIG.baseUrl).trim().replace(/\/+$/, "")
}


async function requestMerchantMappingsSummary(payload = {}) {
  try {
    return await sendRuntimeMessage({ type: "MERCHANT_MAPPING_LIST", payload })
  } catch (error) {
    if (!isUnsupportedMessageTypeError(error)) {
      throw error
    }
    const config = await getEffectiveConfig()
    const onlyEnabled = payload.onlyEnabled ? "1" : "0"
    const url = `${normalizeRequestBaseUrl(config.baseUrl)}/pricing/merchant-mappings?shop_id=${encodeURIComponent(String(Number(config.shopId) || 0))}&platform=${encodeURIComponent(String(payload.platform || "fliggy"))}&only_enabled=${onlyEnabled}`
    const response = await fetch(url, {
      headers: {
        "X-Tenant-Id": String(config.tenantId),
        "X-Shop-Id": String(config.shopId),
        ...(String(config.authToken || "").trim() ? { Authorization: `Bearer ${String(config.authToken || "").trim()}` } : {})
      }
    })
    const text = await response.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch (parseError) {
      data = null
    }
    if (!response.ok) {
      throw new Error(data?.error || data?.message || text || `HTTP ${response.status}`)
    }
    return data
  }
}

async function requestCompetitorRoomPricesViaHttp(payload = {}) {
  const config = await getEffectiveConfig()
  const hotels = normalizeCompetitorHotels(payload.hotels || config.competitorHotels)
  if (!hotels.length) {
    throw new Error("\u8bf7\u5148\u5728\u8bbe\u7f6e\u9875\u914d\u7f6e\u81f3\u5c11\u4e00\u6761\u7ade\u5bf9\u9152\u5e97\u8be6\u60c5\u9875")
  }
  const response = await fetch(`${normalizeRequestBaseUrl(config.baseUrl)}/plugin/competitor/room-prices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": String(config.tenantId),
      "X-Shop-Id": String(config.shopId),
      ...(String(config.authToken || "").trim() ? { Authorization: `Bearer ${String(config.authToken || "").trim()}` } : {})
    },
    body: JSON.stringify({
      shop_id: Number(config.shopId),
      hotels,
      headless: payload.headless !== undefined ? Boolean(payload.headless) : true,
      save_result: payload.saveResult !== undefined ? Boolean(payload.saveResult) : Boolean(config.saveResult),
      debug_url: String(config.debugUrl || "")
    })
  })
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch (error) {
    data = null
  }
  if (!response.ok) {
    throw new Error(data?.error || data?.message || text || `HTTP ${response.status}`)
  }
  return data
}

async function requestCompetitorRoomPrices(payload = {}) {
  let lastError = null
  for (const type of COMPETITOR_ROOM_PRICE_MESSAGE_TYPES) {
    try {
      return await sendRuntimeMessage({ type, payload })
    } catch (error) {
      lastError = error
      if (!isUnsupportedMessageTypeError(error)) {
        throw error
      }
    }
  }
  if (lastError && isUnsupportedMessageTypeError(lastError)) {
    try {
      return await requestCompetitorRoomPricesViaHttp(payload)
    } catch (httpError) {
      throw new Error(httpError instanceof Error ? httpError.message : String(httpError))
    }
  }
  throw lastError || new Error("\u5f53\u524d\u63d2\u4ef6\u7248\u672c\u4e0d\u652f\u6301\u63d2\u4ef6\u5185\u76f4\u6293\u623f\u578b\u4ef7\uff0c\u8bf7\u5237\u65b0\u6269\u5c55\u540e\u91cd\u8bd5")
}


function summarizeCompetitorConfigDebug(response) {
  const counts = response?.counts || {}
  return [
    `local: ${Number(counts.local || 0)} 家`,
    `sync: ${Number(counts.sync || 0)} 家`,
    `merged: ${Number(counts.merged || 0)} 家`,
    `effective: ${Number(counts.effective || 0)} 家`
  ].join(" | ")
}

function sendTabMessage(tabId, message) {
  return withTimeout(new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      if (!response?.ok) {
        reject(new Error(response?.error || "Unknown content script response"))
        return
      }
      resolve(response.data)
    })
  }), TAB_TIMEOUT_MS, `页面消息 ${message?.type || "unknown"}`)
}

function toPositiveNumber(value) {
  const next = Number(value)
  if (!Number.isFinite(next) || next <= 0) {
    return null
  }
  return Math.round(next * 100) / 100
}

function toPositiveInteger(value) {
  const next = Number(value)
  if (!Number.isFinite(next) || next <= 0) {
    return null
  }
  return Math.round(next)
}

function toNonNegativeInteger(value) {
  const next = Number(value)
  if (!Number.isFinite(next) || next < 0) {
    return null
  }
  return Math.round(next)
}

function formatPrice(value) {
  return value ? `¥${Number(value).toFixed(2)}` : "-"
}

function formatSignedPrice(value) {
  if (!Number.isFinite(Number(value))) {
    return "-"
  }
  const amount = Number(value)
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "±"
  return `${sign}¥${Math.abs(amount).toFixed(2)}`
}

function formatSignedPercent(value) {
  if (!Number.isFinite(Number(value))) {
    return "-"
  }
  const amount = Number(value)
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "±"
  return `${sign}${Math.abs(amount).toFixed(2)}%`
}

function formatMarketTrendSignal(signal) {
  return {
    up: "上涨",
    down: "下跌",
    flat: "持平",
    mixed: "分化",
  }[String(signal || "").trim()] || "未知"
}

function formatMarketTrendSummary(context) {
  if (!context || typeof context !== "object") {
    return "-"
  }
  const signal = formatMarketTrendSignal(context.majority_signal)
  const pct = formatSignedPercent(context.representative_change_pct)
  const majorityCount = Number(context.majority_hotel_count || 0)
  const seriesCount = Number(context.series_count || 0)
  return `${signal} ${pct} | 同向酒店 ${majorityCount}/${seriesCount} | ${context.window_label || "最近趋势"}`
}

function formatInventory(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return "-"
  }
  const totalRooms = Number(snapshot.total_rooms || 0)
  const availableRooms = Number(snapshot.available_rooms || 0)
  if (!totalRooms) {
    return "-"
  }
  return `${availableRooms}/${totalRooms}`
}

function escapeHtml(value) {
  return resultView?.escapeHtml ? resultView.escapeHtml(value) : String(value || "")
}














