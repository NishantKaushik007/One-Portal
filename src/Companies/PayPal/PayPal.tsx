import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select'; // Importing react-select
import { jobCategory, jobType, location, skills } from '../../Data/data'; // Ensure this path is correct
import JobCard from '../../Components/JobCard/JobCard';

// Define the Job interface
interface Job {
    name: string;
    display_job_id: string;
    postingDate: string;
    canonicalPositionUrl: string;
    locations: string[];
    id: string;
}

// Define props for the PayPal component
interface PayPalProps {
    selectedCompany: string;
}

const PayPal: React.FC<PayPalProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // State variables for filters
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [jobTypeCode, setJobTypeCode] = useState<string>('');
    const [locationCode, setLocationCode] = useState<string>('');
    const [skillsCode, setSkillsCode] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 10;

    // State variable to hold the selected job ID for displaying details
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // State variable to store job details
    const [description, setDescription] = useState<{ [key: string]: string }>({});

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        // Construct query parameters based on selected filters and pagination
        const queryParams = [
            locationCode && `location=${locationCode}`,
            jobCategoryCode && `Job+Category=${jobCategoryCode}`,
            jobTypeCode && `Employment+Type=${jobTypeCode}`,
            skillsCode && `Skills=${skillsCode}`,
            `start=${(currentPage - 1) * resultsPerPage}`,
            `num=${resultsPerPage}`,
        ].filter(Boolean).join('&');

        const url = `/paypal/api/apply/v2/jobs?domain=paypal.com&${queryParams}`;
        console.log(url);

        try {
            const res = await axios.get(url);
            if (res.data.positions) {
                setJobs(res.data.positions); // Set jobs
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            setError('Error fetching data: ' + (error as Error).message);
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobDetails = async (jobId: string) => {
        const aiResumeUrl = `/paypal/api/apply/v2/jobs/${jobId}?domain=paypal.com`; // Construct the URL for fetching job details
        console.log(aiResumeUrl);
    
        try {
            const response = await axios.get(aiResumeUrl);
            if (response.status === 200) {
                const jobDetails = response.data; // Get job details from the response
                setDescription(prev => ({
                    ...prev,
                    [jobId]: jobDetails.job_description || '', // Handle potential undefined description
                }));
            } else {
                console.error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching job details:', error.message);
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [jobCategoryCode, jobTypeCode, locationCode, skillsCode, currentPage]);

    // Handler functions for pagination
    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handleBackPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1)); // Ensure page doesn't go below 1
    };

    const handleJobClick = (id: string) => {
        if (selectedJobId === id) {
            setSelectedJobId(null); // Hide details
        } else {
            setSelectedJobId(id); // Show details
            fetchJobDetails(id);
        }
    };

    return (
        <div>
            <div className="flex flex-row space-x-4 mb-6">
                <label className="flex flex-col">
                    Teams:
                    <Select
                        options={jobCategory
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(option) => {
                            if (option) {
                                setJobCategoryCode(option.value);
                            }
                        }}
                        styles={{ 
                            control: (base) => ({
                                ...base,
                                minWidth: '200px', // Minimum width for dropdown
                            }),
                        }}
                        placeholder="Select a Team"
                    />
                </label>

                <label className="flex flex-col">
                    Work Type:
                    <Select
                        options={jobType
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(option) => {
                            if (option) {
                                setJobTypeCode(option.value);
                            }
                        }}
                        styles={{ 
                            control: (base) => ({
                                ...base,
                                minWidth: '200px', // Minimum width for dropdown
                            }),
                        }}
                        placeholder="Select Work Type"
                    />
                </label>

                <label className="flex flex-col">
                    Locations:
                    <Select
                        options={location
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(option) => {
                            if (option) {
                                setLocationCode(option.value);
                            }
                        }}
                        styles={{ 
                            control: (base) => ({
                                ...base,
                                minWidth: '200px', // Minimum width for dropdown
                            }),
                        }}
                        placeholder="Select a Location"
                    />
                </label>

                <label className="flex flex-col">
                    Skills:
                    <Select
                        options={skills
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(option) => {
                            if (option) {
                                setSkillsCode(option.value);
                            }
                        }}
                        styles={{ 
                            control: (base) => ({
                                ...base,
                                minWidth: '200px', // Minimum width for dropdown
                            }),
                        }}
                        placeholder="Select Skills"
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
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <li key={job.display_job_id}>
                                    <JobCard
                                        job={{
                                            title: job.name,
                                            id_icims: job.display_job_id,
                                            job_path: `${job.canonicalPositionUrl}`,
                                            normalized_location: job.locations.join(', '),
                                            basic_qualifications: "",
                                            description: selectedJobId === job.id ? description[Number(job.id)] || '' : '', // Show description only if selected
                                            preferred_qualifications: "", // Assuming you want to show the same as preferred
                                            responsibilities: "",
                                        }}
                                        onToggleDetails={() => handleJobClick(job.id)}
                                        isSelected={selectedJobId === job.id}
                                        baseUrl=""
                                    />
                                </li>
                            ))
                        ) : (
                            <div>No jobs available.</div>
                        )}
                    </ul>

                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-between space-x-2">
                        <button 
                            onClick={handleBackPage} 
                            disabled={loading || currentPage === 1} // Disable while loading and on the first page
                            className="bg-gray-500 text-white py-2 px-4 rounded">
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={loading} // Disable while loading
                            className="bg-blue-500 text-white py-2 px-4 rounded">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayPal;
