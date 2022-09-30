/*****************************************************************
 * Indexes for utilities that 
 * 
 * 
 * ***************************************************************/ 

export const hasOwnProperty = <T extends object>(obj: T, key: keyof T): boolean => {
   return obj.hasOwnProperty(key);
};

