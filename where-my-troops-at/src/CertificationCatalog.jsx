import { useState, useEffect } from 'react'

function CertificationCatalog() {
    const [certifications, setCertifications] = useState([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/certifications`)
            .then(res => res.json())
            .then(data => {
                setCertifications(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const filteredCertifications = certifications.filter(cert => {
        const term = query.toLowerCase()
        return (
            cert.name?.toLowerCase().includes(term) ||
            cert.owner?.toLowerCase().includes(term) ||
            cert.expiration_date?.toLowerCase().includes(term) ||
            cert.issuing_authority?.toLowerCase().includes(term)
        )
    })

    return (
        <div className="cert-catalog">
            <h2>CERTIFICATION CATALOG</h2>
            <input
                type="text"
                className="cert-search"
                placeholder="Search by certification, owner, expiration date, or issuing authority."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {loading ? (
                <p>Loading certifications...</p>
            ) : (
                <ul className="cert-results">
                    {filteredCertifications.length === 0 ? (
                        <li>No certifications found.</li>
                    ) : (
                        filteredCertifications.map(cert => (
                            <li key={cert.id}>
                                {cert.name} — {cert.owner} | Expires: {cert.expiration_date} | {cert.issuing_authority}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    )
}

export default CertificationCatalog