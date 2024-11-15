import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select'; // Import react-select
import JobCard from '../../Components/JobCard/JobCard'; // Adjust the import path as necessary

interface Job {
    job_title: string;
    job_id: string;
    job_code: string;
    location: string[];
    location_city: string[];
    location_country: string;
    experience_from: string;
    experience_to: string;
    is_remote: number;
    job_updated_timestamp: string;
    post_on_careers_page: number;
    business_unit: string;
}

interface MakeMyTripProps {
    selectedCompany: string;
}

const MakeMyTrip: React.FC<MakeMyTripProps> = ({}) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const [selectedLocation, setSelectedLocation] = useState<string>('');  
    const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>('');  
    const [selectedExperienceRange, setSelectedExperienceRange] = useState<string>('');  

    const [locations, setLocations] = useState<string[]>([]);
    const [businessUnits, setBusinessUnits] = useState<string[]>([]);
    const [experienceRanges, setExperienceRanges] = useState<string[]>([]);

    // Job descriptions state
    const [jobDescriptions, setJobDescriptions] = useState<Record<string, string>>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const jobsPerPage = 10;

    // Fetch jobs from the API
    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        const url = `/makemytrip/api/jobs`;
        console.log(url);

        try {
            const res = await axios.get(url);
            if (res.data.status === 1) {
                const activeJobs: Job[] = res.data.data.filter((job: Job) => job.post_on_careers_page === 1);
                setJobs(activeJobs);

                setLocations(['All Locations', ...[...new Set(activeJobs.flatMap((job: Job) => job.location as string[]))]]);
                setBusinessUnits(['All Business Units', ...[...new Set(activeJobs.map((job: Job) => job.business_unit))]]);

                const experienceRangeSet = new Set<string>();
                activeJobs.forEach((job: Job) => {
                    const from = parseInt(job.experience_from);
                    const to = parseInt(job.experience_to);
                    if (from < to) {
                        experienceRangeSet.add(`${from} - ${to} years`);
                    }
                });
                setExperienceRanges(['All Experience Ranges', ...[...experienceRangeSet]]);
            } else {
                setError('No jobs found');
            }
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch job description
    const fetchJobDescription = async (jobId: string) => {
        try {
            console.log(`Fetching job description for jobId: ${jobId}`);  // Log the jobId
            const res = await axios.get(`/makemytrip/api/jobDetails?jobId=${jobId}`);
            console.log(`Job description response:`, res.data);  // Log the API response

            if (res.data.status === 1) {
                setJobDescriptions((prevState) => {
                    console.log(`Updating job description for jobId: ${jobId}`);  // Log before updating state
                    return {
                        ...prevState,
                        [jobId]: res.data.data.job_decription,
                    };
                });
            } else {
                console.error(`Error: No description found for jobId ${jobId}`);
            }
        } catch (error) {
            console.error(`Error fetching job description for ${jobId}:`, error);
        }
    };

    // Handle job selection and toggle job description
    const handleToggleDetails = (jobId: string) => {
        if (selectedJobId === jobId) {
            setSelectedJobId(null); // Hide details if the job is already selected
        } else {
            setSelectedJobId(jobId); // Show details if the job is clicked
            fetchJobDescription(jobId); // Fetch description when job is selected
        }
    };

    // Filter jobs based on dropdown selections
    const filteredJobs = jobs.filter((job) => {
        const locationMatch = selectedLocation && selectedLocation !== 'All Locations' ? job.location.includes(selectedLocation) : true;
        const businessUnitMatch = selectedBusinessUnit && selectedBusinessUnit !== 'All Business Units' ? job.business_unit === selectedBusinessUnit : true;
        const experienceMatch = selectedExperienceRange && selectedExperienceRange !== 'All Experience Ranges'
            ? (() => {
                  const [rangeFrom, rangeTo] = selectedExperienceRange.split(' - ').map(val => parseInt(val));
                  const jobFrom = parseInt(job.experience_from);
                  const jobTo = parseInt(job.experience_to);
                  return jobFrom >= rangeFrom && jobTo <= rangeTo;
              })()
            : true;

        return locationMatch && businessUnitMatch && experienceMatch;
    });

    // Pagination logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredJobs.length / jobsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleBackPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const formatJobTitle = (title: string) => {
        return title.replace(/\//g, '-').replace(/\s+/g, '-');
    };

    return (
        <div className="container mx-auto">
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : (
                <div>
                    <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                        {/* Location Dropdown with react-select */}
                        <label className="flex flex-col mb-4 md:mb-0">
                            Location:
                            <Select
                                options={locations.map(location => ({ label: location, value: location }))}
                                onChange={(selectedOption) => setSelectedLocation(selectedOption ? selectedOption.value : '')}
                                value={locations.find(location => location === selectedLocation) ? { label: selectedLocation, value: selectedLocation } : null}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Location"
                            />
                        </label>

                        {/* Business Unit Dropdown with react-select */}
                        <label className="flex flex-col mb-4 md:mb-0">
                            Business Unit:
                            <Select
                                options={businessUnits.map(unit => ({ label: unit, value: unit }))}
                                onChange={(selectedOption) => setSelectedBusinessUnit(selectedOption ? selectedOption.value : '')}
                                value={businessUnits.find(unit => unit === selectedBusinessUnit) ? { label: selectedBusinessUnit, value: selectedBusinessUnit } : null}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Business Unit"
                            />
                        </label>

                        {/* Experience Range Dropdown with react-select */}
                        <label className="flex flex-col mb-4 md:mb-0">
                            Experience Range:
                            <Select
                                options={experienceRanges.map(range => ({ label: range, value: range }))}
                                onChange={(selectedOption) => setSelectedExperienceRange(selectedOption ? selectedOption.value : '')}
                                value={experienceRanges.find(range => range === selectedExperienceRange) ? { label: selectedExperienceRange, value: selectedExperienceRange } : null}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Experience Range"
                            />
                        </label>
                    </div>

                    <ul>
                        {currentJobs.length === 0 ? (
                            <div className="text-center">No jobs match your criteria</div>
                        ) : (
                            currentJobs.map((job) => (
                                <li key={job.job_id}>
                                    <JobCard
                                        job={{
                                            title: job.job_title,
                                            id_icims: job.job_id,
                                            posted_date: job.job_updated_timestamp,
                                            job_path: `https://careers.makemytrip.com/prod/opportunity/${job.job_id}/${formatJobTitle(job.job_title)}`,
                                            normalized_location: job.location.join(', ') || 'Not Specified',
                                            basic_qualifications: "",
                                            description: jobDescriptions[job.job_id] || 'Description is loading...', // Show loading message while fetching
                                            preferred_qualifications: "",
                                            responsibilities: "",
                                        }}
                                        onToggleDetails={() => handleToggleDetails(job.job_id)}
                                        isSelected={selectedJobId === job.job_id}
                                        baseUrl=""
                                    />
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="mt-4 flex justify-between space-x-2">
                        <button onClick={handleBackPage} disabled={currentPage === 1} className="bg-gray-500 text-white py-2 px-4 rounded">
                            Previous
                        </button>
                        <span>
                            Page {currentPage}
                        </span>
                        <button onClick={handleNextPage} disabled={currentPage >= Math.ceil(filteredJobs.length / jobsPerPage)} className="bg-blue-500 text-white py-2 px-4 rounded">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MakeMyTrip;
