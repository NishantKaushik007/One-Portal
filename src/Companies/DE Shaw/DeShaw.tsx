import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import JobCard from '../../Components/JobCard/JobCard'; // Adjust the import path as needed

interface JobDescription {
    websiteDescription: string;
    responsibilities: string;
    peopleWeAreLookingForStr: string;
}

interface JobLocations {
    name: string;
}

interface JobMetadata {
    activeOnWebsite: boolean;
    jobLocations: JobLocations[];
    workStatus: string;
    jobSeekerCategories: string[];
}

interface Department {
    name: string;
}

interface Job {
    id: string;
    displayName: string;
    jobDescription: JobDescription;
    jobHeaders: string[];
    jobMetadata: JobMetadata;
    department: Department;
    jobUrl: string;
}

interface DeShawProps {
    selectedCompany: string | null; // Prop for the selected company
}

const DeShaw: React.FC<DeShawProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedJobSeekerCategory, setSelectedJobSeekerCategory] = useState<string | null>(null);
    const [locations, setLocations] = useState<string[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [jobSeekerCategories, setJobSeekerCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filtered, setFiltered] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const jobsPerPage = 10;

    useEffect(() => {
        const fetchJobs = async () => {
            if (!selectedCompany) return;

            setIsLoading(true);
            setError(null);
            setJobs([]);

            try {
                const response1 = await axios.get(`/deshaw/services/jobs/getJobsActiveOnApplicationPages/1`);
                const response2 = await axios.get('/deshaw/services/jobs/getJobsActiveOnApplicationPages/2');
                const combinedJobs = [...response1.data, ...response2.data];
                const data: Job[] = combinedJobs;

                const activeJobs = data.filter(job => job.jobMetadata.activeOnWebsite);

                const uniqueLocations = [
                    ...new Set(activeJobs.flatMap(job => job.jobMetadata.jobLocations.map(location => location.name))),
                ];
                setLocations(uniqueLocations);

                const uniqueDepartments = [
                    ...new Set(activeJobs.map(job => job.jobHeaders[0])),
                ];
                setDepartments(uniqueDepartments);

                const uniqueJobSeekerCategories = [
                    ...new Set(activeJobs.flatMap(job => job.jobMetadata.jobSeekerCategories)),
                ];
                setJobSeekerCategories(uniqueJobSeekerCategories);

                const filteredJobs = activeJobs.filter(job => {
                    const locationMatch = selectedLocation
                        ? job.jobMetadata.jobLocations.some(location => location.name === selectedLocation)
                        : true;
                    const departmentMatch = selectedDepartment
                        ? job.jobHeaders[0] === selectedDepartment
                        : true;
                    const jobSeekerCategoryMatch = selectedJobSeekerCategory
                        ? job.jobMetadata.jobSeekerCategories?.includes(selectedJobSeekerCategory)
                        : true;
                    return locationMatch && departmentMatch && jobSeekerCategoryMatch;
                });

                setJobs(filteredJobs);
                setFiltered(true);
            } catch (error) {
                setError('Error fetching jobs. Please try again later.');
                console.error("Error fetching jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [selectedCompany, selectedLocation, selectedDepartment, selectedJobSeekerCategory]);

    const handleToggleDetails = (jobId: string) => {
        setSelectedJobId((prevId) => (prevId === jobId ? null : jobId));
    };

    const showJobSeekerCategoryDropdown = selectedLocation && !['Gurugram', 'Hyderabad', 'Bengaluru'].includes(selectedLocation);

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                <div className="flex flex-col mb-4">
                    <label htmlFor="location-select">Location:</label>
                    <Select
                        id="location-select"
                        options={locations.map(location => ({ value: location, label: location }))}
                        value={selectedLocation ? { value: selectedLocation, label: selectedLocation } : null}
                        onChange={(selectedOption) => setSelectedLocation(selectedOption?.value || null)}
                        placeholder="Select Location"
                        isClearable
                    />
                </div>

                <div className="flex flex-col mb-4">
                    <label htmlFor="department-select">Department:</label>
                    <Select
                        id="department-select"
                        options={departments.map(department => ({ value: department, label: department }))}
                        value={selectedDepartment ? { value: selectedDepartment, label: selectedDepartment } : null}
                        onChange={(selectedOption) => setSelectedDepartment(selectedOption?.value || null)}
                        placeholder="Select Department"
                        isClearable
                    />
                </div>

                {showJobSeekerCategoryDropdown && (
                    <div className="flex flex-col mb-4">
                        <label htmlFor="job-seeker-category-select">Job Seeker Category:</label>
                        <Select
                            id="job-seeker-category-select"
                            options={jobSeekerCategories.map(category => ({ value: category, label: category }))}
                            value={selectedJobSeekerCategory ? { value: selectedJobSeekerCategory, label: selectedJobSeekerCategory } : null}
                            onChange={(selectedOption) => setSelectedJobSeekerCategory(selectedOption?.value || null)}
                            placeholder="Select Job Seeker Category"
                            isClearable
                        />
                    </div>
                )}
            </div>

            {isLoading && <p>Loading jobs...</p>}
            {error && <p>{error}</p>}
            {!isLoading && filtered && jobs.length === 0 && <p>No jobs available with the selected filters.</p>}

            {currentJobs.map((job) => {
                const baseUrl =
                    job.jobMetadata.jobLocations.some(location => location.name === 'Gurugram' || location.name === 'Hyderabad' || location.name === 'Bengaluru')
                        ? 'https://www.deshawindia.com/careers/'
                        : 'https://www.deshaw.com/careers/';

                return (
                    <JobCard
                        key={job.id + job.jobUrl}
                        job={{
                            title: job.displayName,
                            id_icims: job.id,
                            posted_date: '',
                            job_path: job.jobUrl.toLowerCase(),
                            normalized_location: job.jobMetadata.jobLocations.map(location => location.name).join(', ') || '',
                            basic_qualifications: job.jobDescription.peopleWeAreLookingForStr || '',
                            description: job.jobDescription.websiteDescription || '',
                            preferred_qualifications: '',
                            responsibilities: job.jobDescription.responsibilities || '',
                        }}
                        onToggleDetails={() => handleToggleDetails(job.id)}
                        isSelected={selectedJobId === job.id}
                        baseUrl={baseUrl}
                    />
                );
            })}

            {jobs.length > jobsPerPage && (
                <div className="mt-4 flex justify-between space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-gray-500 text-white py-2 px-4 rounded"
                    >
                        Previous
                    </button>
                    <span>Page {currentPage}</span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(jobs.length / jobsPerPage)}
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeShaw;
