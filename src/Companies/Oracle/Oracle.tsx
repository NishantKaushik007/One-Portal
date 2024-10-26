import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, industryExp, jobType, country, postingDate } from '../../Data/data';

interface SecondaryLocation {
    RequisitionLocationId: number;
    GeographyNodeId: number;
    GeographyId: number;
    Name: string;
    CountryCode: string;
    Latitude: number | null;
    Longitude: number | null;
}

interface Job {
    Title: string;
    Id: string;
    PostedDate: string;
    job_path: string;
    normalized_location: string;
    items: string[];
    PrimaryLocation: string;
    secondaryLocations: SecondaryLocation[];
}

const RenderHTML: React.FC<{ html: string }> = ({ html }) => (
    <div dangerouslySetInnerHTML={{ __html: html }} />
);

interface OracleProps {
    selectedCompany: string;
}

const Oracle: React.FC<OracleProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // State variable to store job details
    const [jobDetails, setJobDetails] = useState({
        ExternalDescriptionStr: '',
        CorporateDescriptionStr: '',
        ExternalQualificationsStr: '',
        ExternalResponsibilitiesStr: '',
        Skills: '',
    });

    const [filters, setFilters] = useState({
        jobCategoryCode: '',
        jobTypeCode: '',
        countryCode: '',
        industryExpCode: '',
        postingDateCode: '',
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 10;

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        const queryParams: { [key: string]: string } = {
            selectedFlexFieldsFacets: filters.jobTypeCode || filters.industryExpCode,
            selectedCategoriesFacet: filters.jobCategoryCode,
            selectedLocationsFacet: filters.countryCode,
            selectedPostingDatesFacet: filters.postingDateCode,
        };

        const url = `/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations,flexFieldsFacet.values,requisitionList.requisitionFlexFields&finder=findReqs;siteNumber=CX_45001,facetsList=LOCATIONS%3BWORK_LOCATIONS%3BWORKPLACE_TYPES%3BTITLES%3BCATEGORIES%3BORGANIZATIONS%3BPOSTING_DATES%3BFLEX_FIELDS,limit=200,${Object.entries(queryParams).filter(([, value]) => value).map(([key, value]) => `${key}=${value}`).join(',')},sortBy=POSTING_DATES_DESC`;

        try {
            const res = await axios.get(url);
            setJobs(res.data.items[0]?.requisitionList || []);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Error fetching data' : 'Error fetching data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobDetails = async (jobId: string) => {
        const aiResumeUrl = `/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?expand=all&onlyData=true&finder=ById;siteNumber=CX_45001,Id=%22${jobId}%22`; // Construct the URL for fetching job details
        console.log(`https://eeho.fa.us2.oraclecloud.com${aiResumeUrl}`);

        try {
            const response = await axios.get(aiResumeUrl);
            console.log(response);
            if (response.status === 200) {
                const jobDetail = response.data.items[0]; // Get job details from the response
                
                // Map the API response to your local state
                setJobDetails({
                    ExternalDescriptionStr: jobDetail.ExternalDescriptionStr || '',
                    CorporateDescriptionStr: jobDetail.CorporateDescriptionStr || '',
                    ExternalQualificationsStr: jobDetail.ExternalQualificationsStr || '',
                    ExternalResponsibilitiesStr: jobDetail.ExternalResponsibilitiesStr || '',
                    Skills: jobDetail.Skills || '',
                });
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
    }, [filters]);

    const handleDropdownChange = (key: string) => (value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Render Dropdown
    const renderDropdown = (label: string, options: any[], stateSetter: (value: string) => void) => (
        <label className="flex flex-col">
            {label}:
            <Dropdown
                options={options.map(option => ({
                    label: option.value,
                    value: option.code
                }))}
                onChange={(e) => stateSetter(e.target.value)}
            />
        </label>
    );

    // Calculate the index of the first and last job for the current page
    const indexOfLastJob = currentPage * resultsPerPage;
    const indexOfFirstJob = indexOfLastJob - resultsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

    // Calculate total pages
    const totalPages = Math.ceil(jobs.length / resultsPerPage);

    return (
        <div>
            <div className="flex flex-row space-x-4 mb-6">
                {renderDropdown("Job Category", jobCategory.filter(option => option.company === selectedCompany), handleDropdownChange('jobCategoryCode'))}
                {renderDropdown("Job Type", jobType.filter(option => option.company === selectedCompany), handleDropdownChange('jobTypeCode'))}
                {renderDropdown("Country", country.filter(option => option.company === selectedCompany), handleDropdownChange('countryCode'))}
                {renderDropdown("Industry Experience", industryExp.filter(option => option.company === selectedCompany), handleDropdownChange('industryExpCode'))}
                {renderDropdown("Posting Dates", postingDate.filter(option => option.company === selectedCompany), handleDropdownChange('postingDateCode'))}
            </div>

            {loading ? (
                <div className="spinner">Loading jobs...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <ul>
                    {currentJobs.length > 0 ? (
                        currentJobs.map((job) => (
                            <li key={job.Id}>
                                <div>
                                    <h3>{job.Title}</h3>
                                    <p>Job ID: {job.Id}</p>
                                    <p>
                                        Location: {job.PrimaryLocation}
                                        {job.secondaryLocations.length > 0
                                            ? `, ${job.secondaryLocations.map(location => location.Name).join(', ')}`
                                            : ''}
                                    </p>
                                    <p>Posted On: {job.PostedDate}</p>
                                    <a
                                        href={`https://careers.oracle.com/jobs/#en/sites/jobsearch/job/${job.Id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Job
                                    </a>
                                    <button 
                                        aria-expanded={selectedJobId === job.Id}
                                        onClick={() => {
                                            if (selectedJobId === job.Id) {
                                                setSelectedJobId(null); // If the same job is clicked, close the details
                                                setJobDetails({
                                                    ExternalDescriptionStr: '',
                                                    CorporateDescriptionStr: '',
                                                    ExternalQualificationsStr: '',
                                                    ExternalResponsibilitiesStr: '',
                                                    Skills: '',
                                                });
                                            } else {
                                                setSelectedJobId(job.Id); // Set selected job ID
                                                fetchJobDetails(job.Id); // Fetch job details
                                            }
                                        }}
                                    >
                                        {selectedJobId === job.Id ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                                {/* Job Details Section: Show only if this job is selected */}
                                {selectedJobId === job.Id && (
                                    <div className="mt-4">
                                        {jobDetails.Skills && (
                                            <div>
                                                <h4>Skills:</h4>
                                                <RenderHTML html={jobDetails.Skills} />
                                            </div>
                                        )}
                                        {jobDetails.ExternalQualificationsStr && (
                                            <RenderHTML html={jobDetails.ExternalQualificationsStr} />
                                        )}
                                        {jobDetails.ExternalDescriptionStr && (
                                            <RenderHTML html={jobDetails.ExternalDescriptionStr} />
                                        )}
                                        {jobDetails.CorporateDescriptionStr && (
                                            <RenderHTML html={jobDetails.CorporateDescriptionStr} />
                                        )}
                                        {jobDetails.ExternalResponsibilitiesStr && (
                                            <RenderHTML html={jobDetails.ExternalResponsibilitiesStr} />
                                        )}
                                    </div>
                                )}
                            </li>
                        ))
                    ) : (
                        <div>No jobs available.</div>
                    )}
                </ul>
            )}

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between space-x-2">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-gray-500 text-white py-2 px-4 rounded"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Oracle;
