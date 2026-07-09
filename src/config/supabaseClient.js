require('dotenv').config({
    path: 'C:/Users/PC/Desktop/SafeNest/.env'
});
const { createClient } = require('@supabase/supabase-js'); //conexão de usuario com o supabase

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// console.log("URL:", process.env.SUPABASE_URL);
// console.log("KEY:", process.env.SUPABASE_KEY ? "existe" : "undefined");
module.exports = supabase;