"use client";

import { motion } from "framer-motion";

export default function HeroPortal() {
  return (
    <div className="relative flex h-[720px] w-[720px] items-center justify-center">

      {/* Outer Ring */}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 45,
          ease: "linear",
        }}
        className="absolute h-[700px] w-[700px] rounded-full border border-[#8d5bff]/20"
      />

      {/* Second Ring */}

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
        className="absolute h-[620px] w-[620px] rounded-full border border-[#d6b36b]/20"
      />

      {/* Third Ring */}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
        className="absolute h-[520px] w-[520px] rounded-full border border-white/10"
      />

      {/* Energy */}

      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.55, 0.9, 0.55],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
        }}
        className="absolute h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(109,60,255,.35),transparent_72%)] blur-[90px]"
      />

      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
        }}
        className="absolute h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(214,179,107,.18),transparent_75%)] blur-[70px]"
      />

      {/* Logo */}

      <motion.div
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
        }}
        className="relative z-20"
      >

        <h1 className="select-none bg-gradient-to-b from-white via-[#f4deb0] to-[#8d5bff] bg-clip-text text-[17rem] font-black leading-none text-transparent">

          A

        </h1>

      </motion.div>

    </div>
  );
}