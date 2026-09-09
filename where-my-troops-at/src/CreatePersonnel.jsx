import { useState } from 'react';

const createPersonnelUrl = 'http://localhost:8080/personnel';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function CreatePersonnel() {
  const [rank, setRank] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('trainee');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rank || !firstName || !lastName) {
      setError('Missing required information');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(createPersonnelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rank,
          last_name: lastName,
          first_name: firstName,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(capitalize(data.error || 'Failed to create person'));
      }

      setSuccess(`${data.rank} ${data.last_name} was created.`);
      setRank('');
      setLastName('');
      setFirstName('');
      setRole('trainee');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Personnel</h2>

      {error && <div>{error}</div>}
      {success && <div>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="rank">Rank</label>
          <input
            id="rank"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="trainee">Trainee</option>
            <option value="evaluator">Evaluator</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating personnel...' : 'Create Personnel'}
        </button>
      </form>
    </div>
  );
}
