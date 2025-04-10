import React, { useState } from 'react';
import axios from 'axios';

interface Scholarship {
  name: string;
  description: string;
  deadline: string;
  amount: string;
  location: string;
  application_link: string;
}

export default function InternationalScholarships() {
  const [criteria, setCriteria] = useState({
    year: '',
  });

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/find_international_scholarships', {
        year: criteria.year,
      });
      
      console.log("Response from server:", response.data);
      setScholarships(response.data.matching_scholarships || []);
    } catch (error: any) {
      console.error('Error fetching scholarships:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch scholarships';
      setError(`Error: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Find International Scholarships
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filter Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="space-y-6">
                <div>
                  <label style={{ backgroundColor: 'white', color: 'BLack' }} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Academic Level
                  </label>
                  <select style={{ backgroundColor: 'white', color: 'BLack' }}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
                    value={criteria.year}
                    onChange={(e) => setCriteria({ ...criteria, year: e.target.value })}
                  >
                    <option style={{ backgroundColor: 'white', color: 'BLack' }} value="">Select Academic Level</option>
                    <option style={{ backgroundColor: 'white', color: 'BLack' }} value="High school senior">High School Senior</option>
                    <option style={{ backgroundColor: 'white', color: 'BLack' }} value="College freshman">College Freshman</option>
                    <option style={{ backgroundColor: 'white', color: 'BLack' }} value="College sophomore">College Sophomore</option>
                    <option style={{ backgroundColor: 'white', color: 'BLack' }} value="College junior">College Junior</option>
                    <option style={{ backgroundColor: 'white', color: 'BLack' }} value="College senior">College Senior</option>
                    <option style={{ backgroundColor: 'white', color: 'BLack' }} value="Master's-level study">Master's Level</option>
                    <option value="Doctoral-level study">Doctoral Level</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Finding..." : "Find Scholarships"}
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {loading && <p className="text-indigo-600 dark:text-indigo-400">Searching scholarships...</p>}
              
              {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

              {!loading && scholarships.length === 0 && !error && (
                <p className="text-gray-500 dark:text-gray-400">No scholarships found. Try adjusting your criteria.</p>
              )}

              {scholarships.map((scholarship, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {scholarship.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {scholarship.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scholarship.location && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {scholarship.location}
                      </span>
                    )}
                    {scholarship.deadline && scholarship.deadline !== 'N/A' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Deadline: {scholarship.deadline}
                      </span>
                    )}
                    {scholarship.amount && scholarship.amount !== 'N/A' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Amount: {scholarship.amount}
                      </span>
                    )}
                  </div>
                  <a
                    href={scholarship.application_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
