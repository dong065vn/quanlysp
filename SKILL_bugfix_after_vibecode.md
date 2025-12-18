---
name: vibecode-bugfixer-after-vibe-code
description: Skill sửa lỗi (bugfix) sau khi Vibe Code: tái hiện nhanh, tìm root cause đúng, patch nhỏ-an toàn, thêm regression test, và harden để không tái diễn.
version: 1.0
---

# VIBECODE BUGFIXER (After Vibe Code)

Mục tiêu: Khi code được tạo nhanh theo kiểu “vibe code” (chạy được nhưng dễ lỗi/khó maintain), skill này giúp anh **fix bug có hệ thống**: *repro → isolate → root cause → patch → regression → harden → verify → release*.

> Format giữ hệ “Logic Flow Tree / Tree Diagram / % formula” để dễ copy-paste vào chat và chạy như checklist.

---

## 0) Persona (vai trò đồng bộ)

```
PERSONA
├── Debug Lead (Incident mindset)
│   ├── Ưu tiên tái hiện + khoanh vùng nhanh
│   └── Không fix mò, không “thử vận may”
├── Senior Engineer (Maintainability)
│   ├── Patch nhỏ, rõ, ít side-effect
│   └── Không tạo technical debt mới
├── QA Thinker (Test-first prevention)
│   ├── Bug fix = thêm regression test
│   └── Rõ expected/actual + edge cases
└── Contrarian Reviewer (chặn shortcut nguy hiểm)
    ├── Hỏi “nếu sai thì sao?”
    └── Chặn fix kiểu che log / swallow error
```

**KPI bắt buộc (có số):**
- Repro Rate (% tái hiện được)
- Time-to-Isolate (phút/giờ)
- Patch Size (# files, # lines)
- Regression Coverage (có/không + test name)
- Before/After Metric (latency/error rate/memory)

---

## 1) Trigger (khi nào dùng)

- “App vừa vibe code xong, chạy được nhưng lỗi lặt vặt / crash / behavior lạ”
- “Bug chỉ xảy ra ở staging/prod, local không thấy”
- “Fix một chỗ hỏng chỗ khác (side-effect)”
- “Performance tụt / memory leak / timeout / race condition”
- “Code dài, trùng lặp, khó đọc → bug ẩn”

---

## 2) Output (cái phải giao)

✅ **Bug Brief** (repro + expected/actual + impact)  
✅ **RCA** (root cause 1 câu + bằng chứng)  
✅ **Patch** (nhỏ, rõ, có guardrail)  
✅ **Regression test** (đảm bảo không tái diễn)  
✅ **Verification report** (before/after metrics)  
✅ **Prevention note** (rule/tool/checklist để chặn)

---

## 3) Logic Flow (chuẩn debug: không fix mò)

```
BUGFIX PIPELINE (After Vibe Code)
│
├── PHẦN I: TRIAGE & REPRO (10–30 phút)
│   ├── Mục tiêu: tái hiện bug + đo impact + xác định severity
│   └── Output: Bug Brief + Repro Script
│
├── PHẦN II: ISOLATE & MINIMIZE (20–60 phút)
│   ├── Mục tiêu: khoanh vùng module/commit/input nhỏ nhất gây lỗi
│   └── Output: Suspect List (Top 3) + Minimal Case
│
├── PHẦN III: ROOT CAUSE (30–90 phút)
│   ├── Mục tiêu: 1 nguyên nhân chính + bằng chứng (log/trace/test)
│   └── Output: RCA (1 câu) + Proof
│
├── PHẦN IV: PATCH + GUARDRAIL (30–120 phút)
│   ├── Mục tiêu: sửa đúng chỗ, patch nhỏ, thêm guard
│   └── Output: PR patch + regression test
│
├── PHẦN V: VERIFY & RELEASE (20–60 phút)
│   ├── Mục tiêu: confirm fix + không tạo bug mới + đo before/after
│   └── Output: Verification Report + Release Notes
│
└── PHẦN VI: HARDEN & CLEANUP (tuỳ mức)
    ├── Mục tiêu: giảm bug ẩn do vibe code (trùng lặp, coupling, config drift)
    └── Output: Refactor mini + rules/checks
```

---

## 4) Debug Confidence Score (% formula)

Dùng để tự kiểm soát “đang fix chắc hay fix may”.

```
DEBUG CONFIDENCE SCORE = 
  30% * ReproRate
+ 25% * IsolationQuality
+ 25% * ProofStrength
+ 20% * RegressionStrength

Trong đó:
- ReproRate: 0–100 (tái hiện 7/10 lần = 70)
- IsolationQuality: 0–100 (minimal case nhỏ + module rõ)
- ProofStrength: 0–100 (có log/trace/test chứng minh)
- RegressionStrength: 0–100 (test fail trước, pass sau + cover edge)
```

**Rule:** Score < 70% ⇒ chưa được “merge fix”, phải quay lại bước II/III.

---

## 5) Template: Bug Brief (copy-paste)

```
BUG BRIEF: [Title]
│
├── IMPACT:
│   ├── Severity: S0/S1/S2/S3
│   ├── Users affected: ~N/day
│   └── Workaround: yes/no
│
├── ENV:
│   ├── branch/commit: ...
│   ├── runtime: node/python/go version
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

---

## 6) Repro & Triage Playbook (fail fast)

### 6.1 Repro Ladder (từ dễ → khó)

```
REPRO LADDER
├── A) Local repro (ideal)
├── B) Local with prod-like data/config
├── C) Staging repro
├── D) Prod shadow repro (read-only / safe)
└── E) Synthetic test harness (đóng khung bug)
```

### 6.2 Triage rules

- **Không bắt đầu “optimize”** khi chưa tái hiện ổn định (ReproRate < 70%).
- **Không commit fix** nếu chưa có ít nhất 1 dạng bằng chứng (log/trace/test).

---

## 7) Isolate & Minimize (khoanh vùng đúng)

### 7.1 3 kỹ thuật khoanh vùng nhanh

```
ISOLATION TOOLBOX
├── 1) "Binary Search" theo commit (git bisect mindset)
├── 2) Toggle module/feature flag (tắt dần để tìm thủ phạm)
└── 3) Minimal Input (giữ input nhỏ nhất vẫn gây lỗi)
```

### 7.2 Suspect List Template

```
SUSPECT LIST (Top 3)
├── S1: [Module/File/Function]
│   ├── Reason: (gần symptom, mới thay đổi, logic rủi ro)
│   └── Evidence: (stacktrace/log)
├── S2: ...
└── S3: ...
```

### 7.3 “Bug ẩn” hay gặp sau vibe code (pattern)

```
HIDDEN BUG PATTERNS (vibe-code thường dính)
├── Null/undefined assumptions (missing guard)
├── Async/race condition (state update không đồng bộ)
├── Config drift (dev chạy, prod fail)
├── Error swallowed (try/catch nuốt lỗi)
├── Implicit coupling (module gọi nhau vòng)
├── Data shape mismatch (API trả khác schema)
└── Performance traps (N+1 query, re-render loop, unbounded loop)
```

---

## 8) Root Cause Analysis (RCA) — 1 câu + proof

### 8.1 RCA Template

```
RCA: [Bug Title]
│
├── Symptom: ...
├── Root cause (1 câu, không dài): ...
├── Proof:
│   ├── Stacktrace/log line: ...
│   ├── Minimal repro: ...
│   └── Test: [name] (fail before, pass after)
└── Fix direction: ...
```

### 8.2 Proof Strength Ladder

```
PROOF STRENGTH
├── Level 1: “Quan sát” (log/screenshot)  → yếu
├── Level 2: “Giải thích được” (code path + data) → khá
└── Level 3: “Chứng minh” (test fail→pass / trace) → mạnh
```

**Rule:** Bug critical (S0/S1) phải đạt Proof Level 3.

---

## 9) Patch nhỏ & an toàn (không tạo side-effect)

### 9.1 Patch Rules (an toàn sau vibe code)

```
PATCH RULES
├── 1) Patch size nhỏ:
│   ├── <= 3 files (khuyến nghị)
│   └── <= 300 lines changed (khuyến nghị)
├── 2) Không đổi behavior ngoài scope bug
├── 3) Thêm guardrail:
│   ├── input validation / assertion
│   ├── error handling rõ ràng
│   └── log có context (không spam)
└── 4) Regression test là bắt buộc
```

### 9.2 “Guardrail Menu” (chọn đúng loại)

```
GUARDRAIL MENU
├── Defensive checks: validate input/schema
├── Timeouts/retries: cho external calls
├── Idempotency: cho actions có thể chạy lại
├── Rate limit / circuit breaker: tránh cascade failure
└── Feature flag: rollout an toàn
```

---

## 10) Regression Test Playbook (để khỏi tái diễn)

### 10.1 Test Rule “Fail Before, Pass After”

- Test phải **fail** trên code cũ (chứng minh có bug).
- Test phải **pass** sau patch.

### 10.2 Regression Template

```
REGRESSION TEST SPEC
├── Name: should_[expected]_when_[condition]
├── Given: ...
├── When: ...
├── Then: ...
└── Edge cases:
    ├── empty input
    ├── max size
    ├── unexpected field
    └── concurrency (nếu liên quan)
```

---

## 11) Verify & Release (đo trước/sau)

### 11.1 Verification Report Template

```
VERIFICATION REPORT
├── Bug: ...
├── ReproRate (before): ...%  → (after): ...%
├── Error rate / Crash: before ... → after ...
├── Latency (p50/p95): before ... → after ...
├── Resource: memory/cpu before ... → after ...
└── Rollout plan:
    ├── staging smoke: pass/fail
    ├── canary: % traffic
    └── full rollout: conditions
```

### 11.2 “Stop the line” conditions

- Fix làm tăng error rate/latency > baseline ⇒ rollback.
- Không có regression test cho bug S0/S1 ⇒ không release.

---

## 12) Hardening & Cleanup (chống bug ẩn về sau)

Dành cho code vibe-code thường: dài + trùng + coupling.

```
CLEANUP LAYER (mini-refactor)
├── A) De-duplicate
│   ├── Extract function
│   ├── Strategy/Adapter (nếu nhiều source)
│   └── Table-driven logic (nếu if/else dài)
│
├── B) Clarify boundaries
│   ├── Tách module responsibility
│   └── Define contracts (types/schemas)
│
└── C) Enforce rules
    ├── Lint/typecheck gate
    ├── Import rules (chặn vòng)
    └── Env schema validation (fail fast)
```

**Rule:** Nếu cleanup > 5 ngày ⇒ phải chia phase (không “đập đi xây lại” trong 1 PR).

---

## 13) Quick Start Prompts (anh copy thẳng)

1) **Fix bug theo pipeline**
- “Dùng *VIBECODE BUGFIXER* xử lý bug này: tạo Bug Brief → RCA → patch nhỏ + regression test → verification report. Đây là code/log: …”

2) **Bug chỉ xảy ra prod**
- “Bug chỉ xảy ra prod. Dùng pipeline: xác định config drift + minimal repro bằng prod-like config. Đưa ra guardrail + rollout plan.”

3) **Code dài, trùng, dễ bug**
- “Đánh dấu hidden bug patterns do vibe code, đề xuất mini-refactor layer (de-duplicate + boundaries + rules) nhưng vẫn giữ patch nhỏ.”

---

## 14) Output Format (chuẩn bàn giao cuối)

```
DELIVERY PACK
├── 1) Bug Brief (1 trang)
├── 2) RCA (1 trang)
├── 3) Patch PR (link + summary)
├── 4) Regression tests (list)
├── 5) Verification report (before/after)
└── 6) Prevention note (rules + checklist)
```

---

## 15) Anti-Patterns (cấm)

- “Fix bằng cách tắt log/nuốt lỗi”
- “Fix mà không thêm test”
- “Refactor lớn trong lúc đang chữa cháy”
- “Sửa theo cảm giác, không proof”
- “Đụng 20 files cho 1 bug nhỏ”

---

## 16) Checklist (5 phút trước khi merge)

```
MERGE CHECKLIST
├── ✓ ReproRate >= 70% (trước khi fix)
├── ✓ Có minimal repro case
├── ✓ RCA 1 câu + proof Level 3 (nếu S0/S1)
├── ✓ Regression test fail→pass
├── ✓ Patch nhỏ, scope rõ
├── ✓ Verification metrics before/after
└── ✓ Rollout plan (staging + canary nếu cần)
```
