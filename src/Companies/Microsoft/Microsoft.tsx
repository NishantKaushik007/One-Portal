import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, industryExp, jobType, country, category, discipline } from '../../Data/data'; // Ensure this path is correct

// Define the Job interface
interface Job {
    title: string;
    jobId: string;
    postingDate: string;
    properties: {
        locations: string[];
    };
}

// Define props for the Microsoft component
interface MicrosoftProps {
    selectedCompany: string;
}

const Microsoft: React.FC<MicrosoftProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State variables for filters
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [categoryCode, setCategoryCode] = useState<string>('');
    const [jobTypeCode, setJobTypeCode] = useState<string>('');
    const [countryCode, setCountryCode] = useState<string>('');
    const [industryExpCode, setIndustryExpCode] = useState<string>('');
    const [disciplineCode, setDisciplineCode] = useState<string>('');

    // State variable for pagination
    const [currentPage, setCurrentPage] = useState<number>(1);

    // State variable to hold the selected job ID for displaying details
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // State variables to store job details
    const [description, setDescription] = useState<string>('');
    const [qualifications, setQualifications] = useState<string>('');
    const [responsibilities, setResponsibilities] = useState<string>('');

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        // Construct query parameters based on selected filters
        const queryParams = [
            jobCategoryCode && `p=${jobCategoryCode}`,
            jobTypeCode && `et=${jobTypeCode}`,
            countryCode && `lc=${countryCode}`,
            industryExpCode && `exp=${industryExpCode}`,
            categoryCode && `ws=${categoryCode}`,
            disciplineCode && `d=${disciplineCode}`,
            `pg=${currentPage}` // Include current page in the query params
        ].filter(Boolean).join('&');

        const url = `/search/api/v1/search?${queryParams}&l=en_us&pgSz=20&o=Relevance&flt=true`;
        console.log(url);

        try {
            const res = await axios.get(url);
            // Check if the response has the expected structure
            if (res.data.operationResult.result && res.data.operationResult.result.jobs) {
                setJobs(res.data.operationResult.result.jobs); // Set jobs
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
        const aiResumeUrl = `/search/api/v1/job/${jobId}?lang=en_us`; // Construct the URL for fetching job details

        try {
            const response = await axios.get(aiResumeUrl);
            const jobDetails = response.data.operationResult.result;

            // Store the relevant details in state variables
            setDescription(jobDetails.description);
            setQualifications(jobDetails.qualifications);
            setResponsibilities(jobDetails.responsibilities);
        } catch (error) {
            console.error('Error fetching job details:', error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [jobCategoryCode, categoryCode, jobTypeCode, countryCode, industryExpCode, disciplineCode, currentPage]); // Include currentPage in dependencies

    const formatTitle = (title: string) => {
        return title.replace(/\s+/g, '-').replace(/,/g, '%2C'); // Replace spaces with dashes and commas with %2C
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1); // Increment current page
    };

    const handleBackPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // Decrement current page, ensuring it doesn't go below 1
    };

    return (
        <div>
            <div className="flex flex-row space-x-4 mb-6">
                <label className="flex flex-col">
                    Profession:
                    <Dropdown
                        options={jobCategory
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) setJobCategoryCode(newValue.value);
                        }} // Correct state update
                    />
                </label>

                <label className="flex flex-col">
                    Work site:
                    <Dropdown
                        options={category
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) setCategoryCode(newValue.value);
                        }} // Correct state update
                    />
                </label>

                <label className="flex flex-col">
                    Employment Type:
                    <Dropdown
                        options={jobType
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) setJobTypeCode(newValue.value);
                        }} // Correct state update
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
                        onChange={(newValue) => {
                            if (newValue) setCountryCode(newValue.value);
                        }} // Correct state update
                    />
                </label>

                <label className="flex flex-col">
                    Experience:
                    <Dropdown
                        options={industryExp
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) setIndustryExpCode(newValue.value);
                        }} // Correct state update
                    />
                </label>

                <label className="flex flex-col">
                    Discipline:
                    <Dropdown
                        options={discipline
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))}                        
                        onChange={(newValue) => {
                            if (newValue) {
                                setDisciplineCode(newValue.value.replace(/&/g, '%26'));
                            } else {
                                setDisciplineCode(''); // Reset state if no value is selected
                            }
                        }}
                    />
                </label>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : jobs.length === 0 ? ( // Check if there are no jobs
                <div>No jobs available.</div>
            ) : (
                <ul>
                    {jobs.map((job) => (
                        <li key={job.jobId}>
                            <div>
                                <h3>{job.title}</h3>
                                <p>Job ID: {job.jobId}</p>
                                <p>Location: {job.properties.locations.join(', ')}</p>
                                <p>Posted On: {new Date(job.postingDate).toLocaleDateString()}</p>
                                <a 
                                    href={`https://jobs.careers.microsoft.com/global/en/job/${job.jobId}/${formatTitle(job.title)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer">
                                    View Job
                                </a>
                                <button onClick={() => {
                                    if (selectedJobId === job.jobId) {
                                        setSelectedJobId(null); // If the same job is clicked, close the details
                                        setDescription(''); // Clear the description
                                        setQualifications(''); // Clear the qualifications
                                        setResponsibilities(''); // Clear the responsibilities
                                    } else {
                                        setSelectedJobId(job.jobId); // Set selected job ID
                                        fetchJobDetails(job.jobId); // Fetch job details
                                    }
                                }}>
                                    {selectedJobId === job.jobId ? 'Hide Details' : 'View Details'}
                                </button>
                            </div>
                            {/* Job Details Section: Show only if this job is selected */}
                            {selectedJobId === job.jobId && (
                                <div className="mt-4">
                                    {qualifications && (
                                        <div>
                                            <div dangerouslySetInnerHTML={{ __html: qualifications }} />
                                        </div>
                                    )}
                                    {description && (
                                        <div>
                                            <h4>Description:</h4>
                                            <div dangerouslySetInnerHTML={{ __html: description }} />
                                        </div>
                                    )}
                                    {responsibilities && (
                                        <div>
                                            <h4>Responsibilities:</h4>
                                            <div dangerouslySetInnerHTML={{ __html: responsibilities }} />
                                        </div>
                                    )}
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
    );
};

export default Microsoft;
