<!-- supabaseClient.js (type=module) -->
<script type="module">
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

  // PUBLIC gegevens (mag client-side)
  const SUPABASE_URL = 'https://ohhgmkiwkyntanzgetxv.supabase.co'
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaGdta2l3a3ludGFuemdldHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjQyMDIsImV4cCI6MjA3NDMwMDIwMn0.DcfhXBWwz788rEoiD2-350NrcmWcBcpzqJqmhFwf95Q'

  // Maak een globale client voor andere scripts
  window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
</script>
