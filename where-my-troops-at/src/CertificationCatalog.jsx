import { useState, useEffect } from 'react'

function CertificationCatalog() {
    const [certifications, setCertifications] = useState([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`http://127.0.0.1:8080/certs`)
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

    const filteredCertifications = certifications.filter(cert =>
        cert.name?.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="cert-catalog">
            <h2>CERTIFICATION CATALOG</h2>
            <input
                type="text"
                className="cert-search"
                placeholder="Search by certification."
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
                            <li key={cert.id}>{cert.name}</li>
                        ))
                    )}
                </ul>
            )}
        </div>
    )
}

export default CertificationCatalog