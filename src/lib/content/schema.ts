import { z } from "zod";
export const createContentSchema=z.object({format:z.enum(["POST","STORY","CAROUSEL"]),topic:z.string().trim().max(300),objective:z.string().trim().max(300),instructions:z.string().trim().max(2000),scheduledAt:z.string().trim()});
export type CreateContentState={ok:boolean;message:string;postId?:string};
