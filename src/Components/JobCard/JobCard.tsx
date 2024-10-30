import React from 'react';

interface SecondaryLocation {
    Name: string; // Name of the secondary location
}

interface Job {
    title: string;
    id_icims?: string; // Optional for backward compatibility
    req_id?: string;
    jobId?: string; // Optional for backward compatibility
    posted_date?: string; // Optional for backward compatibility
    postingDate?: string; // Optional for backward compatibility
    job_path?: string;
    apply_url?: string;
    url?: string;
    location_name?: string;
    normalized_location?: string; // Optional for backward compatibility
    secondaryLocations?: SecondaryLocation[]; // Added secondary locations
    basic_qualifications?: string;
    qualifications?: string;
    description: string;
    preferred_qualifications?: string;
    responsibilities?: string; // Made optional
    salary_range?: string;
}

interface JobCardProps {
    job: Job;
    onToggleDetails: (jobId: string) => void;
    isSelected: boolean;
    baseUrl: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, onToggleDetails, isSelected, baseUrl }) => {
    const handleViewJob = () => {
        if (job.job_path) {
            const jobPath = job.job_path ? job.job_path : (job.url ? job.url : job.apply_url);
            window.open(`${baseUrl}${jobPath}`, '_blank');
        } else {
            console.error('Job path is not defined');
        }
    };

    const jobId = job.id_icims || job.jobId || job.req_id;
    const postingDate = job.posted_date || job.postingDate;
    const primaryLocation = job.normalized_location || job.location_name || '';
    const secondaryLocations = job.secondaryLocations?.map(location => location.Name) || [];
    const fullLocation = [primaryLocation, ...secondaryLocations].filter(Boolean).join(', ');

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 mb-4 ${isSelected ? 'bg-gray-100' : ''}`}>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <div className="flex flex-col md:flex-row items-center mt-1 gap-x-10 justify-between">
                <span className="flex flex-row items-center">
                    <img
                        src="./JobCard Logo/JobID.png"
                        alt="Job ID Icon"
                        className="mr-1 w-7 h-7" // Adjust size as needed
                    />
                    <span>{jobId}</span>
                </span>
                <span className="flex flex-row items-center">
                    <img
                        src="./JobCard Logo/Salary.png"
                        alt="Salary Icon"
                        className="mr-1 w-10 h-10" // Adjust size as needed
                    />
                    <span>{job.salary_range || 'N/A'}</span>
                </span>
                <span className="flex flex-row items-center">
                    <img
                        src="./JobCard Logo/Calendar.png"
                        alt="Calendar Icon"
                        className="mr-1 w-7 h-7" // Adjust size as needed
                    />
                    <span>{postingDate ? new Date(postingDate).toLocaleDateString() : 'N/A'}</span>
                </span>
                <span className="flex flex-row items-center">
                    <img
                        src="./JobCard Logo/Location.png"
                        alt="Location Icon"
                        className="mr-1 w-6 h-6" // Adjust size as needed
                    />
                    <span>{fullLocation || 'N/A'}</span>
                </span>
            </div>
            <div className="flex flex-col md:flex-row justify-between mt-2">
                <button
                    onClick={handleViewJob}
                    className="text-white bg-green-500 hover:bg-green-600 rounded px-4 py-2 mb-2 md:mb-0 order-1 md:order-2"
                    aria-label="View job posting"
                >
                    View Job
                </button>
                <button
                    onClick={() => onToggleDetails(jobId!)}
                    className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 order-2 md:order-1"
                    aria-expanded={isSelected}
                    aria-label={isSelected ? 'Hide job details' : 'View job details'}
                >
                    {isSelected ? 'Hide Details' : 'View Details'}
                </button>
            </div>

            {/* Job Details Section */}
            {isSelected && (
                <div className="mt-2 border-t pt-2">
                    <h4 className="font-semibold">Description:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.description || '' }} />
                    <h4 className="font-semibold">Basic Qualifications:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.basic_qualifications || job.qualifications || '' }} />
                    <h4 className="font-semibold">Preferred Qualifications:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.preferred_qualifications || '' }} />
                    {job.responsibilities && (
                        <>
                            <h4 className="font-semibold">Responsibilities:</h4>
                            <div dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobCard;
