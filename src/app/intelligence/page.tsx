import Sidebar from "../components/intelligence/Sidebar";
import ChatWindow from "../components/intelligence/ChatWindow";
import AilaOrb from "../components/intelligence/AilaOrb";
import PromptCards from "../components/intelligence/PromptCards";

export default function IntelligencePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex flex-1 flex-col">

          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">

            <div className="flex items-center justify-between px-10 py-6">

              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-cyan-400">
                  AILA Intelligence
                </p>

                <h1 className="mt-2 text-4xl font-black">
                  Welcome Back
                </h1>
              </div>

              <AilaOrb />

            </div>

          </header>

          <div className="flex flex-1 flex-col gap-8 p-10">
            <PromptCards />
            <ChatWindow />
          </div>

        </section>
      </div>
    </main>
  );
}
