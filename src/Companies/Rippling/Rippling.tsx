//Not Re-rendreing during filter change on runtime, only renders for filters when make some changes in code
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
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

const Dropdown = ({ options, onChange }: { options: { label: string; value: string }[], onChange: (value: string) => void }) => (
    <select onChange={(e) => onChange(e.target.value)} aria-label="Select an option">
        <option value="">Select an option</option>
        {options.map(option => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);

const Rippling: React.FC<RipplingProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [jobCategoryCode, setJobCategoryCode] = useState<string>('');
    const [locationCode, setLocationCode] = useState<string>('');

    // Fetch jobs only when selectedCompany is "Rippling"
    useEffect(() => {
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

        if (selectedCompany === 'Rippling') {
            fetchJobs();
        } else {
            setJobs([]); // Clear jobs if another company is selected
        }
    }, [selectedCompany]);

    const filteredJobCategories = useMemo(() => 
        jobCategory.filter(option => option.company === selectedCompany).map(option => ({
            label: option.value,
            value: option.code
        })), [selectedCompany]);

    const filteredLocations = useMemo(() => 
        location.filter(option => option.company === selectedCompany).map(option => ({
            label: option.value,
            value: option.code
        })), [selectedCompany]);

    // Use memo to filter jobs based on selected location and department
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesLocation = locationCode ? job.workLocation.id === locationCode : true;
            const matchesDepartment = jobCategoryCode ? job.department.id === jobCategoryCode : true;
            return matchesLocation && matchesDepartment;
        });
    }, [jobs, locationCode, jobCategoryCode]);

    const handleDepartmentChange = (value: string) => {
        setJobCategoryCode(value);
        console.log('Selected Department:', value);
    };

    const handleLocationChange = (value: string) => {
        setLocationCode(value);
        console.log('Selected Location:', value);
    };

    return (
        <div>
            <div className="flex flex-row space-x-4 mb-6">
                <label className="flex flex-col">
                    Departments:
                    <Dropdown 
                        options={filteredJobCategories} 
                        onChange={handleDepartmentChange} 
                    />
                </label>
                <label className="flex flex-col">
                    Locations:
                    <Dropdown 
                        options={filteredLocations} 
                        onChange={handleLocationChange} 
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
