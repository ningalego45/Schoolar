import React, { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

type Page = 'signin' | 'signup' | 'contact' | 'indian-scholarships' | 'international-scholarships';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true"; 
  });

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = () => {
      const isAuth = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(isAuth);
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-50 shadow-md border-b border-gray-300 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="ScholarMatch Logo" className="h-8 w-auto mr-2" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/indian-scholarships" 
              className={`nav-link ${currentPage === 'indian-scholarships' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
              onClick={() => setCurrentPage('indian-scholarships')}
            >
              Find Indian Scholarships
            </Link>
            <Link 
              to="/international-scholarships" 
              className={`nav-link ${currentPage === 'international-scholarships' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
              onClick={() => setCurrentPage('international-scholarships')}
            >
              Find International Scholarships
            </Link>

            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="nav-link text-red-600 dark:text-red-400"
              >
                Log-Out
              </button>
            ) : (
              <Link 
                to="/sign-in" 
                className={`nav-link ${currentPage === 'signin' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
                onClick={() => setCurrentPage('signin')}
              >
                Sign-In
              </Link>
            )}

            <Link 
              to="/contact" 
              className={`nav-link ${currentPage === 'contact' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
              onClick={() => setCurrentPage('contact')}
            >
              Contact
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link 
              to="/indian-scholarships" 
              className={`mobile-nav-link ${currentPage === 'indian-scholarships' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
              onClick={() => setCurrentPage('indian-scholarships')}
            >
              Find Indian Scholarships
            </Link>
            <Link 
              to="/international-scholarships" 
              className={`mobile-nav-link ${currentPage === 'international-scholarships' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
              onClick={() => setCurrentPage('international-scholarships')}
            >
              Find International Scholarships
            </Link>
            <Link 
              to="/contact" 
              className={`mobile-nav-link ${currentPage === 'contact' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
              onClick={() => setCurrentPage('contact')}
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                Log-Out
              </button>
            ) : (
              <Link 
                to="/sign-in" 
                className={`mobile-nav-link ${currentPage === 'signin' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}
                onClick={() => setCurrentPage('signin')}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}