const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing query' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    if (!accessKey) {
      return new Response(JSON.stringify({ url: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitized = query.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 50);
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(sanitized)}&per_page=1&orientation=squarish`;

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ url: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const photoUrl = data.results?.[0]?.urls?.small ?? null;

    return new Response(JSON.stringify({ url: photoUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ url: null, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
