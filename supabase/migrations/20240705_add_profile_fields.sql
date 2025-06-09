-- Add bio and interests fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a row into public.profiles
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    avatar_url, 
    bio,
    interests,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NULL,
    NULL,
    ARRAY[]::TEXT[],
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_user_update function to include new fields
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding row in public.profiles
  UPDATE public.profiles
  SET 
    email = NEW.email,
    username = COALESCE(NEW.raw_user_meta_data->>'username', profiles.username),
    bio = COALESCE(NEW.raw_user_meta_data->>'bio', profiles.bio),
    interests = COALESCE(
      (NEW.raw_user_meta_data->>'interests')::TEXT[],
      profiles.interests,
      ARRAY[]::TEXT[]
    ),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 