'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import { useEffect, useState, useCallback } from 'react';
import { useDarkMode } from '@/lib/DarkModeContext';

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload =
      typeof window !== 'undefined'
        ? decodeURIComponent(
            atob(base64)
              .split('')
              .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join('')
          )
        : '';
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Navbar() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const readUserFromStorage = useCallback(() => {
    try {
      const t = localStorage.getItem('token');
      if (!t) {
        setUser(null);
        return;
      }
      const payload = decodeJwt(t);
      if (payload) {
        setUser({
          id: payload.id,
          email: payload.email,
          username: payload.username,
          role: payload.role,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // initial read
    readUserFromStorage();

    // listen cross-tab changes
    const onStorage = (e) => {
      if (e.key === 'token') readUserFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [readUserFromStorage]);

  // Trigger animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('token');
    } catch {}
    setUser(null);
    await Swal.fire({
      title: 'ออกจากระบบแล้ว',
      icon: 'success',
      timer: 1200,
      showConfirmButton: false,
      background: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#fff' : '#111827',
    });
    router.push('/login');
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        className={`navbar-container ${isVisible ? 'navbar-visible' : ''} ${isScrolled ? 'navbar-scrolled' : ''}`}
        sx={{
          background: isScrolled 
            ? (isDarkMode 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)')
            : 'transparent',
          color: isDarkMode ? 'white' : 'black',
          borderBottom: isDarkMode
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.1)',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          backdropFilter: 'blur(20px)',
          boxShadow: isScrolled 
            ? (isDarkMode 
                ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                : '0 8px 32px rgba(0, 0, 0, 0.1)')
            : 'none',
        }}
      >
        <Toolbar className="container mx-auto flex gap-2 navbar-toolbar">
          <div className="flex items-center gap-3 mr-auto navbar-item navbar-item-1">
            <Link
              href="/"
              className="navbar-logo group font-bold text-2xl flex items-center gap-2"
            >
              <div className="logo-icon group cursor-pointer">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${
                    isDarkMode
                      ? 'from-gray-700 via-blue-800 to-gray-800'
                      : 'from-blue-100 via-orange-100 to-blue-200'
                  } rounded-full flex items-center justify-center shadow-md relative overflow-hidden backdrop-blur-md`}
                >
                  {/* Sun */}
                  <div
                    className={`absolute top-1 right-2 w-4 h-4 bg-gradient-to-br ${
                      isDarkMode
                        ? 'from-yellow-400 to-orange-400'
                        : 'from-orange-300 to-orange-500'
                    } rounded-full sun-icon`}
                  />
                  {/* Cloud */}
                  <div
                    className={`w-6 h-4 bg-gradient-to-br ${
                      isDarkMode ? 'from-gray-400 to-gray-500' : 'from-blue-200 to-blue-300'
                    } rounded-full relative cloud-icon`}
                  >
                    <div
                      className={`absolute -top-1 left-1 w-3 h-3 bg-gradient-to-br ${
                        isDarkMode ? 'from-gray-400 to-gray-500' : 'from-blue-200 to-blue-300'
                      } rounded-full`}
                    />
                    <div
                      className={`absolute -top-1 right-1 w-2 h-2 bg-gradient-to-br ${
                        isDarkMode ? 'from-gray-400 to-gray-500' : 'from-blue-200 to-blue-300'
                      } rounded-full`}
                    />
                  </div>
                  {/* Rain drops */}
                  <div
                    className={`absolute bottom-1 left-2 w-1 h-2 ${
                      isDarkMode ? 'bg-blue-300' : 'bg-blue-400'
                    } rounded-full opacity-70 rain-drop rain-drop-1`}
                  />
                  <div
                    className={`absolute bottom-1 right-3 w-1 h-2 ${
                      isDarkMode ? 'bg-blue-300' : 'bg-blue-400'
                    } rounded-full opacity-70 rain-drop rain-drop-2`}
                  />
                </div>
              </div>
              <span
                className={`bg-gradient-to-r ${
                  isDarkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
                } bg-clip-text text-transparent logo-text`}
              >
                SMART-DEPART
              </span>
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center mr-2 navbar-item navbar-item-2">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center ${
                isDarkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100/50 hover:bg-gray-200/50'
              } rounded-full p-1 backdrop-blur-md dark-mode-toggle`}
              type="button"
            >
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 mode-option ${
                  !isDarkMode
                    ? 'bg-yellow-400 text-gray-800 shadow-md mode-active'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                ☀️
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 mode-option ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white shadow-md mode-active' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🌙
              </div>
            </button>
          </div>

          <div className="navbar-item navbar-item-3">
            <Link href="/smart-depart">
              <Button
                className="nav-button"
                sx={{
                  color: isDarkMode ? 'white' : 'inherit',
                  backdropFilter: 'blur(10px)',
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  mr: 1,
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode 
                      ? '0 8px 25px rgba(255,255,255,0.1)' 
                      : '0 8px 25px rgba(0,0,0,0.1)',
                  },
                }}
              >
                การเดินทางอัฉริยะ
              </Button>
            </Link>
          </div>

          {/* Auth Area */}
          {user ? (
            <>
              <div className="navbar-item navbar-item-4">
                <Link href="/user">
                  <Button
                    className="nav-button"
                    sx={{
                      color: isDarkMode ? 'white' : 'inherit',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      mr: 1,
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: isDarkMode 
                          ? '0 8px 25px rgba(255,255,255,0.1)' 
                          : '0 8px 25px rgba(0,0,0,0.1)',
                      },
                    }}
                    title={user.email || user.username}
                  >
                    {user.username ?? 'บัญชีผู้ใช้'}
                  </Button>
                </Link>
              </div>

              <div className="navbar-item navbar-item-5">
                <Button
                  onClick={handleLogout}
                  className="logout-button"
                  sx={{
                    color: '#fff',
                    backgroundColor: '#0051ff',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    '&:hover': { 
                      backgroundColor: '#dc2626',
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)',
                    },
                  }}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="navbar-item navbar-item-4">
                <Link href="/login">
                  <Button
                    className="nav-button"
                    sx={{
                      color: isDarkMode ? 'white' : 'inherit',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      mr: 1,
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: isDarkMode 
                          ? '0 8px 25px rgba(255,255,255,0.1)' 
                          : '0 8px 25px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    Login
                  </Button>
                </Link>
              </div>
              <div className="navbar-item navbar-item-5">
                <Link href="/register">
                  <Button
                    variant="outlined"
                    className="register-button"
                    sx={{
                      color: isDarkMode ? 'white' : 'inherit',
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                        transform: 'translateY(-2px)',
                        boxShadow: isDarkMode 
                          ? '0 8px 25px rgba(255,255,255,0.1)' 
                          : '0 8px 25px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Toolbar>
      </AppBar>

      <style jsx>{`
        /* Navbar Container Animation */
        .navbar-container {
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .navbar-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .navbar-scrolled {
          transform: translateY(0) !important;
        }
        
        /* Stagger Animation for Items */
        .navbar-toolbar .navbar-item {
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .navbar-visible .navbar-item-1 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.1s;
        }
        
        .navbar-visible .navbar-item-2 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.2s;
        }
        
        .navbar-visible .navbar-item-3 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.3s;
        }
        
        .navbar-visible .navbar-item-4 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.4s;
        }
        
        .navbar-visible .navbar-item-5 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.5s;
        }
        
        /* Logo Animations */
        .navbar-logo {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .navbar-logo:hover {
          transform: scale(1.05);
        }
        
        .logo-icon {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .logo-icon:hover {
          transform: scale(1.1);
        }
        
        .logo-icon:hover .sun-icon {
          animation: spin 2s linear infinite;
          transform: scale(1.1);
        }
        
        .logo-icon:hover .cloud-icon {
          transform: translateX(2px);
        }
        
        .logo-icon:hover .rain-drop {
          animation: bounce 0.6s ease-in-out infinite;
        }
        
        .rain-drop-2 {
          animation-delay: 0.2s;
        }
        
        .logo-text {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .navbar-logo:hover .logo-text {
          background: linear-gradient(45deg, #8b5cf6, #ec4899, #f59e0b);
          -webkit-background-clip: text;
          background-clip: text;
          letter-spacing: 1px;
        }
        
        /* Dark Mode Toggle */
        .dark-mode-toggle {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .dark-mode-toggle:hover {
          transform: scale(1.05);
        }
        
        .mode-option {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .mode-active {
          transform: scale(1.05);
        }
        
        /* Button Animations */
        .nav-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .nav-button:hover {
          transform: translateY(-2px) scale(1.02);
        }
        
        .nav-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }
        
        .nav-button:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .logout-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .logout-button:hover {
          transform: translateY(-2px) scale(1.05);
        }
        
        .register-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .register-button:hover {
          transform: translateY(-2px) scale(1.02);
        }
        
        /* Keyframes */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        /* Ripple Effect */
        .nav-button:active::after,
        .logout-button:active::after,
        .register-button:active::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}