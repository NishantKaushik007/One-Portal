import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, jobType, location } from '../../Data/data'; // Ensure this path is correct

// Define the Job interface
interface Job {
    name: string;
    display_job_id: string;
    postingDate: string;
    canonicalPositionUrl: string;
    locations: string[];
    id: string;
}

// Define props for the Netflix component
interface NetflixProps {
    selectedCompany: string;
}

const Netflix: React.FC<NetflixProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State variables for filters
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [jobTypeCode, setJobTypeCode] = useState<string>('');
    const [locationCode, setLocationCode] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 10;

    // State variable to hold the selected job ID for displaying details
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // State variable to store job details
    const [description, setDescription] = useState<string>('');

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        // Construct query parameters based on selected filters and pagination
        const queryParams = [
            locationCode && `location=${locationCode}`,
            jobCategoryCode && `Teams=${jobCategoryCode}`,
            jobTypeCode && `Work%20Type=${jobTypeCode}`,
            `start=${(currentPage - 1) * resultsPerPage}`,
            `num=${resultsPerPage}`,
        ].filter(Boolean).join('&');

        const url = `/netflix/api/apply/v2/jobs?domain=netflix.com&${queryParams}`;
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
        const aiResumeUrl = `/netflix/api/apply/v2/jobs/${jobId}?domain=netflix.com`;
        console.log(aiResumeUrl);
    
        try {
            const response = await axios.get(aiResumeUrl);
    
            if (response.status === 200) {
                const jobDetails = response.data;
                setDescription(jobDetails.job_description || ''); // Handle potential undefined description
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
    }, [jobCategoryCode, jobTypeCode, locationCode, currentPage]);

    // Handler functions for pagination
    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handleBackPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div>
            <div className="flex flex-row space-x-4 mb-6">
                <label className="flex flex-col">
                    Teams:
                    <Dropdown
                        options={jobCategory
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) {
                                setJobCategoryCode(newValue.value);
                            }
                        }} 
                    />
                </label>

                <label className="flex flex-col">
                    Work Type:
                    <Dropdown
                        options={jobType
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) {
                                setJobTypeCode(newValue.value);
                            }
                        }} 
                    />
                </label>

                <label className="flex flex-col">
                    Locations:
                    <Dropdown
                        options={location
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) {
                                setLocationCode(newValue.value);
                            }
                        }} 
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
                                    <div>
                                        <h3>{job.name}</h3>
                                        <p>Job ID: {job.display_job_id}</p>
                                        <p>Location: {job.locations.join(', ')}</p>
                                        <p>Posted On: {new Date(job.postingDate).toLocaleDateString()}</p>
                                        <a 
                                            href={job.canonicalPositionUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer">
                                            View Job
                                        </a>
                                        <button onClick={() => {
                                            if (selectedJobId === job.id) {
                                                setSelectedJobId(null);
                                                setDescription('');
                                            } else {
                                                setSelectedJobId(job.id);
                                                fetchJobDetails(job.id);
                                            }
                                        }}>
                                            {selectedJobId === job.id ? 'Hide Details' : 'View Details'}
                                        </button>
                                    </div>
                                    {selectedJobId === job.id && (
                                        <div className="mt-4">
                                            {description && (
                                                <div>
                                                    <h4>Description:</h4>
                                                    <div dangerouslySetInnerHTML={{ __html: description }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))
                        ) : (
                            <div>No jobs available.</div>
                        )}
                    </ul>

                    <div className="mt-4 flex justify-between space-x-2">
                        <button 
                            onClick={handleBackPage} 
                            disabled={loading || currentPage === 1} 
                            className="bg-gray-500 text-white py-2 px-4 rounded">
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={loading} 
                            className="bg-blue-500 text-white py-2 px-4 rounded">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Netflix;
