const supabase = require('../../config/supabaseClient');

const getAllBookings = async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

const searchPlaneTicket = async (req, res) => {
  const { from, to, date, seat_class, passenger_count } = req.query;

  const { data: dataTickets, error } = await supabase
    .from("tickets")
    .select(`
      *,
      transportation (
        operator_name,
        operator_code
      ),
      seat_classes:seat_class_id (
        class_name,
        price_modifier,
        description
      )
    `)
    .eq("from_city", from)
    .eq("to_city", to)
    .gte("available_seats", passenger_count)
    .gte("departure_time", `${date}T00:00:00`)
    .lt("departure_time", `${date}T23:59:59`)
    .eq('seat_classes.class_name', seat_class);


  if (error) return res.status(500).json({ error: error.message })

  res.json(dataTickets)
}

const updateBooking = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('bookings')
    .update(req.body)
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

module.exports = {
  searchPlaneTicket,
  getAllBookings,
  updateBooking,
}; 