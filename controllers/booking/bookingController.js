const supabase = require('../../config/supabaseClient');

const getAllBookings = async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

const createBooking = async (req, res) => {
  const booking = {
    user_id: req.body.user_id,
    item_id: req.body.item_id,
    item_type: req.body.item_type,
    item_name: req.body.item_name,
    guests: req.body.guests,
    rooms: req.body.rooms,
    total_price: req.body.total_price,
    status: req.body.status || 'pending',
    check_in_date: req.body.check_in_date,
    check_out_date: req.body.check_out_date,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([booking]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

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
  getAllBookings,
  createBooking,
  updateBooking,
}; 