// src/pages/Employer/EmployerProfileView.js
import React, { useEffect, useState } from 'react';
import { employerApi } from '../../services/employer';

export default function EmployerProfileView() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await employerApi.get('/employer/me', {
          headers: {
            Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          },
        });
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to load employer profile:', error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Employer Profile</h2>
        <a href="/employer/profile/edit" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
          ✏️ Edit
        </a>
      </div>
      <div style={{ marginTop: '1.5rem', lineHeight: '2' }}>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Address:</strong> {profile.address}</p>
        <p><strong>City:</strong> {profile.city}</p>
        <p><strong>State:</strong> {profile.state}</p>
        <p><strong>Country:</strong> {profile.country}</p>
        <p><strong>Timezone:</strong> {profile.timezone}</p>
        <p><strong>Website:</strong> {profile.website || 'N/A'}</p>
        <p><strong>Industry:</strong> {profile.industry || 'N/A'}</p>
        <p><strong>Company Size:</strong> {profile.size || 'N/A'}</p>
        <p><strong>Contact Number:</strong> {profile.contact_number || 'N/A'}</p>
      </div>
    </div>
  );
}
