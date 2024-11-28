import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import JobCard from "../../Components/JobCard/JobCard"; // Adjust the import path as needed

interface Location {
  name: string;
}

interface Metadata {
  id: number;
  name: string;
  value: string | string[] | null;
  value_type: string;
}

interface Job {
  absolute_url: string;
  location: Location;
  metadata: Metadata[];
  title: string;
  requisition_id: string;
  id: number;
  updated_at: string;
}

interface SpaceXProps {
  selectedCompany: string | null; // Prop for the selected company
}

const SpaceX: React.FC<SpaceXProps> = ({ selectedCompany }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [uniqueDisciplines, setUniqueDisciplines] = useState<string[]>([]);
  const [uniquePrograms, setUniquePrograms] = useState<string[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(
    null
  );
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jobsPerPage] = useState<number>(10); // Jobs per page
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null); // Manage selection state

  const fetchData = async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      const res = await axios.get(`/spaceX/v1/boards/spacex/jobs`); // Update API endpoint as necessary
      const data = res.data;

      if (data.jobs) {
        setJobs(data.jobs);

        // Populate dropdown options
        const uniqueLocations = Array.from(
          new Set(data.jobs.map((job: Job) => job.location.name))
        ) as string[];

        const uniqueDisciplines = Array.from(
          new Set(
            data.jobs.flatMap((job: Job) =>
              job.metadata.find((meta) => meta.name === "Discipline")?.value ??
              []
            )
          )
        ) as string[];

        const uniquePrograms = Array.from(
          new Set(
            data.jobs.flatMap((job: Job) =>
              Array.isArray(
                job.metadata.find((meta) => meta.name === "Program")?.value
              )
                ? (job.metadata.find((meta) => meta.name === "Program")
                    ?.value as string[])
                : []
            )
          )
        ) as string[];

        setUniqueLocations(uniqueLocations);
        setUniqueDisciplines(uniqueDisciplines);
        setUniquePrograms(uniquePrograms);
      } else {
        setError("Invalid data format received from API");
      }
    } catch (err) {
      setError("Error fetching jobs data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on dropdown selections
  useEffect(() => {
    const filterJobs = () => {
      const filtered = jobs.filter((job) => {
        const matchesLocation =
          !selectedLocation || job.location.name === selectedLocation;
        const matchesDiscipline =
          !selectedDiscipline ||
          job.metadata.some(
            (meta) =>
              meta.name === "Discipline" && meta.value === selectedDiscipline
          );
        const matchesProgram =
          !selectedProgram ||
          job.metadata.some(
            (meta) =>
              meta.name === "Program" &&
              Array.isArray(meta.value) &&
              meta.value.includes(selectedProgram)
          );

        return matchesLocation && matchesDiscipline && matchesProgram;
      });

      setFilteredJobs(filtered);
      setCurrentPage(1); // Reset to first page after filtering
    };

    filterJobs();
  }, [jobs, selectedLocation, selectedDiscipline, selectedProgram]);

  useEffect(() => {
    fetchData();
  }, [selectedCompany]); // Fetch data again if the selected company changes

  // Pagination Logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  // Toggle job details visibility
  const handleToggleDetails = (jobId: string) => {
    setSelectedJobId((prevId) => (prevId === jobId ? null : jobId)); // Toggle selected job ID
  };

  return (
    <div className="container mx-auto">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {/* Dropdowns */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Select
              options={uniqueLocations.map((loc) => ({
                value: loc,
                label: loc,
              }))}
              placeholder="Filter by Location"
              onChange={(selectedOption) =>
                setSelectedLocation(selectedOption?.value || null)
              }
              isClearable
            />
            <Select
              options={uniqueDisciplines.map((disc) => ({
                value: disc,
                label: disc,
              }))}
              placeholder="Filter by Discipline"
              onChange={(selectedOption) =>
                setSelectedDiscipline(selectedOption?.value || null)
              }
              isClearable
            />
            <Select
              options={uniquePrograms.map((prog) => ({
                value: prog,
                label: prog,
              }))}
              placeholder="Filter by Program"
              onChange={(selectedOption) =>
                setSelectedProgram(selectedOption?.value || null)
              }
              isClearable
            />
          </div>

          {/* Job List */}
          <ul>
            {currentJobs.map((job) => (
              <li key={job.id}>
                <JobCard
                  job={{
                    title: job.title,
                    id_icims: job.id.toString(),
                    posted_date: job.updated_at,
                    job_path: `${job.absolute_url}`,
                    normalized_location: job.location.name || "Remote",
                    basic_qualifications: "",
                    description: "",
                    preferred_qualifications: "",
                    responsibilities: "",
                  }}
                  onToggleDetails={() => handleToggleDetails(job.id.toString())}
                  isSelected={selectedJobId === job.id.toString()} // Check if the job is selected
                  baseUrl="" // Update with your actual base URL
                />
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpaceX;
