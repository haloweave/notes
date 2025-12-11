import React from 'react';

export const MaterialIcon = ({ name, className }: { name: string; className?: string }) => {
    let fontSize = "text-[24px]";
    if (className?.includes("h-3")) fontSize = "text-[12px]";
    if (className?.includes("h-4")) fontSize = "text-[16px]";
    if (className?.includes("h-5")) fontSize = "text-[20px]";
    if (className?.includes("h-6")) fontSize = "text-[24px]";
    if (className?.includes("h-8")) fontSize = "text-[32px]";
    if (className?.includes("h-12")) fontSize = "text-[48px]";

    return <span className={`material-symbols-outlined ${fontSize} ${className} select-none`}>{name}</span>;
};
