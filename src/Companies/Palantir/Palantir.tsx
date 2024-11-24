import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import JobCard from '../../Components/JobCard/JobCard';

interface Categories {
    commitment: string;
    location: string;
    team: string;
    allLocations: string[];
}

interface Lists {
    text: string;
    content: string;
}

interface Content {
    descriptionHtml: string;
    lists: Lists[];
    closingHtml: string;
}

interface Urls {
    show: string;
}

interface Data {
    id: string;
    text: string;
    categories: Categories;
    tags: string[];  // Tags are now an array of strings
    content: Content;
    urls: Urls;
    updatedAt: string;
}

interface JobListing {
    data: Data[];
    hasNext: boolean;
    next: string;
}

interface PalantirProps {
    selectedCompany: string;
}

const Palantir: React.FC<PalantirProps> = ({ selectedCompany }) => {
    const [jobs, setJobs] = useState<Data[]>([]); // Store all fetched jobs
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [teamCode, setTeamCode] = useState<string>('');
    const [allLocationsCode, setAllLocationsCode] = useState<string>('');
    const [categoryCode, setCategoryCode] = useState<string>(''); // State for selected category

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const resultsPerPage = 10;

    // Fetch all jobs until hasNext is false
    const fetchAllJobs = async () => {
        setLoading(true);
        setError(null);

        let allJobs: Data[] = [];
        let url = `/palantir/api/lever/v1/postings?state=published`;

        try {
            while (url) {
                const res = await axios.get<JobListing>(url);

                if (res.data && Array.isArray(res.data.data)) {
                    allJobs = [...allJobs, ...res.data.data];
                } else {
                    throw new Error('Invalid response structure: data.data is not an array');
                }

                if (res.data.hasNext && res.data.next) {
                    url = `/palantir/api/lever/v1/postings?state=published&offset=${res.data.next}`;
                } else {
                    url = ''; // No more pages to fetch
                }
            }

            setJobs(allJobs);
        } catch (error) {
            setError('Error fetching data: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCompany === 'Palantir') {
            fetchAllJobs();
        } else {
            setJobs([]); // Clear jobs when the company changes
        }
    }, [selectedCompany]);

    // Log jobs to inspect the structure
    useEffect(() => {
        console.log("Fetched jobs:", jobs);
    }, [jobs]);

    // Extract categories from tags by checking for the "Category:" prefix
    const categories = jobs.length > 0
        ? [
              ...new Set(
                  jobs
                      .flatMap(job =>
                          job.tags
                              .filter(tag => tag.startsWith('Category:')) // Filter tags starting with "Category:"
                              .map(tag => tag.replace('Category:', '').trim()) // Extract the category name after "Category:"
                      )
                      .filter(Boolean) // Filter out null or undefined values
              ),
          ]
        : [];

    console.log("Available Categories:", categories); // Log available categories

    const teams = jobs.length > 0 ? [...new Set(jobs.map(job => job.categories.team).filter(Boolean))] : []; // Get unique teams
    const allLocations = jobs.length > 0 ? [...new Set(jobs.flatMap(job => job.categories.allLocations).filter(Boolean))] : []; // Get unique locations

    // Function to format preferred qualifications and remove the last element
    const formatPreferredQualifications = (lists: { text: string, content: string }[]): string => {
        // Exclude the last element using slice()
        const filteredLists = lists.slice(0, -1); // This removes the last element

        return filteredLists
            .map(item => {
                // Convert the content from HTML to text (strip HTML tags and format nicely)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.content;
                const plainTextContent = tempDiv.textContent || tempDiv.innerText;

                return `<strong>${item.text}:</strong><br>\n${plainTextContent}<br><br>`;
            })
            .join('\n\n'); // Join all items with two newlines for separation
    };

    // Filter jobs based on selected criteria
    const filteredJobs = jobs.filter(job => {
        const matchesTeam = teamCode
            ? job.categories.team.toLowerCase().includes(teamCode.toLowerCase())
            : true;
        const matchesAllLocations = allLocationsCode
            ? job.categories.allLocations.some(loc => loc.toLowerCase().includes(allLocationsCode.toLowerCase()))
            : true;
        const matchesCategory = categoryCode
            ? job.tags.some(tag => tag.startsWith('Category:') && tag.replace('Category:', '').trim() === categoryCode) // Match based on selected category
            : true;

        return matchesTeam && matchesAllLocations && matchesCategory;
    });

    // Pagination logic
    const indexOfLastJob = currentPage * resultsPerPage;
    const indexOfFirstJob = indexOfLastJob - resultsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    const handleTeamChange = (selectedOption: { value: string | null; label: string | null } | null) => {
        setTeamCode(selectedOption?.value || ''); // Adjusted to handle null
    };

    const handleAllLocationsChange = (selectedOption: { value: string | null; label: string | null } | null) => {
        setAllLocationsCode(selectedOption?.value || ''); // Adjusted to handle null
    };

    const handleCategoryChange = (selectedOption: { value: string | null; label: string | null } | null) => {
        setCategoryCode(selectedOption?.value || ''); // Adjusted to handle null
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handleBackPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        {teams.length > 0 && (
                            <label className="flex flex-col">
                                Team:
                                <Select
                                    options={teams.map(team => ({ label: team, value: team }))}
                                    onChange={handleTeamChange}
                                    isClearable
                                    placeholder="Select a Team"
                                />
                            </label>
                        )}
                        {allLocations.length > 0 && (
                            <label className="flex flex-col">
                                All Locations:
                                <Select
                                    options={allLocations.map(location => ({ label: location, value: location }))}
                                    onChange={handleAllLocationsChange}
                                    isClearable
                                    placeholder="Select a Location"
                                />
                            </label>
                        )}
                        {categories.length > 0 && (
                            <label className="flex flex-col">
                                Category:
                                <Select
                                    options={categories.map(category => ({ label: category, value: category }))}
                                    onChange={handleCategoryChange}
                                    isClearable
                                    placeholder="Select a Category"
                                />
                            </label>
                        )}
                    </div>

                    <ul>
                        {currentJobs.length > 0 ? (
                            currentJobs.map((job) => (
                                <li key={job.id}>
                                    <JobCard
                                        job={{
                                            title: job.text,
                                            id_icims: job.id,
                                            job_path: job.urls.show,
                                            postingDate: job.updatedAt,
                                            normalized_location: (job.categories.allLocations || []).join(', '),
                                            basic_qualifications: job.content.descriptionHtml,
                                            description: formatPreferredQualifications(job.content.lists),
                                            preferred_qualifications: '', // Formatted preferred qualifications
                                            responsibilities: job.content.closingHtml,
                                        }}
                                        onToggleDetails={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                                        isSelected={selectedJobId === job.id}
                                        baseUrl=""/>
                                </li>
                            ))
                        ) : (
                            <div>No jobs available for the selected criteria.</div>
                        )}
                    </ul>

                    <div className="mt-4 flex justify-between space-x-2">
                        <button
                            onClick={handleBackPage}
                            disabled={loading || currentPage === 1}
                            className="bg-gray-500 text-white py-2 px-4 rounded">
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button
                            onClick={handleNextPage}
                            disabled={loading || currentJobs.length < resultsPerPage}
                            className="bg-blue-500 text-white py-2 px-4 rounded">
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Palantir;
