function EvaluatorsAndTraineesList({ evaluators, trainees }) {
    return (
        <div className="list-banner">
            <h3>List Evaluators & trainees</h3>
            <div className="combined-list">
                <div>
                    <h4>Evaluators</h4>
                    <ul>
                        {evaluators.map(e => (
                            <li key={e.id}>{e.name}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4>Trainees</h4>
                    <ul>
                        {trainees.map(t => (
                            <li key={t.id}>{t.name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default EvaluatorsAndTraineesList