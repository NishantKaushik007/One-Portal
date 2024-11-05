import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { country, jobCategory } from '../../Data/data'; // Ensure this file has the correct data format
import JobCard from '../../Components/JobCard/JobCard';

interface Job {
    title: string;
    id: string;
    updated_at: string;
    absolute_url: string;
    location: {
        name: string;
    };
}

interface Department {
    id: number;
    name: string;
    jobs: Job[]; // Jobs can be an empty array
}

interface CountryResponse {
    id: number;
    name: string;
    departments: Department[]; // Should be an array of departments
}

interface SumoLogicProps {
    selectedCompany: string;
}

const SumoLogic: React.FC<SumoLogicProps> = ({ selectedCompany }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [departmentJobs, setDepartmentJobs] = useState<Job[]>([]);
    const [countryJobs, setCountryJobs] = useState<Job[]>([]);
    const [commonJobs, setCommonJobs] = useState<Job[]>([]); // Holds common jobs
    const [defaultJobs, setDefaultJobs] = useState<Job[]>([]); // State to hold default jobs
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [jobsPerPage] = useState<number>(10); // Set how many jobs to display per page

    useEffect(() => {
        const fetchDefaultJobs = async () => {
            try {
                const response = await axios.get('https://api.greenhouse.io/v1/boards/sumologic/jobs/');
                const jobs = response.data.jobs.map((job: any) => ({
                    title: job.title,
                    id: job.id.toString(),
                    updated_at: job.updated_at,
                    absolute_url: job.absolute_url,
                    location: job.location,
                }));
                setDefaultJobs(jobs);
                setCommonJobs(jobs); // Set default jobs initially
            } catch (error) {
                console.error("Error fetching default jobs:", error);
                setError('Error fetching default jobs');
            }
        };

        fetchDefaultJobs();
    }, []);

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch departments if needed
            } catch (error) {
                console.error("Error fetching departments:", error);
                setError('Error fetching departments');
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, [selectedCompany]);

    const fetchDepartmentJobs = async (jobCategoryCode: string) => {
        setLoading(true);
        setError(null);
        try {
            const departmentResponse = await axios.get(`/v1/boards/sumologic/departments/${jobCategoryCode}`);
            const jobs = departmentResponse.data.jobs.map((job: Job) => ({
                title: job.title,
                id: job.id.toString(),
                updated_at: job.updated_at,
                absolute_url: job.absolute_url,
                location: job.location,
            }));

            setDepartmentJobs(jobs);
            updateCommonJobs(jobs, countryJobs); // Update common jobs based on current jobs
        } catch (error) {
            console.error("Error fetching department jobs:", error);
            setError('Error fetching department jobs');
        } finally {
            setLoading(false);
        }
    };

    const fetchCountryJobs = async (countryCode: string) => {
        setLoading(true);
        setError(null);
        try {
            const countryResponse = await axios.get(`/v1/boards/sumologic/offices/${countryCode}`);
            const countryData: CountryResponse = countryResponse.data;

            let jobs: Job[] = [];
            if (countryData && Array.isArray(countryData.departments)) {
                const countryDepartments = countryData.departments;
                countryDepartments.forEach((dept: Department) => {
                    if (Array.isArray(dept.jobs)) {
                        dept.jobs.forEach((job: Job) => {
                            jobs.push({
                                title: job.title,
                                id: job.id.toString(),
                                updated_at: job.updated_at,
                                absolute_url: job.absolute_url,
                                location: job.location,
                            });
                        });
                    }
                });
            }

            setCountryJobs(jobs);
            updateCommonJobs(departmentJobs, jobs); // Update common jobs based on current jobs
        } catch (error) {
            console.error("Error fetching country jobs:", error);
            setError('Error fetching country jobs');
        } finally {
            setLoading(false);
        }
    };

    const updateCommonJobs = (newDepartmentJobs: Job[], newCountryJobs: Job[]) => {
        if (newDepartmentJobs.length > 0 && newCountryJobs.length > 0) {
            const intersectionJobs = newDepartmentJobs.filter((job: Job) =>
                newCountryJobs.some((countryJob: Job) => countryJob.id === job.id)
            );
            setCommonJobs(intersectionJobs);
        } else if (newDepartmentJobs.length > 0) {
            setCommonJobs(newDepartmentJobs);
        } else if (newCountryJobs.length > 0) {
            setCommonJobs(newCountryJobs);
        } else {
            setCommonJobs(defaultJobs); // Fallback to default jobs if no jobs are selected
        }
    };

    const handleDepartmentChange = (selectedOption: { value: string; label: string } | null) => {
        const selectedCode = selectedOption ? selectedOption.value : null;
        if (selectedCode) {
            fetchDepartmentJobs(selectedCode);
        } else {
            setDepartmentJobs([]); // Clear department jobs
            updateCommonJobs([], countryJobs); // Update common jobs based on remaining jobs
        }
    };

    const handleLocationChange = (selectedOption: { value: string; label: string } | null) => {
        const selectedCode = selectedOption ? selectedOption.value : null;
        if (selectedCode) {
            fetchCountryJobs(selectedCode);
        } else {
            setCountryJobs([]); // Clear country jobs
            updateCommonJobs(departmentJobs, []); // Update common jobs based on remaining jobs
        }
    };

    const filteredJobCategories = jobCategory
        .filter(option => option.company === 'Sumo Logic')
        .map(option => ({
            label: option.value,
            value: option.code
        }));

    const filteredCountries = country
        .filter(option => option.company === 'Sumo Logic')
        .map(option => ({
            label: option.value,
            value: option.code
        }));

    // Pagination Logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = commonJobs.slice(indexOfFirstJob, indexOfLastJob);

    const totalPages = Math.ceil(commonJobs.length / jobsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handleBackPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                <label className="flex flex-col mb-4 md:mb-0">
                    Job Category:
                    <Select 
                        options={filteredJobCategories} 
                        onChange={handleDepartmentChange} 
                        isClearable
                        placeholder="Select a department"
                    />
                </label>

                <label className="flex flex-col mb-4 md:mb-0">
                    Country:
                    <Select 
                        options={filteredCountries} 
                        onChange={handleLocationChange} 
                        isClearable
                        placeholder="Select a country"
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
                        {currentJobs.map((job) => (
                            <li key={job.id}>
                                <JobCard
                                    job={{
                                        title: job.title,
                                        id_icims: job.id,
                                        posted_date: job.updated_at,
                                        job_path: job.absolute_url,
                                        normalized_location: job.location.name,
                                        basic_qualifications: "",
                                        description: '',
                                        preferred_qualifications: "",
                                        responsibilities: "",
                                    }}
                                    onToggleDetails={(jobId) => setSelectedJobId(jobId)}
                                    isSelected={selectedJobId === job.id}
                                    baseUrl=""
                                />
                            </li>
                        ))}
                    </ul>

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
                            disabled={loading || currentPage === totalPages} // Disable while loading
                            className="bg-blue-500 text-white py-2 px-4 rounded">
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SumoLogic;
