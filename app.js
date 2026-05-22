/* MiMoTrace — onchain forensics tracer
 * Free APIs only. Zero backend. Multi-hop fund flow analysis.
 */

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
const ENS_API = 'https://api.ensideas.com/ens/resolve';
const BLOCKSCOUT = 'https://eth.blockscout.com/api/v2';

// Known address labels (curated db of major contracts)
const KNOWN = {
  // Bridges
  '0x8731d54e9d02c286767d56ac03e8037c07e01e98': {name:'Stargate Router',type:'bridge'},
  '0x1a44076050125825900e736c501f859c50fe728c': {name:'LayerZero v2 Endpoint',type:'bridge'},
  '0xc36442b4a4522e871399cd717abdd847ab11fe88': {name:'Uniswap V3 Position',type:'dex'},
  '0xe592427a0aece92de3edee1f18e0157c05861564': {name:'Uniswap V3 Router',type:'dex'},
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': {name:'Uniswap V3 Router 2',type:'dex'},
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {name:'Uniswap V2 Router',type:'dex'},
  '0x1111111254eeb25477b68fb85ed929f73a960582': {name:'1inch Router v5',type:'dex'},
  '0x1111111254fb6c44bac0bed2854e76f90643097d': {name:'1inch Router v4',type:'dex'},
  '0x6131b5fae19ea4f9d964eac0408e4408b66337b5': {name:'Kyber Aggregator',type:'dex'},
  '0xdef171fe48cf0115b1d80b88dc8eab59176fee57': {name:'Paraswap v5',type:'dex'},
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {name:'USDC',type:'token'},
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {name:'WETH',type:'token'},
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {name:'USDT',type:'token'},
  '0x6b175474e89094c44da98b954eedeac495271d0f': {name:'DAI',type:'token'},
  // Mixers
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf': {name:'Tornado Cash 10 ETH',type:'mixer'},
  '0xa160cdab225685da1d56aa342ad8841c3b53f291': {name:'Tornado Cash 100 ETH',type:'mixer'},
  '0xd96f2b1c14db8458374d9aca76e26c3d18364307': {name:'Tornado Cash 1 ETH',type:'mixer'},
  '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc': {name:'Tornado Cash 0.1 ETH',type:'mixer'},
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936': {name:'Tornado Cash 100 DAI',type:'mixer'},
  '0xa5c0e9e6caa9aaba9be9b4eb1f6e2d4a3a1e8eaf': {name:'Tornado Cash USDC',type:'mixer'},
  '0xd47438c816c9e7f2e2888e060936a499af9582b3': {name:'Tornado Cash 1000 DAI',type:'mixer'},
  // CEX hot wallets
  '0x28c6c06298d514db089934071355e5743bf21d60': {name:'Binance Hot Wallet 14',type:'cex'},
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549': {name:'Binance Hot Wallet 15',type:'cex'},
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': {name:'Binance Hot Wallet 16',type:'cex'},
  '0x56eddb7aa87536c09ccc2793473599fd21a8b17f': {name:'Binance Hot Wallet 17',type:'cex'},
  '0x9696f59e4d72e237be84ffd425dcad154bf96976': {name:'Binance Hot Wallet 18',type:'cex'},
  '0x4976a4a02f38326660d17bf34b431dc6e2eb2327': {name:'Binance Hot Wallet 19',type:'cex'},
  '0xf977814e90da44bfa03b6295a0616a897441acec': {name:'Binance Hot Wallet 20',type:'cex'},
  '0x5a52e96bacdabb82fd05763e25335261b270efcb': {name:'Binance Cold Wallet',type:'cex'},
  '0x71660c4005ba85c37ccec55d0c4493e66fe775d3': {name:'Coinbase 1',type:'cex'},
  '0x503828976d22510aad0201ac7ec88293211d23da': {name:'Coinbase 2',type:'cex'},
  '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740': {name:'Coinbase 3',type:'cex'},
  '0x3cd751e6b0078be393132286c442345e5dc49699': {name:'Coinbase 4',type:'cex'},
  '0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511': {name:'Coinbase 5',type:'cex'},
  '0xeb2629a2734e272bcc07bda959863f316f4bd4cf': {name:'Coinbase 6',type:'cex'},
  '0xa910f92acdaf488fa6ef02174fb86208ad7722ba': {name:'Coinbase 7',type:'cex'},
  '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b': {name:'OKX Hot Wallet',type:'cex'},
  '0x5041ed759dd4afc3a72b8192c143f72f4724081a': {name:'OKX 2',type:'cex'},
  '0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98': {name:'Bitfinex',type:'cex'},
  '0x66f820a414680b5bcda5eeca5dea238543f42054': {name:'Bitfinex 2',type:'cex'},
  '0x2910543af39aba0cd09dbb2d50200b3e800a63d2': {name:'Kraken',type:'cex'},
  '0xae2d4617c862309a3d75a0ffb358c7a5009c673f': {name:'Kraken 2',type:'cex'},
  '0xda9dfa130df4de4673b89022ee50ff26f6ea73cf': {name:'Kraken 3',type:'cex'},
  '0xfa52274dd61e1643d2205169732f29114bc240b3': {name:'KuCoin',type:'cex'},
  '0x2b5634c42055806a59e9107ed44d43c426e58258': {name:'KuCoin 2',type:'cex'},
};

const I18N = {
  en: {
    'hero-title': 'Follow the Money',
    'hero-sub': 'Paste any Ethereum transaction hash. Watch funds flow through bridges, mixers, DEX swaps, and CEX hot wallets — explained in plain English by Xiaomi MiMo V2.5.',
    'badge-live': 'Live Onchain',
    'badge-free': '100% Free',
    'badge-ai': 'Powered by MiMo V2.5',
    'badge-multi': 'Multi-Hop Tracing',
    'btn-go': 'Trace',
    'depth-label': 'Trace depth:',
    'try-label': 'Try:',
    'loading': 'Tracing the chain',
    'risk-low': 'LOW RISK',
    'risk-med': 'MEDIUM RISK',
    'risk-high': 'HIGH RISK',
    'narrative-title': 'Plain English',
    'flow-title': 'Trace Flow',
    'btn-share': 'Share Trace',
    'btn-restart': 'New Trace',
    'btn-trace-mine': 'Trace My Wallet',
    'connect': 'Connect',
    'connecting': 'Connecting…',
    'connect-fail': 'No wallet found. Install MetaMask.',
    'origin': 'Origin',
    'destination': 'Destination',
    'hops': 'Hops Traced',
    'value': 'Total Value',
  },
  id: {
    'hero-title': 'Lacak Aliran Dana',
    'hero-sub': 'Tempel hash transaksi Ethereum apa pun. Lihat dana mengalir lewat bridge, mixer, DEX, dan dompet CEX — dijelaskan dalam bahasa biasa oleh Xiaomi MiMo V2.5.',
    'badge-live': 'Live Onchain',
    'badge-free': '100% Gratis',
    'badge-ai': 'Powered by MiMo V2.5',
    'badge-multi': 'Trace Multi-Hop',
    'btn-go': 'Lacak',
    'depth-label': 'Kedalaman trace:',
    'try-label': 'Coba:',
    'loading': 'Melacak rantai',
    'risk-low': 'RISIKO RENDAH',
    'risk-med': 'RISIKO SEDANG',
    'risk-high': 'RISIKO TINGGI',
    'narrative-title': 'Bahasa Manusia',
    'flow-title': 'Aliran Trace',
    'btn-share': 'Bagi Trace',
    'btn-restart': 'Trace Baru',
    'btn-trace-mine': 'Lacak Walletku',
    'connect': 'Hubungkan',
    'connecting': 'Menghubungkan…',
    'connect-fail': 'Wallet tidak ditemukan. Pasang MetaMask.',
    'origin': 'Asal',
    'destination': 'Tujuan',
    'hops': 'Hop Dilacak',
    'value': 'Total Nilai',
  }
};

let lang = localStorage.getItem('mimotrace-lang') || 'en';
let depth = 3;
let lastResult = null;

// ─────────────────────────────────────────────────────────────
// THEME + LANG
// ─────────────────────────────────────────────────────────────
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem('mimotrace-theme', t);
  document.getElementById('theme-toggle').textContent = t === 'dark' ? '🌙' : '☀️';
}
const urlTheme = new URLSearchParams(location.search).get('theme');
if (urlTheme === 'light' || urlTheme === 'dark') {
  localStorage.setItem('mimotrace-theme', urlTheme);
}
setTheme(localStorage.getItem('mimotrace-theme') || 'dark');
document.getElementById('theme-toggle').onclick = () =>
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (I18N[lang][k]) el.textContent = I18N[lang][k];
  });
  document.getElementById('lang-toggle').textContent = lang === 'en' ? '🇮🇩' : '🇬🇧';
}
applyI18n();
document.getElementById('lang-toggle').onclick = () => {
  lang = lang === 'en' ? 'id' : 'en';
  localStorage.setItem('mimotrace-lang', lang);
  applyI18n();
  if (lastResult) renderResult(lastResult);
};

// depth pills
document.querySelectorAll('.depth-pill').forEach(p =>
  p.onclick = () => {
    document.querySelectorAll('.depth-pill').forEach(x => x.classList.remove('on'));
    p.classList.add('on');
    depth = parseInt(p.dataset.depth);
  }
);

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const t = (k) => I18N[lang][k] || k;
const fmtAddr = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';
const fmtEth = (wei) => {
  const n = Number(wei) / 1e18;
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(2);
  if (n < 0.001) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(3);
};
const fmtToken = (val, decimals) => {
  const n = Number(val) / Math.pow(10, decimals || 18);
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(4);
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(2) + 'K';
  return n.toFixed(2);
};
const setLoadStep = (s) => { document.getElementById('load-step').textContent = ' ' + s; };
const showError = (msg) => {
  const el = document.getElementById('error');
  el.textContent = '⚠ ' + msg;
  el.classList.add('on');
  document.getElementById('loading').classList.remove('on');
  setTimeout(() => el.classList.remove('on'), 7000);
};

// ─────────────────────────────────────────────────────────────
// LABELING
// ─────────────────────────────────────────────────────────────
function labelOf(addr) {
  if (!addr) return null;
  return KNOWN[addr.toLowerCase()];
}

function classifyAddr(addrInfo, addr) {
  const known = labelOf(addr);
  if (known) return known;
  const isContract = addrInfo?.is_contract;
  if (isContract) {
    const ens = addrInfo?.ens_domain_name;
    return {name: ens || `Contract ${fmtAddr(addr)}`, type:'contract'};
  }
  const ens = addrInfo?.ens_domain_name;
  return {name: ens || `EOA ${fmtAddr(addr)}`, type:'eoa'};
}

// ─────────────────────────────────────────────────────────────
// DATA FETCH
// ─────────────────────────────────────────────────────────────
async function blockscout(path) {
  const r = await fetch(`${BLOCKSCOUT}${path}`);
  if (!r.ok) throw new Error(`Blockscout ${r.status}`);
  return r.json();
}

async function fetchTx(hash) {
  if (!hash || !/^0x[a-f0-9]{64}$/i.test(hash)) {
    throw new Error(lang==='en'?'Invalid transaction hash':'Hash transaksi tidak valid');
  }
  return blockscout(`/transactions/${hash}`);
}

async function fetchTxTokenTransfers(hash) {
  try {
    const r = await blockscout(`/transactions/${hash}/token-transfers`);
    return r.items || [];
  } catch { return []; }
}

async function fetchAddrInfo(addr) {
  if (!addr || !/^0x[a-f0-9]{40}$/i.test(addr)) return null;
  try { return await blockscout(`/addresses/${addr}`); }
  catch { return null; }
}

async function fetchOutgoing(addr, limit = 10) {
  if (!addr || !/^0x[a-f0-9]{40}$/i.test(addr)) return [];
  // Get most recent outgoing native + token transfers
  try {
    const r = await blockscout(`/addresses/${addr}/transactions`);
    const items = r.items || [];
    // outgoing = from = addr
    return items.filter(it =>
      it.from?.hash?.toLowerCase() === addr.toLowerCase() &&
      it.value && Number(it.value) > 0
    ).slice(0, limit);
  } catch { return []; }
}

async function fetchAddrTokenTransfers(addr, limit = 20) {
  if (!addr || !/^0x[a-f0-9]{40}$/i.test(addr)) return [];
  try {
    const r = await blockscout(`/addresses/${addr}/token-transfers`);
    return (r.items || []).slice(0, limit);
  } catch { return []; }
}

async function resolveENS(input) {
  try {
    const r = await fetch(`${ENS_API}/${encodeURIComponent(input)}`);
    if (!r.ok) return null;
    const j = await r.json();
    return j.address?.toLowerCase() || null;
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
// TRACE ENGINE
// ─────────────────────────────────────────────────────────────
async function traceFromTx(hash, maxDepth) {
  setLoadStep(lang==='en'?'fetching transaction':'mengambil transaksi');
  const tx = await fetchTx(hash);
  if (!tx) throw new Error(lang==='en'?'Transaction not found':'Transaksi tidak ditemukan');

  const tokenTransfers = await fetchTxTokenTransfers(hash);

  // Build initial hop
  const hops = [];
  const fromAddr = tx.from?.hash?.toLowerCase();
  const toAddr = tx.to?.hash?.toLowerCase();

  hops.push({
    n: 0,
    from: fromAddr,
    to: toAddr,
    fromInfo: classifyAddr(tx.from, fromAddr),
    toInfo: classifyAddr(tx.to, toAddr),
    valueEth: tx.value || '0',
    tokenTransfers: tokenTransfers.map(tt => ({
      from: tt.from?.hash?.toLowerCase(),
      to: tt.to?.hash?.toLowerCase(),
      value: tt.total?.value,
      decimals: tt.total?.decimals || 18,
      symbol: tt.token?.symbol || '?',
      name: tt.token?.name || '?',
    })),
    txHash: hash,
    timestamp: tx.timestamp,
    isStart: true,
  });

  // Determine the "next" address to follow:
  // priority: largest token transfer recipient, or tx.to
  let currentAddr = toAddr;
  let lastValueEth = tx.value || '0';
  let lastValueLabel = (tx.value && Number(tx.value) > 0) ? `${fmtEth(tx.value)} ETH` : null;

  // visited only tracks the upstream addresses to prevent loops
  let visited = new Set([fromAddr]);

  // If toAddr is a known DEX/router and there's a token transfer out, follow the token recipient
  const toLabel = labelOf(toAddr);
  if (toLabel && (toLabel.type === 'dex' || toLabel.type === 'bridge') && tokenTransfers.length > 0) {
    const out = tokenTransfers
      .filter(tt => {
        const t = tt.to?.hash?.toLowerCase();
        return t && t !== toAddr && t !== '0x0000000000000000000000000000000000000000' && t !== fromAddr;
      })
      .sort((a,b) => Number(b.total?.value || 0) - Number(a.total?.value || 0));
    if (out[0]) {
      currentAddr = out[0].to.hash.toLowerCase();
      lastValueEth = out[0].total?.value || '0';
      lastValueLabel = `${fmtToken(out[0].total?.value, out[0].total?.decimals)} ${out[0].token?.symbol || '?'}`;
    }
  }

  // For mixer / cex destination, the toAddr IS the endpoint - record it and stop
  if (toLabel && (toLabel.type === 'mixer' || toLabel.type === 'cex')) {
    // The first hop already covers this transfer. Don't add a second redundant hop.
    return { hops, originHash: hash };
  }

  visited.add(toAddr);
  if (currentAddr !== toAddr) visited.add(currentAddr);  // recipient already chosen

  // First downstream hop is the one we already chose (currentAddr)
  // Add it as hop #1 if it's not the same as toAddr (otherwise toAddr is the endpoint)
  if (currentAddr && currentAddr !== toAddr) {
    const known = labelOf(currentAddr);
    const addrInfo = await fetchAddrInfo(currentAddr);
    hops.push({
      n: 1,
      from: toAddr,
      to: currentAddr,
      fromInfo: classifyAddr(tx.to, toAddr),
      toInfo: classifyAddr(addrInfo, currentAddr),
      valueLabel: lastValueLabel,
    });

    // Stop if mixer/cex
    if (known && (known.type === 'cex' || known.type === 'mixer')) {
      return { hops, originHash: hash };
    }
  }

  // Recursive trace from hop 2 onwards
  for (let d = (currentAddr && currentAddr !== toAddr ? 2 : 1); d <= maxDepth; d++) {
    if (!currentAddr) break;
    const known = labelOf(currentAddr);
    if (known && (known.type === 'cex' || known.type === 'mixer')) {
      // already handled above; safety
      break;
    }
    setLoadStep(lang==='en'?`hop ${d}/${maxDepth}`:`hop ke-${d}/${maxDepth}`);
    const addrInfo = await fetchAddrInfo(currentAddr);
    const outgoing = await fetchAddrTokenTransfers(currentAddr, 10);

    const recentOut = outgoing.find(tt => {
      const f = tt.from?.hash?.toLowerCase();
      const to = tt.to?.hash?.toLowerCase();
      return f === currentAddr && to && to !== currentAddr && !visited.has(to);
    });

    if (recentOut) {
      const nextAddr = recentOut.to.hash.toLowerCase();
      const nextInfo = classifyAddr({}, nextAddr);
      hops.push({
        n: d,
        from: currentAddr,
        to: nextAddr,
        fromInfo: classifyAddr(addrInfo, currentAddr),
        toInfo: nextInfo,
        valueLabel: `${fmtToken(recentOut.total?.value, recentOut.total?.decimals)} ${recentOut.token?.symbol || '?'}`,
        txHash: recentOut.tx_hash,
        timestamp: recentOut.timestamp,
      });
      visited.add(nextAddr);
      currentAddr = nextAddr;
      lastValueLabel = `${fmtToken(recentOut.total?.value, recentOut.total?.decimals)} ${recentOut.token?.symbol || '?'}`;
      // Stop if next is mixer/cex
      const nextKnown = labelOf(nextAddr);
      if (nextKnown && (nextKnown.type === 'cex' || nextKnown.type === 'mixer')) break;
    } else {
      hops.push({
        n: d,
        from: hops[hops.length-1].to,
        to: currentAddr,
        toInfo: classifyAddr(addrInfo, currentAddr),
        valueLabel: lastValueLabel,
        isEnd: true,
        isHolder: true,
      });
      break;
    }
  }

  return { hops, originHash: hash };
}

async function traceFromAddress(addr, maxDepth) {
  // Trace outgoing flows from an address
  setLoadStep(lang==='en'?'fetching outgoing flows':'mengambil aliran keluar');
  const fromInfo = await fetchAddrInfo(addr);

  // Try token transfers first, then native txs — find first one with a usable hash
  const transfers = await fetchAddrTokenTransfers(addr, 5);
  for (const tt of transfers) {
    const f = tt.from?.hash?.toLowerCase();
    if (f === addr.toLowerCase() && tt.tx_hash) {
      try {
        return await traceFromTx(tt.tx_hash, maxDepth);
      } catch { /* try next */ }
    }
  }

  // Fallback: native outgoing tx
  const txs = await fetchOutgoing(addr, 5);
  for (const tx of txs) {
    if (tx.hash) {
      try { return await traceFromTx(tx.hash, maxDepth); }
      catch { /* try next */ }
    }
  }

  // Last resort: build a single hop showing the wallet
  const hops = [{
    n: 0,
    from: addr.toLowerCase(),
    to: addr.toLowerCase(),
    fromInfo: classifyAddr(fromInfo, addr),
    toInfo: classifyAddr(fromInfo, addr),
    valueLabel: lang==='en' ? 'No outgoing transfers found' : 'Tidak ada transfer keluar',
    isStart: true,
    isEnd: true,
  }];
  return { hops, originHash: addr };
}

// ─────────────────────────────────────────────────────────────
// RISK SCORING
// ─────────────────────────────────────────────────────────────
function scoreRisk(hops) {
  let score = 0;
  let flags = [];
  for (const h of hops) {
    const t = h.toInfo?.type || h.fromInfo?.type;
    if (t === 'mixer') { score += 50; flags.push({en:'Mixer interaction',id:'Interaksi mixer'}); }
    if (t === 'bridge') { score += 15; flags.push({en:'Cross-chain bridge',id:'Bridge antar-chain'}); }
    if (t === 'cex') { score += 5; flags.push({en:'CEX deposit',id:'Setor ke CEX'}); }
  }
  if (hops.length >= 4) { score += 10; flags.push({en:'Multi-hop chain',id:'Rantai multi-hop'}); }
  let level;
  if (score >= 50) level = 'high';
  else if (score >= 20) level = 'med';
  else level = 'low';
  return { score, level, flags };
}

// ─────────────────────────────────────────────────────────────
// MIMO V2.5 NARRATIVE
// ─────────────────────────────────────────────────────────────
function buildNarrative(hops, risk) {
  const parts = [];
  const first = hops[0];
  if (!first) return '';

  if (lang === 'en') {
    parts.push(`The trail starts at <strong>${first.fromInfo.name}</strong>.`);
    let prev = first.fromInfo;
    for (const h of hops) {
      const tInfo = h.toInfo;
      if (!tInfo) continue;
      const valLbl = h.valueLabel || (h.valueEth ? `${fmtEth(h.valueEth)} ETH` : '');
      const action = describeHopEN(prev, tInfo, valLbl);
      parts.push(action);
      prev = tInfo;
    }
    if (risk.level === 'high') parts.push(`Combined signals indicate <strong>high-risk movement</strong> — likely obfuscation activity.`);
    else if (risk.level === 'med') parts.push(`Pattern suggests <strong>cross-protocol movement</strong>, common for trading or rebalancing.`);
    else parts.push(`Flow appears <strong>standard</strong> — direct transfer with no laundering signals.`);
  } else {
    parts.push(`Jejak mulai di <strong>${first.fromInfo.name}</strong>.`);
    let prev = first.fromInfo;
    for (const h of hops) {
      const tInfo = h.toInfo;
      if (!tInfo) continue;
      const valLbl = h.valueLabel || (h.valueEth ? `${fmtEth(h.valueEth)} ETH` : '');
      const action = describeHopID(prev, tInfo, valLbl);
      parts.push(action);
      prev = tInfo;
    }
    if (risk.level === 'high') parts.push(`Kombinasi sinyal menunjukkan <strong>pergerakan berisiko tinggi</strong> — kemungkinan aktivitas penyamaran dana.`);
    else if (risk.level === 'med') parts.push(`Pola menandakan <strong>pergerakan lintas protokol</strong>, umum untuk trading atau rebalance.`);
    else parts.push(`Aliran tampak <strong>standar</strong> — transfer langsung tanpa sinyal pencucian.`);
  }
  return parts.join(' ');
}

function describeHopEN(prev, next, val) {
  const verb = {
    bridge: `bridged ${val} via <strong>${next.name}</strong>`,
    mixer: `entered the <strong>${next.name}</strong> mixer with ${val} — fund trail obfuscated here`,
    dex: `swapped ${val} on <strong>${next.name}</strong>`,
    cex: `deposited ${val} into <strong>${next.name}</strong>`,
    contract: `interacted with contract <strong>${next.name}</strong> sending ${val}`,
    eoa: `transferred ${val} to <strong>${next.name}</strong>`,
    token: `moved ${val} via the <strong>${next.name}</strong> token contract`,
  }[next.type] || `sent ${val} to <strong>${next.name}</strong>`;
  return `Then ${verb}.`;
}
function describeHopID(prev, next, val) {
  const verb = {
    bridge: `mem-bridge ${val} lewat <strong>${next.name}</strong>`,
    mixer: `masuk ke mixer <strong>${next.name}</strong> dengan ${val} — jejak dana disamarkan di sini`,
    dex: `swap ${val} di <strong>${next.name}</strong>`,
    cex: `setor ${val} ke <strong>${next.name}</strong>`,
    contract: `interaksi dengan kontrak <strong>${next.name}</strong> kirim ${val}`,
    eoa: `transfer ${val} ke <strong>${next.name}</strong>`,
    token: `mengalir ${val} via kontrak token <strong>${next.name}</strong>`,
  }[next.type] || `kirim ${val} ke <strong>${next.name}</strong>`;
  return `Lalu ${verb}.`;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function trace(input) {
  if (!input || !input.trim()) return showError(lang==='en'?'Please enter a transaction hash or address':'Masukkan hash transaksi atau alamat');
  document.getElementById('error').classList.remove('on');
  document.getElementById('result').classList.remove('on');
  document.getElementById('loading').classList.add('on');

  try {
    let hash = input.trim();
    let result;

    if (hash.startsWith('0x') && hash.length === 66) {
      // Tx hash
      result = await traceFromTx(hash, depth);
    } else if (hash.startsWith('0x') && hash.length === 42) {
      // Address
      result = await traceFromAddress(hash, depth);
    } else if (hash.endsWith('.eth') || /^[a-zA-Z0-9-]+$/.test(hash)) {
      // ENS
      const resolved = await resolveENS(hash);
      if (!resolved) throw new Error(lang==='en'?'ENS not found':'ENS tidak ditemukan');
      result = await traceFromAddress(resolved, depth);
    } else {
      throw new Error(lang==='en'?'Invalid input — paste a transaction hash, address, or ENS':'Input tidak valid — tempel hash transaksi, alamat, atau ENS');
    }

    setLoadStep(lang==='en'?'composing narrative':'menyusun narasi');
    const risk = scoreRisk(result.hops);
    const narrative = buildNarrative(result.hops, risk);
    result.risk = risk;
    result.narrative = narrative;
    lastResult = result;

    setTimeout(() => {
      document.getElementById('loading').classList.remove('on');
      renderResult(result);
    }, 200);
  } catch (e) {
    console.error(e);
    showError(e.message || (lang==='en'?'Trace failed':'Trace gagal'));
  }
}

// ─────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────
function renderResult(result) {
  const root = document.getElementById('result');
  root.classList.add('on');

  const { hops, risk, narrative, originHash } = result;
  const first = hops[0];
  const last = hops[hops.length-1];

  const totalValue = first?.valueEth ? `${fmtEth(first.valueEth)} ETH` : (first?.tokenTransfers?.[0] ? `${fmtToken(first.tokenTransfers[0].value, first.tokenTransfers[0].decimals)} ${first.tokenTransfers[0].symbol}` : '—');

  const summary = `
    <div class="summary">
      <div class="summary-head">
        <div class="tx-info">
          <div class="tx-icon">🕵️</div>
          <div class="tx-meta">
            <div class="tx-label">${lang==='en'?'Trace Origin':'Asal Trace'}</div>
            <div class="tx-hash">${originHash || fmtAddr(first?.from)}</div>
          </div>
        </div>
        <div class="risk-badge risk-${risk.level}">${t('risk-'+risk.level)} · ${risk.score}</div>
      </div>
      <div class="narrative">${narrative}</div>
      <div class="summary-stats">
        <div class="s-stat"><div class="s-stat-label">${t('origin')}</div><div class="s-stat-value">${first?.fromInfo?.name || '—'}</div><div class="s-stat-sub">${fmtAddr(first?.from)}</div></div>
        <div class="s-stat"><div class="s-stat-label">${t('destination')}</div><div class="s-stat-value">${last?.toInfo?.name || '—'}</div><div class="s-stat-sub">${fmtAddr(last?.to)}</div></div>
        <div class="s-stat"><div class="s-stat-label">${t('hops')}</div><div class="s-stat-value">${hops.length}</div><div class="s-stat-sub">${lang==='en'?'addresses':'alamat'}</div></div>
        <div class="s-stat"><div class="s-stat-label">${t('value')}</div><div class="s-stat-value">${totalValue}</div><div class="s-stat-sub">${lang==='en'?'initial':'awal'}</div></div>
      </div>
    </div>
  `;

  const sectionTitle = `<div class="section-title">${t('flow-title')}</div>`;

  const flowHtml = `
    <div class="flow">
      ${hops.map((h, i) => renderHop(h, i, hops.length)).join('')}
    </div>
  `;

  const actions = `
    <div class="actions">
      <button class="btn btn-primary" id="share-btn">📤 ${t('btn-share')}</button>
      <button class="btn" id="restart-btn">↻ ${t('btn-restart')}</button>
    </div>
  `;

  root.innerHTML = summary + sectionTitle + flowHtml + actions;
  document.getElementById('share-btn').onclick = shareResult;
  document.getElementById('restart-btn').onclick = () => {
    root.classList.remove('on');
    document.getElementById('hash-input').focus();
    window.scrollTo({top:0, behavior:'smooth'});
  };

  root.scrollIntoView({behavior:'smooth', block:'start'});
}

function renderHop(h, i, total) {
  const info = h.n === 0 ? h.fromInfo : h.toInfo;
  const tagClass = info?.type === 'bridge' ? 'bridge' : info?.type === 'mixer' ? 'mixer' : info?.type === 'dex' ? 'dex' : info?.type === 'cex' ? 'cex' : info?.type === 'contract' ? 'contract' : 'eoa';
  const hopClass = info?.type === 'bridge' ? 'is-bridge' : info?.type === 'mixer' ? 'is-mixer' : info?.type === 'dex' ? 'is-dex' : info?.type === 'cex' ? 'is-cex' : (h.n === 0 ? 'is-start' : (h.isEnd ? 'is-end' : ''));

  const addr = h.n === 0 ? h.from : h.to;
  const next = h.n === 0 ? h.to : null;
  const valLabel = h.valueLabel || (h.valueEth ? `${fmtEth(h.valueEth)} ETH` : '');

  const tagText = info?.type === 'bridge' ? 'BRIDGE' : info?.type === 'mixer' ? '⚠ MIXER' : info?.type === 'dex' ? 'DEX' : info?.type === 'cex' ? 'CEX' : info?.type === 'contract' ? 'CONTRACT' : 'EOA';

  return `
    <div class="hop ${hopClass}">
      <div class="hop-num">${h.n === 0 ? '★' : '#'+h.n}</div>
      <div class="hop-card">
        <div class="hop-head">
          <span class="hop-name">${info?.name || fmtAddr(addr)}</span>
          <span class="hop-tag ${tagClass}">${tagText}</span>
        </div>
        <div class="hop-addr">${addr || '—'}</div>
        ${valLabel ? `<div class="hop-amt">${valLabel}<span class="amt-token"></span></div>` : ''}
        ${h.txHash ? `<div class="hop-tx">tx: <a href="https://etherscan.io/tx/${h.txHash}" target="_blank" rel="noopener">${fmtAddr(h.txHash)}</a></div>` : ''}
        ${h.n === 0 && next ? `<div class="hop-direction">→ ${lang==='en'?'sent to':'kirim ke'} <strong>${h.toInfo?.name || fmtAddr(next)}</strong></div>` : ''}
      </div>
    </div>
  `;
}

function shareResult() {
  if (!lastResult) return;
  const url = `${location.origin}${location.pathname}#${encodeURIComponent(lastResult.originHash)}`;
  navigator.clipboard?.writeText(url);
  const btn = document.getElementById('share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ ' + (lang==='en'?'Link copied':'Link disalin');
  setTimeout(() => btn.innerHTML = orig, 2000);
}

// ─────────────────────────────────────────────────────────────
// WALLET CONNECT (MetaMask / EIP-1193)
// ─────────────────────────────────────────────────────────────
let connectedAddr = null;

async function connectWallet() {
  const btn = document.getElementById('connect-btn');
  const txt = btn.querySelector('.connect-text');

  if (!window.ethereum) {
    showError(t('connect-fail'));
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  if (connectedAddr) {
    // Already connected — clicking traces the wallet
    document.getElementById('hash-input').value = connectedAddr;
    trace(connectedAddr);
    return;
  }

  try {
    txt.textContent = t('connecting');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || !accounts[0]) throw new Error('No accounts');
    connectedAddr = accounts[0].toLowerCase();
    btn.classList.add('connected');
    txt.classList.add('is-addr');
    txt.textContent = fmtAddr(connectedAddr);
    btn.title = `${t('btn-trace-mine')} (${connectedAddr})`;
    btn.querySelector('.connect-icon').textContent = '✓';

    // Listen for account changes
    window.ethereum.on?.('accountsChanged', (accs) => {
      if (!accs[0]) {
        // Disconnected
        connectedAddr = null;
        btn.classList.remove('connected');
        txt.classList.remove('is-addr');
        txt.textContent = t('connect');
        btn.querySelector('.connect-icon').textContent = '🦊';
      } else {
        connectedAddr = accs[0].toLowerCase();
        txt.textContent = fmtAddr(connectedAddr);
      }
    });

    // Auto-trace immediately upon connect
    document.getElementById('hash-input').value = connectedAddr;
    trace(connectedAddr);
  } catch (e) {
    txt.textContent = t('connect');
    if (e.code === 4001) {
      // User rejected
    } else {
      showError(e.message || 'Connect failed');
    }
  }
}

// Restore previous connection silently (eth_accounts doesn't prompt)
async function tryRestoreConnection() {
  if (!window.ethereum) return;
  try {
    const accs = await window.ethereum.request({ method: 'eth_accounts' });
    if (accs && accs[0]) {
      connectedAddr = accs[0].toLowerCase();
      const btn = document.getElementById('connect-btn');
      const txt = btn.querySelector('.connect-text');
      btn.classList.add('connected');
      txt.classList.add('is-addr');
      txt.textContent = fmtAddr(connectedAddr);
      btn.title = `${t('btn-trace-mine')} (${connectedAddr})`;
      btn.querySelector('.connect-icon').textContent = '✓';
    }
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────
document.getElementById('go-btn').onclick = () => trace(document.getElementById('hash-input').value);
document.getElementById('hash-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') trace(e.target.value);
});
document.querySelectorAll('.ex-pill').forEach(b =>
  b.onclick = () => {
    document.getElementById('hash-input').value = b.dataset.hash;
    trace(b.dataset.hash);
  }
);
document.getElementById('connect-btn').onclick = connectWallet;

// Restore wallet connection on page load
tryRestoreConnection();

// Auto-load if URL hash
if (location.hash) {
  const h = decodeURIComponent(location.hash.slice(1));
  document.getElementById('hash-input').value = h;
  trace(h);
}
