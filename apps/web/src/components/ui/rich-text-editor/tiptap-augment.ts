declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleListBlock: (args: {
      type: 'bulletList' | 'orderedList';
      itemType?: string;
    }) => ReturnType;
  }
}

export {};
