import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, industryExp, jobType, country, category } from '../../Data/data';

// Define the Job interface
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

// Define props for the Amazon component
interface AmazonProps {
    selectedCompany: string;
}

const Amazon: React.FC<AmazonProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null); // State to hold selected job ID

    // State variables for filters
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [categoryCode, setCategoryCode] = useState<string>('');
    const [jobTypeCode, setJobTypeCode] = useState<string>('');
    const [countryCode, setCountryCode] = useState<string>('');
    const [industryExpCode, setIndustryExpCode] = useState<string>('');

    // State variable for pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 20;

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        // Construct query parameters based on selected filters
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

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handleBackPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const toggleJobDetails = (jobId: string) => {
        // If the selected job is already open, close it; otherwise, open it
        setSelectedJobId(selectedJobId === jobId ? null : jobId);
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
                        onChange={(e) => setJobCategoryCode(e.target.value)}
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
                        onChange={(e) => setCategoryCode(e.target.value)}
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
                        onChange={(e) => setJobTypeCode(e.target.value)}
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
                        onChange={(e) => setCountryCode(e.target.value)}
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
                        onChange={(e) => setIndustryExpCode(e.target.value)}
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
                            <div>
                                <h3>{job.title}</h3>
                                <p>Job ID: {job.id_icims}</p>
                                <p>Location: {job.normalized_location}</p>
                                <p>Posted On: {job.posted_date}</p>
                                <a href={`https://amazon.jobs${job.job_path}`} target="_blank" rel="noopener noreferrer">
                                    View Job
                                </a>
                                <button onClick={() => toggleJobDetails(job.id_icims)}>
                                    {selectedJobId === job.id_icims ? 'Hide Details' : 'View Details'}
                                </button>
                            </div>

                            {/* Job Details Section: Show only if this job is selected */}
                            {selectedJobId === job.id_icims && (
                                <div className="mt-2">
                                    <h4>Description:</h4>
                                    <div dangerouslySetInnerHTML={{ __html: job.description || '' }} />
                                    <h4>Basic Qualifications:</h4>
                                    <div dangerouslySetInnerHTML={{ __html: job.basic_qualifications || '' }} />
                                    <h4>Preferred Qualifications:</h4>
                                    <div dangerouslySetInnerHTML={{ __html: job.preferred_qualifications || '' }} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination Buttons */}
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
    );
}

export default Amazon;
