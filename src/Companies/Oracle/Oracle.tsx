import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, industryExp, jobType, country, postingDate } from '../../Data/data';
import JobCard from '../../Components/JobCard/JobCard';

interface SecondaryLocation {
    Name: string; // Name of the secondary location
}

interface Job {
    Title: string;
    Id: string;
    PostedDate: string;
    job_path: string;
    normalized_location: string;
    PrimaryLocation: string;
    secondaryLocations: SecondaryLocation[];
}

interface JobDetails {
    ExternalDescriptionStr: string;
    CorporateDescriptionStr: string;
    ExternalQualificationsStr: string;
    ExternalResponsibilitiesStr: string;
    Skills: string;
}

const Oracle: React.FC<{ selectedCompany: string }> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [jobDetails, setJobDetails] = useState<JobDetails>({
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
            limit: resultsPerPage.toString(),
            offset: ((currentPage - 1) * resultsPerPage).toString(), // Calculate offset for pagination
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
        const aiResumeUrl = `/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?expand=all&onlyData=true&finder=ById;siteNumber=CX_45001,Id=%22${jobId}%22`;
        try {
            const response = await axios.get(aiResumeUrl);
            if (response.status === 200) {
                const jobDetail = response.data.items[0];
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
            console.error('Error fetching job details:', error);
        }
    };

    useEffect(() => {
        fetchJobs();
        setSelectedJobId(null); // Reset selected job on filter change
    }, [filters, currentPage]); // Include filters and currentPage in dependencies

    const handleJobSelect = (jobId: string) => {
        if (selectedJobId === jobId) {
            setSelectedJobId(null);
        } else {
            setSelectedJobId(jobId);
            fetchJobDetails(jobId);
        }
    };

    const handleDropdownChange = (key: string) => (value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const renderDropdown = (label: string, options: any[], stateSetter: (value: string) => void) => (
        <label className="flex flex-col">
            {label}:
            <Dropdown
                options={options.map(option => ({
                    label: option.value,
                    value: option.code
                }))}
                onChange={(newValue) => {
                    if (newValue) {
                        stateSetter(newValue.value);
                    } else {
                        stateSetter(''); // Reset filter if no value is selected
                    }
                }}
            />
        </label>
    );

    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const handleBackPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1)); // Ensure page doesn't go below 1
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
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
                <div>
                    <ul>
                        {jobs.map((job) => (
                            <li key={job.Id}>
                                <JobCard
                                    baseUrl=""
                                    job={{
                                        title: job.Title,
                                        id_icims: job.Id,
                                        posted_date: job.PostedDate,
                                        job_path: `https://careers.oracle.com/jobs/#en/sites/jobsearch/job/${job.Id}`,
                                        normalized_location: job.PrimaryLocation,
                                        secondaryLocations: job.secondaryLocations,
                                        basic_qualifications: jobDetails.ExternalQualificationsStr,
                                        description: jobDetails.ExternalDescriptionStr,
                                        preferred_qualifications: jobDetails.ExternalResponsibilitiesStr
                                    }}
                                    onToggleDetails={handleJobSelect}
                                    isSelected={selectedJobId === job.Id}
                                />
                            </li>
                        ))}
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

export default Oracle;
