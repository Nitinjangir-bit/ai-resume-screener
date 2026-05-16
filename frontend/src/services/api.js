import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export const uploadResume = (formData) =>
  api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getAllCandidates = () => api.get('/resumes/');
export const deleteCandidate = (id) => api.delete(`/resumes/${id}`);
export const createJob = (data) => api.post('/jobs/', data);
export const getAllJobs = () => api.get('/jobs/');
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const screenSingle = (candidateId, jobId) =>
  api.post('/screen/single', { candidate_id: candidateId, job_id: jobId });
export const screenBulk = (jobId) =>
  api.post('/screen/bulk', { job_id: jobId });
export const getResultsByJob = (jobId) =>
  api.get(`/screen/results/job/${jobId}`);