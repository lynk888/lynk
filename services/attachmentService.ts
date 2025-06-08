import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../utils/supabase';

export interface AttachmentResult {
  url: string;
  type: string;
  fileName: string;
}

export class AttachmentService {
  static async pickImage(): Promise<AttachmentResult | null> {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return null;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (result.canceled) return null;
    
    return await this.uploadFile(
      result.assets[0].uri,
      'image/' + (result.assets[0].uri.split('.').pop() || 'jpeg'),
      `image_${Date.now()}.${result.assets[0].uri.split('.').pop() || 'jpg'}`
    );
  }
  
  static async pickDocument(): Promise<AttachmentResult | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) return null;
    
    return await this.uploadFile(
      result.assets[0].uri,
      result.assets[0].mimeType || 'application/octet-stream',
      result.assets[0].name
    );
  }
  
  private static async uploadFile(
    uri: string,
    type: string,
    fileName: string
  ): Promise<AttachmentResult | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Create a folder structure with user ID to enforce ownership
      const filePath = `${userData.user.id}/${Date.now()}_${fileName}`;
      
      // Read file as base64
      const fileBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, fileBase64, {
          contentType: type,
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);
      
      return {
        url: urlData.publicUrl,
        type,
        fileName,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      return null;
    }
  }
}

