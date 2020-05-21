import React, { useEffect } from 'react';

export default function Code({ language, content }: CodeProps) {
  return (
    <pre>
      <code>{content}</code>
    </pre>
  );
}

type CodeProps = {
  language: string;
  content: string;
};
