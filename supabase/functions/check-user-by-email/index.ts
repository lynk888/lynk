// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
      );
    }

    // Get the request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { email } = requestBody;

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if the user exists in auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error checking auth users:", authError);
      return new Response(
        JSON.stringify({ error: "Failed to check user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Filter users by email
    const matchingUsers = authUsers?.users.filter((user: any) =>
      user.email?.toLowerCase() === email.toLowerCase().trim()
    ) || [];

    // If user exists in auth.users
    if (matchingUsers.length > 0) {
      const authUser = matchingUsers[0];

      // Check if profile exists
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error checking profile:", profileError);
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const { error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: authUser.id,
            email: authUser.email,
            username: authUser.user_metadata.username || authUser.email.split("@")[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error creating profile:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create profile" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        // Get the newly created profile
        const { data: newProfile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        return new Response(
          JSON.stringify({
            user: newProfile,
            message: "Profile created successfully"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 201 }
        );
      }

      // Return the existing profile
      return new Response(
        JSON.stringify({
          user: profile,
          message: "User found"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // User not found
    return new Response(
      JSON.stringify({
        user: null,
        message: "User not found"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});