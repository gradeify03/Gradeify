    export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbz2SGdf4fIh2j6TygRNXS4Ngqxyo7ILBKOKKFO_r6ogyEddeomahhFMaBwaWD7CSKEs/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
        });
        const data = await response.json();
        if (!response.ok) {
        return res.status(response.status).json({ error: data.error || 'Failed to create sheet' });
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
    }