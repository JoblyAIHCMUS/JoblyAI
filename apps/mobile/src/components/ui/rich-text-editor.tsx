import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import {
  EnrichedTextInput,
  type EnrichedTextInputInstance,
  type OnChangeStateEvent,
  type OnChangeHtmlEvent,
} from 'react-native-enriched';
import type { NativeSyntheticEvent } from 'react-native';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
} from 'lucide-react-native';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export const RichTextEditor = React.forwardRef<
  EnrichedTextInputInstance,
  RichTextEditorProps
>(function RichTextEditor(
  { content, onChange, placeholder = 'Write something...', editable = true },
  ref
) {
  const internalRef = useRef<EnrichedTextInputInstance>(null);
  const [styleState, setStyleState] = useState<OnChangeStateEvent | null>(null);
  const hasInitialized = useRef(false);
  const initialContentRef = useRef(content);

  React.useImperativeHandle(
    ref,
    () => internalRef.current || ({} as EnrichedTextInputInstance)
  );

  // Initialize content only once on mount
  React.useEffect(() => {
    if (!hasInitialized.current && internalRef.current && content) {
      // Store initial content
      initialContentRef.current = content;
      hasInitialized.current = true;
    }
  }, []);

  const handleChangeHtml = (e: NativeSyntheticEvent<OnChangeHtmlEvent>) => {
    onChange(e.nativeEvent.value);
  };

  const handleChangeState = (e: NativeSyntheticEvent<OnChangeStateEvent>) => {
    setStyleState(e.nativeEvent);
  };

  const ensureFocusedThen = (action: () => void) => {
    internalRef.current?.focus();
    // Defer the toggle slightly so focus is registered natively first
    setTimeout(action, 0);
  };

  const toggleBold = () => internalRef.current?.toggleBold();
  const toggleItalic = () => internalRef.current?.toggleItalic();
  const toggleStrikethrough = () => internalRef.current?.toggleStrikeThrough();

  const toggleHeading2 = () =>
    ensureFocusedThen(() => internalRef.current?.toggleH2());
  const toggleHeading3 = () =>
    ensureFocusedThen(() => internalRef.current?.toggleH3());
  const toggleUnorderedList = () =>
    ensureFocusedThen(() => internalRef.current?.toggleUnorderedList());
  const toggleOrderedList = () =>
    ensureFocusedThen(() => internalRef.current?.toggleOrderedList());
  const toggleBlockQuote = () =>
    ensureFocusedThen(() => internalRef.current?.toggleBlockQuote());

  const toolbarButtonClass = (isActive?: boolean, isBlocking?: boolean) =>
    [
      'p-2 rounded border',
      isActive ? 'bg-blue-100 border-blue-400' : 'bg-white border-slate-200',
      isBlocking ? 'opacity-40' : 'active:bg-slate-100',
    ].join(' ');

  return (
    <View className="border border-input rounded-lg bg-background overflow-hidden">
      {editable && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-slate-50 border-b border-input"
          contentContainerClassName="gap-1 p-2"
        >
          <TouchableOpacity
            className={toolbarButtonClass(
              styleState?.bold.isActive,
              styleState?.bold.isBlocking
            )}
            disabled={styleState?.bold.isBlocking}
            onPress={toggleBold}
          >
            <Bold
              size={18}
              color={styleState?.bold.isActive ? '#3B82F6' : '#64748B'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className={toolbarButtonClass(
              styleState?.italic.isActive,
              styleState?.italic.isBlocking
            )}
            disabled={styleState?.italic.isBlocking}
            onPress={toggleItalic}
          >
            <Italic
              size={18}
              color={styleState?.italic.isActive ? '#3B82F6' : '#64748B'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className={toolbarButtonClass(
              styleState?.strikeThrough.isActive,
              styleState?.strikeThrough.isBlocking
            )}
            disabled={styleState?.strikeThrough.isBlocking}
            onPress={toggleStrikethrough}
          >
            <Strikethrough
              size={18}
              color={styleState?.strikeThrough.isActive ? '#3B82F6' : '#64748B'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View className="w-px bg-slate-200 mx-1" />

          <TouchableOpacity
            className={toolbarButtonClass(
              styleState?.h2?.isActive,
              styleState?.h2?.isBlocking
            )}
            disabled={styleState?.h2?.isBlocking}
            onPress={toggleHeading2}
          >
            <Heading2
              size={18}
              color={styleState?.h2?.isActive ? '#3B82F6' : '#64748B'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className={toolbarButtonClass(
              styleState?.h3?.isActive,
              styleState?.h3?.isBlocking
            )}
            disabled={styleState?.h3?.isBlocking}
            onPress={toggleHeading3}
          >
            <Heading3
              size={18}
              color={styleState?.h3?.isActive ? '#3B82F6' : '#64748B'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View className="w-px bg-slate-200 mx-1" />

          <TouchableOpacity
            className={toolbarButtonClass(styleState?.unorderedList?.isActive)}
            onPress={toggleUnorderedList}
          >
            <List
              size={18}
              color={
                styleState?.unorderedList?.isActive ? '#3B82F6' : '#64748B'
              }
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className={toolbarButtonClass(styleState?.orderedList?.isActive)}
            onPress={toggleOrderedList}
          >
            <ListOrdered
              size={18}
              color={styleState?.orderedList?.isActive ? '#3B82F6' : '#64748B'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className={toolbarButtonClass(styleState?.blockQuote?.isActive)}
            onPress={toggleBlockQuote}
          >
            <Quote
              size={18}
              color={styleState?.blockQuote?.isActive ? '#3B82F6' : '#64748B'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </ScrollView>
      )}

      <EnrichedTextInput
        ref={internalRef}
        defaultValue={initialContentRef.current}
        onChangeHtml={handleChangeHtml}
        onChangeState={handleChangeState}
        placeholder={placeholder}
        editable={editable}
        style={{
          minHeight: 150,
          padding: 12,
          color: '#0f172a',
          fontSize: 16,
        }}
      />
    </View>
  );
});

export default RichTextEditor;
