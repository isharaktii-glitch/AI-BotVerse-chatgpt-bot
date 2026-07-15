export default function Home() {
  return (
    <div className="min-h-screen bg-botverse-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold mb-4">
        <span className="text-botverse-green">Bot</span>
        <span className="text-botverse-pink">Verse</span>
      </h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        AI-powered WhatsApp, Facebook &amp; Instagram auto-reply bots for your business.
      </p>
      <div className="flex gap-4">
        <a href="/register" className="bg-botverse-green text-black px-6 py-3 rounded-lg font-semibold">
          Get Started
        </a>
        <a href="/login" className="border border-botverse-blue text-botverse-blue px-6 py-3 rounded-lg font-semibold">
          Login
        </a>
      </div>
    </div>
  );
}
