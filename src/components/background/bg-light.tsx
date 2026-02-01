"use client";
import React from "react";

export default function BackGroundLight({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="wrap">
      <div className="gridOverlay" />
      <div className="tri triA" />
      <div className="tri triB" />
      <div className="tri triC" />
      <div className="tri triD" />

      <div className="glowLayer" />
      <div className="content">{children}</div>

      <style jsx>{`
        /* ====== Base Layer (White Clean) ====== */
        .wrap {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(
            circle at 50% 20%,
            #f8fafc 0%,
            /* slate-50 */ #ffffff 60%,
            #f1f5f9 100% /* slate-100 */
          );
          color: #0f172a;
        }

        /* ====== Light Grid Overlay ====== */
        .gridOverlay {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: repeating-linear-gradient(
              45deg,
              rgba(56, 189, 248, 0.18) 0px,
              rgba(56, 189, 248, 0.18) 1px,
              transparent 1px,
              transparent 90px
            ),
            repeating-linear-gradient(
              -45deg,
              rgba(125, 211, 252, 0.12) 0px,
              rgba(125, 211, 252, 0.12) 1px,
              transparent 1px,
              transparent 90px
            );
          background-size: 180px 180px;
          animation: gridMove 30s linear infinite;
        }

        @keyframes gridMove {
          from {
            background-position: 0 0, 0 0;
          }
          to {
            background-position: 0 -180px, 0 -180px;
          }
        }

        /* ====== Soft Triangles ====== */
        .tri {
          position: absolute;
          width: 280px;
          height: 280px;
          background: linear-gradient(
            135deg,
            rgba(186, 230, 253, 0.6),
            rgba(224, 242, 254, 0.5),
            rgba(240, 249, 255, 0.35)
          );
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          filter: blur(1px);
          z-index: 0;
        }

        .triA {
          top: 10%;
          left: -6%;
          transform: rotate(-18deg);
          animation: floaty 10s ease-in-out infinite;
          opacity: 10;
        }

        .triB {
          bottom: 12%;
          right: -8%;
          width: 360px;
          height: 360px;
          transform: rotate(25deg);
          opacity: 10;
        }

        .triC {
          top: 45%;
          left: 12%;
          width: 220px;
          height: 220px;
          opacity: 10;
        }

        .triD {
          bottom: 26%;
          right: 35%;
          width: 260px;
          height: 260px;
          opacity: 10;
        }

        @keyframes floaty {
          0% {
            transform: translateY(0) rotate(-18deg);
          }
          50% {
            transform: translateY(-12px) rotate(-16deg);
          }
          100% {
            transform: translateY(0) rotate(-18deg);
          }
        }

        /* ====== Subtle Glow ====== */
        .glowLayer {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(
            circle at 50% 40%,
            rgba(186, 230, 253, 0.35) 0%,
            rgba(224, 242, 254, 0.25) 30%,
            transparent 70%
          );
          animation: glowPulse 8s ease-in-out infinite alternate;
        }

        @keyframes glowPulse {
          from {
            opacity: 0.4;
          }
          to {
            opacity: 0.8;
          }
        }

        /* ====== Content ====== */
        .content {
          position: relative;
          z-index: 0;
          margin: 0;
        }

        /* ====== Responsive ====== */
        @media (max-width: 768px) {
          .tri {
            width: 200px;
            height: 200px;
          }
          .triB {
            width: 260px;
            height: 260px;
          }
        }
      `}</style>
    </div>
  );
}
