import { useState } from "react";

function EvaluatorsPanel({ evaluators }) {
    const handleEdit = (id) => {
        console.log('Edit evaluator', id)
    }

    return (
        <div className="panel">
            <div className="panel-header">
                <h3>Evaluators:</h3>
                <button className="new-btn">New</button>
            </div>
            <ul>
                {evaluators.map(e => (
                    <li key={e.id}>
                        {e.name} | Training Quals | Trainees -{' '}
                        <button onClick={() => handleEdit(e.id)}>Edit</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EvaluatorsPanel