// Menggunakan node-fetch@2 yang kompatibel dengan CommonJS
const fetch = require('node-fetch');
const supabase = require('../../config/supabaseClient');

// ==============================
// Main Route
// ==============================
const getMain = (req, res) => {
    res.send('utama');
};

// ==============================
// Hello Route
// ==============================
const getHello = (req, res) => {
    console.log({ urlParams: req.query });
    res.send('Hello World lalalaalla!');
};

// ==============================
// Update Username Route
// ==============================
const updateUsername = (req, res) => {
    console.log({ updateData: req.body });
    res.send('update berhasil');
};

// ==============================
// Get Flights from Amadeus
// ==============================
const getFlights = async (req, res) => {
    try {
        console.log('Mencoba mengambil data penerbangan...');

        const response = await fetch('https://test.api.amadeus.com/v2/shopping/flight-offers', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer edk1WtaOQa4q5qPMjfQmzyZoloGt',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currencyCode: 'USD',
                originDestinations: [
                    {
                        id: '1',
                        originLocationCode: 'CGK',
                        destinationLocationCode: 'SIN',
                        departureDateTimeRange: { date: '2025-06-28' }
                    }
                ],
                travelers: [
                    {
                        id: '1',
                        travelerType: 'ADULT'
                    }
                ],
                sources: ['GDS']
            })
        });

        console.log('Status response:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.log('Response dari Amadeus error:', data);
            return res.status(response.status).json({
                error: 'Amadeus API Error',
                status: response.status,
                details: data
            });
        }

        res.json(data.data);
    } catch (error) {
        console.error('ERROR fetch detail:', error.message);
        console.error('ERROR stack:', error.stack);
        res.status(500).json({
            error: 'Gagal mengambil data penerbangan',
            message: error.message
        });
    }
};

const createMultiTicket = async (req, res) => {
    const { id: userId } = req.user;
    const { journeys } = req.body;

    if (!journeys || !Array.isArray(journeys) || journeys.length === 0) {
        return res.status(400).json({ message: "Journey harus di isi dan berupa Array!" })
    }

    try {
        const { data, error } = await supabase.rpc("create_multiple_booking", {
            p_user_id: userId,
            p_journeys: journeys
        })

        if (error) throw error;

        res.status(201).json({ message: "Booking berhasil dibuat!", created_data: data })
    } catch (error) {
        res.status(500).json({ message: "Error",  details: error})
    }
};

module.exports = {
    getMain,
    getHello,
    updateUsername,
    getFlights,
    createMultiTicket
}; 