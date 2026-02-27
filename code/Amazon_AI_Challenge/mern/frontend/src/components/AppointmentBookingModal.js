import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AppointmentBookingModal = ({ isOpen, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        email: '',
        appointment_date: '',
        appointment_time: '',
        product_name: '',
        issue_description: '',
        notes: ''
    });
    const [checking, setChecking] = useState(false);
    const [availability, setAvailability] = useState(null);
    const [booking, setBooking] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Reset availability when date/time changes
        if (e.target.name === 'appointment_date' || e.target.name === 'appointment_time') {
            setAvailability(null);
        }
    };

    const handleCheckAvailability = async () => {
        if (!formData.appointment_date || !formData.appointment_time) {
            alert('Please select both date and time');
            return;
        }

        setChecking(true);
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/appointments/check-availability`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    date_str: formData.appointment_date,
                    time_str: formData.appointment_time
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAvailability(data);
            }
        } catch (err) {
            console.error('Error checking availability:', err);
            alert('Failed to check availability');
        }
        setChecking(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!availability || !availability.available) {
            alert('Please check availability first');
            return;
        }

        setBooking(true);
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            
            // First create appointment
            const appointmentData = {
                ...formData,
                customer_id: `${formData.phone}_${Date.now()}`,
                status: 'scheduled',
                assigned_agent_type: 'AI',
                assigned_agent: 'AI Assistant'
            };

            const response = await fetch(`${baseUrl}/api/appointments`, {
                method: 'POST',
                headers,
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                alert('Appointment booked successfully!');
                onSuccess && onSuccess();
                onClose();
                // Reset form
                setFormData({
                    customer_name: '',
                    phone: '',
                    email: '',
                    appointment_date: '',
                    appointment_time: '',
                    product_name: '',
                    issue_description: '',
                    notes: ''
                });
                setAvailability(null);
            }
        } catch (err) {
            console.error('Error booking appointment:', err);
            alert('Failed to book appointment');
        }
        setBooking(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 max-w-2xl w-full border border-[#e6e6db] dark:border-[#3a3928] my-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Book New Appointment</h2>
                    <button
                        onClick={onClose}
                        className="text-[#8c8b5f] hover:text-black dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                name="customer_name"
                                required
                                value={formData.customer_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                Appointment Date *
                            </label>
                            <input
                                type="date"
                                name="appointment_date"
                                required
                                value={formData.appointment_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                Appointment Time *
                            </label>
                            <input
                                type="time"
                                name="appointment_time"
                                required
                                value={formData.appointment_time}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleCheckAvailability}
                            disabled={checking}
                            className="w-full px-4 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-black font-semibold transition-colors disabled:opacity-50"
                        >
                            {checking ? 'Checking...' : 'Check Availability'}
                        </button>
                        
                        {availability && (
                            <div className={`mt-2 p-3 rounded-lg ${
                                availability.available 
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}>
                                <p className={`text-sm font-semibold ${
                                    availability.available ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                }`}>
                                    {availability.message}
                                </p>
                                {availability.suggested_slots && availability.suggested_slots.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-[#8c8b5f] mb-1">Suggested times:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {availability.suggested_slots.slice(0, 3).map((slot, i) => (
                                                <span key={i} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                                    {slot}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                            Product/Device
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="e.g., MacBook Pro, iPhone 13"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                            Issue Description
                        </label>
                        <textarea
                            name="issue_description"
                            value={formData.issue_description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Describe the issue..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!availability || !availability.available || booking}
                            className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-yellow-300 text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {booking ? 'Booking...' : 'Book Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentBookingModal;
