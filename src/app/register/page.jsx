"use client";
import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Sparkles } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDarkMode } from '@/lib/DarkModeContext';
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", { username, email, password });

      // ถ้า API ส่ง token มาด้วย เก็บใน localStorage (cookie httpOnly ถูกตั้งจากฝั่ง server แล้ว)
      if (data?.token) {
        try { localStorage.setItem("token", data.token); } catch {}
      }

      const next = searchParams.get("next") || "/";

      await Swal.fire({
        title: "สำเร็จ!",
        text: "สมัครสมาชิกเรียบร้อย กำลังพาเข้าสู่ระบบ...",
        icon: "success",
        background: isDarkMode ? '#1a1a2e' : '#ffffff',
        color: isDarkMode ? '#fff' : '#000',
        confirmButtonColor: '#8b5cf6'
      });

      router.replace(next);
      window.location.assign(next);
    } catch (err) {
      Swal.fire({
        title: "ผิดพลาด!",
        text: err.response?.data?.message || "Register failed",
        icon: "error",
        background: isDarkMode ? '#1a1a2e' : '#ffffff',
        color: isDarkMode ? '#fff' : '#000',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleRegister() {
    try {
      window.location.href = "/api/auth/google?mode=register";
    } catch {
      Swal.fire({
        title: "ผิดพลาด!",
        text: "ไม่สามารถสมัครสมาชิกด้วย Google ได้",
        icon: "error",
        background: isDarkMode ? '#1a1a2e' : '#ffffff',
        color: isDarkMode ? '#fff' : '#000',
        confirmButtonColor: '#ef4444'
      });
    }
  }

  async function handleFacebookRegister() {
    try {
      window.location.href = "/api/auth/facebook?mode=register";
    } catch {
      Swal.fire({
        title: "ผิดพลาด!",
        text: "ไม่สามารถสมัครสมาชิกด้วย Facebook ได้",
        icon: "error",
        background: isDarkMode ? '#1a1a2e' : '#ffffff',
        color: isDarkMode ? '#fff' : '#000',
        confirmButtonColor: '#ef4444'
      });
    }
  }

  const bgGradient = isDarkMode ? "from-slate-900 via-purple-900 to-slate-900" : "from-purple-50 via-pink-50 to-cyan-50";
  const cardBg = isDarkMode ? "bg-white/10 backdrop-blur-lg" : "bg-white/80 backdrop-blur-lg";
  const textColor = isDarkMode ? "text-white" : "text-gray-800";
  const placeholderColor = isDarkMode ? "placeholder-gray-400" : "placeholder-gray-500";
  const borderColor = isDarkMode ? "border-white/20" : "border-gray-200";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={`absolute top-10 left-10 w-72 h-72 ${isDarkMode ? 'bg-purple-500' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-xl ${isDarkMode ? 'opacity-20' : 'opacity-30'} animate-pulse`}></div>
        <div className={`absolute top-60 right-10 w-96 h-96 ${isDarkMode ? 'bg-cyan-500' : 'bg-cyan-300'} rounded-full mix-blend-multiply filter blur-xl ${isDarkMode ? 'opacity-20' : 'opacity-30'} animate-pulse delay-1000`}></div>
        <div className={`absolute bottom-10 left-1/2 w-80 h-80 ${isDarkMode ? 'bg-pink-500' : 'bg-pink-300'} rounded-full mix-blend-multiply filter blur-xl ${isDarkMode ? 'opacity-20' : 'opacity-30'} animate-pulse delay-500`}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-purple-400'} rounded-full ${isDarkMode ? 'opacity-10' : 'opacity-30'} animate-float`}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${3 + Math.random() * 4}s` }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`${cardBg} rounded-3xl shadow-2xl ${isDarkMode ? 'border border-white/20' : 'border border-gray-200/50'} p-8 transform transition-all duration-500 hover:scale-105`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className={`text-3xl font-bold ${textColor} mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent`}>สมัครสมาชิก</h1>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>เข้าร่วมกับเราวันนี้</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Username */}
            <div className="relative group">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'username' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                className={`w-full pl-10 pr-4 py-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50/80'} border ${borderColor} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100/80'}`}
              />
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transform transition-all duration-300 ${focusedField === 'username' ? 'scale-x-100' : 'scale-x-0'}`} />
            </div>

            {/* Email */}
            <div className="relative group">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                className={`w-full pl-10 pr-4 py-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50/80'} border ${borderColor} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100/80'}`}
              />
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transform transition-all duration-300 ${focusedField === 'email' ? 'scale-x-100' : 'scale-x-0'}`} />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                className={`w-full pl-10 pr-12 py-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50/80'} border ${borderColor} rounded-xl ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100/80'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-500 hover:text-purple-500'} transition-colors duration-300`}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transform transition-all duration-300 ${focusedField === 'password' ? 'scale-x-100' : 'scale-x-0'}`} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังสมัคร...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    สมัครสมาชิก
                  </>
                )}
              </div>
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </button>
          </form>

          {/* Social Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-3 bg-transparent ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>หรือสมัครด้วย</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* Google */}
              <button
                onClick={handleGoogleRegister}
                className={`w-full inline-flex justify-center py-3 px-4 border ${isDarkMode ? 'border-white/20' : 'border-gray-200'} rounded-xl shadow-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/70 hover:bg-white/90'} text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-all duration-300 backdrop-blur-sm group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </div>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookRegister}
                className={`w-full inline-flex justify-center py-3 px-4 border ${isDarkMode ? 'border-white/20' : 'border-gray-200'} rounded-xl shadow-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/70 hover:bg-white/90'} text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-all duration-300 backdrop-blur-sm group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </div>
              </button>
            </div>
          </div>

          {/* Legal */}
          <div className="mt-6 text-center">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>
              การสมัครสมาชิกแสดงว่าคุณยอมรับ{" "}
              <a href="/terms" className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'} transition-colors duration-300 underline`}>
                เงื่อนไขการใช้งาน
              </a>{" "}
              และ{" "}
              <a href="/privacy" className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'} transition-colors duration-300 underline`}>
                นโยบายความเป็นส่วนตัว
              </a>
            </p>
          </div>

          {/* Footer link */}
          <div className="mt-8 text-center">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              มีบัญชีอยู่แล้ว?{" "}
              <a href="/login" className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'} transition-colors duration-300 underline decoration-wavy`}>
                เข้าสู่ระบบ
              </a>
            </p>
          </div>
        </div>

        {/* Decoration blobs */}
        <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full ${isDarkMode ? 'opacity-20' : 'opacity-30'} blur-xl animate-bounce`} />
        <div className={`absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full ${isDarkMode ? 'opacity-20' : 'opacity-30'} blur-xl animate-bounce delay-1000`} />
      </div>

      <style jsx>{`
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0)} 33%{transform:translateY(-10px) rotate(120deg)} 66%{transform:translateY(5px) rotate(240deg)} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes gradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .animate-gradient { background-size:400% 400%; animation: gradient 3s ease infinite; }
      `}</style>
    </div>
  );
}
