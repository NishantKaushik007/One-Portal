import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jobCategory, location } from '../../Data/data';
import JobCard from '../../Components/JobCard/JobCard';

interface Job {
    uuid: string;
    name: string;
    url: string;
    workLocation: {
        id: string;
        label: string;
    };
    department: {
        id: string;
        label: string;
    };
    title: string;
    basic_qualifications: string; 
    description: string; 
    preferred_qualifications: string; 
}

interface ApiResponse {
    pageProps: {
        jobs: Job[];
    };
}

interface RipplingProps {
    selectedCompany: string;
}

const Rippling: React.FC<RipplingProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [locationCode, setLocationCode] = useState<string>('');

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        const url = `/_next/data/mQnQRZZE96pBwyvaaXPuY/en-GB/careers/open-roles.json`;
        try {
            const res = await axios.get<ApiResponse>(url);
            if (res.data.pageProps?.jobs) {
                setJobs(res.data.pageProps.jobs);
            } else {
                throw new Error('Invalid response structure: jobs not found');
            }
        } catch (error) {
            setError('Error fetching data: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCompany === 'Rippling') {
            fetchJobs();
        } else {
            setJobs([]); // Clear jobs when the company changes
        }
    }, [selectedCompany]);

    const toggleJobDetails = (jobId: string) => {
        setSelectedJobId(selectedJobId === jobId ? null : jobId);
    };

    const handleFilterChange = () => {
        fetchJobs(); // Refetch jobs based on current filters
    };

    const filteredJobCategories = jobCategory.filter(option => option.company === selectedCompany).map(option => ({
        label: option.value,
        value: option.code
    }));

    const filteredLocations = location.filter(option => option.company === selectedCompany).map(option => ({
        label: option.value,
        value: option.code
    }));

    // Aggregate jobs by UUID
    const jobsMap = jobs.reduce<{ [key: string]: Job & { locations: string[] } }>((acc, job) => {
        if (!acc[job.uuid]) {
            acc[job.uuid] = { ...job, locations: [job.workLocation.label] };
        } else {
            acc[job.uuid].locations.push(job.workLocation.label);
        }
        return acc;
    }, {});

    // Convert the jobs map back to an array
    const aggregatedJobs = Object.values(jobsMap);

    const filteredJobs = aggregatedJobs.filter(job => {
        const matchesLocation = locationCode ? job.workLocation.id === locationCode : true;
        const matchesDepartment = jobCategoryCode ? job.department.id === jobCategoryCode : true;
        return matchesLocation && matchesDepartment;
    });

    const handleDepartmentChange = (selectedOption: { value: string; label: string } | null) => {
        setJobCategoryCode(selectedOption ? selectedOption.value : '');
        handleFilterChange(); // Refetch jobs when department changes
    };

    const handleLocationChange = (selectedOption: { value: string; label: string } | null) => {
        setLocationCode(selectedOption ? selectedOption.value : '');
        handleFilterChange(); // Refetch jobs when location changes
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <label className="flex flex-col">
                    Departments:
                    <Select 
                        options={filteredJobCategories} 
                        onChange={handleDepartmentChange} 
                        isClearable
                        placeholder="Select a department"
                    />
                </label>
                <label className="flex flex-col">
                    Locations:
                    <Select 
                        options={filteredLocations} 
                        onChange={handleLocationChange} 
                        isClearable
                        placeholder="Select a location"
                    />
                </label>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div>
                    <ul>
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <li key={job.uuid}>
                                    <JobCard
                                        job={{
                                            title: job.name,
                                            id_icims: job.uuid,
                                            job_path: job.url,
                                            normalized_location: job.locations.join(', '),
                                            basic_qualifications: job.basic_qualifications || "",
                                            description: selectedJobId === job.uuid ? job.description || '' : '',
                                            preferred_qualifications: job.preferred_qualifications || "",
                                            responsibilities: "",
                                        }}
                                        onToggleDetails={toggleJobDetails}
                                        isSelected={selectedJobId === job.uuid}
                                        baseUrl=""
                                    />
                                </li>
                            ))
                        ) : (
                            <div>No jobs available for the selected criteria.</div>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Rippling;
