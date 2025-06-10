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
      {/* Graphic */}
      <div className="mb-8">
        <Image
          src="/unsubgraphic.png"
          alt="Sad promoter with broken guitar"
          width={360}
          height={360}
          className="rounded-md shadow-xl"
          priority
        />
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-bold mb-2 text-[#ffee33] drop-shadow-sm text-center">
        You want to unsubscribe from
      </h1>
      <h2 className="text-4xl font-extrabold text-[#ff66cc] mb-6 uppercase text-center tracking-tight">
        Best. Concert. Ever.?
      </h2>

      {/* Subtext */}
      <p className="text-sm text-gray-400 italic mb-8 text-center">
        We're not crying... you're crying. 💔
      </p>

      {/* Input */}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-black border border-[#ffee33] text-white placeholder-[#ffee33] rounded-md px-4 py-3 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#ff66cc]"
      />

      {/* Button */}
      <button
        onClick={handleUnsubscribe}
        className="bg-[#ff66cc] hover:bg-[#ff85d1] text-black font-bold py-2 px-6 rounded-full transition-all duration-200 shadow-md"
      >
        Unsubscribe
      </button>

      {/* Feedback */}
     {status === "success" && (
  <p className="mt-6 text-[#ffee33] font-semibold text-center">
    👻 You've officially ghosted us. No hard feelings.
  </p>
)}
      {status === "error" && (
        <p className="mt-6 text-red-500 font-semibold text-center">
          ⚠️ Something went wrong. Try again later.
        </p>
      )}
    </div>
  );
}
