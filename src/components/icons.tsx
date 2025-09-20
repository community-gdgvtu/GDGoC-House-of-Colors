import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.3 6.3L18.1 3L22 4.9V12L18.1 14.7L12.3 11.4V6.3Z" fill="#4285F4"/>
        <path d="M11.7 6.3L5.9 3L2 4.9V12L5.9 14.7L11.7 11.4V6.3Z" fill="#FBBC05"/>
        <path d="M12.3 20.4L18.1 23.1L22 21.2V14.1L18.1 11.4L12.3 14.7V20.4Z" fill="#4CAF50"/>
        <path d="M11.7 20.4L5.9 23.1L2 21.2V14.1L5.9 11.4L11.7 14.7V20.4Z" fill="#F44336"/>
    </svg>
  );
}
