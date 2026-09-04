import { useEffect, useState } from "react"

function CertQualRenewalPanel() {
    const [renewals, setRenewals] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8080/perscerts')
            .then(res => res.json())
            .then(data => {
                const now = new Date()
                const soon = new Date()
                soon.setDate(now.getDate() + 30)

                const upcoming = data.filter(r => {
                    const expiry = new Date(r.expiry_date)
                    return expiry >= now && expiry <= soon
                })

                setRenewals(upcoming)
            })
            .catch(console.error)
    }, [])

    const getPersonName = (id) => {
        const p = personnel.find(p => p.id === id)
        return p ? `${p.first_name} ${p.last_name}` : `#${id}`
    }

    const getCertName = (id) => {
        const c = certifications.find(c => c.id === id)
        return c ? c.name : `#${id}`
    }

    return (
        <div className="panel">
            <h3>Upcoming cert Renewals & Quals:</h3>
            <ul>
                {renewals.map(r => (
                    <li key={r.id}>{getPersonName(r.personnel_id)} | {getCertName(r.certificationsd_id)}</li>
                ))}
            </ul>
        </div>
    );
}

export default CertQualRenewalPanel