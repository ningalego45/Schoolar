import React from 'react';
import { Search, GraduationCap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Assistant from '../components/Assistant';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Find Your Perfect</span>
              <span className="block text-indigo-600 dark:text-indigo-400">Scholarship Match</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover scholarships tailored to your profile. Your educational journey starts here.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <Link
                to="/indian-scholarships"
                className="rounded-md shadow px-8 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Find Your Scholarship
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Assistant Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ask Our Scholarship Assistant
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Get instant help finding the right scholarships for you
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Assistant />
        </div>
      </div>

      {/* Quick Search */}
      

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <Link
            to="/indian-scholarships"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Indian Scholarships
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Find scholarships based on your education, community, and other criteria
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/international-scholarships"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  International Scholarships
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Explore global opportunities for higher education
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}