import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import JobCard from '../../Components/JobCard/JobCard'; // Adjust the import path as needed

interface Job {
  location: string;
  country: string;
  role: string;
  jobFunctions: string[];
  remoteEligible: boolean;
  name: string;
  sourceSystemId: number;
  updatedAt: string;
}

interface ThoughtworksProps {
  selectedCompany: string | null; // Prop for the selected company
}

const Thoughtworks: React.FC<ThoughtworksProps> = ({ selectedCompany }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [jobFunctions, setJobFunctions] = useState<string[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedJobFunction, setSelectedJobFunction] = useState<string>('');
  const [selectedRemoteEligible, setSelectedRemoteEligible] = useState<boolean | null>(null);

  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jobsPerPage] = useState<number>(10); // Jobs per page

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null); // Manage selection state

  // Fetch data based on selected company
  const fetchData = async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      const res = await axios.get(`/rest/careers/jobs`); // Update API endpoint as necessary
      const data = res.data;

      if (data.jobs && data.countriesLocationsMap && data.jobFunctionsRolesMap) {
        setJobs(data.jobs);

        // Populate dropdown options
        setCountries(['All Countries', ...Object.keys(data.countriesLocationsMap)]);
        setJobFunctions(['All Job Functions', ...Object.keys(data.jobFunctionsRolesMap)]);
      } else {
        setError('Invalid data format received from API');
      }
    } catch (err) {
      setError('Error fetching jobs data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs
  useEffect(() => {
    const filterJobs = () => {
      const filtered = jobs.filter((job) => {
        const countryMatch = selectedCountry && selectedCountry !== 'All Countries' ? job.country === selectedCountry : true;
        const jobFunctionMatch = selectedJobFunction && selectedJobFunction !== 'All Job Functions'
          ? job.jobFunctions.includes(selectedJobFunction)
          : true;
        const remoteEligibleMatch =
          selectedRemoteEligible !== null ? job.remoteEligible === selectedRemoteEligible : true;

        return countryMatch && jobFunctionMatch && remoteEligibleMatch;
      });

      setFilteredJobs(filtered);
      setCurrentPage(1); // Reset to first page after filtering
    };

    filterJobs();
  }, [jobs, selectedCountry, selectedJobFunction, selectedRemoteEligible]);

  useEffect(() => {
    fetchData();
  }, [selectedCompany]); // Fetch data again if the selected company changes

  // Pagination Logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  // Toggle job details visibility
  const handleToggleDetails = (jobId: string) => {
    setSelectedJobId((prevId) => (prevId === jobId ? null : jobId)); // Toggle selected job ID
  };

  return (
    <div className="container mx-auto">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {/* Filters */}
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                <div className="flex flex-col mb-4">
                    <label htmlFor="country" className="flex flex-col md:mb-0">
                        Country:
                    </label>
                    <Select
                        id="country"
                        options={countries.map((country) => ({ label: country, value: country }))}
                        onChange={(selectedOption) =>
                        setSelectedCountry(selectedOption ? selectedOption.value : '')
                        }
                        placeholder="Select Country"
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
                <div className="flex flex-col mb-4">
                    <label htmlFor="jobFunction" className="flex flex-col md:mb-0">
                        Job Function:
                    </label>
                    <Select
                        id="jobFunction"
                        options={jobFunctions.map((func) => ({ label: func, value: func }))}
                        onChange={(selectedOption) =>
                        setSelectedJobFunction(selectedOption ? selectedOption.value : '')
                        }
                        placeholder="Select Job Function"
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
                <div className="flex flex-col mb-4">
                    <label htmlFor="remoteEligible" className="flex flex-col md:mb-0">
                        Remote Eligible:
                    </label>
                    <Select
                        id="remoteEligible"
                        options={[
                        { label: 'All', value: null },
                        { label: 'Yes', value: true },
                        { label: 'No', value: false },
                        ]}
                        onChange={(selectedOption) =>
                        setSelectedRemoteEligible(selectedOption ? selectedOption.value : null)
                        }
                        placeholder="Select Remote Eligibility"
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
            </div>

          {/* Job List */}
          <ul>
            {currentJobs.map((job) => (
              <li key={job.sourceSystemId}>
                <JobCard
                  job={{
                    title: job.name,
                    id_icims: job.sourceSystemId.toString(),
                    posted_date: job.updatedAt,
                    job_path: job.sourceSystemId.toString(), // Update with actual job path if available
                    normalized_location: job.location || 'Remote',
                    basic_qualifications: '',
                    description: '',
                    preferred_qualifications: '',
                    responsibilities: '',
                  }}
                  onToggleDetails={() => handleToggleDetails(job.sourceSystemId.toString())}
                  isSelected={selectedJobId === job.sourceSystemId.toString()} // Check if the job is selected
                  baseUrl="https://www.thoughtworks.com/en-in/careers/jobs/" // Update with your actual base URL
                />
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                Previous
              </button>
              <span>
                Page {currentPage}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Thoughtworks;
