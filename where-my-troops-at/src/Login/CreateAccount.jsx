import { useState, useEffect } from 'react';

const createUserUrl = 'http://localhost:8080/users';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function CreateAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEvaluator, setIsEvaluator] = useState(false);
  const [isPlanner, setIsPlanner] = useState(false);
  const [personnelId, setPersonnelId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const personnelLookup = async () => {
      if (!firstName || !lastName) {
        setPersonnelId(null);
        setLookupError('');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/personnel?firstName=${firstName}&lastName=${lastName}`,
        );
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.error || 'Personnel lookup failed');
        }
        if (!data.length) {
          setPersonnelId(null);
          setLookupError('No matching personnel record found');
          return;
        }

        setPersonnelId(data[0].id);
        setLookupError('');
      } catch (err) {
        if (cancelled) return;
        setPersonnelId(null);
        setLookupError(err.message);
      }
    };

    personnelLookup();

    return () => {
      cancelled = true;
    };
  }, [firstName, lastName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Missing username/password');
      return;
    }

    if (!personnelId) {
      setError('No matching personnel record — check the first/last name');
      return;
    }

    if (password !== verifyPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(createUserUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          is_admin: isAdmin,
          is_evaluator: isEvaluator,
          is_planner: isPlanner,
          personnel_id: personnelId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(capitalize(data.error || 'Failed to create account'));
      }

      setSuccess(`Account "${data.username}" was created.`);
      setUsername('');
      setPassword('');
      setVerifyPassword('');
      setIsAdmin(false);
      setIsEvaluator(false);
      setIsPlanner(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Account</h2>

      {error && <div>{error}</div>}
      {lookupError && <div>{lookupError}</div>}
      {success && <div>{success}</div>}

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="verifyPassword">Verify Password</label>
          <input
            id="verifyPassword"
            type="password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Admin
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={isEvaluator}
              onChange={(e) => setIsEvaluator(e.target.checked)}
            />
            Evaluator
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={isPlanner}
              onChange={(e) => setIsPlanner(e.target.checked)}
            />
            Planner
          </label>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
