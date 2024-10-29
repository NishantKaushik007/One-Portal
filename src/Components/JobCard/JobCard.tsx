import React from 'react';

interface SecondaryLocation {
    Name: string; // Name of the secondary location
}

interface Job {
    title: string;
    id_icims?: string; // Optional for backward compatibility
    jobId?: string; // Optional for backward compatibility
    posted_date?: string; // Optional for backward compatibility
    postingDate?: string; // Optional for backward compatibility
    job_path?: string;
    url?:string;
    normalized_location?: string; // Optional for backward compatibility
    secondaryLocations?: SecondaryLocation[]; // Added secondary locations
    basic_qualifications: string;
    description: string;
    preferred_qualifications: string;
    responsibilities?: string; // Made optional
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
            const jobPath = job.job_path ? job.job_path : job.url;
            window.open(`${baseUrl}${jobPath}`, '_blank');
        } else {
            console.error('Job path is not defined');
        }
    };

    // Determine job ID, posting date, and location based on available properties
    const jobId = job.id_icims || job.jobId;
    const postingDate = job.posted_date || job.postingDate;
    const primaryLocation = job.normalized_location || '';
    const secondaryLocations = job.secondaryLocations?.map(location => location.Name) || [];
    const fullLocation = [primaryLocation, ...secondaryLocations].filter(Boolean).join(', '); // Join locations

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 mb-4 ${isSelected ? 'bg-gray-100' : ''}`}>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <div className="flex items-center mt-1">
                <span className="flex-1 text-gray-600 text-sm">Job ID: {jobId}</span>
                <span className="flex-1 text-center text-gray-600 text-sm">{postingDate ? new Date(postingDate).toLocaleDateString() : 'N/A'}</span>
                <span className="flex-1 text-right text-gray-600 text-sm">Location: {fullLocation || 'N/A'}</span>
            </div>
            <div className="flex justify-between mt-2">
                <button
                    onClick={() => onToggleDetails(jobId!)}
                    className="text-white bg-blue-500 hover:bg-blue-600 rounded px-4 py-2"
                    aria-expanded={isSelected}
                    aria-label={isSelected ? 'Hide job details' : 'View job details'}
                >
                    {isSelected ? 'Hide Details' : 'View Details'}
                </button>
                <button
                    onClick={handleViewJob}
                    className="text-white bg-green-500 hover:bg-green-600 rounded px-4 py-2"
                    aria-label="View job posting"
                >
                    View Job
                </button>
            </div>

            {/* Job Details Section */}
            {isSelected && (
                <div className="mt-2 border-t pt-2">
                    <h4 className="font-semibold">Description:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.description || '' }} />
                    <h4 className="font-semibold">Basic Qualifications:</h4>
                    <div dangerouslySetInnerHTML={{ __html: job.basic_qualifications || '' }} />
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
