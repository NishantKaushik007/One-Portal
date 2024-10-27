import React, { useEffect, useState, useMemo } from 'react';
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
            setJobs([]);
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

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesLocation = locationCode ? job.workLocation.id === locationCode : true;
            const matchesDepartment = jobCategoryCode ? job.department.id === jobCategoryCode : true;
            return matchesLocation && matchesDepartment;
        });
    }, [jobs, locationCode, jobCategoryCode]);

    const handleDepartmentChange = (selectedOption: { value: string; label: string } | null) => {
        setJobCategoryCode(selectedOption ? selectedOption.value : '');
    };

    const handleLocationChange = (selectedOption: { value: string; label: string } | null) => {
        setLocationCode(selectedOption ? selectedOption.value : '');
    };

    const calculateDropdownWidth = (options: { label: string; value: string }[], placeholder: string) => {
        const maxLength = Math.max(
            ...options.map(option => option.label.length),
            placeholder.length
        );

        // Increase multiplier to account for the width of the dropdown and add extra padding
        return `${Math.ceil(maxLength * 8.5) + 50}px`; // Increased padding
    };

    // Adjust dropdown widths specifically
    const departmentDropdownWidth = calculateDropdownWidth(filteredJobCategories, 'Select a department');
    const locationDropdownWidth = calculateDropdownWidth(filteredLocations, 'Select a location');

    const dropdownStyles = {
        control: (provided: any) => ({
            ...provided,
            minWidth: '200px',
            width: departmentDropdownWidth,
        }),
        menu: (provided: any) => ({
            ...provided,
            width: departmentDropdownWidth,
        }),
        singleValue: (provided: any) => ({
            ...provided,
            whiteSpace: 'normal',
        }),
        option: (provided: any) => ({
            ...provided,
            whiteSpace: 'normal',
        }),
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
                        styles={{
                            ...dropdownStyles,
                            control: (provided: any) => ({
                                ...provided,
                                width: departmentDropdownWidth,
                            }),
                            menu: (provided: any) => ({
                                ...provided,
                                width: departmentDropdownWidth,
                            }),
                        }}
                    />
                </label>
                <label className="flex flex-col">
                    Locations:
                    <Select 
                        options={filteredLocations} 
                        onChange={handleLocationChange} 
                        isClearable
                        placeholder="Select a location"
                        styles={{
                            ...dropdownStyles,
                            control: (provided: any) => ({
                                ...provided,
                                width: locationDropdownWidth,
                            }),
                            menu: (provided: any) => ({
                                ...provided,
                                width: locationDropdownWidth,
                            }),
                        }}
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
