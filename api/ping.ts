const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (req, res) => {
    try {
        // Create Supabase client (no type checking in this file)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Simple lightweight query
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        console.log(`[${new Date().toISOString()}] Supabase ping successful. Row count: ${count}`);

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            message: 'Supabase pinged successfully'
        });
    } catch (error) {
        console.error('Error pinging Supabase:', error);
        return res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            message: 'Failed to ping Supabase'
        });
    }
}