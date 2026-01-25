import { useState, useEffect } from 'react';
import { cleaningRotationApi, type CleaningRotationUser, type RotationState } from '../services/api';
import './CleaningOrder.css';

function CleaningOrder() {
    const [rotation, setRotation] = useState<CleaningRotationUser[]>([]);
    const [rotationState, setRotationState] = useState<RotationState | null>(null);
    const [loading, setLoading] = useState(true);
    const [daysRemaining, setDaysRemaining] = useState<number>(7);

    useEffect(() => {
        loadRotationData();
        // Check rotation every minute
        const interval = setInterval(checkRotation, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadRotationData = async () => {
        try {
            const [rotationData, stateData] = await Promise.all([
                cleaningRotationApi.getRotation(),
                cleaningRotationApi.getState(),
            ]);

            setRotation(rotationData);
            setRotationState(stateData);

            if (stateData) {
                const days = cleaningRotationApi.getDaysRemaining(stateData.rotation_start_date);
                setDaysRemaining(days);
            }
        } catch (error) {
            console.error('Error loading rotation:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkRotation = async () => {
        try {
            const advanced = await cleaningRotationApi.checkAndAdvanceIfNeeded();
            if (advanced) {
                // Reload data if rotation was advanced
                loadRotationData();
            }
        } catch (error) {
            console.error('Error checking rotation:', error);
        }
    };

    if (loading) {
        return (
            <div className="cleaning-order">
                <h2>🧼 Städordning</h2>
                <p>Laddar...</p>
            </div>
        );
    }

    if (rotation.length === 0) {
        return (
            <div className="cleaning-order">
                <h2>🧼 Städordning</h2>
                <p className="no-rotation">Ingen städordning konfigurerad ännu.</p>
            </div>
        );
    }

    return (
        <div className="cleaning-order">
            <h2>🧼 Städordning</h2>

            {rotationState?.current_user && (
                <div className="current-cleaner-banner">
                    <div className="banner-content">
                        <span className="banner-label">Nuvarande städare:</span>
                        <span className="banner-name">
                            {rotationState.current_user.full_name || rotationState.current_user.email}
                        </span>
                    </div>
                    <div className="days-remaining">
                        {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagar'} kvar
                    </div>
                </div>
            )}

            <ul className="rotation-list">
                {rotation.map((rotationUser) => {
                    const isCurrentCleaner = rotationUser.user_id === rotationState?.current_user_id;
                    const user = rotationUser.user;

                    return (
                        <li
                            key={rotationUser.id}
                            className={isCurrentCleaner ? 'current-cleaner' : ''}
                        >
                            <span className="position-number">{rotationUser.order_position}</span>
                            <span className="user-name">
                                {user?.full_name || user?.email || 'Okänd användare'}
                            </span>
                            {isCurrentCleaner && <span className="current-badge">Aktiv</span>}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default CleaningOrder;
