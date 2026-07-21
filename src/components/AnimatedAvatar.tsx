"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedAvatarProps {
  speaking?: boolean;
  listening?: boolean;
}

export default function AnimatedAvatar({
  speaking = false,
  listening = false,
}: AnimatedAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#1a1a2e");
      bg.addColorStop(0.5, "#16213e");
      bg.addColorStop(1, "#0f3460");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 - 40;
      const radius = 70;

      const breath = 1 + Math.sin(frame * 0.02) * 0.03;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(breath, breath);

      // Head
      const skin = ctx.createRadialGradient(0, -20, 20, 0, 0, radius);
      skin.addColorStop(0, "#f5d5b8");
      skin.addColorStop(0.6, "#e8c4a0");
      skin.addColorStop(1, "#d4a574");

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = "#2a1a1a";
      ctx.beginPath();
      ctx.ellipse(0, -45, 75, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      const eyeY = -15;
      const eyeSpace = 28;
      const irisOffset = Math.sin(frame * 0.03) * 4;

      if (!blinking) {
        ctx.fillStyle = "#fff";

        ctx.beginPath();
        ctx.ellipse(-eyeSpace, eyeY, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(eyeSpace, eyeY, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#4a3728";

        ctx.beginPath();
        ctx.arc(-eyeSpace + irisOffset, eyeY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeSpace + irisOffset, eyeY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";

        ctx.beginPath();
        ctx.arc(-eyeSpace + irisOffset + 2, eyeY - 2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeSpace + irisOffset + 2, eyeY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#4b352b";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-eyeSpace - 10, eyeY);
        ctx.lineTo(-eyeSpace + 10, eyeY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(eyeSpace - 10, eyeY);
        ctx.lineTo(eyeSpace + 10, eyeY);
        ctx.stroke();
      }

      // Nose
      ctx.fillStyle = "#d4a574";
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(-4, 10);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fill();

      // Mouth
      const mouth = speaking
        ? Math.sin(frame * 0.08) * 0.5 + 0.5
        : 0;

      ctx.strokeStyle = "#8b4545";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.ellipse(0, 25, 22, 8 + mouth * 6, 0, 0, Math.PI);
      ctx.stroke();

      if (speaking && mouth > 0.3) {
        ctx.fillStyle = "rgba(200,100,100,0.3)";
        ctx.beginPath();
        ctx.ellipse(0, 25, 22, 8 + mouth * 6, 0, 0, Math.PI);
        ctx.fill();
      }

      ctx.restore();

      // Ring
      if (speaking || listening) {
        ctx.shadowColor = speaking
          ? "rgba(201,168,76,0.5)"
          : "rgba(6,182,212,0.5)";
        ctx.shadowBlur = 30;

        ctx.strokeStyle = speaking
          ? "rgba(201,168,76,0.4)"
          : "rgba(6,182,212,0.4)";

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      frame++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speaking, listening, blinking]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 320,
          height: 400,
          overflow: "hidden",
          borderRadius: "50%",
          border: speaking
            ? "2px solid #c9a84c"
            : "2px solid rgba(201,168,76,0.3)",
          boxShadow: speaking
            ? "0 0 40px rgba(201,168,76,0.5)"
            : "0 0 60px rgba(6,182,212,0.2)",
          transition: "all .4s ease",
        }}
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={400}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>
    </motion.div>
  );
}