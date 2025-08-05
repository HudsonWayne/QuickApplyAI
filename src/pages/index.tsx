import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a resume file');
    setUploading(true);
    setMessage('');
    setJobs([]);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message || 'Upload complete');
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>QuickApply 📝</h1>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        style={{ margin: '1rem 0' }}
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          backgroundColor: '#2563EB',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Resume & Find Jobs'}
      </button>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}

      {jobs.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Matching Jobs</h2>
          <ul>
            {jobs.map((job, index) => (
              <li key={index} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                <p><strong>{job.title}</strong></p>
                <p>{job.company}</p>
                <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>
                  View Job
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
