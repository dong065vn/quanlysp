---
name: vibecode-skillpack-app-analysis-tools-bugfix
description: Bộ Skill đồng bộ (Synced SkillPack) reverse-engineered từ Skeleton Vibe Code Creator + Vibecode Plan Creator. Gồm 3 skill: (1) App Analysis, (2) Tooling/Deployment Setup + folder structure tối ưu, (3) Fix bug & Optimize/Refactor khi code dài, trùng lặp, bug ẩn.
version: 1.0
---

# Vibecode Synced SkillPack (Reverse Edition)

Mục tiêu: biến 2 skill nền (Skeleton + Plan) thành **1 bộ 3 skill chạy liền mạch**:
1) **APP ANALYSIS** → hiểu đúng app trước khi đụng code  
2) **TOOLS & DEPLOYMENT** → setup đúng toolchain + folder để “run tốt nhất”  
3) **BUGFIX & OPTIMIZATION** → xử lý bug lộ/bug ẩn + tối ưu, cắt trùng lặp, rút ngắn code

> Nguyên tắc văn phong & format giữ y hệt hệ “Logic Flow Tree / Tree Diagram / % formula”. (Xem chuẩn ký tự & template ở skill gốc.) fileciteturn1file1L50-L62

---

## 0) Persona (đồng bộ 3 skill)

```
PERSONA CHÍNH:
├── Senior Software Architect (8+ năm)
│   └── Ưu tiên maintainability + scale (không “chạy được là xong”)
├── Incident/Debug Lead thực chiến
│   └── Đã dính sev/production bug → biết “bug ẩn” nằm đâu
├── DevOps/Tooling Engineer
│   └── Setup CI/CD + environment reproducible
└── Contrarian Reviewer
    └── Thấy plan rườm rà → cắt, thấy shortcut nguy hiểm → chặn
```

Metrics “có số liệu” là bắt buộc. fileciteturn1file1L36-L48

---

# SKILL 1: VIBECODE APP ANALYZER (Phân tích App)

## Trigger (khi nào dùng)
- “Phân tích app này giúp anh: flow, module, rủi ro, chỗ dễ bug”
- “App chạy chậm / lỗi lạ / khó maintain, cần diagnosis trước”
- “Chuẩn bị refactor lớn / tách module / thêm feature lớn”

## Output (cái phải giao)
✅ App Map (Module + Dataflow + Entry points)  
✅ Risk Matrix (Top 10 risk theo Impact/Probability)  
✅ Dependency Graph (internal + external)  
✅ Quick Wins (1-2 ngày) vs Deep Fix (1-2 sprint)  
✅ Plan hành động (phù hợp format planning) fileciteturn1file6L1-L30

---

## Logic Flow (5 phần chuẩn kiểu Skeleton → chuyển hóa sang App Analysis)

> Reverse từ “SKELETON VIBE CODE PLANNING 5 phần”. fileciteturn1file10L25-L53

```
APP ANALYSIS PLANNING
│
├── PHẦN I: RECON & CONTEXT (20-30 phút)
│   ├── Mục tiêu: Nắm “app làm gì” + “ai dùng” + “đau ở đâu”
│   └── Output: Context Sheet
│
├── PHẦN II: ARCHITECTURE SNAPSHOT (30-45 phút)
│   ├── Mục tiêu: Chụp kiến trúc hiện tại (as-is) không phán xét
│   └── Output: Current Architecture Diagram
│
├── PHẦN III: MODULE & FLOW MAPPING (45-60 phút)
│   ├── Mục tiêu: Vẽ module boundaries + dataflow + critical path
│   └── Output: App Map (Module / Flow / Contracts)
│
├── PHẦN IV: RISK & BOTTLENECK ANALYSIS (30-45 phút)
│   ├── Mục tiêu: Top risk + bottleneck + hidden coupling
│   └── Output: Risk Matrix + Bottleneck List
│
└── PHẦN V: RECOMMENDATION & PLAN (20-30 phút)
    ├── Mục tiêu: Đưa plan sửa (Quick wins → Long-term)
    └── Output: Action Plan (Sprint/Phase-based)
```

---

## Template “App Map” (copy-paste)

```
APP MAP: [Tên app]
│
├── ENTRY POINTS:
│   ├── Web: src/main.ts(x) / pages/_app.tsx
│   ├── API: src/server.ts / src/index.ts
│   └── Worker/Cron: src/jobs/* (nếu có)
│
├── CORE FLOWS (Critical Path):
│   ├── Flow 1: [User action] → [API] → [DB] → [UI]
│   │   ├── SLA target: [ms/sec] | Rủi ro: [timeout/N+1]
│   │   └── Logs/Trace: [where]
│   └── Flow 2: ...
│
├── MODULES (Boundaries):
│   ├── module-auth/
│   │   ├── Responsibility: ...
│   │   ├── Public API: ...
│   │   └── Depends on: [module-user, shared-*]
│   ├── module-payment/
│   └── shared/
│
└── DATA (Source of Truth):
    ├── Primary DB: [Postgres/MySQL/Mongo] - schema owners
    ├── Cache: [Redis] - cache keys policy
    └── External APIs: [Stripe/Sendgrid/...]
```

## Risk Matrix Template (có số liệu)

```
RISK MATRIX (Top 10)
│
├── R1: [Circular dependency] | Prob: Med | Impact: High
│   → Symptom: build flaky / runtime import error
│   → Fix: enforce import rules + tool check
│
├── R2: [N+1 queries] | Prob: High | Impact: High
│   → Metric: p95 latency > 800ms
│   → Fix: add index + eager load + query plan check
│
└── R10: [Config drift] | Prob: Med | Impact: Med
    → Fix: single source env + CI validate
```

## “Sự thật quan trọng” (Reality check)
- App failure thường không nằm ở “code xấu” mà ở **boundary xấu**: module đè nhau, contract mập mờ. (Trùng tinh thần “mixing concerns” + “unclear dependencies”.) fileciteturn1file1L11-L15

---

# SKILL 2: VIBECODE TOOLING & DEPLOYMENT SETUP (Tools + Folder chạy tốt nhất)

## Trigger
- “Tạo bộ tools để project chạy ổn, test/ci/deploy chuẩn”
- “Team mới vào, setup môi trường hay lỗi, cần chuẩn hóa”
- “Muốn giảm bug ẩn do config/env khác nhau”

## Output
✅ Tool Matrix (tool nào + dùng làm gì + rule)  
✅ Folder Blueprint (đặt tool ở đâu để dễ chạy)  
✅ Scripts (setup/build/test/deploy)  
✅ CI/CD skeleton (tối thiểu)  
✅ Validation checklist (chạy 1 lệnh là biết ổn)  

---

## Tool Matrix (core)

```
TOOLING CORE
├── Quality Gate:
│   ├── Linter: ESLint / Ruff / golangci-lint
│   ├── Formatter: Prettier / Black / gofmt
│   ├── Typecheck: TypeScript / mypy
│   └── Static Analysis: Sonar / semgrep (optional)
│
├── Testing:
│   ├── Unit: Jest/Vitest / PyTest / Go test
│   ├── Integration: supertest / testcontainers
│   └── E2E: Playwright / Cypress
│
├── Observability (giảm bug ẩn):
│   ├── Logging: structured logs (json)
│   ├── Tracing: OpenTelemetry (optional)
│   └── Error tracking: Sentry (optional)
│
└── Delivery:
    ├── Env: .env.example + schema validate
    ├── Container: Dockerfile + compose (optional)
    └── CI: GitHub Actions/GitLab CI (run lint+test+build)
```

> Tư duy: “Setup & Validation” là phase riêng, không trộn với code feature. fileciteturn1file5L52-L56

---

## Folder “run tốt nhất” (Blueprint gợi ý)

Reverse từ tư duy: folder depth ≤ 4-5, naming thống nhất. fileciteturn1file1L45-L47  
Naming rules gợi ý (kebab-case folders / PascalCase components). fileciteturn1file5L1-L13

```
project-root/
│
├── docs/                      # kiến trúc, quyết định, runbook
│   ├── ARCHITECTURE.md
│   ├── RUNBOOK.md
│   └── DECISIONS.md
│
├── src/                       # code chính
│   ├── app/                   # entrypoints + wiring
│   ├── modules/               # feature/domain modules
│   ├── shared/                # utilities, types, constants
│   └── config/                # config loader + schema validate
│
├── tests/                     # unit/integration/e2e
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                   # 1-liner scripts (setup/build/test/deploy)
│   ├── setup.(sh|ps1)
│   ├── dev.(sh|ps1)
│   ├── test.(sh|ps1)
│   └── deploy.(sh|ps1)
│
├── tools/                     # tooling config (lint/format/typecheck hooks)
│   ├── lint/
│   ├── format/
│   └── ci/
│
├── .env.example               # env template (không commit secret)
├── Makefile                   # hoặc task runner (optional)
└── README.md                  # “How to run” chỉ cần 5 dòng
```

### Golden Rule (để chạy ổn)
```
ONE COMMAND TO RUN ALL:
├── make check
│   ├── lint
│   ├── typecheck
│   ├── test
│   └── build
└── = Pass → mới được merge
```

---

## Validation Checklist (Tooling)

```
TOOLING QUALITY CHECK
├── ✓ Setup mới trong 15 phút (cold start)
├── ✓ CI chạy < 10 phút (baseline)
├── ✓ 1 command “check” pass trên máy dev + CI
├── ✓ Env validation fail fast (thiếu biến là fail ngay)
├── ✓ No circular deps (detect bằng tool)
└── ✓ Folder depth ≤ 5, naming 1 chuẩn
```

---

# SKILL 3: VIBECODE BUGFIX & OPTIMIZATION (Fix bug + tối ưu + cắt trùng)

## Trigger
- “Lỗi khó tái hiện / bug ẩn / chạy prod mới dính”
- “Code quá dài, lặp lại, sửa 1 chỗ hỏng 3 chỗ”
- “Performance giảm dần, không rõ nguyên nhân”

## Output
✅ Bug Report chuẩn (repro + expected/actual)  
✅ Root Cause Analysis (RCA) + Fix Plan  
✅ Patch + Regression tests  
✅ Refactor Plan (de-duplicate + shorten + clarify)  
✅ Metrics trước/sau (để chứng minh)  

---

## Debug Flow (chống fix mò)

```
BUGFIX PIPELINE
│
├── 1) REPRO & TRIAGE
│   ├── Repro rate: % tái hiện (>= 70% mới bắt đầu tối ưu)
│   └── Severity: S0/S1/S2 + user impact
│
├── 2) ISOLATE (giảm diện)
│   ├── Bisect: commit range
│   ├── Toggle flags: bật/tắt module
│   └── Minimal test case: input nhỏ nhất gây lỗi
│
├── 3) ROOT CAUSE (1 nguyên nhân, không 5 giả thuyết)
│   ├── Code path
│   ├── Data shape
│   └── Environment drift
│
├── 4) FIX + GUARDRAIL
│   ├── Patch nhỏ, rõ
│   ├── Add test (regression)
│   └── Add assertions/logs (fail fast)
│
└── 5) VERIFY & PREVENT
    ├── Perf check / load check (nếu liên quan)
    ├── Static check (lint/type)
    └── Postmortem note (1 trang)
```

> Tư duy “Risk & mitigation” áp dụng thẳng cho bugfix: không chỉ sửa, phải chặn tái diễn. fileciteturn1file8L36-L49

---

## Template: Bug Report (copy-paste)

```
BUG REPORT: [Title]
│
├── ENV:
│   ├── branch/commit: ...
│   ├── runtime: node/python/go version
│   └── config: [staging/prod/local]
│
├── STEPS TO REPRO:
│   1) ...
│   2) ...
│
├── EXPECTED vs ACTUAL:
│   ├── Expected: ...
│   └── Actual: ...
│
├── OBSERVATIONS:
│   ├── logs: ...
│   ├── trace: ...
│   └── screenshot: ...
│
└── IMPACT:
    ├── Severity: S?
    ├── Users affected: ~N/day
    └── Workaround: yes/no
```

## Template: RCA (Root Cause Analysis)

```
RCA: [Bug Title]
│
├── Symptom: ...
├── Root cause: [1 câu]
├── Why it happened:
│   ├── Cause 1: ...
│   └── Cause 2: ...
├── Fix:
│   ├── Code change: ...
│   └── Test added: ...
└── Prevention:
    ├── Guardrail: lint rule / assertion / circuit breaker
    └── Monitoring: metric/log alert
```

---

## Optimization & Refactor (khi code dài + trùng)

### 1) Detect (đo trước, sửa sau)
```
CODE HEALTH METRICS (baseline)
├── File length: > 400 lines = warning, > 800 = red flag
├── Function length: > 60 lines = split
├── Duplication: copy-paste blocks > 3 lần = extract
├── Complexity: cyclomatic > 15 = simplify
└── Tests: coverage critical path >= 70%
```

### 2) De-duplicate patterns (3 kiểu hay gặp)
```
TRÙNG LẶP: 3 pattern
├── Pattern A: “same logic, different names”
│   → Extract function + param
├── Pattern B: “same flow, different data source”
│   → Strategy/Adapter
└── Pattern C: “if/else dài vô tận”
    → Table-driven / guard clauses
```

### 3) Refactor Checklist (không phá app)
```
SAFE REFACTOR RULES
├── ✓ Không đổi behavior (test giữ nguyên)
├── ✓ Mỗi PR <= 300 lines changed (dễ review)
├── ✓ Refactor + tests đi chung PR
├── ✓ Rename theo convention 1 chuẩn
└── ✓ Không tăng coupling (module boundaries rõ)
```

Tinh thần “Task > 5 days = Fail” áp dụng y chang: refactor/bugfix cũng phải chia nhỏ. fileciteturn1file7L35-L37

---

# 4) “Đồng bộ 3 skill” bằng 1 Flow tổng

```
END-TO-END FLOW
│
├── App Analysis (Skill 1)
│   └── Output: App Map + Risk Matrix
│
├── Tooling Setup (Skill 2)
│   └── Output: Folder Blueprint + CI + Scripts
│
└── Bugfix/Optimize (Skill 3)
    └── Output: RCA + Patch + Regression + Refactor plan
    =
    VIBECODE SYSTEM READY (run ổn + sửa nhanh + scale được)
```

---

## 5) Quick Start (cách dùng nhanh trong chat)
- “Dùng **Skill 1** phân tích app X, output App Map + Risk Matrix + Action Plan”  
- “Dùng **Skill 2** đề xuất toolchain + folder structure cho stack Y, ưu tiên 1-liner scripts”  
- “Dùng **Skill 3** xử lý bug Z: RCA + fix plan + regression tests + tối ưu chỗ trùng”  

---

## 6) Notes quan trọng (để khỏi fail)
- Tránh “inconsistent naming” + “circular dependencies” ngay từ đầu. fileciteturn1file5L24-L29  
- Plan mà thiếu buffer/risk → bugfix sẽ nổ muộn, tốn gấp đôi. fileciteturn1file3L21-L29  
- Skeleton tốt tự giải thích: folder nhìn vào biết chức năng. fileciteturn1file1L29-L33  
