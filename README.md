# 🕵️ MiMoTrace

### Onchain Forensics Tracer — Powered by Xiaomi MiMo V2.5

Paste any Ethereum transaction hash, wallet address, or ENS. Watch funds flow through bridges, mixers, DEX swaps, and CEX hot wallets — read the multi-hop money trail as plain English.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-▶_Trace_Now-06b6d4?style=for-the-badge&logo=ethereum&logoColor=white)](https://gyoomei.github.io/mimotrace/)
[![Powered by MiMo](https://img.shields.io/badge/AI-Xiaomi%20MiMo%20V2.5-a855f7?style=for-the-badge&logo=xiaomi&logoColor=white)](https://gyoomei.github.io/mimotrace/)
[![Live Data](https://img.shields.io/badge/Data-Blockscout-3b82f6?style=for-the-badge&logo=ethereum&logoColor=white)](https://eth.blockscout.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

[![Stars](https://img.shields.io/github/stars/gyoomei/mimotrace?style=flat&logo=github&color=fbbf24)](https://github.com/gyoomei/mimotrace/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/gyoomei/mimotrace?style=flat&color=22c55e)](https://github.com/gyoomei/mimotrace/commits/main)
[![Single File](https://img.shields.io/badge/Deploy-Single%20HTML-06b6d4?style=flat)](#-quick-start)
[![No API Key](https://img.shields.io/badge/API%20Key-None-22c55e?style=flat)](#-data-sources)

---

## 📖 The Idea

When funds move onchain, they leave a trail. But that trail is hexadecimal noise to anyone without a forensics tool. Chainalysis charges enterprise rates. Etherscan shows you one tx at a time. Most retail users sign approvals without ever reading what's about to happen.

MiMoTrace closes the gap. Paste a hash, get a story.

The tracer follows funds through up to 5 hops, automatically classifies every address (bridge, mixer, DEX, CEX, contract, or EOA), assigns a risk score, and hands the entire chain to MiMo V2.5 — which composes the route as readable prose: *"The trail starts at 0x97c6… Then entered the Tornado Cash 100 ETH mixer — fund trail obfuscated here. Combined signals indicate high-risk movement."*

Every hop is verifiable. Every classification is from a curated database of 50+ known protocol contracts. No API key. No backend. One HTML file.

---

## ✨ Core Features

### 🔗 **Multi-Hop Tracing (2–5 depth)**
Configurable depth slider. Each hop fetches the largest outgoing token transfer and follows it to the next address. Walk-back protection prevents loops, automatic termination at known endpoints (CEX deposits, mixer entries).

### 🏷 **Auto-Address Classification**
Every address gets a label and a type:

| Type | Examples |
|---|---|
| 🟣 **Bridge** | Stargate, LayerZero, Across, Hop |
| 🔴 **Mixer** | Tornado Cash (all denominations), Railway |
| 🔵 **DEX** | Uniswap V2/V3, 1inch, Kyber, Paraswap |
| 🟢 **CEX** | Binance, Coinbase, OKX, Kraken, KuCoin, Bitfinex |
| ⚪ **Contract** | Verified contracts with ENS or short address |
| ⚫ **EOA** | Regular wallets, with ENS if available |

Curated db of 50+ known contracts hand-vetted from Etherscan public labels.

### 🚨 **Risk Scoring**

| Signal | Points |
|---|---|
| Mixer interaction (Tornado, Railway) | +50 |
| Cross-chain bridge | +15 |
| CEX deposit | +5 |
| Multi-hop chain (4+ hops) | +10 |

Total → **LOW (<20)** / **MEDIUM (20-49)** / **HIGH (50+)**

### 🧠 **MiMo V2.5 Narrative**
Every trace renders as bilingual prose (EN/ID):

> *"The trail starts at vitalik.eth. Then bridged 12.5 ETH via Stargate Router. Then swapped to 22,400 USDC on Uniswap V3. Then deposited into Binance Hot Wallet 14. Pattern suggests cross-protocol movement, common for trading or rebalancing."*

Verb-typed by destination class — bridges *"bridged"*, mixers *"entered"*, DEXs *"swapped"*, CEXs *"deposited"*. No generic "transferred" filler.

### 📊 **Visual Flow Diagram**
- Color-coded vertical hop list with connector lines
- Numbered nodes (★ origin, #1, #2…) with type-colored borders
- Each hop card: address, type badge, value moved, originating tx link
- Etherscan deep-link on every hop

### 🎯 **Universal Input**
- **Tx hash** (`0x...` 66 chars) — full trace from that tx
- **Address** (`0x...` 42 chars) — trace most-recent outflow
- **ENS** (`vitalik.eth`) — auto-resolve, then trace

---

## 🛠 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | Vanilla HTML + CSS + JS | Zero build, single-file deploy |
| **AI Engine** | Xiaomi MiMo V2.5 | Verb selection + narrative composition |
| **Onchain Data** | [Blockscout Ethereum API](https://eth.blockscout.com) | No key, no rate limit pain |
| **ENS Resolution** | [ensideas.com API](https://api.ensideas.com) | Bidirectional ENS↔address |
| **Address DB** | Curated in-app (50+ contracts) | Fast lookup, no external dep |
| **Hosting** | GitHub Pages | Free CDN, auto SSL |

**Total stack:** 1 HTML, 1 JS, zero deps, zero keys.

---

## 🏗 Architecture

```
                   ┌─────────────────────────┐
                   │   USER INPUT            │
                   │   tx hash / addr / ENS  │
                   └────────────┬────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   INPUT NORMALIZER         │
                  │   • 66-char → tx hash      │
                  │   • 42-char → address      │
                  │   • .eth → resolve via ENS │
                  └─────────────┬─────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   PRIMARY HOP FETCH        │
                  │   Blockscout /transactions │
                  │   + token transfers        │
                  └─────────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │ recursive trace, depth N (2–5)    │
              │  • find largest outgoing transfer │
              │  • lookup KNOWN[next addr]        │
              │  • if mixer/cex → STOP            │
              │  • if seen → skip, find next      │
              │  • else → recurse                 │
              └─────────────────┬─────────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   ADDRESS CLASSIFIER       │
                  │   bridge/mixer/dex/cex     │
                  │   /contract/eoa            │
                  └─────────────┬─────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   RISK SCORER              │
                  │   weighted signals → LOW   │
                  │   /MED/HIGH                │
                  └─────────────┬─────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   MIMO V2.5 NARRATIVE      │
                  │   • verb-typed per class   │
                  │   • bilingual EN/ID        │
                  │   • risk-aware closing     │
                  └─────────────┬─────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   RENDER                   │
                  │   summary card + flow      │
                  │   diagram + share link     │
                  └───────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1 — Live Demo

Visit **[gyoomei.github.io/mimotrace](https://gyoomei.github.io/mimotrace/)** and paste any tx hash.

### Option 2 — Permalink

```
https://gyoomei.github.io/mimotrace/#<tx_hash_or_address>
https://gyoomei.github.io/mimotrace/?theme=light#vitalik.eth
```

### Option 3 — Self-host

```bash
git clone https://github.com/gyoomei/mimotrace.git
cd mimotrace
python3 -m http.server 8080
# open http://localhost:8080
```

No build, no `.env`, no keys.

---

## 🎨 Demo Examples

Try these on the live site:

- **Bridge** — Stargate router cross-chain transfer
- **DEX swap** — Uniswap V3 multi-token chain
- **Mixer** — Tornado Cash 100 ETH deposit (HIGH RISK trigger)
- **Address** — `vitalik.eth` (trace from latest outflow)

---

## 🌐 Bilingual

Toggle EN ↔ ID with the 🌐 button. All chapter labels, narrative verbs, and risk descriptions translate. Default English.

---

## 🗺 Roadmap

- [ ] **Multi-chain support** — Base, Arbitrum, Optimism, Polygon, BSC tracing
- [ ] **Sankey diagram view** — full visual fund-flow graph (D3.js client-side)
- [ ] **Cluster detection** — auto-flag wallets that share funding sources
- [ ] **Time-axis trace** — reconstruct fund history over months/years
- [ ] **Export forensics report** — PDF or JSON with full chain + screenshots
- [ ] **Watchlist mode** — paste 10 addresses, get unified flow map
- [ ] **CEX exit-detector** — alert when traced funds reach exchange deposit
- [ ] **Stolen funds db** — overlay public hack/scam wallet labels (Web3Watcher style)

---

## 🤝 Contributing

Single-file app — easy to read, easy to extend.

- New protocol address → add to `KNOWN` dict in `app.js`
- New chain support → extend `BLOCKSCOUT` to multi-chain map
- New language → add to `I18N` dict
- New verb category → extend `describeHopEN/ID`

---

## 📜 License

MIT © 2026 [@gyoomei](https://github.com/gyoomei)

---

## 🙏 Acknowledgements

- **[Xiaomi MiMo V2.5](https://github.com/XiaomiMiMo)** — narrative composition engine
- **[Blockscout](https://eth.blockscout.com)** — open Ethereum data, no key
- **[ENS Ideas](https://ensideas.com)** — ENS resolution API
- The Ethereum community, which has made every transaction visible since 2015

---

*Built for the Xiaomi MiMo 100T program — showcasing what an open AI engine plus open onchain data can do, in a single zero-dependency HTML file.*
