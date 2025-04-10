import React, { useState } from 'react';
import axios from 'axios';
import { IndianScholarshipCriteria } from '../types';
import ScholarshipCard from '../components/ScholarshipCard';

export default function IndianScholarships() {
  const [criteria, setCriteria] = useState<IndianScholarshipCriteria>({
    education: '',
    qualification: '',
    gender: '',
    community: '',
    religion: '',
    isExServiceman: false,
    hasDisability: false,
    hasSportsAchievements: false,
    annualPercentage: null,
    income: null,
  });

  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!criteria.education) {
      setError('Please select an education level');
      return false;
    }
    if (!criteria.gender) {
      setError('Please select a gender');
      return false;
    }
    if (criteria.annualPercentage !== null && (criteria.annualPercentage < 0 || criteria.annualPercentage > 100)) {
      setError('Annual percentage must be between 0 and 100');
      return false;
    }
    if (criteria.income !== null && criteria.income < 0) {
      setError('Annual income cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
  
    const formattedData = {
      education: criteria.education,
      gender: criteria.gender,
      community: criteria.community || undefined,
      religion: criteria.religion || undefined,
      isExServiceman: criteria.isExServiceman,
      hasDisability: criteria.hasDisability,
      hasSportsAchievements: criteria.hasSportsAchievements,
      annualPercentage: criteria.annualPercentage || undefined,
      income: criteria.income || undefined
    };

    console.log("Sending data to Flask:", formattedData); // Debugging

    try {
      const response = await axios.post('http://localhost:5000/find_indian_scholarships', formattedData);
      console.log("Response from server:", response.data);  // Debug log
      setScholarships(response.data.matching_scholarships || []);
      if (response.data.matching_scholarships?.length === 0) {
        setError('No scholarships found matching your criteria. Try adjusting your search.');
      }
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
          Find Indian Scholarships
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filter Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-md">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Education Level
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                    value={criteria.education}
                    onChange={(e) => setCriteria({ ...criteria, education: e.target.value })}
                  >
                    <option value="">Select Education Level</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="PhD">PhD</option>  
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gender
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                    value={criteria.gender}
                    onChange={(e) => setCriteria({ ...criteria, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Community
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                    value={criteria.community}
                    onChange={(e) => setCriteria({ ...criteria, community: e.target.value })}
                  >
                    <option value="">Select Community</option>
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="Minority">Minority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Religion
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                    value={criteria.religion}
                    onChange={(e) => setCriteria({ ...criteria, religion: e.target.value })}
                  >
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Annual Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter your percentage"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                    value={criteria.annualPercentage || ''}
                    onChange={(e) => setCriteria({ ...criteria, annualPercentage: e.target.value ? Number(e.target.value) : null })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter your Annual Percentage (e.g., if you have 95%, you'll see scholarships requiring 95% or less). 
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Annual Family Income (in Lakhs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Enter your family income in Lakhs"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                    value={criteria.income || ''}
                    onChange={(e) => setCriteria({ ...criteria, income: e.target.value ? Number(e.target.value) : null })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter your annual family income in Lakhs (e.g., 1.5 for 1.5 Lakhs). 
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-700 dark:bg-black text-indigo-600 focus:ring-indigo-500"
                      checked={criteria.isExServiceman}
                      onChange={(e) => setCriteria({ ...criteria, isExServiceman: e.target.checked })}
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Ex-Serviceman
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-700 dark:bg-black text-indigo-600 focus:ring-indigo-500"
                      checked={criteria.hasDisability}
                      onChange={(e) => setCriteria({ ...criteria, hasDisability: e.target.checked })}
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Person with Disability
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-700 dark:bg-black text-indigo-600 focus:ring-indigo-500"
                      checked={criteria.hasSportsAchievements}
                      onChange={(e) => setCriteria({ ...criteria, hasSportsAchievements: e.target.checked })}
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Sports Achievement
                    </label>
                  </div>
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
              
              {!loading && scholarships.length === 0 && !error && (
                <p className="text-gray-500 dark:text-gray-400">No scholarships found. Try adjusting your criteria.</p>
              )}

              {scholarships.map((scholarship, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {scholarship.scholarship_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {scholarship.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {scholarship.location}
                    </span>
                    {scholarship.deadline !== 'N/A' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Deadline: {scholarship.deadline}
                      </span>
                    )}
                    {scholarship.amount !== 'N/A' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Amount: {scholarship.amount}
                      </span>
                    )}
                  </div>
                  <a
                    href={scholarship.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Learn More
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