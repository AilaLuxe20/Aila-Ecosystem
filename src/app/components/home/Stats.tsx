"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    value: 500,
    suffix: "+",
    label: "Projects Delivered",
    description: "Across web, mobile, and AI",
  },
  {
    value: 98,
    suffix: "%",
    label: "Client Satisfaction",
    description: "Measured across all engagements",
  },
  {
    value: 6,
    suffix: "",
    label: "AI Products",
    description: "Inside the Aila Ecosystem",
  },
  {
    value: 24,
    suffix: "/7",
    label: "AI Always On",
    description: "Intelligent systems never sleep",
  },
];

function useCountUp(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

function StatCard({
  value,
  suffix,
  label,
  description,
  index,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  description: string;
  index: number;
  active: boolean;
}) {
  const count = useCountUp(value, 1800, active);

  return (
    <div
      className="stat-card"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="stat-number">
        <span className="stat-count">{count}</span>
        <span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-description">{description}</div>
      <div className="stat-line" />
    </div>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .stats-section {
          position: relative;
          padding: 120px 24px;
          overflow: hidden;
        }

        .stats-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(103, 232, 249, 0.04) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        .stats-divider {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 80px;
          background: linear-gradient(to bottom, transparent, rgba(103, 232, 249, 0.3), transparent);
        }

        .stats-inner {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-eyebrow {
          text-align: center;
          margin-bottom: 72px;
        }

        .stats-eyebrow-text {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #67e8f9;
        }

        .stats-eyebrow-line {
          display: block;
          width: 32px;
          height: 1px;
          background: #67e8f9;
          opacity: 0.5;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          overflow: hidden;
        }

        .stat-card {
          position: relative;
          padding: 48px 40px;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(12px);
          transition: background 0.3s ease;
          opacity: 0;
          animation: statFadeIn 0.6s ease forwards;
        }

        @keyframes statFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card:hover {
          background: rgba(103, 232, 249, 0.03);
        }

        .stat-card:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stat-number {
          display: flex;
          align-items: baseline;
          gap: 2px;
          margin-bottom: 12px;
          line-height: 1;
        }

        .stat-count {
          font-size: 56px;
          font-weight: 700;
          letter-spacing: -2px;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .stat-suffix {
          font-size: 32px;
          font-weight: 600;
          color: #67e8f9;
          letter-spacing: -1px;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }

        .stat-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.3);
          line-height: 1.5;
        }

        .stat-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(103, 232, 249, 0.15), transparent);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .stat-card:hover .stat-line {
          transform: scaleX(1);
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-card:nth-child(2) {
            border-right: none;
          }

          .stat-card:not(:last-child) {
            border-right: 1px solid rgba(255, 255, 255, 0.06);
          }

          .stat-card:nth-child(2),
          .stat-card:nth-child(4) {
            border-right: none;
          }

          .stat-card:nth-child(1),
          .stat-card:nth-child(2) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
        }

        @media (max-width: 560px) {
          .stats-section {
            padding: 80px 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            border-radius: 16px;
          }

          .stat-card {
            padding: 36px 28px;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .stat-card:last-child {
            border-bottom: none;
          }

          .stat-count {
            font-size: 48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stat-card {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>

      <section ref={sectionRef} className="stats-section">
        <div className="stats-bg" />
        <div className="stats-divider" />

        <div className="stats-inner">
          <div className="stats-eyebrow">
            <span className="stats-eyebrow-text">
              <span className="stats-eyebrow-line" />
              By the numbers
              <span className="stats-eyebrow-line" />
            </span>
          </div>

          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <StatCard
                key={stat.label}
                {...stat}
                index={i}
                active={active}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}