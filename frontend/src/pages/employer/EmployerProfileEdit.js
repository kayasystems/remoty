// src/pages/employer/EmployerProfileEdit.js
import React, { useEffect, useState } from 'react';
import { employerApi } from '../../services/employer';
import { useNavigate } from 'react-router-dom';

const TIMEZONES = [
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Riyadh',
  'Europe/Berlin',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'Etc/UTC'
];

export default function EmployerProfileEdit() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: '',
    website: '',
    industry: '',
    size: '',
    contact_number: '',
    address: '',
    city: '',
    state: '',
    country: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employerApi.get('/employer/me');
        setFormData(res.data);
      } catch (err) {
        console.error('Failed to load profile', err);
        alert('Failed to load profile.');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employerApi.put('/employer/profile', formData);
      alert('Profile updated successfully.');
      navigate('/employer/profile/view');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h2>Edit Employer Profile</h2>
      <form onSubmit={handleSubmit}>
        {[
          ['name', 'Company Name'],
          ['email', 'Email'],
          ['website', 'Website'],
          ['industry', 'Industry'],
          ['size', 'Company Size'],
          ['contact_number', 'Contact Number'],
          ['address', 'Address'],
          ['city', 'City'],
          ['state', 'State'],
          ['country', 'Country'],
        ].map(([field, label]) => (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label>
              {label}
              <input
                type="text"
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>
          </div>
        ))}

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Timezone
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="">Select a timezone</option>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" style={{ padding: '0.75rem 2rem' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
