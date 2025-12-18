---
name: vibecode-fullstack-plan-skeleton-build-design-bugfix
description: Skill end-to-end: lập kế hoạch → khung sườn → triển khai & design → bugfix & harden cho dự án vibe code.
version: 1.0
---

# VIBECODE FULLSTACK PIPELINE
*(Plan → Skeleton → Build & Design → Bugfix & Harden)*

Mục tiêu: gom **toàn bộ vòng đời 1 app vibe-code** thành **1 skill duy nhất**:
- Lập kế hoạch (Plan & Scope)
- Thiết kế khung sườn & tooling (Skeleton)
- Triển khai + design (Build & Design)
- Fix bug + tối ưu + harden (Bugfix & Optimization)

> Văn phong + format giữ đúng hệ “Logic Flow Tree / Tree Diagram / % formula” để dễ copy-paste chạy như checklist.

---

## 0) Persona (vai trò hợp nhất)

```text
PERSONA (FULLSTACK)
├── Product-minded Planner
│   ├── Hiểu user, business, constraint
│   └── Đặt KPI rõ ràng, đo được
├── System Architect / Skeleton Designer
│   ├── Thiết kế module boundary, folder, contract
│   └── Ưu tiên maintainability + scale
├── Implementation & UX Engineer
│   ├── Code sạch, design rõ, component reuse
│   └── Ưu tiên DX + UX (dev + user)
├── Debug Lead (After Vibe Code)
│   ├── Repro → isolate → root cause → patch nhỏ
│   └── Không fix mò, luôn có proof + test
└── Contrarian Reviewer
    ├── Thấy plan rườm rà → cắt
    └── Thấy shortcut nguy hiểm → chặn
```

**KPI bắt buộc (có số):**
- **Plan Quality Score**: % yêu cầu + constraint + risk được capture
- **Skeleton Health**: #module rõ + không circular deps + time-to-onboard dev mới (giờ)
- **Build Velocity**: lead time từ spec → feature chạy (ngày)
- **Bugfix Quality**: Repro Rate, Patch Size, Regression Coverage
- **System Stability**: error rate / latency / incident count theo tuần

---

## 1) Trigger (khi nào dùng)

- Bắt đầu **project mới / feature lớn** → cần 1 flow Plan → Build → Bugfix trơn tru.
- **Thừa skill lẻ** (plan / skeleton / bugfix) nhưng chưa có **1 skill gom vòng đời**.
- App đang ở trạng thái **“đã vibe code kha khá”**: chạy được, có user, nhưng:
  - Folder lộn xộn, khó thêm feature.
  - Bug ẩn, lỗi prod khó tái hiện.
  - Performance chậm dần / chi phí tăng.

---

## 2) Output (Delivery Pack cho 1 vòng đời)

✅ **PLAN BRIEF** (scope, constraint, success metrics, risk)  
✅ **SKELETON BLUEPRINT** (arch + module + folder + tooling)  
✅ **BUILD & DESIGN SPEC** (API/UI/flow + component map)  
✅ **BUGFIX & OPTIMIZATION PACK** (Bug Brief, RCA, Patch, Regression tests)  
✅ **VERIFICATION & HARDENING NOTE** (before/after metrics + rule chặn tái diễn)  

```text
FULL DELIVERY PACK
├── 1) PLAN BRIEF
├── 2) SKELETON BLUEPRINT
├── 3) BUILD & DESIGN SPEC
├── 4) BUGFIX & OPTIMIZATION PACK
└── 5) VERIFICATION & HARDENING NOTE
```

---

## 3) Logic Flow (End-to-End)

```text
FULLSTACK VIBECODE FLOW
│
├── PHẦN I: PLAN & SCOPE (Lập kế hoạch)
│   ├── Hiểu vấn đề, user, constraint, success
│   └── Output: PLAN BRIEF
│
├── PHẦN II: SKELETON & TOOLING (Khung sườn)
│   ├── Thiết kế kiến trúc, module, folder, tooling
│   └── Output: SKELETON BLUEPRINT
│
├── PHẦN III: BUILD & DESIGN (Triển khai + Design)
│   ├── Triển khai feature theo skeleton + spec UI/UX
│   └── Output: BUILD & DESIGN SPEC + code chạy
│
├── PHẦN IV: BUGFIX & OPTIMIZE (After Vibe Code)
│   ├── Repro → isolate → RCA → patch nhỏ + regression
│   └── Output: BUGFIX & OPTIMIZATION PACK
│
└── PHẦN V: VERIFY & HARDEN (Đo & chống tái diễn)
    ├── Đo before/after metrics, cleanup mini, rule chặn lặp
    └── Output: VERIFICATION & HARDENING NOTE
```

---

## 4) PHẦN I — PLAN & SCOPE (Lập kế hoạch)

### 4.1 Plan Flow

```text
PLAN FLOW
├── 1) PROBLEM & CONTEXT
├── 2) SCOPE & CONSTRAINT
├── 3) SUCCESS METRICS
├── 4) RISK & MITIGATION
└── 5) ROADMAP & SLICE (chia nhỏ)
```

### 4.2 Template: PLAN BRIEF

```text
PLAN BRIEF: [Tên project/feature]
│
├── PROBLEM & CONTEXT:
│   ├── User: [ai dùng? vai trò?]
│   ├── Pain: [đau hiện tại là gì?]
│   └── Why now: [tại sao làm bây giờ?]
│
├── SCOPE & NON-SCOPE:
│   ├── In-scope: ...
│   └── Out-of-scope: ...
│
├── CONSTRAINT:
│   ├── Thời gian: [deadline, sprint]
│   ├── Resource: [#dev, skillset]
│   └── Tech/legacy: [stack, ràng buộc hệ thống]
│
├── SUCCESS METRICS:
│   ├── Product: [conversion, retention, NPS...]
│   ├── System: [latency, error rate, throughput]
│   └── DevEx: [time-to-onboard, leadtime change]
│
├── RISK & MITIGATION (Top 5):
│   ├── R1: ... → Mitigation: ...
│   ├── R2: ... → Mitigation: ...
│   └── R5: ... → Mitigation: ...
│
└── ROADMAP & SLICE:
    ├── Milestone 1 (1–2 tuần): ...
    ├── Milestone 2 (2–4 tuần): ...
    └── Later: ...
```

**Rules (Plan):**
- Mỗi yêu cầu/feature đều phải **gắn 1 metric** đo được.
- Task > 5 ngày → phải **chia nhỏ lại**.
- Không commit kế hoạch nếu **RISK & MITIGATION** còn mơ hồ.

---

## 5) PHẦN II — SKELETON & TOOLING (Khung sườn + Tools)

### 5.1 Skeleton Objectives

- Tạo **app skeleton** giúp bất kỳ dev mới:
  - Hiểu nhanh **entry points, module, dataflow**.
  - Chạy được project với **1–2 lệnh**.
- Giảm rủi ro **folder lộn xộn, circular deps, config drift**.

### 5.2 Skeleton Flow

```text
SKELETON FLOW
├── 1) ARCHITECTURE SNAPSHOT (as-is hoặc dự kiến)
├── 2) MODULE & BOUNDARIES
├── 3) FOLDER BLUEPRINT
├── 4) TOOLING CORE (lint/type/test/ci)
└── 5) ONE-COMMAND CHECK
```

### 5.3 Template: SKELETON BLUEPRINT

```text
SKELETON BLUEPRINT: [Tên app]
│
├── ARCHITECTURE (high-level):
│   ├── Type: monolith / modular monolith / microservice
│   ├── Frontend: [NextJS/React/...]
│   ├── Backend: [Node/Go/Python/...]
│   └── Infra: [DB/Cache/Queue/...]
│
├── MODULE MAP:
│   ├── module-auth/        → login/signup/session
│   ├── module-user/        → profile, permissions
│   ├── module-payment/     → billing, invoices
│   └── shared/             → utils, types, config
│
├── FOLDER STRUCTURE (gợi ý):
│   project-root/
│   ├── docs/
│   │   ├── ARCHITECTURE.md
│   │   ├── RUNBOOK.md
│   │   └── DECISIONS.md
│   ├── src/
│   │   ├── app/
│   │   ├── modules/
│   │   ├── shared/
│   │   └── config/
│   ├── tests/
│   ├── scripts/
│   ├── tools/
│   ├── .env.example
│   └── README.md
│
├── TOOLING CORE:
│   ├── Linter: ...
│   ├── Formatter: ...
│   ├── Typecheck: ...
│   ├── Test: unit / integration / e2e
│   └── CI: [GitHub Actions/GitLab CI/...]
│
└── ONE COMMAND TO RUN ALL:
    ├── make check
    │   ├── lint
    │   ├── typecheck
    │   ├── test
    │   └── build
    └── Rule: Pass → mới được merge
```

### 5.4 Skeleton Quality Checklist

```text
SKELETON QUALITY CHECK
├── ✓ Dev mới setup < 15 phút
├── ✓ CI chạy < 10 phút
├── ✓ Không circular deps (có tool detect)
├── ✓ Folder depth ≤ 5, naming 1 chuẩn
├── ✓ 1 command check pass trên dev + CI
└── ✓ README “How to run” ≤ 5 dòng
```

---

## 6) PHẦN III — BUILD & DESIGN (Triển khai + Design)

Mục tiêu:
- Triển khai tính năng **theo skeleton** đã thiết kế.
- Giữ **design rõ ràng**: flow, API, UI/UX, state.

### 6.1 Build & Design Flow

```text
BUILD & DESIGN FLOW
├── 1) FEATURE BRIEF (từ Plan)
├── 2) FLOW & CONTRACT DESIGN
├── 3) UI/UX & COMPONENT MAP
├── 4) IMPLEMENTATION (code)
└── 5) REVIEW (code + UX)
```

### 6.2 Template: FEATURE DESIGN SPEC

```text
FEATURE DESIGN SPEC: [Tên feature]
│
├── CONTEXT:
│   ├── Liên quan PLAN BRIEF: [link/tóm tắt]
│   └── User story: “Là [user], tôi muốn [goal], để [benefit]”
│
├── FLOW DESIGN:
│   ├── Happy path: step-by-step
│   └── Non-happy path: error, edge case, retry
│
├── API / CONTRACT:
│   ├── Request: method, path, body, header
│   ├── Response: schema, error code
│   └── Invariant: rule phải luôn đúng
│
├── UI/UX (nếu có UI):
│   ├── Screen: ...
│   ├── Components: [Button, Form, Table...]
│   └── States: loading / empty / error / success
│
├── DATA & STATE:
│   ├── Source of Truth: [DB/cache/client state]
│   └── Sync rules: khi nào fetch, khi nào cache
│
└── TEST PLAN:
    ├── Unit: ...
    ├── Integration: ...
    └── E2E: ...
```

### 6.3 Implementation Rules

```text
BUILD RULES
├── 1) Keep functions nhỏ, dễ test
├── 2) Không trộn quá nhiều concern trong 1 file
├── 3) Component UI: stateless trước, stateful sau
├── 4) API: rõ schema, rõ error
└── 5) Mỗi feature phải có test tối thiểu cho critical path
```

---

## 7) PHẦN IV — BUGFIX & OPTIMIZE (After Vibe Code)

Mục tiêu: Khi code đã chạy nhưng dính bug/behavior lạ → **debug có hệ thống**, không fix mò.

### 7.1 Bugfix Pipeline

```text
BUGFIX PIPELINE (After Vibe Code)
│
├── PHẦN I: TRIAGE & REPRO
│   ├── Tái hiện bug + đo impact + severity
│   └── Output: Bug Brief + Repro Script
│
├── PHẦN II: ISOLATE & MINIMIZE
│   ├── Khoanh vùng module/commit/input nhỏ nhất
│   └── Output: Suspect List + Minimal Case
│
├── PHẦN III: ROOT CAUSE
│   ├── 1 nguyên nhân chính + bằng chứng
│   └── Output: RCA (1 câu) + Proof
│
├── PHẦN IV: PATCH + GUARDRAIL
│   ├── Patch nhỏ, rõ, ít side-effect
│   └── Output: PR patch + regression test
│
└── PHẦN V: VERIFY & HARDEN
    ├── Đo before/after metrics + cleanup mini
    └── Output: Verification Report + Prevention note
```

### 7.2 Template: BUG BRIEF

```text
BUG BRIEF: [Title]
│
├── IMPACT:
│   ├── Severity: S0/S1/S2/S3
│   ├── Users affected: ~N/day
│   └── Workaround: yes/no
│
├── ENV:
│   ├── branch/commit: ...
│   ├── runtime: ...
│   ├── env: local/staging/prod
│   └── config flags: ...
│
├── STEPS TO REPRO:
│   1) ...
│   2) ...
│
├── EXPECTED vs ACTUAL:
│   ├── Expected: ...
│   └── Actual: ...
│
└── EVIDENCE:
    ├── logs: ...
    ├── trace: ...
    └── screenshots/recording: ...
```

### 7.3 Template: RCA + PATCH

```text
RCA: [Bug Title]
│
├── Symptom: ...
├── Root cause (1 câu): ...
├── Proof:
│   ├── Stacktrace/log line: ...
│   ├── Minimal repro: ...
│   └── Test: [name] (fail trước, pass sau)
├── Fix:
│   ├── Code change: ...
│   └── Test added: ...
└── Prevention:
    ├── Guardrail: [check/assert/lint rule/...]
    └── Monitoring: [metric/log alert]
```

### 7.4 Patch Rules & Guardrail Menu

```text
PATCH RULES
├── Patch size nhỏ: ≤ 3 files, ≤ 300 lines (khuyến nghị)
├── Không đổi behavior ngoài scope bug
├── Regression test bắt buộc
└── Thêm guardrail đúng chỗ
```

```text
GUARDRAIL MENU
├── Defensive checks: validate input/schema
├── Timeouts/retries: cho external calls
├── Idempotency: cho actions có thể chạy lại
├── Rate limit / circuit breaker: tránh cascade failure
└── Feature flag: rollout an toàn
```

---

## 8) PHẦN V — VERIFY & HARDEN (Đo & chống tái diễn)

### 8.1 Verification Report

```text
VERIFICATION REPORT
├── Bug/Feature: ...
├── ReproRate (before → after): ...% → ...%
├── Error rate / Crash: before ... → after ...
├── Latency (p50/p95): before ... → after ...
├── Resource: memory/cpu before ... → after ...
└── Rollout plan:
    ├── staging smoke: pass/fail
    ├── canary: % traffic
    └── full rollout: conditions
```

### 8.2 Cleanup Layer (Mini-refactor)

```text
CLEANUP LAYER
├── A) De-duplicate
│   ├── Extract function
│   ├── Strategy/Adapter
│   └── Table-driven logic
│
├── B) Clarify boundaries
│   ├── Tách module responsibility
│   └── Định nghĩa contracts (types/schemas)
│
└── C) Enforce rules
    ├── Lint/typecheck gate
    ├── Import rules (chặn vòng)
    └── Env schema validation (fail fast)
```

---

## 9) Confidence Score (% công thức hợp nhất)

```text
FULLSTACK CONFIDENCE SCORE =
  20% * PlanQuality
+ 20% * SkeletonHealth
+ 20% * BuildDesignQuality
+ 20% * DebugConfidence
+ 20% * HardeningLevel
```

Trong đó (0–100):

- **PlanQuality**: % yêu cầu/risk/metric được capture rõ.  
- **SkeletonHealth**: folder/module rõ, setup dễ, CI ổn định.  
- **BuildDesignQuality**: feature spec + test + UX không mâu thuẫn.  
- **DebugConfidence**: dựa trên ReproRate, IsolationQuality, ProofStrength, RegressionStrength.  
- **HardeningLevel**: cleanup + guardrail + monitoring đã bật.  

**Rule:** Score < 70% ⇒ chưa được xem là “done-done” cho vòng đời đó.

---

## 10) Quick Start Prompts (copy-paste dùng nhanh)

1. **Plan → Skeleton → Build cho feature mới**
   - “Dùng *VIBECODE FULLSTACK PIPELINE* giúp anh: tạo PLAN BRIEF → SKELETON BLUEPRINT → FEATURE DESIGN SPEC cho feature [X] với stack [Y]. Đây là context: …”

2. **Refactor & bugfix cho app đã vibe code**
   - “App này đã vibe code, giờ dùng FULLSTACK PIPELINE để: map skeleton hiện tại → đề xuất cleanup layer → xử lý bug [Z] theo Bugfix Pipeline + Verification Report. Đây là code/log: …”

3. **Đánh giá mức độ ‘ready’ của 1 dự án**
   - “Dùng FULLSTACK CONFIDENCE SCORE chấm điểm dự án [X] (Plan/Skeleton/Build/Bugfix/Harden), đề xuất 3 việc nên làm trong 1–2 tuần tới để tăng score nhanh nhất.”

---

## 11) Merge Checklist (cuối vòng đời 1 feature lớn)

```text
FULLSTACK MERGE CHECKLIST
├── ✓ PLAN BRIEF rõ: scope, metric, risk
├── ✓ SKELETON BLUEPRINT: module + folder + tooling
├── ✓ BUILD & DESIGN SPEC: flow + API + UI/UX + test plan
├── ✓ BUGFIX PACK: Bug Brief + RCA + patch nhỏ + regression test
├── ✓ VERIFICATION REPORT: before/after metric rõ ràng
└── ✓ Confidence Score ≥ 70% (hoặc lý do chấp nhận rủi ro)
```
