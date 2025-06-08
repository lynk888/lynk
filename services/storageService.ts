import { supabase } from '../utils/supabase';

export class StorageService {
  /**
   * Upload a user avatar
   */
  static async uploadAvatar(file: File): Promise<string | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userData.user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload a file attachment to a conversation
   */
  static async uploadAttachment(conversationId: string, file: File): Promise<string | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userData.user.id}/${conversationId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  }

  /**
   * Get a signed URL for a private file
   */
  static async getSignedUrl(bucket: string, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // URL valid for 1 hour

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }
} 