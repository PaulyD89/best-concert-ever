import { useState } from "react";
import Image from "next/image";

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleUnsubscribe = async () => {
    const res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 py-12">
      {/* Logo at top */}
      <div className="mb-6">
        <Image
          src="/fullsquarelogo.jpg" // make sure this is in your /public folder
          alt="Best Concert Ever Logo"
          width={100}
          height={100}
          className="rounded-full shadow-lg"
        />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-green-400">Unsubscribe from Best. Concert. Ever.</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-black border border-green-500 text-white placeholder-green-500 rounded-md px-4 py-3 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <button
        onClick={handleUnsubscribe}
        className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-6 rounded-full transition"
      >
        Unsubscribe
      </button>

      {status === "success" && <p className="mt-6 text-green-400">✅ You’ve been unsubscribed.</p>}
      {status === "error" && <p className="mt-6 text-red-500">⚠️ Something went wrong. Try again later.</p>}
    </div>
  );
}
