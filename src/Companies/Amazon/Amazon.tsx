import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, industryExp, jobType, country, category } from '../../Data/data';
import JobCard from '../../Components/JobCard/JobCard'; // Adjust the import path as necessary

interface Job {
    title: string;
    id_icims: string;
    posted_date: string;
    job_path: string;
    normalized_location: string;
    basic_qualifications: string;
    description: string;
    preferred_qualifications: string;
}

interface AmazonProps {
    selectedCompany: string;
}

const Amazon: React.FC<AmazonProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 20;

    // State variables for filters
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [categoryCode, setCategoryCode] = useState<string>('');
    const [jobTypeCode, setJobTypeCode] = useState<string>('');
    const [countryCode, setCountryCode] = useState<string>('');
    const [industryExpCode, setIndustryExpCode] = useState<string>('');

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        const queryParams = [
            jobCategoryCode && `category[]=${jobCategoryCode}`,
            jobTypeCode && `schedule_type_id[]=${jobTypeCode}`,
            countryCode && `normalized_country_code[]=${countryCode}`,
            industryExpCode && `industry_experience[]=${industryExpCode}`,
            categoryCode === 'student-programs' ? `business_category[]=student-programs` : null,
            categoryCode === 'virtual-locations' ? `location[]=virtual-locations` : null,
            `offset=${(currentPage - 1) * resultsPerPage}`,
            `result_limit=${resultsPerPage}`
        ].filter(Boolean).join('&');

        const url = `/en-gb/search.json?${queryParams}&radius=24km`;
        console.log(url);

        try {
            const res = await axios.get(url);
            setJobs(res.data.jobs);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [jobCategoryCode, categoryCode, jobTypeCode, countryCode, industryExpCode, currentPage]);

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
            <div className="flex flex-row space-x-4 mb-6">
                <label className="flex flex-col">
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

                <label className="flex flex-col">
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

                <label className="flex flex-col">
                    Job Type:
                    <Dropdown
                        options={jobType
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(selectedOption) => setJobTypeCode(selectedOption ? selectedOption.value : '')}
                    />
                </label>

                <label className="flex flex-col">
                    Country:
                    <Dropdown
                        options={country
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}
                        onChange={(selectedOption) => setCountryCode(selectedOption ? selectedOption.value : '')}
                    />
                </label>

                <label className="flex flex-col">
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
                        <li key={job.id_icims}>
                            <JobCard
                                job={job}
                                onToggleDetails={toggleJobDetails}
                                isSelected={selectedJobId === job.id_icims}
                                baseUrl="https://amazon.jobs" // Base URL for job links
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

export default Amazon;
