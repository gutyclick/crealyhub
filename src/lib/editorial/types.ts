export type EditorialSlide={id:string;position:number;role:string;headline:string;body:string;mediaUrl:string|null};
export type EditorialPost={id:string;format:"POST"|"STORY"|"CAROUSEL";status:string;scheduledAt:string|null;topic:string;pillar:string|null;coverUrl:string|null;version:{id:string;number:number;hook:string;caption:string;cta:string;hashtags:string[];createdAt:string};slides:EditorialSlide[];versions:number};
export type CalendarPost={id:string;format:string;status:string;scheduledAt:string;topic:string;coverUrl:string|null};
