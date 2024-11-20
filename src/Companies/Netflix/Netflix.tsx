import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown'; // Ensure this path is correct
import { jobCategory, jobType, location } from '../../Data/data'; // Ensure this path is correct
import JobCard from '../../Components/JobCard/JobCard';

// Define the Job interface
interface Job {
    name: string;
    display_job_id: string;
    canonicalPositionUrl: string;
    locations: string[];
    id: string;
    custom_JD?: {
        data_fields: {
            posting_date: string[];
        };
    };
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

    // State variable to store job details
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [postingDates, setPostingDates] = useState<{ [key: string]: string }>({});
    const [jobDescriptions, setJobDescriptions] = useState<{ [key: string]: string }>({});

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

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
                const fetchedJobs: Job[] = res.data.positions;
                setJobs(fetchedJobs);

                // Fetch posting dates for each job
                const newPostingDates: { [key: string]: string } = {};
                await Promise.all(fetchedJobs.map((job: Job) => fetchJobDetails(job.id, newPostingDates)));

                // Set the posting dates
                setPostingDates(newPostingDates);
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

    const fetchJobDetails = async (jobId: string, postingDateAccumulator: { [key: string]: string }) => {
        const aiResumeUrl = `/netflix/api/apply/v2/jobs/${jobId}?domain=netflix.com`;
        console.log(aiResumeUrl);

        try {
            const response = await axios.get(aiResumeUrl);
            if (response.status === 200) {
                const jobDetails = response.data;

                const postingDate = jobDetails.custom_JD?.data_fields?.posting_date[0] || '';
                postingDateAccumulator[jobId] = postingDate;

                setJobDescriptions(prev => ({
                    ...prev,
                    [jobId]: jobDetails.job_description || '',
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
        fetchJobs(); // Call fetchJobs when filters change
    }, [jobCategoryCode, jobTypeCode, locationCode, currentPage]);

    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handleBackPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleJobClick = (id: string) => {
        if (selectedJobId === id) {
            setSelectedJobId(null);
        } else {
            setSelectedJobId(id);
        }
    };

    return (
        <div>
            {/* Filters integrated directly in Netflix */}
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                <label className="flex flex-col w-full md:w-1/3">
                    Teams:
                    <Dropdown
                        options={jobCategory
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(newValue) => {
                            // Handle both selection and unselection
                            if (newValue) {
                                setJobCategoryCode(newValue.value);
                            } else {
                                setJobCategoryCode(''); // Reset if unselected
                            }
                            setCurrentPage(1); // Reset to the first page when filters change
                        }} 
                    />
                </label>

                <label className="flex flex-col w-full md:w-1/3">
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
                            } else {
                                setJobTypeCode(''); // Reset if unselected
                            }
                            setCurrentPage(1); // Reset to the first page when filters change
                        }} 
                    />
                </label>

                <label className="flex flex-col w-full md:w-1/3">
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
                            } else {
                                setLocationCode(''); // Reset if unselected
                            }
                            setCurrentPage(1); // Reset to the first page when filters change
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
                                <li key={job.id}>
                                    <JobCard
                                        job={{
                                            title: job.name,
                                            id_icims: job.display_job_id,
                                            posted_date: postingDates[job.id] || '',
                                            job_path: `${job.canonicalPositionUrl}`,
                                            normalized_location: job.locations.join(', '),
                                            basic_qualifications: "",
                                            description: selectedJobId === job.id ? jobDescriptions[job.id] || '' : '',
                                            preferred_qualifications: "",
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
