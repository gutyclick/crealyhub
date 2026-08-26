import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { StorageProvider, StoredObject } from "@/lib/storage/provider";
export class SupabaseStorageProvider implements StorageProvider{
  constructor(private client:SupabaseClient,private bucket=env.SUPABASE_STORAGE_BUCKET){}
  async put(key:string,data:ArrayBuffer,mimeType:string):Promise<StoredObject>{const{error}=await this.client.storage.from(this.bucket).upload(key,data,{contentType:mimeType,upsert:false});if(error)throw new Error(`Storage upload failed: ${error.message}`);return{bucket:this.bucket,key,mimeType,bytes:data.byteLength}}
  async createSignedReadUrl(key:string,expiresInSeconds:number){const{data,error}=await this.client.storage.from(this.bucket).createSignedUrl(key,expiresInSeconds);if(error)throw new Error(`Signed URL failed: ${error.message}`);return data.signedUrl}
  async remove(key:string){const{error}=await this.client.storage.from(this.bucket).remove([key]);if(error)throw new Error(`Storage removal failed: ${error.message}`)}
}
