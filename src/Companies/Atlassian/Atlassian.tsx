import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jobCategory, country } from '../../Data/data';
import JobCard from '../../Components/JobCard/JobCard';

interface JobListing {
    portalJobPost: {
        portalId: string;
        portalUrl: string;
        id: string;
        updatedDate: string;
    };
    id: string;
    portalId: number;
    title: string;
    type: string;
    locations: string[];
    category: string;
    overview: string;
    responsibilities: string;
    qualifications: string;
    applyUrl: string;
}

interface AtlassianProps {
    selectedCompany: string;
}

const Atlassian: React.FC<AtlassianProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [countryCode, setCountryCode] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 10; // Number of items per page

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        const url = `/endpoint/careers/listings`;
        try {
            const res = await axios.get<JobListing[]>(url);
            setJobs(res.data);
        } catch (error) {
            setError('Error fetching data: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCompany === 'Atlassian') {
            fetchJobs();
        } else {
            setJobs([]); // Clear jobs when the company changes
        }
    }, [selectedCompany]);

    const toggleJobDetails = (jobId: string) => {
        setSelectedJobId(selectedJobId === jobId ? null : jobId);
    };

    const handleFilterChange = () => {
        fetchJobs(); // Refetch jobs based on current filters
    };

    const filteredJobCategories = jobCategory
        .filter(option => option.company === selectedCompany)
        .map(option => ({ label: option.value, value: option.code }));

    const filteredCountries = country
        .filter(option => option.company === selectedCompany)
        .map(option => ({ label: option.value, value: option.code }));

    // Aggregate jobs by id
    const jobsMap = jobs.reduce<{ [key: string]: JobListing & { locations: string[] } }>((acc, job) => {
        if (!acc[job.id]) {
            acc[job.id] = { ...job, locations: [job.locations[0]] };
        } else {
            acc[job.id].locations.push(job.locations[0]);
        }
        return acc;
    }, {});

    // Convert the jobs map back to an array
    const aggregatedJobs = Object.values(jobsMap);
    

    const filteredJobs = aggregatedJobs.filter(job => {
        const matchesLocation = countryCode !== undefined 
        ? Array.isArray(job.locations) && job.locations.length > 0 && 
          new RegExp(countryCode, 'i').test(job.locations[0]) 
        : true;
        const matchesDepartment = jobCategoryCode ? job.category === jobCategoryCode : true;
        return matchesLocation && matchesDepartment;
    });

    // Calculate current jobs based on pagination
    const indexOfLastJob = currentPage * resultsPerPage;
    const indexOfFirstJob = indexOfLastJob - resultsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    const handleDepartmentChange = (selectedOption: { value: string; label: string } | null) => {
        setJobCategoryCode(selectedOption ? selectedOption.value : '');
        handleFilterChange(); // Refetch jobs when department changes
    };

    const handleLocationChange = (selectedOption: { value: string; label: string } | null) => {
        setCountryCode(selectedOption ? selectedOption.value : '');
        handleFilterChange(); // Refetch jobs when location changes
    };

    // Handler functions for pagination
    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handleBackPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1)); // Ensure page doesn't go below 1
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <label className="flex flex-col">
                    Departments:
                    <Select 
                        options={filteredJobCategories} 
                        onChange={handleDepartmentChange} 
                        isClearable
                        placeholder="Select a Department"
                    />
                </label>
                <label className="flex flex-col">
                    Locations:
                    <Select 
                        options={filteredCountries} 
                        onChange={handleLocationChange} 
                        isClearable
                        placeholder="Select a Country"
                    />
                </label>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div>
                    <ul>
                        {currentJobs.length > 0 ? (
                            currentJobs.map((job) => (
                                <li key={job.id}>
                                    <JobCard
                                        job={{
                                            title: job.title,
                                            id_icims: job.id.toString(),
                                            job_path: job.portalJobPost.portalUrl,
                                            postingDate: job.portalJobPost.updatedDate,
                                            normalized_location: job.locations.join(', '),
                                            basic_qualifications: job.qualifications || "",
                                            description: job.overview || '',
                                            preferred_qualifications: "",
                                            responsibilities: job.responsibilities || "",
                                        }}
                                        onToggleDetails={toggleJobDetails}
                                        isSelected={selectedJobId === job.id.toString()}
                                        baseUrl=""
                                    />
                                </li>
                            ))
                        ) : (
                            <div>No jobs available for the selected criteria.</div>
                        )}
                    </ul>

                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-between space-x-2">
                        <button 
                            onClick={handleBackPage} 
                            disabled={loading || currentPage === 1} // Disable on first page
                            className="bg-gray-500 text-white py-2 px-4 rounded">
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={loading || currentJobs.length < resultsPerPage} // Disable if there are no more jobs
                            className="bg-blue-500 text-white py-2 px-4 rounded">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Atlassian;
