import { useState, useEffect } from "react";
import { CarController } from "./components/CarController";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "user" && password === "1234") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md p-8 border border-white/5 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 shadow-xl">
          <h1 className="mb-6 font-bold text-gray-100 text-2xl text-center">
            IoT Car Controller
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block mb-1 text-gray-400 text-sm"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-white/10 focus:border-blue-500 rounded-lg focus:outline-none bg-slate-900/50 text-gray-100 placeholder-gray-500"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-gray-400 text-sm"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-white/10 focus:border-blue-500 rounded-lg focus:outline-none bg-slate-900/50 text-gray-100 placeholder-gray-500"
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-linear-to-br from-blue-500 hover:from-blue-400 to-blue-600 hover:to-blue-500 font-medium text-white active:scale-95 transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <CarController />
    </div>
  );
}

export default App;
