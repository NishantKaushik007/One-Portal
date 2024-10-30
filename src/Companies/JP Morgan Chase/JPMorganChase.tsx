import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from '../../Components/Dropdown/Dropdown';
import { jobCategory, country, postingDate } from '../../Data/data';
import JobCard from '../../Components/JobCard/JobCard'; // Adjust the import path as needed

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
    Id: string;
    Title: string;
    PostedDate: string;
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

interface JPMorganChaseProps {
    selectedCompany: string;
}

const JPMorganChase: React.FC<JPMorganChaseProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalJobsCount, setTotalJobsCount] = useState<number>(0);
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [postingDateCode, setPostingDateCode] = useState<string>('');
    const [countryCode, setCountryCode] = useState<string>('');
    const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        const queryParams = [
            countryCode && `locationId=${countryCode}`,
            jobCategoryCode && `selectedCategoriesFacet=${jobCategoryCode}`,
            postingDateCode && `selectedPostingDatesFacet=${postingDateCode}`,
            `limit=10`,
            `offset=${(currentPage - 1) * 10}`
        ].filter(Boolean).join(',');

        const url = `/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations,flexFieldsFacet.values,requisitionList.requisitionFlexFields&finder=findReqs;siteNumber=CX_1001,facetsList=LOCATIONS%3BWORK_LOCATIONS%3BWORKPLACE_TYPES%3BTITLES%3BCATEGORIES%3BORGANIZATIONS%3BPOSTING_DATES%3BFLEX_FIELDS,${queryParams},sortBy=POSTING_DATES_DESC`;

        try {
            const res = await axios.get(url);
            if (res.data && res.data.items && res.data.items[0].requisitionList) {
                setJobs(res.data.items[0].requisitionList);
                setTotalJobsCount(res.data.items[0].TotalJobsCount);
            } else {
                setJobs([]);
                setError('No jobs found');
            }
        } catch (error) {
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobDetails = async (jobId: string) => {
        const url = `/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?expand=all&onlyData=true&finder=ById;siteNumber=CX_1001,Id=%22${jobId}%22`;

        try {
            const response = await axios.get(url);
            if (response.data && response.data.items && response.data.items[0]) {
                const jobDetail = response.data.items[0];
                setJobDetails({
                    ExternalDescriptionStr: jobDetail.ExternalDescriptionStr || '',
                    CorporateDescriptionStr: jobDetail.CorporateDescriptionStr || '',
                    ExternalQualificationsStr: jobDetail.ExternalQualificationsStr || '',
                    ExternalResponsibilitiesStr: jobDetail.ExternalResponsibilitiesStr || '',
                    Skills: jobDetail.Skills || '',
                });
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [jobCategoryCode, postingDateCode, countryCode, currentPage]);

    const handleJobSelect = (jobId: string) => {
        if (selectedJobId === jobId) {
            setSelectedJobId(null); // Deselect if it's already selected
            setJobDetails(null); // Clear job details
        } else {
            setSelectedJobId(jobId);
            fetchJobDetails(jobId);
        }
    };

    const nextPage = () => {
        if ((currentPage - 1) * 10 + jobs.length < totalJobsCount) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
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
                    Posting Date:
                    <Dropdown
                        options={postingDate
                            .filter(option => option.company === selectedCompany)
                            .map(option => ({
                                label: option.value,
                                value: option.code
                            }))} 
                        onChange={(selectedOption) => setPostingDateCode(selectedOption ? selectedOption.value : '')}
                    />
                </label>

                <label className="flex flex-col mb-4 md:mb-0">
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
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <>
                    <ul>
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <li key={job.Id}>
                                    <JobCard
                                        baseUrl="" // Set baseUrl to an empty string
                                        job={{
                                            title: job.Title,
                                            id_icims: job.Id,
                                            posted_date: job.PostedDate,
                                            job_path: `https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/${job.Id}`,
                                            normalized_location: job.PrimaryLocation,
                                            basic_qualifications: jobDetails?.ExternalQualificationsStr || '',
                                            description: jobDetails?.ExternalDescriptionStr || '',
                                            preferred_qualifications: jobDetails?.ExternalResponsibilitiesStr || ''
                                        }}
                                        onToggleDetails={handleJobSelect}
                                        isSelected={selectedJobId === job.Id}
                                    />
                                </li>
                            ))
                        ) : (
                            <div>No jobs available.</div>
                        )}
                    </ul>
                    <div className="mt-4 flex justify-between space-x-2">
                        <button onClick={previousPage} disabled={currentPage === 1} className="bg-gray-500 text-white py-2 px-4 rounded">Previous</button>
                        <span>Page {currentPage}</span>
                        <button onClick={nextPage} disabled={(currentPage - 1) * 10 + jobs.length >= totalJobsCount} className="bg-blue-500 text-white py-2 px-4 rounded">Next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default JPMorganChase;
