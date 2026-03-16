import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = () => {
    if (!login || !password) {
      alert("Login va parolni kiriting");
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop"
          alt="office"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center justify-center bg-[#f5f5fa] px-6">
        <h1 className="text-5xl font-semibold text-gray-500 mb-12">
          Najot Talim
        </h1>

        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-lg p-10">
          <h2 className="text-4xl font-bold mb-6">Tizimga kirish</h2>

          {success && (
            <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-xl text-center">
              Muvaffaqiyatli kirdingiz
            </div>
          )}

          <div className="mb-6">
            <label className="block mb-2 text-lg font-medium">Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Loginni kiriting"
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-green-500"
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-lg font-medium">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting"
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-green-500"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-2xl font-semibold cursor-pointer"
          >
            Kirish
          </button>
        </div>
      </div>
    </div>
  );
}
