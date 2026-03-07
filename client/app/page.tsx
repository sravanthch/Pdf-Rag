import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0c]">
      {/* Sidebar / Upload Section */}
      <div className="w-full md:w-[350px] lg:w-[400px] border-b md:border-b-0 md:border-r border-[#27272a] p-6 flex flex-col gap-8 bg-[#0d0d0f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white text-xl">P</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">PDF Insight</h1>
            <p className="text-xs text-[#a1a1aa]">Intelligent RAG System</p>
          </div>
        </div>

        <div className="flex-1">
          <FileUploadComponent />

          <div className="mt-8">
            <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-4 px-1">How it works</h3>
            <ul className="space-y-3">
              {[
                { step: 1, text: "Upload your PDF document" },
                { step: 2, text: "AI indexes the content safely" },
                { step: 3, text: "Ask questions and get answers" }
              ].map((item) => (
                <li key={item.step} className="flex gap-3 text-sm text-[#e4e4e7] bg-[#18181b] p-3 rounded-xl border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">{item.step}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-300 font-medium">Using Qdrant Vector Store</p>
          <p className="text-[10px] text-[#71717a] mt-1">High-performance similarity search for your documents.</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-100px)] md:h-screen">
        <ChatComponent />
      </div>
    </main>
  );
}
