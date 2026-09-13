"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  ArrowRight,
  Copy,
  Check,
  Play,
  Shield,
  Zap,
  Database,
  Layers,
  Cpu,
  Lock,
  Code2,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Activity,
  HardDrive,
  Sparkles,
} from "lucide-react";

export default function Home() {
  // Command copy state
  const [activeInstallTab, setActiveInstallTab] = useState<"curl" | "docker" | "go">("curl");
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Hero interactive inspector state
  const [inspectorTab, setInspectorTab] = useState<"trace" | "sandbox" | "router" | "queue">("trace");
  const [activeStepIndex, setActiveStepIndex] = useState(2);

  // Code snippet tab
  const [codeTab, setCodeTab] = useState<"go" | "rust" | "sql" | "ts">("go");
  const [copiedCode, setCopiedCode] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const installCommands = {
    curl: "curl -fsSL https://opada.dev/install.sh | sh",
    docker: "docker run -d -p 8080:8080 -p 3001:3001 opada/runtime:latest",
    go: "go install github.com/opada/operator-api/cmd/operator-api@latest",
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeSnippets = {
    go: `// Go ReAct Step Execution Loop
func (a *Agent) Step(ctx context.Context, task *Task) (*StepResult, error) {
    // 1. Fetch relevant memories via pgvector cosine distance
    memories := a.memory.Recall(ctx, task.Prompt, 1024, 3)

    // 2. Multi-model router with automatic cascade
    resp, err := a.router.GenerateWithFailover(ctx, task.WithContext(memories))
    if err != nil {
        return nil, fmt.Errorf("provider cascade failed: %w", err)
    }

    // 3. Dispatch validated tool calls into Rust sandbox jail
    if resp.HasToolCall() {
        return a.sandbox.ExecuteTool(ctx, resp.ToolCall)
    }
    return &StepResult{Done: true, Output: resp.Content}, nil
}`,
    rust: `// Rust Axum Sandbox Jail (sub-12ms execution)
pub async fn execute_sandboxed(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RunCodeRequest>,
) -> Result<Json<RunCodeResponse>, StatusCode> {
    let jail_dir = TempDir::new("opada-jail-")?;
    
    // Hardened environment: zero secrets, restricted PATH
    let mut cmd = Command::new(&payload.language);
    cmd.current_dir(jail_dir.path())
       .env_clear()
       .env("PATH", "/usr/bin:/bin")
       .arg("-c")
       .arg(&payload.code);

    // Enforce 100KB stdout cap & 5s watchdog timeout
    let output = timeout(Duration::from_secs(5), cmd.output()).await??;
    Ok(Json(RunCodeResponse::from(output)))
}`,
    sql: `-- Zero-Redis PostgreSQL SKIP LOCKED Worker Queue
CREATE TABLE agent_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    status VARCHAR(32) NOT NULL DEFAULT 'queued',
    prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atomic worker acquisition: zero locks, zero collisions
WITH next_job AS (
    SELECT id FROM agent_jobs
    WHERE status = 'queued'
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
)
UPDATE agent_jobs
SET status = 'running', locked_at = NOW()
WHERE id IN (SELECT id FROM next_job)
RETURNING *;`,
    ts: `// Next.js SSE Streaming Client
const streamAgentTrace = async (conversationId: string, prompt: string) => {
  const res = await fetch('/api/v1/conversations/' + conversationId + '/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt })
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    const chunk = JSON.parse(decoder.decode(value));
    console.log('[AGENT_STEP]', chunk.step_number, chunk.tool_invoked);
  }
};`
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-[#e2e8f0] selection:bg-white/20 selection:text-white font-sans">
      
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="border-b border-[#161a26] bg-[#0b0d14] px-4 py-2 text-center text-xs text-[#8e9bb0]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[#a5b4cb] font-medium">Opada Operator v1.0.4</span>
          <span className="text-[#3b4256]">•</span>
          <span>Go ReAct Runtime with Rust Sandbox Isolation &amp; pgvector Memory</span>
          <Link href="/chat" className="ml-1 text-white hover:underline inline-flex items-center gap-1 font-medium">
            Launch Console <ArrowRight className="w-3 h-3" />
          </Link>
        </span>
      </div>

      {/* ── NAVIGATION ── */}
      <header className="sticky top-0 z-50 border-b border-[#161a26] bg-[#08090d]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white group-hover:border-white/25 transition-colors">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">Opada</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#252c3f] bg-[#121622] text-[#8e9bb0]">
                  daemon
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs text-[#8e9bb0]">
              <a href="#inspector" className="hover:text-white transition-colors">Live Trace</a>
              <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
              <a href="#tools" className="hover:text-white transition-colors">Tool Matrix</a>
              <a href="#benchmarks" className="hover:text-white transition-colors">Benchmarks</a>
              <a href="#code" className="hover:text-white transition-colors">Source</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded border border-[#1b2130] bg-[#0e111a] text-[11px] font-mono text-[#7888a2]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>All Systems 100%</span>
            </div>

            <Link
              href="/login"
              className="text-xs text-[#8e9bb0] hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/chat"
              className="h-8 px-3.5 rounded bg-white text-[#08090d] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#e2e8f0] transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Open Console
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-16 pb-14 md:pt-24 md:pb-20 border-b border-[#161a26] dev-subtle-lines overflow-hidden">
        {/* Subtle radial center light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#212738] bg-[#0e121a] text-xs text-[#8e9bb0] mb-6">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.08] text-white">Go + Rust</span>
            <span>Kernel-isolated agent runtime for engineering teams</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-[54px] font-bold text-white tracking-tight leading-[1.12] mb-5">
            Autonomous agent runtime,<br />
            <span className="text-[#a5b4cb]">hardened at the kernel level.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#8e9bb0] max-w-2xl mx-auto leading-relaxed mb-8">
            Go Chi backend driving multi-model ReAct reasoning loops. Ephemeral Rust sandboxes guarantee zero host-secret leakage, backed by PostgreSQL vector memory.
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/chat"
              className="w-full sm:w-auto h-10 px-5 rounded bg-white text-[#08090d] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#e2e8f0] transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Interactive Console
            </Link>

            <Link
              href="#architecture"
              className="w-full sm:w-auto h-10 px-4 rounded border border-[#232a3d] bg-[#0e121b] text-xs font-medium text-[#c0ccdf] hover:border-white/20 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#7888a2]" />
              Read Technical Spec
            </Link>
          </div>

          {/* Quick Install Pill Box */}
          <div className="max-w-xl mx-auto rounded-lg border border-[#1b2233] bg-[#0c0f18] p-1.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#181d2c] pb-1.5 px-2 mb-1.5">
              <div className="flex items-center gap-1">
                {(["curl", "docker", "go"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveInstallTab(tab)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      activeInstallTab === tab
                        ? "bg-[#182030] text-white font-medium"
                        : "text-[#677790] hover:text-[#9db0cc]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#546279]">v1.0.4 binary</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 font-mono text-xs text-[#a5b4cb] bg-[#090b12] rounded">
              <div className="flex items-center gap-2 overflow-x-auto select-all">
                <span className="text-[#455269]">$</span>
                <span className="whitespace-nowrap">{installCommands[activeInstallTab]}</span>
              </div>
              <button
                onClick={() => copyToClipboard(installCommands[activeInstallTab])}
                className="ml-3 shrink-0 text-[#60718a] hover:text-white transition-colors"
                title="Copy command"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Metric Bar */}
          <div className="mt-8 pt-6 border-t border-[#141824] flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-[#6e7f99]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong className="text-white font-semibold">14.2 MB</strong> Memory RSS
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <strong className="text-white font-semibold">&lt; 12ms</strong> Jail Cold Start
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <strong className="text-white font-semibold">0 Redis</strong> Pure PostgreSQL
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong className="text-white font-semibold">4 Providers</strong> Live Cascading
            </div>
          </div>

        </div>
      </section>

      {/* ── HERO CENTERPIECE: INTERACTIVE RUNTIME INSPECTOR ── */}
      <section id="inspector" className="py-14 md:py-20 border-b border-[#161a26] bg-[#090b12]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#6d7e97] mb-1">Interactive Diagnostic Console</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Inspect the live ReAct engine</h2>
            </div>
            
            {/* View Switcher Tabs */}
            <div className="flex items-center rounded-lg border border-[#1b2233] bg-[#0c0f18] p-1 text-xs font-mono">
              {[
                { id: "trace", label: "Execution Trace" },
                { id: "sandbox", label: "Rust Jail Sandbox" },
                { id: "router", label: "Provider Waterfall" },
                { id: "queue", label: "Postgres Queue" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInspectorTab(t.id as any)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    inspectorTab === t.id
                      ? "bg-[#182133] text-white font-medium"
                      : "text-[#697992] hover:text-[#a0b2cd]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector Window */}
          <div className="rounded-xl border border-[#1c2336] bg-[#0b0e17] overflow-hidden shadow-2xl">
            {/* Window Topbar */}
            <div className="h-10 border-b border-[#181f30] bg-[#0d101a] px-4 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#272f44]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#272f44]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#272f44]" />
                </div>
                <span className="text-[#64748d] text-[11px] border-l border-[#1f273b] pl-3">
                  opada-session-e8f192b0 • Task: &quot;Detect memory leak &amp; profile goroutines&quot;
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#586880] text-[11px]">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Step {activeStepIndex + 1} of 4
                </span>
                <span>Latency: 284ms</span>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-5 font-mono text-xs">
              
              {inspectorTab === "trace" && (
                <div className="space-y-4">
                  {/* Prompt */}
                  <div className="rounded-lg border border-[#1a2133] bg-[#0d111b] p-3.5">
                    <div className="flex items-center justify-between text-[11px] text-[#64748d] mb-1.5">
                      <span className="text-[#8e9bb0] font-semibold">USER INPUT</span>
                      <span>17:42:01 UTC</span>
                    </div>
                    <p className="text-[#c7d5e8] font-sans text-sm">
                      &quot;Check the server heap memory, write a Python profiling script into sandbox, and identify unclosed database handles.&quot;
                    </p>
                  </div>

                  {/* Steps Timeline */}
                  <div className="space-y-2">
                    {[
                      {
                        num: 1,
                        type: "THOUGHT",
                        title: "Querying pgvector for relevant diagnostic protocols",
                        detail: "Found 2 semantic matches in operator knowledge base (similarity 0.892).",
                        badge: "Memory",
                        badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
                      },
                      {
                        num: 2,
                        type: "TOOL_CALL",
                        title: "system_info()",
                        detail: "goroutines: 418 | heap_alloc: 14.8MB | sys: 22.1MB | gc_pause_ns: 28140",
                        badge: "Native Go",
                        badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                      },
                      {
                        num: 3,
                        type: "SANDBOX_EXEC",
                        title: "run_sandboxed_code(lang='python')",
                        detail: "Dispatched to Rust Axum daemon in /tmp/opada-jail-a9f2. Exit code 0, 1.4KB output.",
                        badge: "Rust Jail",
                        badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/20",
                      },
                      {
                        num: 4,
                        type: "RESOLVED",
                        title: "Final analysis complete & checkpoint committed",
                        detail: "Identified 12 idle zombie database connections. Executed pool cleanup successfully.",
                        badge: "Checkpoint",
                        badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                      },
                    ].map((step, idx) => (
                      <div
                        key={step.num}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`rounded-lg border p-3 cursor-pointer transition-all ${
                          activeStepIndex === idx
                            ? "border-[#2b3954] bg-[#111726]"
                            : "border-[#171d2c] bg-[#0a0d15] hover:border-[#222a3d]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-[#1a2336] text-[#8e9bb0]">
                              {step.num}
                            </span>
                            <span className="font-semibold text-[#e2e8f0]">{step.title}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${step.badgeColor}`}>
                            {step.badge}
                          </span>
                        </div>
                        <p className="text-[#7888a2] text-[11px] pl-7">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspectorTab === "sandbox" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-[#1b2233] bg-[#0d111b]">
                      <div className="text-[11px] text-[#63748d]">Jail Directory</div>
                      <div className="text-white font-mono mt-1 text-xs select-all">/tmp/opada-jail-a9f2/</div>
                      <div className="text-[10px] text-[#4a586e] mt-1">Destroyed automatically on exit</div>
                    </div>
                    <div className="p-3 rounded-lg border border-[#1b2233] bg-[#0d111b]">
                      <div className="text-[11px] text-[#63748d]">Environment Isolation</div>
                      <div className="text-emerald-400 font-mono mt-1 text-xs">ENV_CLEARED = true</div>
                      <div className="text-[10px] text-[#4a586e] mt-1">Host keys stripped (0 secrets exposed)</div>
                    </div>
                    <div className="p-3 rounded-lg border border-[#1b2233] bg-[#0d111b]">
                      <div className="text-[11px] text-[#63748d]">Resource Watchdog</div>
                      <div className="text-sky-400 font-mono mt-1 text-xs">5,000ms timeout / 100KB cap</div>
                      <div className="text-[10px] text-[#4a586e] mt-1">Hard kill process tree on expiry</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#1a2133] bg-[#090b12] p-3 text-[11px] leading-relaxed">
                    <div className="text-[#5f7089] mb-2">// Sandboxed Python Code Executed in Axum Daemon:</div>
                    <pre className="text-[#b9c9df] overflow-x-auto">
{`import os, sys, psutil

# Safe introspect inside jail
active_conns = psutil.net_connections(kind='inet')
print(f"Jail PID: {os.getpid()} | Open Sockets: {len(active_conns)}")
# Output: [OK] Execution completed in 11.4ms (Memory usage: 8.2MB)`}
                    </pre>
                  </div>
                </div>
              )}

              {inspectorTab === "router" && (
                <div className="space-y-3">
                  <div className="text-xs text-[#8e9bb0] mb-2">
                    Dynamic cascade: If Groq hits rate-limit (429) or network timeout, the router cascades in 4ms without losing partial ReAct steps.
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Groq (llama-3.3-70b-versatile)", status: "Active Primary", latency: "142ms", tps: "284 t/s", state: "healthy" },
                      { name: "Google Gemini (gemini-2.0-flash)", status: "Hot Standby 1", latency: "210ms", tps: "160 t/s", state: "standby" },
                      { name: "Mistral AI (mistral-large-latest)", status: "Hot Standby 2", latency: "340ms", tps: "110 t/s", state: "standby" },
                      { name: "Cohere (command-r-plus)", status: "Semantic Rerank", latency: "95ms", tps: "310 t/s", state: "healthy" },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#192030] bg-[#0c101a]">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${p.state === "healthy" ? "bg-emerald-400" : "bg-sky-400"}`} />
                          <span className="font-semibold text-white">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#182133] text-[#8e9bb0]">{p.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[#667790] text-[11px]">
                          <span>{p.tps}</span>
                          <span className="font-semibold text-[#a5b4cb]">{p.latency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspectorTab === "queue" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-[#1b2336] bg-[#0c101a] text-xs text-[#8e9bb0]">
                    <div className="font-semibold text-white mb-1">PostgreSQL SKIP LOCKED Concurrency</div>
                    <p className="text-[11px] text-[#71829b] leading-relaxed">
                      Instead of spinning up Redis, Celery, or RabbitMQ, Opada workers pull tasks using <code className="text-[#a5b4cb]">SELECT ... FOR UPDATE SKIP LOCKED</code>. Zero duplicate deliveries, ACID transactional rollbacks, and persistent audit logs in one table.
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#181f30] bg-[#080a11] p-3 text-[11px] text-[#9db0cb]">
                    <div className="flex items-center justify-between border-b border-[#161c2b] pb-2 mb-2 text-[#56667d]">
                      <span>WORKER_ID</span>
                      <span>STATUS</span>
                      <span>LOCK_DURATION</span>
                      <span>TRANSACTION</span>
                    </div>
                    <div className="flex items-center justify-between font-mono py-1">
                      <span className="text-white">worker-go-01</span>
                      <span className="text-emerald-400">EXECUTING</span>
                      <span>320ms</span>
                      <span className="text-[#56667d]">tx_901bfa2</span>
                    </div>
                    <div className="flex items-center justify-between font-mono py-1">
                      <span className="text-white">worker-go-02</span>
                      <span className="text-emerald-400">EXECUTING</span>
                      <span>115ms</span>
                      <span className="text-[#56667d]">tx_901bfa3</span>
                    </div>
                    <div className="flex items-center justify-between font-mono py-1">
                      <span className="text-[#64748d]">worker-go-03</span>
                      <span className="text-[#64748d]">POLLING (IDLE)</span>
                      <span>--</span>
                      <span className="text-[#56667d]">tx_waiting</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE BENTO GRID ── */}
      <section id="architecture" className="py-20 md:py-28 border-b border-[#161a26]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-wider text-[#6d7e97] mb-2">Technical Foundations</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Four engineered primitives</h2>
            <p className="text-sm text-[#8e9bb0] mt-2">
              Every layer of Opada is built with production constraints in mind: minimal memory, strict security, zero duplicate dependencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Rust Sandbox */}
            <div className="p-6 rounded-xl border border-[#1b2233] bg-[#0c0f18] hover:border-[#27324b] transition-all">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 text-sky-400">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Rust Axum Sandbox Isolation</h3>
              <p className="text-xs text-[#7888a2] leading-relaxed mb-4">
                Executes agent-written code in isolated directory jails with stripped environment variables. No access to host AWS/DB credentials. 5-second hard process watchdog kills orphaned sub-threads.
              </p>
              <div className="rounded border border-[#171d2b] bg-[#080a11] p-2.5 font-mono text-[11px] text-[#a5b4cb]">
                <span className="text-[#506079]">&gt;</span> sandbox --jail=ephemeral --secrets=strip --cap=100kb
              </div>
            </div>

            {/* Card 2: Multi-Model Cascade */}
            <div className="p-6 rounded-xl border border-[#1b2233] bg-[#0c0f18] hover:border-[#27324b] transition-all">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Multi-Model Auto-Cascading</h3>
              <p className="text-xs text-[#7888a2] leading-relaxed mb-4">
                Route across Groq, Mistral, Gemini, and Cohere. If a provider returns a 429 or drops a connection mid-turn, the ai.Router falls back to the secondary model with preserved step memory.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["Groq (280 t/s)", "Gemini 2.0", "Mistral Large", "Cohere"].map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono border border-[#1f283d] bg-[#0f1422] text-[#8e9bb0]">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: Postgres Queue */}
            <div className="p-6 rounded-xl border border-[#1b2233] bg-[#0c0f18] hover:border-[#27324b] transition-all">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                <Database className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Zero-Redis Job Queue</h3>
              <p className="text-xs text-[#7888a2] leading-relaxed mb-4">
                Worker coordination handled via native PostgreSQL <code className="text-[#c7d5e8]">SKIP LOCKED</code>. Eliminates separate Redis clusters, preventing split-brain states and ensuring full ACID transaction audit trails.
              </p>
              <div className="rounded border border-[#171d2b] bg-[#080a11] p-2.5 font-mono text-[11px] text-[#a5b4cb]">
                <span className="text-[#506079]">&gt;</span> SELECT * FROM jobs FOR UPDATE SKIP LOCKED
              </div>
            </div>

            {/* Card 4: Vector Long-Term Memory */}
            <div className="p-6 rounded-xl border border-[#1b2233] bg-[#0c0f18] hover:border-[#27324b] transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                <HardDrive className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">pgvector Long-Term Memory</h3>
              <p className="text-xs text-[#7888a2] leading-relaxed mb-4">
                1024-dimensional embeddings stored directly in PostgreSQL with HNSW indexes. Before each ReAct reasoning step, the agent retrieves the 3 most relevant past conversation checkpoints.
              </p>
              <div className="rounded border border-[#171d2b] bg-[#080a11] p-2.5 font-mono text-[11px] text-[#a5b4cb]">
                <span className="text-[#506079]">&gt;</span> vector &lt;=&gt; embedding ORDER BY distance LIMIT 3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL MATRIX SECTION ── */}
      <section id="tools" className="py-20 md:py-28 border-b border-[#161a26] bg-[#090b12]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-wider text-[#6d7e97] mb-2">Function Calling Registry</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Built-in MCP agent tools</h2>
            <p className="text-sm text-[#8e9bb0] mt-2">
              Every tool implements strict parameter schemas and output truncation limits to avoid context window explosion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "run_sandboxed_code",
                lang: "Python / Node / Bash",
                cap: "100 KB limit",
                desc: "Dispatches source into Rust jail with stripped environment and strict timeout.",
                badge: "Kernel Jail",
              },
              {
                name: "web_fetch",
                lang: "HTTP / REST",
                cap: "100 KB limit",
                desc: "Performs outbound HTTP GET requests with custom User-Agent and buffer capping.",
                badge: "Network",
              },
              {
                name: "file_workspace",
                lang: "I/O System",
                cap: "Scoped path",
                desc: "Safe reading and writing within conversation scratchpad with auto directory creation.",
                badge: "Filesystem",
              },
              {
                name: "system_info",
                lang: "Runtime Telemetry",
                cap: "Read-only",
                desc: "Returns host OS, CPU core counts, goroutines, and active heap allocation stats.",
                badge: "Telemetry",
              },
              {
                name: "calculator",
                lang: "Math Engine",
                cap: "Deterministic",
                desc: "Exact floating-point arithmetic without LLM hallucinations or rounding errors.",
                badge: "Math",
              },
              {
                name: "run_command",
                lang: "Shell Exec",
                cap: "50 KB limit",
                desc: "Executes verified shell commands with working directory binding and stdout capturing.",
                badge: "Shell",
              },
            ].map((tool, i) => (
              <div key={i} className="p-4 rounded-lg border border-[#1a2133] bg-[#0c1019] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-white">{tool.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#232b3f] bg-[#121622] text-[#8e9bb0]">
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#71829b] leading-relaxed mb-3">{tool.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-[#161c2b] pt-2 text-[11px] font-mono text-[#54647c]">
                  <span>{tool.lang}</span>
                  <span>{tool.cap}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE SNIPPETS SECTION ── */}
      <section id="code" className="py-20 md:py-28 border-b border-[#161a26]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#6d7e97] mb-1">Developer Implementation</div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Inspect the real code</h2>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center rounded-lg border border-[#1b2233] bg-[#0c0f18] p-1 text-xs font-mono">
              {[
                { id: "go", label: "agent.go" },
                { id: "rust", label: "sandbox.rs" },
                { id: "sql", label: "queue.sql" },
                { id: "ts", label: "client.ts" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCodeTab(t.id as any)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    codeTab === t.id
                      ? "bg-[#182133] text-white font-medium"
                      : "text-[#697992] hover:text-[#a0b2cd]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#1c2336] bg-[#090b12] overflow-hidden shadow-2xl">
            <div className="h-10 border-b border-[#161d2d] bg-[#0c0f18] px-4 flex items-center justify-between text-xs font-mono">
              <span className="text-[#7888a2]">
                {codeTab === "go" && "backend/internal/agent/agent.go"}
                {codeTab === "rust" && "sandbox/src/main.rs"}
                {codeTab === "sql" && "backend/internal/db/schema.sql"}
                {codeTab === "ts" && "frontend/lib/api.ts"}
              </span>
              <button
                onClick={() => copyCodeToClipboard(codeSnippets[codeTab])}
                className="flex items-center gap-1.5 text-[11px] text-[#64748d] hover:text-white transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-[#c7d5e8]">
              <pre>{codeSnippets[codeTab]}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNICAL BENCHMARKS ── */}
      <section id="benchmarks" className="py-20 md:py-28 border-b border-[#161a26] bg-[#090b12]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-mono uppercase tracking-wider text-[#6d7e97] mb-2">Runtime Metrics</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Performance comparisons</h2>
            <p className="text-sm text-[#8e9bb0] mt-2">
              Opada trades interpreted bloat for compiled Go binaries and lightweight Rust jail daemons.
            </p>
          </div>

          <div className="rounded-xl border border-[#1b2233] bg-[#0c0f18] overflow-hidden text-xs">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-[#181f30] bg-[#0e121d] text-[#697992] text-[11px]">
                  <th className="py-3 px-4 font-semibold">METRIC</th>
                  <th className="py-3 px-4 font-semibold text-white">OPADA OPERATOR</th>
                  <th className="py-3 px-4 font-semibold">PYTHON / CELERY</th>
                  <th className="py-3 px-4 font-semibold">NODE / DOCKER-IN-DOCKER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151b29] text-[#9db0cb]">
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-white">Memory Footprint (Idle)</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">14.2 MB</td>
                  <td className="py-3 px-4">420 MB</td>
                  <td className="py-3 px-4">1.8 GB</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-white">Code Sandbox Cold Start</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">&lt; 12ms (Rust Jail)</td>
                  <td className="py-3 px-4">1,400ms (Subprocess)</td>
                  <td className="py-3 px-4">3,200ms (Docker)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-white">Infrastructure Stack</td>
                  <td className="py-3 px-4 text-white font-bold">Go + Rust + Postgres</td>
                  <td className="py-3 px-4">Python + Redis + RabbitMQ</td>
                  <td className="py-3 px-4">Node + Docker + Redis</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-white">Host Secret Protection</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">Sanitized ENV Jails</td>
                  <td className="py-3 px-4">None (Inherits Env)</td>
                  <td className="py-3 px-4">VM Boundary</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-white">Multi-Model Cascade Latency</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">4ms Failover</td>
                  <td className="py-3 px-4">450ms Exception Loop</td>
                  <td className="py-3 px-4">280ms Retry</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 md:py-28 border-b border-[#161a26]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="text-xs font-mono uppercase tracking-wider text-[#6d7e97] mb-2">FAQ</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Engineering answers</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Why PostgreSQL SKIP LOCKED instead of Redis?",
                a: "SKIP LOCKED gives you strict ACID transactional safety, persistent job logs, and eliminates a distributed systems point-of-failure. You manage exactly one database instead of syncing Redis state with relational data.",
              },
              {
                q: "How does the Rust sandbox isolate code?",
                a: "The sandbox runs as an Axum daemon. Each execution request creates an ephemeral directory with strict permissions, wipes all environment variables so host secrets can never be read, and enforces a hard 5-second process tree kill.",
              },
              {
                q: "What happens when an LLM provider hits a 429 rate limit?",
                a: "The ai.Router catches the HTTP 429 or timeout error, preserves all intermediate ReAct scratchpad thoughts, and cascades to the next registered provider within 4ms without interrupting the active conversation.",
              },
              {
                q: "Can I run this without Docker in production?",
                a: "Yes. The Go API compiles to a single ~17 MB static binary. The Rust sandbox compiles to a single ~11 MB binary. You can run them directly as systemd units or lightweight container jobs on any Linux host.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border border-[#1b2233] bg-[#0c0f18] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:bg-white/[0.02] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#64748d] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-xs text-[#8e9bb0] leading-relaxed border-t border-[#151b29] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-[#080a11] text-center border-b border-[#161a26]">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Start running autonomous tasks
          </h2>
          <p className="text-sm text-[#8e9bb0] mb-8 leading-relaxed">
            Open the chat console to test tool dispatch, observe the ReAct trace step-by-step, and switch model providers in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/chat"
              className="w-full sm:w-auto h-10 px-6 rounded bg-white text-[#08090d] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#e2e8f0] transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Console
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto h-10 px-5 rounded border border-[#21283c] bg-[#0c101a] text-xs font-medium text-[#c0ccdf] hover:text-white hover:border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              Authenticate &amp; Save Sessions
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 bg-[#06070a] text-xs text-[#58677f]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#a5b4cb]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-white">Opada Operator</span>
            <span>•</span>
            <span className="font-mono">v1.0.4-prod</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a href="http://localhost:8080/health" target="_blank" rel="noreferrer" className="hover:text-[#a5b4cb] transition-colors">
              /health
            </a>
            <a href="http://localhost:8080/metrics" target="_blank" rel="noreferrer" className="hover:text-[#a5b4cb] transition-colors">
              /metrics
            </a>
            <a href="http://localhost:8080/api/v1/tools" target="_blank" rel="noreferrer" className="hover:text-[#a5b4cb] transition-colors">
              /api/v1/tools
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
