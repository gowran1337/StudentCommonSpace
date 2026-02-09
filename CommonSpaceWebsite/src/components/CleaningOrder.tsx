import { useState, useEffect, useCallback } from 'react';
import { cleaningRotationApi, type CleaningRotationUser, type RotationState } from '../services/api';

function CleaningOrder() {
    const [rotation, setRotation] = useState<CleaningRotationUser[]>([]);
    const [rotationState, setRotationState] = useState<RotationState | null>(null);
    const [loading, setLoading] = useState(true);
    const [daysRemaining, setDaysRemaining] = useState<number>(7);

    const loadRotationData = useCallback(async () => {
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
    }, []);

    const checkRotation = useCallback(async () => {
        try {
            const advanced = await cleaningRotationApi.checkAndAdvanceIfNeeded();
            if (advanced) {
                // Reload data if rotation was advanced
                loadRotationData();
            }
        } catch (error) {
            console.error('Error checking rotation:', error);
        }
    }, [loadRotationData]);

    useEffect(() => {
        loadRotationData();
        // Check rotation every minute
        const interval = setInterval(checkRotation, 60000);
        return () => clearInterval(interval);
    }, [loadRotationData, checkRotation]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                <h2 className="mt-0 mb-5 text-[#2c3e50] text-2xl border-b-[3px] border-[#9b59b6] pb-2.5">🧼 Städordning</h2>
                <p>Laddar...</p>
            </div>
        );
    }

    if (rotation.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                <h2 className="mt-0 mb-5 text-[#2c3e50] text-2xl border-b-[3px] border-[#9b59b6] pb-2.5">🧼 Städordning</h2>
                <p className="text-[#7f8c8d] italic text-center p-5">Ingen städordning konfigurerad ännu.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <h2 className="mt-0 mb-5 text-[#2c3e50] text-2xl border-b-[3px] border-[#9b59b6] pb-2.5">🧼 Städordning</h2>

            {rotationState?.current_user && (
                <div className="bg-gradient-to-br from-[#9b59b6] to-[#8e44ad] text-white p-5 rounded-[10px] mb-5 flex justify-between items-center shadow-[0_4px_10px_rgba(155,89,182,0.3)] max-md:flex-col max-md:gap-4 max-md:text-center">
                    <div className="flex flex-col gap-1.5 max-md:items-center">
                        <span className="text-[0.85rem] opacity-90 uppercase tracking-wide">Nuvarande städare:</span>
                        <span className="text-[1.4rem] font-bold">
                            {rotationState.current_user.full_name || rotationState.current_user.email}
                        </span>
                    </div>
                    <div className="bg-white/20 px-4 py-2.5 rounded-lg text-[0.9rem] font-semibold backdrop-blur-[10px] max-md:w-full max-md:text-center">
                        {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagar'} kvar
                    </div>
                </div>
            )}

            <ul className="list-none p-0 m-0">
                {rotation.map((rotationUser) => {
                    const isCurrentCleaner = rotationUser.user_id === rotationState?.current_user_id;
                    const user = rotationUser.user;

                    return (
                        <li
                            key={rotationUser.id}
                            className={`flex items-center gap-4 p-4 mb-2.5 rounded-lg border-l-4 transition-all hover:bg-[#e9ecef] hover:translate-x-1.5 ${isCurrentCleaner
                                    ? 'bg-gradient-to-r from-[#f5e6ff] to-[#e6ccff] border-l-[#8e44ad] border-l-[6px] font-semibold'
                                    : 'bg-[#f8f9fa] border-l-[#9b59b6]'
                                }`}
                        >
                            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-[0.95rem] shrink-0 ${isCurrentCleaner
                                    ? 'bg-[#8e44ad] shadow-[0_0_0_3px_rgba(142,68,173,0.2)]'
                                    : 'bg-[#9b59b6]'
                                }`}>
                                {rotationUser.order_position}
                            </span>
                            <span className="flex-1 text-[#2c3e50] text-base">
                                {user?.full_name || user?.email || 'Okänd användare'}
                            </span>
                            {isCurrentCleaner && (
                                <span className="bg-[#27ae60] text-white px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider">
                                    Aktiv
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default CleaningOrder;
