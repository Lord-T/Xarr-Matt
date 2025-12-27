'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, CheckCircle, XCircle, Search, ExternalLink, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function VerificationsModule() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        // Fetch pending requests with user profile data
        const { data, error } = await supabase
            .from('verification_requests')
            .select(`
                *,
                profiles:user_id (full_name, email, phone)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetching requests:", error);
        if (data) setRequests(data);
        setLoading(false);
    };

    const handleApprove = async (request: any) => {
        if (!confirm(`Valider l'identité de ${request.profiles?.full_name} ?`)) return;

        // 1. Update Request Status
        const { error: reqError } = await supabase
            .from('verification_requests')
            .update({ status: 'approved' })
            .eq('id', request.id);

        if (reqError) {
            alert("Erreur mise à jour demande: " + reqError.message);
            return;
        }

        // 2. Update User Profile (Verification Badge)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', request.user_id);

        if (profileError) {
            alert("Attention: Demande validée mais erreur sur le profil: " + profileError.message);
        } else {
            // 3. Notify User (Using our notifications table)
            await supabase.from('notifications').insert({
                user_id: request.user_id,
                title: 'Identité Vérifiée ✅',
                message: 'Félicitations ! Votre dossier a été accepté. Vous avez maintenant le badge de confiance.',
                type: 'success'
            });

            alert("Utilisateur vérifié avec succès !");
            setRequests(prev => prev.filter(r => r.id !== request.id));
        }
    };

    const handleReject = async (request: any) => {
        const reason = prompt("Raison du refus (ex: Photo floue) :");
        if (reason === null) return; // Cancelled

        // 1. Update Request Status
        const { error: reqError } = await supabase
            .from('verification_requests')
            .update({
                status: 'rejected',
                admin_notes: reason || 'Non conforme'
            })
            .eq('id', request.id);

        if (reqError) {
            alert("Erreur: " + reqError.message);
        } else {
            // 2. Notify User
            await supabase.from('notifications').insert({
                user_id: request.user_id,
                title: 'Vérification Refusée ❌',
                message: `Votre demande a été refusée. Raison : ${reason || 'Non conforme'}.`,
                type: 'error'
            });

            alert("Demande refusée.");
            setRequests(prev => prev.filter(r => r.id !== request.id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" />
                    Demandes de Vérification ({requests.length})
                </h2>
                <Button variant="outline" onClick={fetchRequests} size="sm">Actualiser</Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader className="animate-spin text-gray-400" /></div>
            ) : requests.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
                    <p className="text-gray-500">Aucune demande en attente. Tout est propre ! ✨</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(request => (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            {/* Image Preview Area */}
                            <div className="relative h-48 bg-gray-100 group cursor-pointer">
                                <img
                                    src={request.document_url}
                                    alt="CNI"
                                    className="w-full h-full object-cover"
                                    onClick={() => window.open(request.document_url, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <ExternalLink size={12} /> Voir
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{request.profiles?.full_name || 'Utilisateur Inconnu'}</h3>
                                        <p className="text-xs text-gray-500">{request.profiles?.phone || 'Sans tel'}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 bg-blue-50 text-blue-700 p-2 rounded mb-4">
                                    ID: {request.user_id.substring(0, 8)}...
                                </p>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <button
                                        onClick={() => handleReject(request)}
                                        className="flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                                    >
                                        <XCircle size={16} /> Refuser
                                    </button>
                                    <button
                                        onClick={() => handleApprove(request)}
                                        className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <CheckCircle size={16} /> Valider
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
