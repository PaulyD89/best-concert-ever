import { useState } from "react";

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
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-black p-6">
      <h1 className="text-2xl font-bold mb-4">Unsubscribe from Best. Concert. Ever.</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 text-black rounded-md mb-4 w-full max-w-sm"
      />
      <button
        onClick={handleUnsubscribe}
        className="bg-red-600 px-6 py-2 rounded-full font-bold text-white hover:bg-red-700"
      >
        Unsubscribe
      </button>
      {status === "success" && <p className="mt-4 text-green-400">You’ve been unsubscribed.</p>}
      {status === "error" && <p className="mt-4 text-red-400">Something went wrong. Try again later.</p>}
    </div>
  );
}
