export default function LegalTopbar() {
  return (
    <header className="
      flex
      items-center
      justify-between
      rounded-3xl
      border
      border-white/10
      bg-white/5
      backdrop-blur-xl
      px-8
      py-5
    ">

      <div>

        <h1 className="text-2xl font-bold">
          AilaLegal AI
        </h1>


        <p className="text-sm text-gray-400">
          AI Legal Intelligence Workspace
        </p>

      </div>



      <div className="flex items-center gap-3">

        <div className="
          h-12
          w-12
          rounded-full
          bg-gradient-to-r
          from-cyan-400
          to-purple-500
        "/>


        <div>

          <p className="font-semibold">
            Aila Intelligence
          </p>

          <p className="text-xs text-gray-400">
            Online
          </p>

        </div>


      </div>


    </header>
  );
}