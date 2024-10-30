import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, industryExp, location, category } from '../../Data/data';
import JobCard from '../../Components/JobCard/JobCard'; // Adjust the import path as necessary

interface Job {
    title: string;
    req_id: string;
    posted_date: string;
    location_name: string;
    qualifications: string;
    description: string;
    responsibilities: string;
    canonical_url: string;
    salary_range: string; // Added salary range
}

interface GitHubProps {
    selectedCompany: string;
}

const GitHub: React.FC<GitHubProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 10;

    // State variables for filters
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [categoryCode, setCategoryCode] = useState<string>('');
    const [locationCode, setLocationCode] = useState<string>('');
    const [industryExpCode, setIndustryExpCode] = useState<string>('');

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        const queryParams = [
            locationCode && `locations=${locationCode}`,
            jobCategoryCode && `categories=${jobCategoryCode}`,
            industryExpCode && `tags4=${industryExpCode}`,
            categoryCode && `tags6=${categoryCode}`,
            `offset=${(currentPage - 1) * resultsPerPage}`,
            `result_limit=${resultsPerPage}`
        ].filter(Boolean).join('&');

        const url = `/GitHub/api/jobs?page=1&${queryParams}sortBy=relevance&descending=false&internal=false&deviceId=undefined&domain=githubinc.jibeapply.com`;
        console.log(url);

        try {
            const res = await axios.get(url);
            const jobData = res.data.jobs.map((job: any) => ({
                title: job.data.title,
                req_id: job.data.req_id,
                posted_date: job.data.posted_date,
                location_name: job.data.location_name,
                qualifications: job.data.qualifications,
                description: job.data.description,
                responsibilities: job.data.responsibilities,
                canonical_url: job.data.meta_data.canonical_url,
                salary_range: `${job.data.tags2[0]} - ${job.data.tags3[0]}` // Extracting salary range
            }));

            setJobs(jobData);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [jobCategoryCode, locationCode, categoryCode, industryExpCode, currentPage]);

    const toggleJobDetails = (jobId: string) => {
        setSelectedJobId(selectedJobId === jobId ? null : jobId);
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handleBackPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                <label className="flex flex-col mb-4 md:mb-0">
                    Job Category:
                    <Dropdown
                        options={jobCategory
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(selectedOption) => setJobCategoryCode(selectedOption ? selectedOption.value : '')}
                    />
                </label>

                <label className="flex flex-col mb-4 md:mb-0">
                    Location:
                    <Dropdown
                        options={location
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(selectedOption) => setLocationCode(selectedOption ? selectedOption.value : '')}
                    />
                </label>

                <label className="flex flex-col mb-4 md:mb-0">
                    Industry Experience:
                    <Dropdown
                        options={industryExp
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(selectedOption) => setIndustryExpCode(selectedOption ? selectedOption.value : '')}
                    />
                </label>

                <label className="flex flex-col mb-4 md:mb-0">
                    Category:
                    <Dropdown
                        options={category
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(selectedOption) => setCategoryCode(selectedOption ? selectedOption.value : '')}
                    />
                </label>

            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : jobs.length === 0 ? (
                <div>No jobs available.</div>
            ) : (
                <ul>
                    {jobs.map((job) => (
                        <li key={job.req_id}>
                            <JobCard
                                job={job}
                                onToggleDetails={toggleJobDetails}
                                isSelected={selectedJobId === job.req_id}
                                baseUrl="" // Base URL for job links
                            />
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination Buttons */}
            <div className="mt-4 flex justify-between space-x-2">
                <button
                    onClick={handleBackPage}
                    disabled={loading || currentPage === 1}
                    className="bg-gray-500 text-white py-2 px-4 rounded"
                >
                    Previous
                </button>
                <span>Page {currentPage}</span>
                <button
                    onClick={handleNextPage}
                    disabled={loading}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default GitHub;
