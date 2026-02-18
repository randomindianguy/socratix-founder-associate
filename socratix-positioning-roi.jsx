import { useState, useEffect } from "react";

// ── COMPETITIVE ATTRIBUTE DATA ──
const APPROACHES = [
  { id: "manual", label: "Manual Teams", shortLabel: "Manual", color: "#8B6F5C", icon: "👥", era: "Gen 0" },
  { id: "rules", label: "Rule Engines", shortLabel: "Rules", color: "#7A8B99", icon: "⚙️", era: "Gen 1", examples: "FICO Falcon, Actimize, Verafin" },
  { id: "ml", label: "ML Platforms", shortLabel: "ML", color: "#5B8FA8", icon: "🧠", era: "Gen 2", examples: "Unit21, Sardine, Featurespace" },
  { id: "agents", label: "AI Agents", shortLabel: "Agents", color: "#3B82F6", icon: "⚡", era: "Gen 3", examples: "Socratix AI", highlight: true },
];

const ATTRIBUTES = [
  {
    id: "speed",
    label: "Investigation Speed",
    description: "Time from alert to decision-ready output",
    buyerCare: "High — directly impacts how many cases get resolved per day",
    scores: { manual: 1, rules: 2, ml: 3, agents: 5 },
    details: {
      manual: "Hours to a full day per case — analyst gathers data across tools, writes up narrative manually",
      rules: "Fast at flagging, but investigation still manual. Rules fire in ms, humans still spend 30-60 min per alert",
      ml: "Better prioritization reduces wasted time, but analysts still investigate every escalated alert. ~20-45 min per case",
      agents: "15 minutes per investigation (vs. full day). Agent gathers evidence, maps relationships, drafts narrative autonomously",
    },
  },
  {
    id: "fp",
    label: "False Positive Rate",
    description: "% of alerts that turn out to be legitimate activity",
    buyerCare: "Critical — up to 95% of alerts are false positives industry-wide, costing billions in wasted investigation",
    scores: { manual: 2, rules: 1, ml: 4, agents: 4 },
    details: {
      manual: "Depends on analyst skill. Experienced analysts can triage faster, but they're still reviewing every alert",
      rules: "Worst performer — rigid rules generate 80-95% false positive rates. Can't distinguish context",
      ml: "Behavioral analytics cut FP rates to 15-40%. Adaptive models learn what 'normal' looks like per customer",
      agents: "Comparable ML-level detection, plus AI pre-screening auto-resolves obvious false positives before human review",
    },
  },
  {
    id: "explain",
    label: "Explainability",
    description: "Can decisions be audited by regulators and compliance teams?",
    buyerCare: "Non-negotiable in regulated finance — SAR filings, audits, and legal hold all require decision trails",
    scores: { manual: 5, rules: 5, ml: 2, agents: 4 },
    details: {
      manual: "Fully explainable — humans document their reasoning. Gold standard for auditability",
      rules: "Deterministic and auditable — if rule X fires, you know exactly why. Regulators love this",
      ml: "Black-box problem. Models detect patterns but can't explain why. Major compliance risk in regulated environments",
      agents: "Explainable by design — each decision includes evidence chain, reasoning, and recommended action. Built for audits",
    },
  },
  {
    id: "deploy",
    label: "Deployment Time",
    description: "Time from contract to production value",
    buyerCare: "Matters for budget cycles — faster deployment means faster ROI realization",
    scores: { manual: 3, rules: 2, ml: 2, agents: 5 },
    details: {
      manual: "Hiring takes weeks, training takes months. Each new analyst needs domain ramp-up",
      rules: "Months-long implementation. Rule tuning, integration with data sources, testing cycles",
      ml: "Similar timeline — data ingestion, model training, integration. 3-6 months is typical",
      agents: "Days, not quarters. Plugs into existing fraud stack. No data migration required — agents learn from historical alerts",
    },
  },
  {
    id: "scale",
    label: "Scalability",
    description: "Can it handle 10x alert volume without 10x cost?",
    buyerCare: "Essential — fraud attacks are scaling with AI while team budgets aren't",
    scores: { manual: 1, rules: 4, ml: 4, agents: 5 },
    details: {
      manual: "Linear scaling only — more alerts = more headcount = more cost. Cannot keep pace with AI-powered fraud",
      rules: "Rules scale computationally, but more rules = more alerts = more analysts needed to investigate",
      ml: "Good computational scale, but investigation bottleneck remains. Better prioritization helps but doesn't eliminate the problem",
      agents: "True non-linear scaling — agents handle investigation autonomously. 10x alerts doesn't mean 10x headcount",
    },
  },
  {
    id: "cost",
    label: "Total Cost of Ownership",
    description: "All-in cost including software, headcount, and maintenance",
    buyerCare: "CFOs compare: fully-loaded analyst cost vs. software + reduced headcount needs",
    scores: { manual: 1, rules: 3, ml: 3, agents: 4 },
    details: {
      manual: "$70-85K per analyst fully loaded. 30%+ annual turnover means constant rehiring and retraining costs",
      rules: "Software licensing + engineering maintenance + analyst team. Rules proliferate and require constant tuning",
      ml: "Platform cost + reduced (but still significant) analyst team. Better efficiency but still labor-intensive",
      agents: "Software cost offset by dramatic headcount efficiency. Recovered analyst capacity redirected to high-value work",
    },
  },
];

// ── COUNTER-POSITIONING DATA ──
const COUNTER_POSITIONS = [
  {
    against: "Manual Teams",
    weakness: "Cannot scale without linear headcount growth",
    socratixStrength: "AI agents scale non-linearly — 10x alerts ≠ 10x cost",
    analogy: "Like hiring 100 junior analysts who never sleep, never burn out, and get smarter every week",
  },
  {
    against: "Rule Engines (FICO, Actimize)",
    weakness: "Rigid rules can't adapt to novel fraud patterns",
    socratixStrength: "Agents learn from historical decisions and adapt in real-time",
    analogy: "Rules are a lock on the front door. Agents are a security guard who can think",
  },
  {
    against: "ML Platforms (Unit21, Sardine)",
    weakness: "Better detection, same investigation bottleneck — analysts still do all the work",
    socratixStrength: "Agents don't just detect — they investigate, gather evidence, and draft case narratives",
    analogy: "ML platforms gave analysts a better radar. Socratix gave them a copilot",
  },
];

const fmt = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const fmtNum = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
};

// ── COMPONENTS ──

function ScoreBar({ score, maxScore = 5, color, showLabel = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {Array.from({ length: maxScore }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i < score ? color : "rgba(255,255,255,0.06)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 16, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
          {score}
        </span>
      )}
    </div>
  );
}

function AttributeRow({ attr, expandedAttr, onToggle }) {
  const isExpanded = expandedAttr === attr.id;
  const best = Math.max(...Object.values(attr.scores));
  const bestApproaches = Object.entries(attr.scores).filter(([_, v]) => v === best).map(([k]) => k);

  return (
    <div style={{
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      cursor: "pointer",
      transition: "background 0.2s ease",
    }}
    onClick={() => onToggle(attr.id)}
    >
      {/* Header Row */}
      <div style={{ padding: "14px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{attr.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{attr.description}</div>
          </div>
          <div style={{
            fontSize: 16, color: "rgba(255,255,255,0.25)",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.3s ease", flexShrink: 0, marginLeft: 12,
          }}>▾</div>
        </div>
        {/* Score bars */}
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 6 }}>
          {APPROACHES.map((a) => (
            <div key={a.id} style={{ display: "contents" }}>
              <div style={{
                fontSize: 10, color: a.highlight ? "#3B82F6" : "rgba(255,255,255,0.35)",
                fontWeight: a.highlight ? 700 : 500,
                display: "flex", alignItems: "center",
                letterSpacing: "0.02em",
              }}>
                {a.shortLabel}
              </div>
              <ScoreBar score={attr.scores[a.id]} color={a.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div style={{
          padding: "0 0 16px 0",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            marginBottom: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(200,170,80,0.7)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              Why buyers care
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              {attr.buyerCare}
            </div>
          </div>
          {APPROACHES.map((a) => (
            <div key={a.id} style={{
              padding: "8px 14px", borderRadius: 6,
              background: a.highlight ? "rgba(59,130,246,0.06)" : "transparent",
              marginBottom: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 12 }}>{a.icon}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: a.highlight ? "#3B82F6" : "rgba(255,255,255,0.5)",
                }}>
                  {a.label}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, paddingLeft: 22 }}>
                {attr.details[a.id]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, prefix, onChange, color = "#3B82F6" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>
          {prefix || ""}{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}{unit || ""}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%", height: 6, appearance: "none", outline: "none",
          borderRadius: 3, cursor: "pointer",
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
    </div>
  );
}

// ── MAIN ──
export default function SocratixPositioning() {
  const [section, setSection] = useState("positioning");
  const [expandedAttr, setExpandedAttr] = useState("speed");
  const [showCounterPos, setShowCounterPos] = useState(false);
  const [expandedCP, setExpandedCP] = useState(null);

  // ROI state
  const [teamSize, setTeamSize] = useState(10);
  const [avgSalary, setAvgSalary] = useState(85);
  const [alertsPerDay, setAlertsPerDay] = useState(50);
  const [falsePositiveRate, setFalsePositiveRate] = useState(80);
  const [avgInvestTime, setAvgInvestTime] = useState(45);

  // ROI math
  const totalAlertsYear = teamSize * alertsPerDay * 260;
  const falsePositivesYear = totalAlertsYear * (falsePositiveRate / 100);
  const hoursOnFP = (falsePositivesYear * avgInvestTime) / 60;
  const totalTeamCost = teamSize * avgSalary * 1000;
  const costOfFP = (hoursOnFP / 2080) * (avgSalary * 1000);
  const fpCostPct = Math.min((costOfFP / totalTeamCost) * 100, 100);

  const timeReduction = 0.85;
  const fpReduction = 0.40;
  const savedHours = hoursOnFP * timeReduction;
  const savedCost = costOfFP * timeReduction;
  const analystEquiv = savedHours / 2080;
  const effectiveFP = falsePositiveRate * (1 - fpReduction);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F1A",
      color: "#fff",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: #fff; cursor: pointer; border: 2px solid #3B82F6;
          box-shadow: 0 2px 8px rgba(59,130,246,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; cursor: pointer; border: 2px solid #3B82F6;
          box-shadow: 0 2px 8px rgba(59,130,246,0.3);
        }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at 30% 0%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(59,130,246,0.03) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 60px", position: "relative" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 28, animation: "fadeIn 0.6s ease" }}>
          <div style={{ fontSize: 12, color: "rgba(59,130,246,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
            Positioning & ROI Analysis
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 5vw, 36px)",
            fontWeight: 700, lineHeight: 1.15, marginBottom: 12, color: "#fff",
          }}>
            The case for{" "}
            <span style={{ color: "#3B82F6" }}>AI agents</span>{" "}
            in fraud operations.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, maxWidth: 540 }}>
            How Socratix positions against every alternative a fraud team evaluates — 
            and what the switch is worth in dollars, hours, and headcount.
          </p>
        </div>

        {/* ── TABS ── */}
        <div style={{
          display: "flex", gap: 4, padding: 4, marginBottom: 28,
          background: "rgba(255,255,255,0.04)", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {[
            { id: "positioning", label: "How Socratix Wins", sub: "vs. every alternative a buyer evaluates" },
            { id: "roi", label: "What It's Worth", sub: "plug in your team's numbers" },
            { id: "plan", label: "What I'd Ship", sub: "30 days as a founder's associate" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: 10, border: "none",
                background: section === tab.id ? "rgba(59,130,246,0.15)" : "transparent",
                color: section === tab.id ? "#3B82F6" : "rgba(255,255,255,0.4)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                textAlign: "center", lineHeight: 1.3,
              }}
            >
              {tab.label}
              <div style={{
                fontSize: 10, fontWeight: 400, marginTop: 2,
                color: section === tab.id ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.25)",
              }}>
                {tab.sub}
              </div>
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            POSITIONING SECTION
        ═══════════════════════════════════════ */}
        {section === "positioning" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>

            {/* Intro */}
            <div style={{
              padding: "16px 18px", marginBottom: 20,
              background: "rgba(59,130,246,0.04)", borderRadius: 12,
              border: "1px solid rgba(59,130,246,0.1)",
            }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, fontWeight: 500 }}>
                Fraud teams have 4 options today: hire analysts, buy rule engines, use ML platforms, or deploy AI agents. 
                Below is how each scores on the <span style={{ color: "#3B82F6" }}>6 things buyers actually care about</span>.
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                👆 Tap any row to see the full breakdown per competitor.
              </div>
            </div>

            {/* Legend */}
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, padding: "10px 14px",
              background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginRight: 4, display: "flex", alignItems: "center" }}>
                The 4 approaches:
              </div>
              {APPROACHES.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} />
                  <span style={{
                    fontSize: 11, color: a.highlight ? a.color : "rgba(255,255,255,0.4)",
                    fontWeight: a.highlight ? 600 : 400,
                  }}>
                    {a.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Attribute Matrix */}
            <div style={{
              background: "rgba(255,255,255,0.01)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 14, padding: "4px 16px", marginBottom: 24,
            }}>
              {ATTRIBUTES.map((attr) => (
                <AttributeRow
                  key={attr.id}
                  attr={attr}
                  expandedAttr={expandedAttr}
                  onToggle={(id) => setExpandedAttr(expandedAttr === id ? null : id)}
                />
              ))}
            </div>

            {/* ── COUNTER-POSITIONING ── */}
            <div style={{
              background: showCounterPos ? "rgba(59,130,246,0.04)" : "rgba(255,255,255,0.02)",
              border: showCounterPos ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, overflow: "hidden", marginBottom: 24,
              transition: "all 0.3s ease",
            }}>
              <div
                onClick={() => setShowCounterPos(!showCounterPos)}
                style={{ padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Counter-Positioning</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    How Socratix turns each competitor's weakness into its strength
                  </div>
                </div>
                <div style={{
                  fontSize: 16, color: "rgba(255,255,255,0.25)",
                  transform: showCounterPos ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.3s ease",
                }}>▾</div>
              </div>

              {showCounterPos && (
                <div style={{ padding: "0 18px 18px", animation: "fadeIn 0.3s ease" }}>
                  <div style={{
                    fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6,
                    marginBottom: 14, fontStyle: "italic",
                  }}>
                    "Counter-positioning works because the incumbent finds it hard to move against you." 
                    — Find their weakness, make it your strength.
                  </div>
                  {COUNTER_POSITIONS.map((cp, i) => (
                    <div
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setExpandedCP(expandedCP === i ? null : i); }}
                      style={{
                        padding: "12px 14px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                        background: expandedCP === i ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)",
                        border: expandedCP === i ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(255,255,255,0.04)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", marginBottom: 4 }}>
                        vs. {cp.against}
                      </div>
                      <div style={{ display: "flex", gap: 8, fontSize: 12, lineHeight: 1.6 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: "rgba(200,130,130,0.7)", fontWeight: 500 }}>Their gap: </span>
                          <span style={{ color: "rgba(255,255,255,0.45)" }}>{cp.weakness}</span>
                        </div>
                      </div>
                      {expandedCP === i && (
                        <div style={{ marginTop: 10, animation: "fadeIn 0.2s ease" }}>
                          <div style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
                            <span style={{ color: "rgba(59,130,246,0.8)", fontWeight: 500 }}>Socratix flips it: </span>
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>{cp.socratixStrength}</span>
                          </div>
                          <div style={{
                            fontSize: 12, color: "rgba(200,170,80,0.6)", fontStyle: "italic",
                            padding: "8px 12px", background: "rgba(200,170,80,0.04)", borderRadius: 6,
                          }}>
                            💡 {cp.analogy}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Positioning Insight */}
            <div style={{
              padding: "16px 18px",
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.15)",
              borderRadius: 12, marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                The positioning statement
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontWeight: 500 }}>
                "For fraud and risk teams drowning in alerts, Socratix is the <span style={{ color: "#3B82F6" }}>AI coworker</span> that 
                investigates autonomously — unlike ML platforms that detect threats but still leave humans to do all the work."
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10, lineHeight: 1.6 }}>
                Anchor category: AI-powered fraud tools. Differentiation: autonomous investigation with explainable decisions. 
                The competitive moat isn't detection accuracy — it's <span style={{ color: "#3B82F6" }}>investigation speed × explainability</span>.
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setSection("roi")}
              style={{
                width: "100%", padding: "14px 20px",
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 12, color: "#3B82F6", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
              }}
            >
              Quantify the ROI →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════
            ROI CALCULATOR SECTION
        ═══════════════════════════════════════ */}
        {section === "roi" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>

            {/* Industry benchmarks */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
              {[
                { stat: "95%", label: "of AML alerts are false positives", color: "#E57373" },
                { stat: "$274B", label: "global financial crime compliance spend", color: "#FFB74D" },
                { stat: "30%+", label: "annual fraud analyst turnover", color: "#E57373" },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "14px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.stat}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4, marginTop: 4 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Sliders */}
            <div style={{
              padding: "20px", background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
                Plug in your team's numbers
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16, lineHeight: 1.5 }}>
                Drag the sliders to match your fraud team — the savings update live below.
              </div>
              <Slider label="Fraud analysts on team" value={teamSize} min={2} max={50} step={1} onChange={setTeamSize} />
              <Slider label="Avg. fully loaded cost per analyst" value={avgSalary} min={50} max={150} step={5} unit="K" prefix="$" onChange={setAvgSalary} />
              <Slider label="Alerts per analyst per day" value={alertsPerDay} min={10} max={150} step={5} onChange={setAlertsPerDay} />
              <Slider label="False positive rate" value={falsePositiveRate} min={30} max={95} step={5} unit="%" onChange={setFalsePositiveRate} />
              <Slider label="Avg. investigation time per alert" value={avgInvestTime} min={10} max={90} step={5} unit=" min" onChange={setAvgInvestTime} />
            </div>

            {/* Current State */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8, paddingLeft: 2 }}>
              ↓ Here's what those numbers cost you today:
            </div>
            <div style={{
              padding: "20px", background: "rgba(200,100,100,0.04)",
              border: "1px solid rgba(200,100,100,0.12)", borderRadius: 14, marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,130,130,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                Current State — The cost of manual investigation
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Total team cost", value: fmt(totalTeamCost), sub: "per year", color: "#fff" },
                  { label: "Alerts processed", value: fmtNum(totalAlertsYear), sub: "per year", color: "#fff" },
                  { label: "Wasted on false positives", value: fmt(costOfFP), sub: `${fpCostPct.toFixed(0)}% of spend`, color: "#E57373" },
                  { label: "Hours investigating nothing", value: fmtNum(hoursOnFP), sub: "hours per year", color: "#E57373" },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              {/* Bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Team time on false positives</div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${Math.min(fpCostPct, 100)}%`,
                    background: "linear-gradient(90deg, #E57373, #EF5350)",
                    borderRadius: 4, transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(229,115,115,0.7)", marginTop: 4, fontWeight: 600 }}>
                  {fpCostPct.toFixed(0)}% of your team's capacity chasing false alarms
                </div>
              </div>
            </div>

            {/* With Socratix */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8, marginTop: 16, paddingLeft: 2 }}>
              ↓ Now, with AI agents handling investigation:
            </div>
            <div style={{
              padding: "20px", background: "rgba(59,130,246,0.04)",
              border: "1px solid rgba(59,130,246,0.15)", borderRadius: 14, marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(59,130,246,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                With AI Agents — Projected impact
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Annual savings", value: fmt(savedCost), sub: "in recovered capacity", color: "#4FC3F7" },
                  { label: "Hours freed up", value: fmtNum(savedHours), sub: "per year", color: "#4FC3F7" },
                  { label: "Equivalent headcount saved", value: analystEquiv.toFixed(1), sub: "full-time analysts", color: "#4FC3F7" },
                  { label: "Effective false positive rate", value: `${effectiveFP.toFixed(0)}%`, sub: `down from ${falsePositiveRate}%`, color: "#4FC3F7" },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What it means */}
            <div style={{
              padding: "16px 18px", background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                What this means in practice
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                {analystEquiv >= 2 ? (
                  <>
                    Your team could <span style={{ color: "#4FC3F7", fontWeight: 500 }}>redeploy {Math.floor(analystEquiv)} analysts</span> from
                    false-positive triage to high-value investigations — or handle{" "}
                    <span style={{ color: "#4FC3F7", fontWeight: 500 }}>{Math.round((savedHours * 60) / avgInvestTime).toLocaleString()} more real cases</span> per 
                    year with the same team.
                  </>
                ) : (
                  <>
                    Your team recovers <span style={{ color: "#4FC3F7", fontWeight: 500 }}>{fmtNum(savedHours)} hours/year</span> — redirected from 
                    false alarms to investigating real threats. That's{" "}
                    <span style={{ color: "#4FC3F7", fontWeight: 500 }}>{Math.round((savedHours * 60) / avgInvestTime).toLocaleString()} more real cases</span> your 
                    team can close annually.
                  </>
                )}
              </div>
            </div>

            {/* Assumptions */}
            <div style={{
              padding: "14px 16px", background: "rgba(200,170,80,0.04)",
              border: "1px solid rgba(200,170,80,0.12)", borderRadius: 10,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(200,170,80,0.7)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                Model assumptions
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                85% reduction in investigation time (based on reported "full-day to 15-min" outcomes). 
                40% reduction in false positive rate via AI pre-screening. 
                2,080 working hours/analyst/year. 260 working days. 
                Savings = recovered capacity, not headcount elimination.
              </div>
            </div>

            {/* CTA to plan */}
            <button
              onClick={() => setSection("plan")}
              style={{
                width: "100%", marginTop: 20, padding: "14px 20px",
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 12, color: "#3B82F6", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
              }}
            >
              See what I'd ship in 30 days →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════
            WHAT I'D SHIP SECTION
        ═══════════════════════════════════════ */}
        {section === "plan" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>

        {/* ── 30-DAY PLAN ── */}
        <div style={{ animation: "fadeIn 1s ease" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "rgba(59,130,246,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
              If I were on the team
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 700, lineHeight: 1.2, color: "#fff", marginBottom: 10,
            }}>
              What I'd ship in <span style={{ color: "#3B82F6" }}>30 days.</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
              Three things I'd own in the first month — scoped for a founding team selling enterprise deals, not a 50-person growth org.
            </p>
          </div>

          {[
            {
              week: "Week 1",
              title: "Build the competitive battle card system",
              what: "Sit in on sales calls. Catalog every objection buyers raise about switching from Unit21, Sardine, or manual teams. Turn these into structured battle cards the founders can pull up mid-call — with counter-positioning, ROI framing, and proof points per objection.",
              deliverable: "Battle card deck (per competitor) + objection-handling playbook + a Notion/doc system founders can update live",
              metric: "Reduce founder prep time per sales call from ad-hoc to <5 min with a standardized reference",
              icon: "🎯",
            },
            {
              week: "Week 2–3",
              title: "Close the feedback loop between customers and product",
              what: "Design a lightweight system to capture insights from every customer call and pilot deployment. Tag by theme (integration friction, explainability gaps, feature requests, fraud pattern types). Surface the top 3 recurring themes weekly to prioritize the roadmap.",
              deliverable: "Customer insight tracker + weekly insight digest + first product requirements doc synthesized from real conversations",
              metric: "Zero customer insights lost between call and product decision. Every feature request traceable to a real conversation.",
              icon: "🔄",
            },
            {
              week: "Week 3–4",
              title: "Build the ROI calculator for enterprise pilots",
              what: "Take this analysis and turn it into a customer-facing tool. Let prospects input their team size, alert volume, and false positive rate — and see the projected savings before signing. Embed it in the sales process so every pilot starts with a clear success benchmark.",
              deliverable: "Customer-facing ROI calculator + integration into sales deck + pilot success criteria template",
              metric: "Every enterprise pilot starts with quantified baseline → measurable 'before vs. after' at renewal",
              icon: "📊",
            },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "18px 20px", borderRadius: 14, marginBottom: 10,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.2s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#3B82F6", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {item.week}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginTop: 1 }}>
                    {item.title}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 10 }}>
                {item.what}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{
                  padding: "8px 10px", borderRadius: 6,
                  background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.08)",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(59,130,246,0.6)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
                    Deliverable
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    {item.deliverable}
                  </div>
                </div>
                <div style={{
                  padding: "8px 10px", borderRadius: 6,
                  background: "rgba(130,200,130,0.04)", border: "1px solid rgba(130,200,130,0.08)",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(130,200,130,0.6)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
                    Success metric
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    {item.metric}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── AUTHOR CARD ── */}
        <div style={{
          marginTop: 36, padding: "20px",
          background: "rgba(59,130,246,0.03)",
          border: "1px solid rgba(59,130,246,0.1)",
          borderRadius: 14,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(59,130,246,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Built by
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>
            Sidharth Sundaram
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 14 }}>
            4 years as a B2B PM — launched a vertical from 0→1, ran customer research to product spec to shipped feature, and built the growth models to prove it worked. MS Engineering Management at Purdue. Looking for a founding-team internship this summer.
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginBottom: 14, fontStyle: "italic" }}>
            Why I built this: Socratix is solving one of those rare problems where the buyer's pain is obvious and quantifiable — 
            fraud teams are drowning in alerts they know are false, and the cost is measurable in hours and dollars. 
            I wanted to show how I think about positioning and ROI, not just talk about it.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Website", href: "https://sidharthsundaram.com" },
              { label: "LinkedIn", href: "https://linkedin.com/in/sidharthsundaram" },
              { label: "sundar84@purdue.edu", href: "mailto:sundar84@purdue.edu" },
            ].map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 14px", borderRadius: 8,
                  background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
                  color: "#3B82F6", fontSize: 12, fontWeight: 500, textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: 48, padding: "24px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            Sources
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>
            False positive benchmarks: Flagright, LexisNexis, Global Investigations Review. 
            Salary data: Salary.com, Glassdoor (2025). 
            Socratix performance: SiliconANGLE, Pear VC investment memo (Oct 2025). 
            Competitor capabilities: Unit21, Sardine, Featurespace product pages. 
            Positioning framework: April Dunford, Obviously Awesome.
          </div>
          <div style={{ fontSize: 12, color: "rgba(59,130,246,0.4)", marginTop: 16, fontStyle: "italic" }}>
            Built as an independent analysis — not affiliated with Socratix AI.
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
            Sidharth Sundaram · sidharthsundaram.com
          </div>
        </div>
      </div>
    </div>
  );
}
