import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jobCategory, location } from '../../Data/data';

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

    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [locationCode, setLocationCode] = useState<string>('');

    // Function to fetch jobs based on the selected filters
    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        const url = `/_next/data/r1zEgQrVrrgLzTRFhjDxY/en-GB/careers/open-roles.json`;
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

    // Fetch jobs when the selected company changes
    useEffect(() => {
        if (selectedCompany === 'Rippling') {
            fetchJobs();
        } else {
            setJobs([]); // Clear jobs when the company changes
        }
    }, [selectedCompany]);

    // Function to handle filter change and refetch data
    const handleFilterChange = () => {
        fetchJobs(); // Refetch jobs based on current filters
    };

    // Filter job categories and locations based on selected company
    const filteredJobCategories = jobCategory.filter(option => option.company === selectedCompany).map(option => ({
        label: option.value,
        value: option.code
    }));

    const filteredLocations = location.filter(option => option.company === selectedCompany).map(option => ({
        label: option.value,
        value: option.code
    }));

    // Filter jobs based on selected criteria
    const filteredJobs = jobs.filter(job => {
        const matchesLocation = locationCode ? job.workLocation.id === locationCode : true;
        const matchesDepartment = jobCategoryCode ? job.department.id === jobCategoryCode : true;
        return matchesLocation && matchesDepartment;
    });

    // Handlers for dropdown changes
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
            <div className="flex flex-row space-x-4 mb-6">
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
                                    <div>
                                        <h3>{job.name}</h3>
                                        <p>Job ID: {job.uuid}</p>
                                        <p>Location: {job.workLocation.label}</p>
                                        <p>Department: {job.department.label}</p>
                                        <a href={job.url} target="_blank" rel="noopener noreferrer">View Job</a>
                                    </div>
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
